import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/public/Logo";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false },
};

/** Sitenin genel 404 sayfası (vitrin düzeni dışında kalan bilinmeyen adresler için) */
export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-shell px-4 py-16 text-center">
      <div aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-citrus-400/25" />
      <div aria-hidden className="absolute -bottom-32 -left-20 size-96 rounded-full bg-sea-500/10" />
      <div className="relative max-w-md">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>
        <p className="font-display text-7xl font-semibold text-citrus-500">404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-sea-700">Bu sayfa dalgalara karışmış</h1>
        <p className="mt-3 text-ink-soft">Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Anasayfaya dön</ButtonLink>
          <ButtonLink href="/properties" variant="outline">
            İlanlara göz at
          </ButtonLink>
        </div>
        <p className="mt-8 text-sm text-ink-soft">
          Yardıma mı ihtiyacın var?{" "}
          <Link href="/contact" className="font-semibold text-sea-700 hover:underline">
            Bize ulaş
          </Link>
        </p>
      </div>
    </main>
  );
}
