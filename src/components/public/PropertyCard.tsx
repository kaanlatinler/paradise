import Image from "next/image";
import Link from "next/link";
import type { PropertyListItem } from "@/components/public/lib/data";
import { amenityName, fmt } from "@/i18n";
import { getI18n } from "@/i18n/server";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { LinkPendingOverlay } from "./LinkPendingOverlay";
import { canOptimizeImage, formatPrice, propertyTypeLabel } from "./format";

interface PropertyCardProps {
  property: Pick<
    PropertyListItem,
    | "slug"
    | "title"
    | "type"
    | "city"
    | "district"
    | "capacity"
    | "bedrooms"
    | "bathrooms"
    | "pricePerNight"
    | "isFeatured"
    | "images"
    | "amenities"
  >;
  /** Listenin ilk kartları için LCP önceliği */
  priority?: boolean;
  /** Tarih filtresi varsa detay sayfasına taşınır */
  query?: string;
}

export async function PropertyCard({ property, priority = false, query }: PropertyCardProps) {
  const { lang, t, href: localize } = await getI18n();
  // İlan başlıkları veritabanında Türkçe; İngilizce sayfada ekran okuyucular için dil işaretlenir
  const contentLang = lang === "tr" ? undefined : "tr";
  const cover = property.images.find((img) => img.isCover) ?? property.images[0];
  const href = `${localize(`/properties/${property.slug}`)}${query ? `?${query}` : ""}`;
  const extraAmenities = Math.max(0, property.amenities.length - 3);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.altText ?? property.title}
            fill
            priority={priority}
            unoptimized={!canOptimizeImage(cover.url)}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-soft">
            <Icon name="image" size={36} />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <Badge tone="white">{propertyTypeLabel(t, property.type)}</Badge>
          {property.isFeatured ? (
            <Badge tone="citrus">
              <Icon name="star" size={12} className="fill-current" /> {t.common.featured}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-sea-500 uppercase">
          <Icon name="map-pin" size={14} />
          {property.district}, {property.city}
        </p>

        <h3 className="mt-2 font-display text-lg leading-snug font-semibold text-ink">
          <Link href={href} lang={contentLang} className="after:absolute after:inset-0 focus-visible:outline-none">
            {property.title}
            <LinkPendingOverlay />
          </Link>
        </h3>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
          <li className="inline-flex items-center gap-1.5">
            <Icon name="users" size={16} /> {fmt(t.common.guests, { n: property.capacity })}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Icon name="bed" size={16} /> {fmt(t.common.bedrooms, { n: property.bedrooms })}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Icon name="bath" size={16} /> {fmt(t.common.bathrooms, { n: property.bathrooms })}
          </li>
        </ul>

        {property.amenities.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((a) => (
              <li key={a.id}>
                <Badge tone="sea">
                  <Icon name={a.icon ?? "sparkles"} size={12} /> {amenityName(t, a)}
                </Badge>
              </li>
            ))}
            {extraAmenities > 0 ? (
              <li>
                <Badge tone="sand">+{extraAmenities}</Badge>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="min-h-5 flex-1" />
        <div className="flex items-end justify-between gap-3 border-t border-sand pt-4">
          <p>
            <span className="font-display text-2xl font-semibold text-citrus-500">{formatPrice(property.pricePerNight, lang)}</span>
            <span className="text-sm text-ink-soft"> {t.common.perNight}</span>
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-sea-700 transition group-hover:gap-2">
            {t.common.view} <Icon name="arrow-right" size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
