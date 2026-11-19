"use server";

import { Prisma, PropertyStatus, PropertyType, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface PropertyFilterInput {
  type?: PropertyType;
  city?: string;
  district?: string;
  minCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenitySlugs?: string[];
  checkIn?: string; // ISO date string
  checkOut?: string; // ISO date string
  featuredOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export async function getFilteredProperties(filters: PropertyFilterInput = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 9));
  const skip = (page - 1) * pageSize;

  const where: Prisma.PropertyWhereInput = {
    status: PropertyStatus.PUBLISHED,
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.city) {
    where.city = { equals: filters.city, mode: "insensitive" };
  }

  if (filters.district) {
    where.district = { equals: filters.district, mode: "insensitive" };
  }

  if (typeof filters.minCapacity === "number" && filters.minCapacity > 0) {
    where.capacity = { gte: filters.minCapacity };
  }

  if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
    where.pricePerNight = {
      ...(typeof filters.minPrice === "number" ? { gte: filters.minPrice } : {}),
      ...(typeof filters.maxPrice === "number" ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.featuredOnly) {
    where.isFeatured = true;
  }

  if (filters.amenitySlugs && filters.amenitySlugs.length > 0) {
    where.AND = filters.amenitySlugs.map((slug) => ({
      amenities: {
        some: {
          amenity: { slug },
        },
      },
    }));
  }

  // Tarih aralığı verilmişse onaylanmış veya bekleyen çakışan rezervasyonu olan ilanları hariç tut
  if (filters.checkIn && filters.checkOut) {
    const start = new Date(filters.checkIn);
    const end = new Date(filters.checkOut);

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start) {
      where.reservations = {
        none: {
          status: { in: [ReservationStatus.APPROVED, ReservationStatus.PENDING] },
          AND: [{ checkIn: { lt: end } }, { checkOut: { gt: start } }],
        },
      };
    }
  }

  const [totalCount, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    }),
  ]);

  // Decimal alanları Client Component'e güvenle aktarmak için serialize et
  const serializedItems = items.map((item) => ({
    ...item,
    pricePerNight: item.pricePerNight.toString(),
    amenities: item.amenities.map((a) => a.amenity),
  }));

  return {
    items: serializedItems,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}