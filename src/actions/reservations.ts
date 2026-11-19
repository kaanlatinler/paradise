"use server";

import { revalidatePath } from "next/cache";
import { PropertyStatus, ReservationStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createReservationSchema = z.object({
  propertyId: z.string().min(1, "İlan seçimi zorunludur."),
  guestName: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  guestEmail: z.string().trim().email("Geçerli bir e-posta adresi giriniz."),
  guestPhone: z.string().trim().min(7, "Geçerli bir telefon numarası giriniz."),
  guestCount: z.coerce.number().int().min(1, "En az 1 misafir seçilmelidir."),
  checkIn: z.string().min(1, "Giriş tarihi zorunludur."),
  checkOut: z.string().min(1, "Çıkış tarihi zorunludur."),
  notes: z.string().trim().max(500).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export async function createReservationRequest(input: CreateReservationInput) {
  const parsed = createReservationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Form verileri geçersiz.",
    };
  }

  const data = parsed.data;
  const checkInDate = new Date(data.checkIn);
  const checkOutDate = new Date(data.checkOut);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return { success: false, error: "Geçersiz tarih formatı." };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / msPerDay);

  if (nights < 1) {
    return { success: false, error: "Çıkış tarihi giriş tarihinden en az 1 gün sonra olmalıdır." };
  }

  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    select: { id: true, status: true, capacity: true, pricePerNight: true, slug: true },
  });

  if (!property || property.status !== PropertyStatus.PUBLISHED) {
    return { success: false, error: "İlan bulunamadı veya yayında değil." };
  }

  if (data.guestCount > property.capacity) {
    return {
      success: false,
      error: `Bu ilan en fazla ${property.capacity} misafir kapasitelidir.`,
    };
  }

  // Mevcut onaylanmış veya bekleyen rezervasyonlarla tarih çakışması kontrolü
  const overlappingCount = await prisma.reservation.count({
    where: {
      propertyId: property.id,
      status: { in: [ReservationStatus.APPROVED, ReservationStatus.PENDING] },
      AND: [{ checkIn: { lt: checkOutDate } }, { checkOut: { gt: checkInDate } }],
    },
  });

  if (overlappingCount > 0) {
    return {
      success: false,
      error: "Seçilen tarih aralığı için mevcut bir rezervasyon veya bekleyen talep bulunuyor.",
    };
  }

  const totalPrice = Number(property.pricePerNight) * nights;

  const reservation = await prisma.reservation.create({
    data: {
      propertyId: property.id,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      guestCount: data.guestCount,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice: totalPrice.toFixed(2),
      status: ReservationStatus.PENDING,
      notes: data.notes || null,
    },
  });

  revalidatePath("/admin/reservations");
  revalidatePath(`/properties/${property.slug}`);

  return {
    success: true,
    reservationId: reservation.id,
    nights,
    totalPrice: totalPrice.toFixed(2),
  };
}