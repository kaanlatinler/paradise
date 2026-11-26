import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getFilteredProperties } from "@/actions/properties";
import { getAllAmenities } from "@/actions/queries";
import { Pagination } from "@/components/public/Pagination";
import { PropertyCard } from "@/components/public/PropertyCard";
import { PropertyFilters } from "@/components/public/PropertyFilters";
import { ListingResultsSkeleton } from "@/components/public/PageSkeletons";
import { SortSelect } from "@/components/public/SortSelect";
import { formatDay, formatPrice, propertyTypeLabel } from "@/components/public/format";
import { Icon } from "@/components/ui/Icon";
import type { PropertyListItem } from "../_lib/data";
import { listingHref, parseListingQuery, toFilterInput, type ListingQuery, type SortKey } from "./_lib/search-params";

export const metadata: Metadata = {
  title: "Günlük Kiralık Villa, Ev ve Apart İlanları",
  description:
    "Tarih, misafir sayısı, bölge, fiyat ve özel havuz, denize sıfır gibi özelliklere göre filtrele; Akdeniz'de sana uygun konağı bul.",
  alternates: { canonical: "/properties" },
};

const PAGE_SIZE = 9;

/**
 * NOT: getFilteredProperties şu an sıralama parametresi almıyor (sabit: öne çıkan → en yeni).
 * Geliştirici A `sortBy` desteği ekleyene kadar sıralama yalnızca mevcut sayfadaki ilanlara uygulanır.
 */
function sortItems(items: PropertyListItem[], sort: SortKey) {
  const list = [...items];
  if (sort === "price_asc") list.sort((a, b) => Number(a.pricePerNight) - Number(b.pricePerNight));
  if (sort === "price_desc") list.sort((a, b) => Number(b.pricePerNight) - Number(a.pricePerNight));
  if (sort === "capacity_desc") list.sort((a, b) => b.capacity - a.capacity);
  return list;
}

function ActiveFilterChips({ q, amenityNames }: { q: ListingQuery; amenityNames: Map<string, string> }) {
  const chips: { label: string; href: string }[] = [];
  if (q.type) chips.push({ label: propertyTypeLabel(q.type), href: listingHref({ ...q, type: undefined, page: 1 }) });
  if (q.city) chips.push({ label: q.city, href: listingHref({ ...q, city: undefined, page: 1 }) });
  if (q.district) chips.push({ label: q.district, href: listingHref({ ...q, district: undefined, page: 1 }) });
  if (q.checkIn && q.checkOut)
    chips.push({
      label: `${formatDay(q.checkIn, "short")} – ${formatDay(q.checkOut, "short")}`,
      href: listingHref({ ...q, checkIn: undefined, checkOut: undefined, page: 1 }),
    });
  if (q.guests) chips.push({ label: `${q.guests}+ misafir`, href: listingHref({ ...q, guests: undefined, page: 1 }) });
  if (q.minPrice) chips.push({ label: `≥ ${formatPrice(q.minPrice)}`, href: listingHref({ ...q, minPrice: undefined, page: 1 }) });
  if (q.maxPrice) chips.push({ label: `≤ ${formatPrice(q.maxPrice)}`, href: listingHref({ ...q, maxPrice: undefined, page: 1 }) });
  if (q.featured) chips.push({ label: "Öne çıkanlar", href: listingHref({ ...q, featured: false, page: 1 }) });
  q.amenities.forEach((slug) =>
    chips.push({
      label: amenityNames.get(slug) ?? slug.replace(/-/g, " "),
      href: listingHref({ ...q, amenities: q.amenities.filter((s) => s !== slug), page: 1 }),
    }),
  );

  if (chips.length === 0) return null;

  return (
    <ul className="mb-6 flex flex-wrap gap-2" aria-label="Aktif filtreler">
      {chips.map((c) => (
        <li key={c.label + c.href}>
          <Link
            href={c.href}
            scroll={false}
            className="inline-flex items-center gap-1.5 rounded-full bg-sea-50 py-1.5 pr-2.5 pl-3 text-xs font-semibold text-sea-700 ring-1 ring-sea-100 transition hover:bg-sea-100"
          >
            {c.label}
            <Icon name="x" size={14} title="Filtreyi kaldır" />
          </Link>
        </li>
      ))}
      <li>
        <Link href={listingHref({ sort: q.sort })} scroll={false} className="inline-flex px-2 py-1.5 text-xs font-semibold text-ink-soft underline-offset-2 hover:underline">
          Tümünü temizle
        </Link>
      </li>
    </ul>
  );
}

