"use server";

import { PropertyStatus, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function getAllAmenities() {
  return prisma.amenity.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, icon: true },
  });
}

export async function getPublishedPropertyBySlug(slug: string) {
  const property = await prisma.property.findFirst({
    where: { slug, status: PropertyStatus.PUBLISHED },
    include: {
      images: { orderBy: { order: "asc" } },
      amenities: { include: { amenity: true } },
    },
  });

  if (!property) return null;

  return {
    ...property,
    pricePerNight: property.pricePerNight.toString(),
    amenities: property.amenities.map((a) => a.amenity),
  };
}

export async function getBookedDateRanges(propertyId: string) {
  const rows = await prisma.reservation.findMany({
    where: {
      propertyId,
      status: { in: [ReservationStatus.APPROVED, ReservationStatus.PENDING] },
    },
    select: {
      checkIn: true,
      checkOut: true,
      status: true,
    },
    orderBy: { checkIn: "asc" },
  });

  return rows.map((r) => ({
    checkIn: r.checkIn.toISOString(),
    checkOut: r.checkOut.toISOString(),
    status: r.status,
  }));
}

export async function getAdminProperties() {
  await requireAdminSession();

  const rows = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isCover: true }, take: 1 },
      _count: { select: { reservations: true } },
    },
  });

  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    type: p.type,
    status: p.status,
    city: p.city,
    district: p.district,
    pricePerNight: p.pricePerNight.toString(),
    capacity: p.capacity,
    isFeatured: p.isFeatured,
    coverUrl: p.images[0]?.url ?? null,
    reservationCount: p._count.reservations,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function getAdminReservations() {
  await requireAdminSession();

  const rows = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        select: { id: true, title: true, city: true, district: true },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    propertyId: r.propertyId,
    propertyTitle: r.property.title,
    location: `${r.property.district}, ${r.property.city}`,
    guestName: r.guestName,
    guestEmail: r.guestEmail,
    guestPhone: r.guestPhone,
    guestCount: r.guestCount,
    checkIn: r.checkIn.toISOString(),
    checkOut: r.checkOut.toISOString(),
    totalPrice: r.totalPrice.toString(),
    status: r.status,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
  }));
}