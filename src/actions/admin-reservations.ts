"use server";

import { revalidatePath } from "next/cache";
import { ReservationStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

const updateReservationStatusSchema = z.object({
  reservationId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
});

const blockDatesSchema = z.object({
  propertyId: z.string().min(1, "İlan seçimi zorunludur."),
  checkIn: z.string().min(1, "Başlangıç tarihi zorunludur."),
  checkOut: z.string().min(1, "Bitiş tarihi zorunludur."),
  notes: z.string().trim().max(300).optional(),
});

export async function updateReservationStatusAction(rawInput: z.infer<typeof updateReservationStatusSchema>) {
  await requireAdminSession();

  const parsed = updateReservationStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: "Geçersiz durum güncelleme isteği." };
  }

  const { reservationId, status } = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const target = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { property: { select: { slug: true } } },
      });

      if (!target) {
        throw new Error("Rezervasyon kaydı bulunamadı.");
      }

      if (status === "APPROVED") {
        // Onaylanan tarihlerle çakışan başka APPROVED rezervasyon var mı kontrol et
        const conflict = await tx.reservation.findFirst({
          where: {
            id: { not: target.id },
            propertyId: target.propertyId,
            status: ReservationStatus.APPROVED,
            AND: [{ checkIn: { lt: target.checkOut } }, { checkOut: { gt: target.checkIn } }],
          },
        });

        if (conflict) {
          throw new Error("Bu tarih aralığı için zaten onaylanmış başka bir rezervasyon bulunuyor.");
        }

        // Aynı tarih aralığındaki diğer bekleyen (PENDING) talepleri otomatik reddet
        await tx.reservation.updateMany({
          where: {
            id: { not: target.id },
            propertyId: target.propertyId,
            status: ReservationStatus.PENDING,
            AND: [{ checkIn: { lt: target.checkOut } }, { checkOut: { gt: target.checkIn } }],
          },
          data: { status: ReservationStatus.REJECTED },
        });
      }

      return tx.reservation.update({
        where: { id: target.id },
        data: { status: status as ReservationStatus },
        include: { property: { select: { slug: true } } },
      });
    });

    revalidatePath("/admin/reservations");
    revalidatePath("/admin");
    revalidatePath(`/properties/${updated.property.slug}`);

    return { success: true, status: updated.status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Rezervasyon durumu güncellenemedi.";
    return { success: false, error: message };
  }
}

export async function blockPropertyDatesAction(rawInput: z.infer<typeof blockDatesSchema>) {
  const session = await requireAdminSession();

  const parsed = blockDatesSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Tarih bilgileri geçersiz." };
  }

  const checkIn = new Date(parsed.data.checkIn);
  const checkOut = new Date(parsed.data.checkOut);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
    return { success: false, error: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır." };
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id: parsed.data.propertyId },
      select: { id: true, slug: true },
    });

    if (!property) {
      return { success: false, error: "İlan bulunamadı." };
    }

    const overlapping = await prisma.reservation.count({
      where: {
        propertyId: property.id,
        status: { in: [ReservationStatus.APPROVED, ReservationStatus.PENDING] },
        AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
      },
    });

    if (overlapping > 0) {
      return { success: false, error: "Seçilen tarihlerde mevcut rezervasyon veya talep bulunuyor." };
    }

    const blocked = await prisma.reservation.create({
      data: {
        propertyId: property.id,
        guestName: session.email || "Admin Takvim Blokajı",
        guestEmail: session.email || "admin@akdenizstay.com",
        guestPhone: "-",
        guestCount: 1,
        checkIn,
        checkOut,
        totalPrice: "0.00",
        status: ReservationStatus.APPROVED,
        notes: parsed.data.notes || "Admin tarafından takvimde kapatıldı.",
      },
    });

    revalidatePath("/admin/reservations");
    revalidatePath(`/properties/${property.slug}`);

    return { success: true, reservationId: blocked.id };
  } catch {
    return { success: false, error: "Tarihler kapatılırken bir hata oluştu." };
  }
}