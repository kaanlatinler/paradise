"use server";

import { PropertyStatus, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function getAdminDashboardStats() {
  await requireAdminSession();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const [
    publishedPropertiesCount,
    totalPropertiesCount,
    pendingReservationsCount,
    approvedMonthReservations,
    recentPendingReservations,
  ] = await Promise.all([
    prisma.property.count({
      where: { status: PropertyStatus.PUBLISHED },
    }),
    prisma.property.count(),
    prisma.reservation.count({
      where: { status: ReservationStatus.PENDING },
    }),
    prisma.reservation.findMany({
      where: {
        status: ReservationStatus.APPROVED,
        checkIn: { lte: monthEnd },
        checkOut: { gte: monthStart },
      },
      select: {
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        property: {
          select: { status: true },
        },
      },
    }),
    prisma.reservation.findMany({
      where: { status: ReservationStatus.PENDING },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        property: {
          select: { title: true, district: true, city: true },
        },
      },
    }),
  ]);

  // Mevcut ay içindeki onaylı gece sayısını hesapla
  const msPerDay = 1000 * 60 * 60 * 24;
  let bookedNightsThisMonth = 0;
  let approvedRevenueThisMonth = 0;

  for (const res of approvedMonthReservations) {
    const effectiveStart = res.checkIn > monthStart ? res.checkIn : monthStart;
    const effectiveEnd = res.checkOut < monthEnd ? res.checkOut : monthEnd;

    if (effectiveEnd > effectiveStart) {
      const nights = Math.max(
        1,
        Math.round((effectiveEnd.getTime() - effectiveStart.getTime()) / msPerDay)
      );
      bookedNightsThisMonth += nights;
    }

    approvedRevenueThisMonth += Number(res.totalPrice || 0);
  }

  const totalAvailableNights = publishedPropertiesCount * daysInMonth;
  const occupancyRate =
    totalAvailableNights > 0
      ? Math.min(100, Number(((bookedNightsThisMonth / totalAvailableNights) * 100).toFixed(1)))
      : 0;

  return {
    publishedPropertiesCount,
    totalPropertiesCount,
    pendingReservationsCount,
    occupancyRate,
    bookedNightsThisMonth,
    totalAvailableNights,
    approvedRevenueThisMonth: approvedRevenueThisMonth.toFixed(2),
    recentPendingReservations: recentPendingReservations.map((r) => ({
      id: r.id,
      guestName: r.guestName,
      guestPhone: r.guestPhone,
      checkIn: r.checkIn.toISOString(),
      checkOut: r.checkOut.toISOString(),
      totalPrice: r.totalPrice.toString(),
      propertyTitle: r.property.title,
      location: `${r.property.district}, ${r.property.city}`,
    })),
  };
}