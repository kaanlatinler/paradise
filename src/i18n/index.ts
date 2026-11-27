import { en } from "./dictionaries/en";
import { tr, type Dictionary } from "./dictionaries/tr";
import { localizePath, type Locale } from "./config";

export type { Dictionary } from "./dictionaries/tr";
export * from "./config";

const dictionaries: Record<Locale, Dictionary> = { tr, en };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** "{n} kişi" + { n: 4 } → "4 kişi" */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

export interface I18n {
  lang: Locale;
  t: Dictionary;
  /** Uygulama içi yolu dile göre adrese çevirir */
  href: (path: string) => string;
}

export function makeI18n(lang: Locale): I18n {
  return { lang, t: getDictionary(lang), href: (path) => localizePath(lang, path) };
}

/** Özellik adını dile göre verir (bilinmeyen slug'larda veritabanındaki ad kullanılır). */
export function amenityName(t: Dictionary, amenity: { slug: string; name: string }): string {
  return t.amenities[amenity.slug] ?? amenity.name;
}
