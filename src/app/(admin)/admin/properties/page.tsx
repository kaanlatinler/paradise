import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getAdminProperties } from "@/actions/queries";
import { DeletePropertyButton } from "@/components/admin/DeletePropertyButton";
import { AdminCard, AdminContainer, AdminPageHeader, adminPrice, PROPERTY_TYPE_LABELS, PropertyStatusBadge } from "@/components/admin/ui";
import { canOptimizeImage } from "@/components/public/format";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { LoadingBadge } from "@/components/public/LoadingBadge";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "İlanlar" };

async function PropertiesTable() {
  const rows = await getAdminProperties();

  if (rows.length === 0) {
    return (
      <AdminCard className="px-6 py-16 text-center">
        <p className="font-display text-xl font-semibold text-ink">Henüz ilan yok</p>
        <p className="mt-1 text-sm text-ink-soft">İlk villanızı, evinizi veya apartınızı ekleyerek başlayın.</p>
        <Link
          href="/admin/properties/new"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-citrus-500 px-4 text-sm font-semibold text-white hover:bg-citrus-600"
        >
          Yeni ilan ekle
        </Link>
      </AdminCard>
    );
  }

  return (
    <AdminCard className="overflow-hidden">
      <ul className="divide-y divide-sand-dark/60">
        {rows.map((p) => (
          <li key={p.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-sand sm:w-32">
              {p.coverUrl ? (
                <Image src={p.coverUrl} alt="" fill sizes="128px" unoptimized={!canOptimizeImage(p.coverUrl)} className="object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-ink-soft">
                  <Icon name="image" size={24} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <PropertyStatusBadge status={p.status} />
                <Badge tone="sand">{PROPERTY_TYPE_LABELS[p.type] ?? p.type}</Badge>
                {p.isFeatured ? (
                  <Badge tone="citrus">
                    <Icon name="star" size={12} className="fill-current" /> Öne çıkan
                  </Badge>
                ) : null}
              </div>
              <Link href={`/admin/properties/${p.id}`} className="mt-1.5 block truncate font-semibold text-ink hover:text-sea-700">
                {p.title}
              </Link>
              <p className="text-sm text-ink-soft">
                {p.district}, {p.city} · {p.capacity} kişi · <span className="font-semibold text-citrus-600">{adminPrice(p.pricePerNight)}</span>
                /gece · {p.reservationCount} rezervasyon
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {p.status === "PUBLISHED" ? (
                <Link
                  href={`/properties/${p.slug}`}
                  target="_blank"
                  className="inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold text-ink-soft hover:bg-sand"
                >
                  Sitede gör
                </Link>
              ) : null}
              <Link
                href={`/admin/properties/${p.id}`}
                className="inline-flex h-9 items-center rounded-full border border-sea-500/30 bg-white px-3.5 text-xs font-semibold text-sea-700 hover:border-sea-500 hover:bg-sea-50"
              >
                Düzenle
              </Link>
              <DeletePropertyButton propertyId={p.id} title={p.title} reservationCount={p.reservationCount} />
            </div>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}

export default function AdminPropertiesPage() {
  return (
    <AdminContainer>
      <AdminPageHeader
        title="İlanlar"
        description="Tüm villa, müstakil ev ve apart ilanlarınız; taslak ve arşivdekiler dahil."
        action={
          <Link
            href="/admin/properties/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-citrus-500 px-4 text-sm font-semibold text-white hover:bg-citrus-600"
          >
            <Icon name="sparkles" size={16} /> Yeni ilan
          </Link>
        }
      />
      <Suspense
        fallback={
          <>
            <LoadingBadge />
            <Skeleton className="h-[28rem] rounded-2xl" />
          </>
        }
      >
        <PropertiesTable />
      </Suspense>
    </AdminContainer>
  );
}
