import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getFilteredProperties } from "@/actions/properties";
import { getBookedDateRanges } from "@/actions/queries";
import { PropertyCard } from "@/components/public/PropertyCard";
import { PropertyGallery } from "@/components/public/PropertyGallery";
import { ReservationRequestForm } from "@/components/public/ReservationRequestForm";
import { SectionHeading } from "@/components/public/SectionHeading";
import { formatPrice, propertyTypeLabel } from "@/components/public/format";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { getPropertyBySlug, type PropertyDetail } from "../../_lib/data";

type Props = PageProps<"/properties/[slug]">;

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) {
    return { title: "İlan bulunamadı", robots: { index: false } };
  }

  const cover = property.images.find((i) => i.isCover) ?? property.images[0];
  const title = `${property.title} — ${property.district}, ${property.city}`;
  const description = `${propertyTypeLabel(property.type)} · ${property.capacity} kişi · ${property.bedrooms} yatak odası · ${formatPrice(
    property.pricePerNight,
  )}/gece. ${property.description}`.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: cover ? [{ url: cover.url, alt: cover.altText ?? property.title }] : undefined,
    },
  };
}

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function JsonLd({ property }: { property: PropertyDetail }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: property.title,
    description: property.description,
    image: property.images.map((i) => i.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.district,
      addressRegion: property.city,
      addressCountry: "TR",
      streetAddress: property.address ?? undefined,
    },
    containsPlace: {
      "@type": "Accommodation",
      occupancy: { "@type": "QuantitativeValue", maxValue: property.capacity },
      numberOfBedrooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
      amenityFeature: property.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.name, value: true })),
    },
    priceRange: `${formatPrice(property.pricePerNight)} / gece`,
  };
  return (
    <script
      type="application/ld+json"
      // JSON içinde "</script>" kapanışını engelle
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

async function SimilarProperties({ type, excludeId }: { type: PropertyDetail["type"]; excludeId: string }) {
  const { items } = await getFilteredProperties({ type, pageSize: 4 });
  const list = items.filter((p) => p.id !== excludeId).slice(0, 3);
  if (list.length === 0) return null;
  return (
    <section className="border-t border-sand-dark/60 bg-sand/50 py-14" aria-labelledby="similar-heading">
      <div className="container-page">
        <SectionHeading eyebrow="Bunlar da ilgini çekebilir" title={`Benzer ${propertyTypeLabel(type)} İlanları`} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

async function PropertyDetailContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [booked, sp] = await Promise.all([getBookedDateRanges(property.id), searchParams]);
  const checkIn = first(sp.checkIn);
  const checkOut = first(sp.checkOut);
  const guests = Number(first(sp.guests));

  const stats = [
    { icon: "users", label: "Kapasite", value: `${property.capacity} kişi` },
    { icon: "bed", label: "Yatak odası", value: property.bedrooms },
    { icon: "bath", label: "Banyo", value: property.bathrooms },
    { icon: property.type === "VILLA" ? "palm" : property.type === "APART" ? "building" : "home", label: "Tip", value: propertyTypeLabel(property.type) },
  ];

  return (
    <>
      <JsonLd property={property} />

      <div className="container-page pt-6 pb-14 sm:pt-8">
        <nav aria-label="Sayfa yolu" className="mb-5 text-sm text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-sea-700">
                Anasayfa
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/properties?type=${property.type}`} className="hover:text-sea-700">
                {propertyTypeLabel(property.type)}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="truncate font-medium text-ink" aria-current="page">
              {property.title}
            </li>
          </ol>
        </nav>

        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge tone="sea">{propertyTypeLabel(property.type)}</Badge>
              {property.isFeatured ? (
                <Badge tone="citrus">
                  <Icon name="star" size={12} className="fill-current" /> Öne Çıkan
                </Badge>
              ) : null}
            </div>
            <h1 className="font-display text-3xl leading-tight font-semibold text-balance text-sea-700 sm:text-4xl">
              {property.title}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-ink-soft">
              <Icon name="map-pin" size={18} className="text-citrus-500" />
              {property.address ? `${property.address}, ` : ""}
              {property.district}, {property.city}
            </p>
          </div>
        </header>

        <PropertyGallery
          title={property.title}
          images={property.images.map((i) => ({ id: i.id, url: i.url, altText: i.altText }))}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
          <div className="min-w-0 space-y-10">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <li key={s.label} className="rounded-2xl border border-sand-dark/70 bg-white p-4">
                  <Icon name={s.icon} size={22} className="mb-2 text-sea-500" />
                  <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{s.label}</p>
                  <p className="font-display text-lg font-semibold text-ink">{s.value}</p>
                </li>
              ))}
            </ul>

            <section aria-labelledby="desc-heading">
              <h2 id="desc-heading" className="mb-3 font-display text-2xl font-semibold text-ink">
                Konak hakkında
              </h2>
              <div className="space-y-4 leading-relaxed whitespace-pre-line text-ink/90">{property.description}</div>
            </section>

            {property.amenities.length > 0 ? (
              <section aria-labelledby="amenities-heading">
                <h2 id="amenities-heading" className="mb-4 font-display text-2xl font-semibold text-ink">
                  Özellikler
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {property.amenities.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-card">
                      <span className="grid size-10 place-items-center rounded-xl bg-sea-50 text-sea-500">
                        <Icon name={a.icon ?? "sparkles"} size={20} />
                      </span>
                      <span className="font-medium text-ink">{a.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="rules-heading" className="rounded-3xl bg-sand/70 p-6">
              <h2 id="rules-heading" className="mb-3 font-display text-xl font-semibold text-ink">
                Rezervasyon nasıl işler?
              </h2>
              <ol className="space-y-2.5 text-sm text-ink-soft">
                {[
                  "Takvimden müsait tarihleri seç ve talep formunu doldur.",
                  "Ekibimiz müsaitliği ve detayları teyit ederek seninle iletişime geçer.",
                  "Onay sonrası rezervasyonun kesinleşir; talep göndermek ücretsizdir.",
                ].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-citrus-400 text-xs font-bold text-ink">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside id="rezervasyon" className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-sand-dark/60">
              <ReservationRequestForm
                propertyId={property.id}
                propertyTitle={property.title}
                pricePerNight={property.pricePerNight}
                capacity={property.capacity}
                bookedRanges={booked}
                initialCheckIn={checkIn && DAY_RE.test(checkIn) ? checkIn : undefined}
                initialCheckOut={checkOut && DAY_RE.test(checkOut) ? checkOut : undefined}
                initialGuests={Number.isFinite(guests) && guests > 0 ? guests : undefined}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobil: sabit alt rezervasyon çubuğu */}
      <div className="sticky bottom-0 z-30 flex items-center justify-between gap-3 border-t border-sand-dark bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <p>
          <span className="font-display text-xl font-semibold text-citrus-500">{formatPrice(property.pricePerNight)}</span>
          <span className="text-sm text-ink-soft"> / gece</span>
        </p>
        <a
          href="#rezervasyon"
          className="inline-flex h-11 items-center rounded-full bg-citrus-500 px-5 text-sm font-semibold text-white"
        >
          Tarih seç
        </a>
      </div>

      <Suspense fallback={null}>
        <SimilarProperties type={property.type} excludeId={property.id} />
      </Suspense>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page pt-8 pb-14" role="status" aria-label="İlan yükleniyor">
      <Skeleton className="mb-5 h-4 w-60" />
      <Skeleton className="mb-3 h-10 w-full max-w-xl" />
      <Skeleton className="mb-6 h-5 w-72" />
      <Skeleton className="h-[20rem] rounded-3xl sm:h-[32rem]" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-[36rem] rounded-3xl" />
      </div>
    </div>
  );
}

export default function PropertyDetailPage(props: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PropertyDetailContent {...props} />
    </Suspense>
  );
}
