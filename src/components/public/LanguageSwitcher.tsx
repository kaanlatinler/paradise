"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { localizePath, splitLocale, type Locale } from "@/i18n";
import { useI18n } from "@/i18n/client";

const LABELS: Record<Locale, { short: string; long: string }> = {
  tr: { short: "TR", long: "Türkçe" },
  en: { short: "EN", long: "English" },
};

function SwitcherLinksBase({ path, query }: { path: string; query: string }) {
  const { lang, t } = useI18n();
  return (
    <div role="group" aria-label={t.nav.language} className="inline-flex rounded-full bg-sand/80 p-0.5 text-xs font-bold">
      {(["tr", "en"] as const).map((target) => {
        const active = target === lang;
        const href = `${localizePath(target, path)}${query ? `?${query}` : ""}`;
        return (
          <Link
            key={target}
            href={href}
            hrefLang={target}
            lang={target}
            aria-current={active ? "true" : undefined}
            title={LABELS[target].long}
            className={`rounded-full px-2.5 py-1 transition ${active ? "bg-white text-sea-700 shadow-sm" : "text-ink-soft hover:text-sea-700"}`}
          >
            {LABELS[target].short}
          </Link>
        );
      })}
    </div>
  );
}

function SwitcherLinksWithRoute() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return <SwitcherLinksBase path={splitLocale(pathname ?? "/").path} query={searchParams.toString()} />;
}

/**
 * TR / EN dil değiştirici. Aynı sayfanın diğer dildeki adresine gider (filtreler korunur).
 * useSearchParams Suspense ister; o sırada (yalnızca ilk yüklemede) anasayfa bağlantıları gösterilir.
 */
export function LanguageSwitcher() {
  return (
    <Suspense fallback={<SwitcherLinksBase path="/" query="" />}>
      <SwitcherLinksWithRoute />
    </Suspense>
  );
}
