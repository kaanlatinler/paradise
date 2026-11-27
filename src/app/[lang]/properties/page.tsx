import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getFilteredProperties } from "@/actions/properties";
import { formatDay, formatPrice, propertyTypeLabel } from "@/components/public/format";
import { getAmenities, getLocations } from "@/components/public/lib/data";
import { listingHref, parseListingQuery, toFilterInput, type ListingQuery } from "@/components/public/lib/search-params";
import { ListingResultsSkeleton } from "@/components/public/PageSkeletons";
import { Pagination } from "@/components/public/Pagination";
import { PropertyCard } from "@/components/public/PropertyCard";
import { PropertyFilters } from "@/components/public/PropertyFilters";
import { SortSelect } from "@/components/public/SortSelect";
import { Icon } from "@/components/ui/Icon";
import { amenityName, fmt, type I18n } from "@/i18n";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t, href } = await getI18n();
  return {
    title: t.meta.listingTitle,
    description: t.meta.listingDescription,
    alternates: { canonical: href("/properties"), languages: { tr: "/properties", en: "/en/properties" } },
  };
}

const PAGE_SIZE = 9;

function ActiveFilterChips({
  q,
  i18n,
  amenityNames,
}: {
  q: ListingQuery;
  i18n: I18n;
  amenityNames: Map<string, string>;
}) {
  const { lang, t } = i18n;
  const href = (patch: Partial<ListingQuery>) => listingHref(lang, { ...q, ...patch, page: 1 });
  const chips: { label: string; href: string }[] = [];
  if (q.type) chips.push({ label: propertyTypeLabel(t, q.type), href: href({ type: undefined }) });
  if (q.city) chips.push({ label: q.city, href: href({ city: undefined, district: undefined }) });
  if (q.district) chips.push({ label: q.district, href: href({ district: undefined }) });
  if (q.checkIn && q.checkOut)
    chips.push({
      label: `${formatDay(q.checkIn, "short", lang)} – ${formatDay(q.checkOut, "short", lang)}`,
      href: href({ checkIn: undefined, checkOut: undefined }),
    });
  if (q.guests) chips.push({ label: fmt(t.listing.guestsChip, { n: q.guests }), href: href({ guests: undefined }) });
  if (q.minPrice) chips.push({ label: `≥ ${formatPrice(q.minPrice, lang)}`, href: href({ minPrice: undefined }) });
  if (q.maxPrice) chips.push({ label: `≤ ${formatPrice(q.maxPrice, lang)}`, href: href({ maxPrice: undefined }) });
  if (q.featured) chips.push({ label: t.listing.featuredChip, href: href({ featured: false }) });
  q.amenities.forEach((slug) =>
    chips.push({
      label: amenityNames.get(slug) ?? slug.replace(/-/g, " "),
      href: href({ amenities: q.amenities.filter((s) => s !== slug) }),
    }),
  );

  if (chips.length === 0) return null;

  return (
    <ul className="mb-6 flex flex-wrap gap-2" aria-label={t.listing.activeFilters}>
      {chips.map((c) => (
        <li key={c.label + c.href}>
          <Link
            href={c.href}
            scroll={false}
            className="inline-flex items-center gap-1.5 rounded-full bg-sea-50 py-1.5 pr-2.5 pl-3 text-xs font-semibold text-sea-700 ring-1 ring-sea-100 transition hover:bg-sea-100"
          >
            {c.label}
            <Icon name="x" size={14} title={t.listing.removeFilter} />
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={listingHref(lang, { sort: q.sort })}
          scroll={false}
          className="inline-flex px-2 py-1.5 text-xs font-semibold text-ink-soft underline-offset-2 hover:underline"
        >
          {t.listing.clearAll}
        </Link>
      </li>
    </ul>
  );
}

async function ListingContent({ searchParams }: { searchParams: PageProps<"/[lang]/properties">["searchParams"] }) {
  const i18n = await getI18n();
  const { lang, t } = i18n;
  const q = parseListingQuery(await searchParams);
  const [result, amenities, locations] = await Promise.all([
    getFilteredProperties(toFilterInput(q, PAGE_SIZE)),
    getAmenities(),
    getLocations(),
  ]);

  // Tarih seçildiyse detay sayfasına taşı (rezervasyon formu ön dolsun)
  const carry = new URLSearchParams();
  if (q.checkIn && q.checkOut) {
    carry.set("checkIn", q.checkIn);
    carry.set("checkOut", q.checkOut);
  }
  if (q.guests) carry.set("guests", String(q.guests));
  const carryQuery = carry.toString() || undefined;
  const items = result.items;

  return (
    <div className="grid gap-8 lg:grid-cols-[18.5rem_1fr]">
      <aside>
        <PropertyFilters key={listingHref(lang, q)} initial={q} amenities={amenities} locations={locations} />
      </aside>

      <section aria-labelledby="results-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="results-heading" className="text-sm text-ink-soft" aria-live="polite">
            <strong className="font-display text-xl text-ink">{result.totalCount}</strong> {t.listing.found}
            {q.checkIn && q.checkOut ? <> · {t.listing.availableOnDates}</> : null}
          </h2>
          <SortSelect query={q} />
        </div>

        <ActiveFilterChips q={q} i18n={i18n} amenityNames={new Map(amenities.map((a) => [a.slug, amenityName(t, a)]))} />

        {items.length === 0 && result.totalCount > 0 ? (
          <div className="rounded-3xl border border-dashed border-sand-dark bg-white px-6 py-16 text-center">
            <h3 className="font-display text-xl font-semibold text-ink">{t.listing.pageEmptyTitle}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{fmt(t.listing.pageEmptyText, { n: result.totalCount })}</p>
            <Link href={listingHref(lang, { ...q, page: 1 })} className="mt-6 inline-flex text-sm font-semibold text-sea-700 hover:underline">
              {t.listing.backToFirst}
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-sand-dark bg-white px-6 py-16 text-center">
            <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-sand text-sea-500">
              <Icon name="search" size={26} />
            </span>
            <h3 className="font-display text-xl font-semibold text-ink">{t.listing.emptyTitle}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{t.listing.emptyText}</p>
            <Link href={listingHref(lang, {})} className="mt-6 inline-flex text-sm font-semibold text-sea-700 hover:underline">
              {t.listing.showAll}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p, i) => (
              <PropertyCard key={p.id} property={p} priority={i < 3} query={carryQuery} />
            ))}
          </div>
        )}

        <Pagination currentPage={result.currentPage} totalPages={result.totalPages} hrefFor={(page) => listingHref(lang, { ...q, page })} />
      </section>
    </div>
  );
}

export default async function PropertiesPage({ searchParams }: PageProps<"/[lang]/properties">) {
  const { t } = await getI18n();
  return (
    <>
      <section className="border-b border-sand-dark/60 bg-sand/60">
        <div className="container-page py-10 sm:py-14">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-citrus-500 uppercase">{t.listing.eyebrow}</p>
          <h1 className="font-display text-3xl font-semibold text-sea-700 sm:text-5xl">{t.listing.title}</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">{t.listing.description}</p>
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