async function ListingContent({ searchParams }: { searchParams: PageProps<"/properties">["searchParams"] }) {
  const q = parseListingQuery(await searchParams);
  const [result, amenities] = await Promise.all([getFilteredProperties(toFilterInput(q, PAGE_SIZE)), getAllAmenities()]);
  const items = sortItems(result.items, q.sort);

  // Tarih seçildiyse detay sayfasına taşı (rezervasyon formu ön dolsun)
  const carry = new URLSearchParams();
  if (q.checkIn && q.checkOut) {
    carry.set("checkIn", q.checkIn);
    carry.set("checkOut", q.checkOut);
  }
  if (q.guests) carry.set("guests", String(q.guests));
  const carryQuery = carry.toString() || undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[18.5rem_1fr]">
      <aside>
        <PropertyFilters key={listingHref(q)} initial={q} amenities={amenities} />
      </aside>

      <section aria-labelledby="results-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="results-heading" className="text-sm text-ink-soft" aria-live="polite">
            <strong className="font-display text-xl text-ink">{result.totalCount}</strong> konak bulundu
            {q.checkIn && q.checkOut ? <> · seçtiğin tarihlerde müsait</> : null}
          </h2>
          <SortSelect query={q} />
        </div>

        <ActiveFilterChips q={q} amenityNames={new Map(amenities.map((a) => [a.slug, a.name]))} />

        {items.length === 0 && result.totalCount > 0 ? (
          <div className="rounded-3xl border border-dashed border-sand-dark bg-white px-6 py-16 text-center">
            <h3 className="font-display text-xl font-semibold text-ink">Bu sayfada ilan yok</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
              Aradığın kriterlere uygun {result.totalCount} konak var; ilk sayfadan göz atabilirsin.
            </p>
            <Link href={listingHref({ ...q, page: 1 })} className="mt-6 inline-flex text-sm font-semibold text-sea-700 hover:underline">
              İlk sayfaya dön
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-sand-dark bg-white px-6 py-16 text-center">
            <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-sand text-sea-500">
              <Icon name="search" size={26} />
            </span>
            <h3 className="font-display text-xl font-semibold text-ink">Kriterlere uygun konak bulamadık</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
              Tarihleri esnetmeyi, fiyat aralığını genişletmeyi veya bazı özellikleri kaldırmayı deneyebilirsin.
            </p>
            <Link href="/properties" className="mt-6 inline-flex text-sm font-semibold text-sea-700 hover:underline">
              Tüm ilanları göster
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p, i) => (
              <PropertyCard key={p.id} property={p} priority={i < 3} query={carryQuery} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={result.currentPage}
          totalPages={result.totalPages}
          hrefFor={(page) => listingHref({ ...q, page })}
        />
      </section>
    </div>
  );
}

export default function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    <>
      <section className="border-b border-sand-dark/60 bg-sand/60">
        <div className="container-page py-10 sm:py-14">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-citrus-500 uppercase">Konaklar</p>
          <h1 className="font-display text-3xl font-semibold text-sea-700 sm:text-5xl">Akdeniz’de sana uygun konağı bul</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Villa, müstakil ev ve apartları tarihe, misafir sayısına, bölgeye ve özelliklere göre filtrele.
          </p>
        </div>
      </section>

      <div className="container-page py-8 sm:py-12">
        <Suspense fallback={<ListingResultsSkeleton />}>
          <ListingContent searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
