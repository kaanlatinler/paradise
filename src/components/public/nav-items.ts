import type { Dictionary } from "@/i18n";

/** Menü bağlantıları: yollar dil öneki olmadan tutulur, gösterimde localizePath ile çevrilir. */
export function navItems(t: Dictionary) {
  return [
    { path: "/", label: t.nav.home },
    { path: "/properties", label: t.nav.properties },
    { path: "/properties?type=VILLA", label: t.nav.villas },
    { path: "/about", label: t.nav.about },
    { path: "/contact", label: t.nav.contact },
  ];
}
