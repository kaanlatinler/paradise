/**
 * Dil (locale) yapılandırması — sunucu ve istemci tarafında güvenle kullanılabilir.
 *
 * URL düzeni:
 *   Türkçe (varsayılan): /, /properties, /properties/[slug] ...   (proxy içeride /tr/... adresine yönlendirir)
 *   İngilizce:           /en, /en/properties, /en/properties/[slug] ...
 */
export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

export function hasLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Intl API'leri için tam yerel ayar (tarih/para biçimi) */
export function intlLocale(lang: Locale): string {
  return lang === "en" ? "en-GB" : "tr-TR";
}

/** Uygulama içi yol → dile göre görünen adres. ("/properties", "en") → "/en/properties" */
export function localizePath(lang: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/**
 * Adresten dil önekini ayıklar: "/en/properties" → { lang: "en", path: "/properties" }.
 * "/tr/..." da desteklenir: sunucuda usePathname yeniden yazılmış (/tr/...) adresi,
 * tarayıcıda ise görünen adresi döndürür; ikisi de aynı sonuca indirgenir (hydration uyumu).
 */
export function splitLocale(pathname: string): { lang: Locale; path: string } {
  const segment = pathname.split("/")[1];
  if (hasLocale(segment)) {
    const rest = pathname.slice(segment.length + 1);
    return { lang: segment, path: rest || "/" };
  }
  return { lang: DEFAULT_LOCALE, path: pathname || "/" };
}
