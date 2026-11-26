/**
 * Vitrin tarafında ortak kullanılan biçimlendirme ve sabitler.
 * Sunucu ve istemci bileşenlerinde güvenle kullanılabilir (Prisma importu yok).
 */
import { intlLocale, type Dictionary, type Locale } from "@/i18n";

export type PropertyTypeKey = "VILLA" | "HOUSE" | "APART";

export const PROPERTY_TYPES: { key: PropertyTypeKey; icon: string }[] = [
  { key: "VILLA", icon: "palm" },
  { key: "HOUSE", icon: "home" },
  { key: "APART", icon: "building" },
];

export function propertyTypeLabel(t: Dictionary, type: string): string {
  return isPropertyType(type) ? t.types[type].label : type;
}

export function isPropertyType(value: unknown): value is PropertyTypeKey {
  return value === "VILLA" || value === "HOUSE" || value === "APART";
}

const priceFormatters = new Map<Locale, Intl.NumberFormat>();

/** pricePerNight backend'den string gelir ("14500.00"). Para birimi her dilde TRY'dir. */
export function formatPrice(value: string | number, lang: Locale = "tr"): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  let f = priceFormatters.get(lang);
  if (!f) {
    f = new Intl.NumberFormat(intlLocale(lang), { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
    priceFormatters.set(lang, f);
  }
  return f.format(n);
}

/** next/image yalnızca yerel ve izinli uzak alan adlarını optimize edebilir; diğerleri için unoptimized kullan. */
const OPTIMIZABLE_HOSTS = new Set(["images.unsplash.com"]);

export function canOptimizeImage(url: string): boolean {
  if (url.startsWith("/")) return true;
  try {
    return OPTIMIZABLE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/* ---------- Tarih yardımcıları (UTC gün bazlı, "YYYY-MM-DD") ---------- */

/** "2026-12-01" veya tam ISO → "2026-12-01" */
export function toDayKey(value: string | Date): string {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function dayKeyToDate(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

export function addDays(key: string, days: number): string {
  const d = dayKeyToDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return toDayKey(d);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const diff = dayKeyToDate(checkOut).getTime() - dayKeyToDate(checkIn).getTime();
  return Math.round(diff / 86_400_000);
}

/** Tarayıcının yerel saatine göre bugünün gün anahtarı (yalnızca istemcide çağır). */
export function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDay(key: string, style: "long" | "short" = "long", lang: Locale = "tr"): string {
  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
      : { day: "numeric", month: "short", timeZone: "UTC" };
  return new Intl.DateTimeFormat(intlLocale(lang), options).format(dayKeyToDate(key));
}

export function formatMonth(month: string, lang: Locale = "tr"): string {
  return new Intl.DateTimeFormat(intlLocale(lang), { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${month}-01T00:00:00Z`),
  );
}
