"use client"; // Hata sınırları istemci bileşeni olmalı

import Link from "next/link";
import { useEffect } from "react";

/** Panel sayfalarında beklenmedik hata: kenar menü yerinde kalır, tekrar deneme sunulur. */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message = error instanceof Error ? error.message : "";
  const unauthorized = /yetkisiz/i.test(message);

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center px-4 py-16 text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold text-sea-700">
          {unauthorized ? "Oturumunuzun süresi dolmuş" : "Sayfa yüklenemedi"}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {unauthorized
            ? "Devam etmek için lütfen tekrar giriş yapın."
            : "Veritabanına bağlanırken bir sorun oluşmuş olabilir. Birkaç saniye sonra tekrar deneyin."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {unauthorized ? (
            <Link
              href="/admin/login"
              className="inline-flex h-10 items-center rounded-full bg-sea-500 px-5 text-sm font-semibold text-white hover:bg-sea-700"
            >
              Giriş yap
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-10 items-center rounded-full bg-sea-500 px-5 text-sm font-semibold text-white hover:bg-sea-700"
            >
              Tekrar dene
            </button>
          )}
          <Link href="/admin" className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-ink-soft hover:bg-sand">
            Genel bakış
          </Link>
        </div>
      </div>
    </div>
  );
}
