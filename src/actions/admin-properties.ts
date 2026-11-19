"use server";

import { revalidatePath } from "next/cache";
import { PropertyStatus, PropertyType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

const propertyImageInputSchema = z.object({
  url: z.string().trim().min(1),
  altText: z.string().trim().optional(),
  order: z.number().int().min(0).default(0),
  isCover: z.boolean().default(false),
});

const upsertPropertySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "İlan başlığı en az 3 karakter olmalıdır."),
  slug: z.string().trim().min(3, "Slug alanı zorunludur."),
  description: z.string().trim().min(10, "Açıklama en az 10 karakter olmalıdır."),
  type: z.nativeEnum(PropertyType),
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.DRAFT),
  city: z.string().trim().min(2, "Şehir zorunludur."),
  district: z.string().trim().min(2, "İlçe/bölge zorunludur."),
  address: z.string().trim().optional(),
  pricePerNight: z.coerce.number().positive("Gecelik fiyat 0'dan büyük olmalıdır."),
  capacity: z.coerce.number().int().min(1, "Kapasite en az 1 olmalıdır."),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(1),
  isFeatured: z.boolean().default(false),
  amenityIds: z.array(z.string()).default([]),
  images: z.array(propertyImageInputSchema).default([]),
});

export type UpsertPropertyInput = z.infer<typeof upsertPropertySchema>;

export async function upsertPropertyAction(rawInput: UpsertPropertyInput) {
  await requireAdminSession();

  const parsed = upsertPropertySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Geçersiz ilan verisi.",
    };
  }

  const data = parsed.data;
  const normalizedSlug = data.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");

  // Kapak görseli seçilmemişse ilk görseli kapak yap
  const preparedImages = data.images.map((img, idx) => ({
    url: img.url,
    altText: img.altText || data.title,
    order: typeof img.order === "number" ? img.order : idx,
    isCover: data.images.some((i) => i.isCover) ? img.isCover : idx === 0,
  }));

  try {
    const property = await prisma.$transaction(async (tx) => {
      if (data.id) {
        await tx.propertyAmenity.deleteMany({ where: { propertyId: data.id } });
        await tx.propertyImage.deleteMany({ where: { propertyId: data.id } });

        return tx.property.update({
          where: { id: data.id },
          data: {
            title: data.title,
            slug: normalizedSlug,
            description: data.description,
            type: data.type,
            status: data.status,
            city: data.city,
            district: data.district,
            address: data.address || null,
            pricePerNight: data.pricePerNight.toFixed(2),
            capacity: data.capacity,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            isFeatured: data.isFeatured,
            amenities: {
              create: data.amenityIds.map((amenityId) => ({ amenityId })),
            },
            images: {
              create: preparedImages,
            },
          },
        });
      }

      return tx.property.create({
        data: {
          title: data.title,
          slug: normalizedSlug,
          description: data.description,
          type: data.type,
          status: data.status,
          city: data.city,
          district: data.district,
          address: data.address || null,
          pricePerNight: data.pricePerNight.toFixed(2),
          capacity: data.capacity,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          isFeatured: data.isFeatured,
          amenities: {
            create: data.amenityIds.map((amenityId) => ({ amenityId })),
          },
          images: {
            create: preparedImages,
          },
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/properties");
    revalidatePath(`/properties/${property.slug}`);
    revalidatePath("/admin/properties");

    return { success: true, propertyId: property.id, slug: property.slug };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "İlan kaydedilirken hata oluştu.";
    return { success: false, error: message };
  }
}

export async function deletePropertyAction(propertyId: string) {
  await requireAdminSession();

  if (!propertyId) {
    return { success: false, error: "İlan ID zorunludur." };
  }

  try {
    const deleted = await prisma.property.delete({
      where: { id: propertyId },
      select: { id: true, slug: true },
    });

    revalidatePath("/");
    revalidatePath("/properties");
    revalidatePath(`/properties/${deleted.slug}`);
    revalidatePath("/admin/properties");

    return { success: true };
  } catch {
    return { success: false, error: "İlan silinirken hata oluştu." };
  }
}