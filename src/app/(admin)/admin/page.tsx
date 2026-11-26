import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAdminDashboardStats } from "@/actions/admin-dashboard";
import { AdminCard, AdminContainer, AdminPageHeader, adminDate, adminPrice, nightsOf } from "@/components/admin/ui";
import { ReservationActions } from "@/components/admin/ReservationActions";
import { Icon } from "@/components/ui/Icon";
import { LoadingBadge } from "@/components/public/LoadingBadge";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "Genel Bakış" };

function StatCard({
  icon,
  label,
  value,
  hint,
  href,
  tone = "sea",
}: {
  icon: string;
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  tone?: "sea" | "citrus";
}) {
  const body = (
    <AdminCard className="flex h-full items-start gap-4 p-5 transition hover:shadow-lift">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${
          tone === "citrus" ? "bg-citrus-50 text-citrus-500" : "bg-sea-50 text-sea-500"
        }`}
      >
        <Icon name={icon} size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-ink-soft">{hint}</p> : null}
      </div>
    </AdminCard>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

async function DashboardContent() {
  const stats = await getAdminDashboardStats();

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="message-circle"
          tone="citrus"
          label="Bekleyen talepler"
          value={stats.pendingReservationsCount}
          hint="Onay veya ret bekliyor"
          href="/admin/reservations?status=PENDING"
        />
        <StatCard
          icon="building"
          label="Yayındaki ilanlar"
          value={`${stats.publishedPropertiesCount} / ${stats.totalPropertiesCount}`}
          hint="Yayında / toplam"
          href="/admin/properties"
        />
        <StatCard
          icon="calendar"
          label="Bu ay doluluk"
          value={`%${stats.occupancyRate.toLocaleString("tr-TR")}`}
          hint={`${stats.bookedNightsThisMonth} / ${stats.totalAvailableNights} gece`}
        />
        <StatCard icon="sparkles" label="Bu ay onaylı gelir" value={adminPrice(stats.approvedRevenueThisMonth)} hint="Onaylı rezervasyonlar" />
      </div>

      <AdminCard className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-sand-dark/70 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">Son bekleyen talepler</h2>
          <Link href="/admin/reservations" className="text-sm font-semibold text-sea-700 hover:underline">
            Tümünü gör
          </Link>
        </div>
        {stats.recentPendingReservations.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">Bekleyen rezervasyon talebi yok. 🎉</p>
        ) : (
          <ul className="divide-y divide-sand-dark/60">
            {stats.recentPendingReservations.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{r.guestName}</p>
                  <p className="truncate text-sm text-ink-soft">
                    {r.propertyTitle} · {r.location}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {adminDate(r.checkIn)} – {adminDate(r.checkOut)} · {nightsOf(r.checkIn, r.checkOut)} gece ·{" "}
                    <span className="font-semibold text-citrus-600">{adminPrice(r.totalPrice)}</span> ·{" "}
                    <a href={`tel:${r.guestPhone.replace(/[^\d+]/g, "")}`} className="text-sea-700 hover:underline">
                      {r.guestPhone}
                    </a>
                  </p>
                </div>
                <ReservationActions reservationId={r.id} status="PENDING" />
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <LoadingBadge />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-8 h-72 rounded-2xl" />
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminContainer>
      <AdminPageHeader
        title="Genel Bakış"
        description="Bu ayın doluluk, gelir ve bekleyen talep özetiniz."
        action={
          <Link
            href="/admin/properties/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-citrus-500 px-4 text-sm font-semibold text-white hover:bg-citrus-600"
          >
            <Icon name="sparkles" size={16} /> Yeni ilan
          </Link>
        }
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </AdminContainer>
  );
}
