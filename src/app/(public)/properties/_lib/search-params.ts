import type { PropertyFilterInput } from "@/actions/properties";
import { isPropertyType, type PropertyTypeKey } from "@/components/public/format";

export type SortKey = "recommended" | "price_asc" | "price_desc" | "capacity_desc";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Önerilen" },
  { key: "price_asc", label: "Fiyat: Düşükten yükseğe" },
  { key: "price_desc", label: "Fiyat: Yüksekten düşüğe" },
  { key: "capacity_desc", label: "Kapasite: En geniş" },
];

/** URL'deki filtre durumu (formda ve aktif filtre çiplerinde kullanılır) */
export interface ListingQuery {
  type?: PropertyTypeKey;
  city?: string;
  district?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities: string[];
  checkIn?: string;
  checkOut?: string;
  featured: boolean;
  sort: SortKey;
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function first(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() || undefined;
}

function positiveInt(v: string | string[] | undefined): number | undefined {
  const n = Number(first(v));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}

export function parseListingQuery(raw: RawParams): ListingQuery {
  const type = first(raw.type);
  const amenitiesRaw = raw.amenities;
  const amenities = (Array.isArray(amenitiesRaw) ? amenitiesRaw : (amenitiesRaw ?? "").split(","))
    .map((s) => s.trim())
    .filter(Boolean);

  let checkIn = first(raw.checkIn);
  let checkOut = first(raw.checkOut);
  if (!checkIn || !DAY_RE.test(checkIn) || !checkOut || !DAY_RE.test(checkOut) || checkOut <= checkIn) {
    checkIn = undefined;
    checkOut = undefined;
  }

  let minPrice = positiveInt(raw.minPrice);
  let maxPrice = positiveInt(raw.maxPrice);
  if (minPrice && maxPrice && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];

  const sortRaw = first(raw.sort);
  const sort = SORT_OPTIONS.some((o) => o.key === sortRaw) ? (sortRaw as SortKey) : "recommended";

  return {
    type: isPropertyType(type) ? type : undefined,
    city: first(raw.city),
    district: first(raw.district),
    guests: positiveInt(raw.guests),
    minPrice,
    maxPrice,
    amenities: [...new Set(amenities)],
    checkIn,
    checkOut,
    featured: first(raw.featured) === "1",
    sort,
    page: positiveInt(raw.page) ?? 1,
  };
}

export function toFilterInput(q: ListingQuery, pageSize = 9): PropertyFilterInput {
  return {
    type: q.type,
    city: q.city,
    district: q.district,
    minCapacity: q.guests,
    minPrice: q.minPrice,
    maxPrice: q.maxPrice,
    amenitySlugs: q.amenities.length ? q.amenities : undefined,
    checkIn: q.checkIn,
    checkOut: q.checkOut,
    featuredOnly: q.featured || undefined,
    page: q.page,
    pageSize,
  };
}

/** ListingQuery → URLSearchParams (varsayılan değerler URL'ye yazılmaz) */
export function toSearchParams(q: Partial<ListingQuery>): URLSearchParams {
  const p = new URLSearchParams();
  if (q.type) p.set("type", q.type);
  if (q.city) p.set("city", q.city);
  if (q.district) p.set("district", q.district);
  if (q.guests) p.set("guests", String(q.guests));
  if (q.minPrice) p.set("minPrice", String(q.minPrice));
  if (q.maxPrice) p.set("maxPrice", String(q.maxPrice));
  if (q.amenities?.length) p.set("amenities", q.amenities.join(","));
  if (q.checkIn && q.checkOut) {
    p.set("checkIn", q.checkIn);
    p.set("checkOut", q.checkOut);
  }
  if (q.featured) p.set("featured", "1");
  if (q.sort && q.sort !== "recommended") p.set("sort", q.sort);
  if (q.page && q.page > 1) p.set("page", String(q.page));
  return p;
}

export function listingHref(q: Partial<ListingQuery>): string {
  const s = toSearchParams(q).toString();
  return s ? `/properties?${s}` : "/properties";
}
