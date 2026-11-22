import { cache } from "react";
import { getSiteContentMap } from "@/actions/admin-cms";
import { getFilteredProperties } from "@/actions/properties";
import { getPublishedPropertyBySlug } from "@/actions/queries";

/**
 * Geliştirici A'nın hazırladığı sorgu fonksiyonlarının istek bazlı (request-scoped) önbellekli sarmalayıcıları.
 * Aynı istekte Navbar, Footer, Hero gibi birden çok bileşen CMS verisi istediğinde veritabanına tek sorgu gider.
 */
export const getCms = cache(getSiteContentMap);
export const getPropertyBySlug = cache(getPublishedPropertyBySlug);

export type PropertyListResult = Awaited<ReturnType<typeof getFilteredProperties>>;
export type PropertyListItem = PropertyListResult["items"][number];
export type PropertyDetail = NonNullable<Awaited<ReturnType<typeof getPublishedPropertyBySlug>>>;

/** CMS değerleri boş gelirse kullanılacak varsayılanlar (seed ile aynı tonda). */
export const CMS_DEFAULTS: Record<string, string> = {
  hero_title: "Deniz, Güneş ve Turunç Kokusu Arasında Tatil",
  hero_subtitle: "Özenle seçilmiş villalar, sahil apartları ve müstakil evlerle Akdeniz'i keşfet.",
  hero_banner_url:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  contact_phone: "+90 242 000 00 00",
  contact_email: "rezervasyon@akdenizstay.com",
  about_text: "Akdeniz'in kıyı şeridinde güvenilir, şeffaf ve özenli kiralama deneyimi sunuyoruz.",
};

export function cmsValue(map: Record<string, string>, key: string): string {
  const v = map[key]?.trim();
  return v ? v : (CMS_DEFAULTS[key] ?? "");
}
