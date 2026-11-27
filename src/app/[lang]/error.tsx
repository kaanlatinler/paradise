"use client"; // Hata sınırları istemci bileşeni olmalı

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/i18n/client";

/**
 * Vitrin sayfalarında beklenmedik hata (ör. veritabanı zaman aşımı) olduğunda menü ve alt bilgi
 * yerinde kalarak gösterilen, iki dilli hata ekranı.
 */
export default function PublicError({ error, retry }: { error: unknown; retry: () => void }) {
  const { t, href } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-citrus-50 text-citrus-500">
          <Icon name="wind" size={30} />
        </span>
        <h1 className="font-display text-3xl font-semibold text-sea-700">{t.errorPage.title}</h1>
        <p className="mt-3 text-ink-soft">{t.errorPage.text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-citrus-500 px-5 text-sm font-semibold text-white hover:bg-citrus-600"
          >
            {t.errorPage.retry}
          </button>
          <Link
            href={href("/")}
            className="inline-flex h-11 items-center rounded-full border border-sea-500/30 bg-white px-5 text-sm font-semibold text-sea-700 hover:bg-sea-50"
          >
            {t.errorPage.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
