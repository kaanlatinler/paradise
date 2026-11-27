import { cache } from "react";
import { getSiteContentMap } from "@/actions/admin-cms";
import { getFilteredProperties, getPropertyLocations } from "@/actions/properties";
import { getAllAmenities, getPublishedPropertyBySlug } from "@/actions/queries";
import type { Locale } from "@/i18n";

/**
 * Geliştirici A'nın sorgu fonksiyonlarının istek bazlı (request-scoped) önbellekli sarmalayıcıları.
 * Aynı istekte Navbar, Footer, Hero gibi birden çok bileşen CMS verisi istediğinde veritabanına tek sorgu gider.
 */
export const getCms = cache(getSiteContentMap);
export const getPropertyBySlug = cache(getPublishedPropertyBySlug);
export const getLocations = cache(getPropertyLocations);
export const getAmenities = cache(getAllAmenities);

export type PropertyListResult = Awaited<ReturnType<typeof getFilteredProperties>>;
export type PropertyListItem = PropertyListResult["items"][number];
export type PropertyDetail = NonNullable<Awaited<ReturnType<typeof getPublishedPropertyBySlug>>>;
export type LocationOption = Awaited<ReturnType<typeof getPropertyLocations>>[number];

/** CMS değerleri boş gelirse kullanılacak varsayılanlar. İngilizce için anahtarların sonuna "_en" eklenir. */
const CMS_DEFAULTS: Record<Locale, Record<string, string>> = {
  tr: {
    hero_title: "Deniz, Güneş ve Turunç Kokusu Arasında Tatil",
    hero_subtitle: "Özenle seçilmiş villalar, sahil apartları ve müstakil evlerle Akdeniz'i keşfet.",
    about_text: "Akdeniz'in kıyı şeridinde güvenilir, şeffaf ve özenli kiralama deneyimi sunuyoruz.",
  },
  en: {
    hero_title: "A Holiday Between the Sea, the Sun and the Scent of Citrus",
    hero_subtitle: "Discover the Mediterranean with hand-picked villas, seaside apartments and detached houses.",
    about_text: "We offer a trustworthy, transparent and caring rental experience along the Mediterranean coast.",
  },
};

const SHARED_DEFAULTS: Record<string, string> = {
  hero_banner_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  contact_phone: "+90 242 000 00 00",
  contact_email: "rezervasyon@akdenizstay.com",
};

/** Çevrilebilir CMS anahtarları (admin içerik sayfasında İngilizce alanı gösterilenler) */
export const TRANSLATABLE_CMS_KEYS = ["hero_title", "hero_subtitle", "about_text"] as const;

/**
 * CMS değerini dile göre döndürür.
 * İngilizce: önce "anahtar_en", yoksa İngilizce varsayılan; Türkçe: "anahtar", yoksa Türkçe varsayılan.
 */
export function cmsValue(map: Record<string, string>, key: string, lang: Locale = "tr"): string {
  if (lang !== "tr") {
    const translated = map[`${key}_${lang}`]?.trim();
    if (translated) return translated;
    if (CMS_DEFAULTS[lang][key]) return CMS_DEFAULTS[lang][key];
  }
  const v = map[key]?.trim();
  if (v) return v;
  return CMS_DEFAULTS.tr[key] ?? SHARED_DEFAULTS[key] ?? "";
}
