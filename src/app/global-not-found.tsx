import type { Metadata } from "next";
import { Logo } from "@/components/public/Logo";
import { NotFoundContent } from "@/components/public/NotFoundContent";
import { makeI18n } from "@/i18n";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Hiçbir rotayla eşleşmeyen adresler için genel 404 (ör. /admin/olmayan, uzantılı bilinmeyen dosyalar).
 * Birden fazla kök düzen (vitrin [lang] + admin) olduğu için layout'lardan bağımsız tam sayfadır.
 * Vitrin içindeki bilinmeyen adresler ise [lang]/[...rest] ile menülü 404 sayfasına düşer.
 */
export const metadata: Metadata = {
  title: "404 — Sayfa bulunamadı | Paradise Emlak",
  robots: { index: false },
};

export default function GlobalNotFound() {
  const i18n = makeI18n("tr");
  return (
    <html lang="tr" className={fontVariables}>
      <body className="min-h-dvh bg-shell">
        <header className="container-page flex h-[4.25rem] items-center">
          <Logo />
        </header>
        <main>
          <NotFoundContent i18n={i18n} />
        </main>
      </body>
    </html>
  );
}
