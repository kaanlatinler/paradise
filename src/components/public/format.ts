/**
 * Vitrin tarafında ortak kullanılan biçimlendirme ve sabitler.
 * Sunucu ve istemci bileşenlerinde güvenle kullanılabilir (Prisma importu yok).
 */

export type PropertyTypeKey = "VILLA" | "HOUSE" | "APART";

export const PROPERTY_TYPES: { key: PropertyTypeKey; label: string; plural: string; icon: string; blurb: string }[] = [
  { key: "VILLA", label: "Villa", plural: "Villalar", icon: "palm", blurb: "Özel havuzlu, bahçeli ve tam mahremiyetli" },
  { key: "HOUSE", label: "Müstakil Ev", plural: "Müstakil Evler", icon: "home", blurb: "Avlulu, sakin ve uzun konaklamaya uygun" },
  { key: "APART", label: "Apart", plural: "Apartlar", icon: "building", blurb: "Plaja yakın, pratik ve ekonomik" },
];

export function propertyTypeLabel(type: string): string {
  return PROPERTY_TYPES.find((t) => t.key === type)?.label ?? type;
}

export function isPropertyType(value: unknown): value is PropertyTypeKey {
  return value === "VILLA" || value === "HOUSE" || value === "APART";
}

const tryFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

/** pricePerNight backend'den string gelir ("14500.00"). */
export function formatPrice(value: string | number): string {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? tryFormatter.format(n) : "—";
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

const longDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });

export function formatDay(key: string, style: "long" | "short" = "long"): string {
  return (style === "long" ? longDate : shortDate).format(dayKeyToDate(key));
}
