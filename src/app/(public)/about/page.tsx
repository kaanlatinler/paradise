import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { cmsValue, getCms } from "../_lib/data";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Paradise Emlak: Akdeniz kıyısında güvenilir, şeffaf ve özenli günlük kiralık villa, ev ve apart deneyimi.",
  alternates: { canonical: "/about" },
};

async function AboutText() {
  const cms = await getCms();
  const text = cmsValue(cms, "about_text");
  return <div className="space-y-4 text-lg leading-relaxed whitespace-pre-line text-ink/90">{text}</div>;
}

const VALUES = [
  { icon: "shield-check", title: "Güven", text: "Her konağı yerinde görüp doğruluyor, yalnızca gerçek fotoğraflarla yayınlıyoruz." },
  { icon: "sun", title: "Şeffaflık", text: "Gecelik fiyat ve müsaitlik baştan net; sürpriz ücretler yok." },
  { icon: "message-circle", title: "Özen", text: "Talep anından çıkış gününe kadar ulaşılabilir bir ekip seninle." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-sea-700 text-white">
        <div aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-citrus-400/90" />
        <div aria-hidden className="absolute -bottom-32 left-1/3 size-96 rounded-full bg-sea-500/50" />
        <div className="relative container-page py-16 sm:py-24">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-citrus-400 uppercase">Hakkımızda</p>
          <h1 className="max-w-2xl font-display text-4xl leading-tight font-semibold text-balance sm:text-5xl">
            Akdeniz’in en güzel köşelerini sizin için seçiyoruz
          </h1>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.4fr_1fr]">
        <Suspense
          fallback={
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          }
        >
          <AboutText />
        </Suspense>

        <ul className="space-y-4">
          {VALUES.map((v) => (
            <li key={v.title} className="flex gap-4 rounded-3xl bg-white p-5 shadow-card">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-citrus-50 text-citrus-500">
                <Icon name={v.icon} size={24} />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">{v.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{v.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page pb-20 text-center">
        <div className="rounded-[2rem] bg-sand/70 px-6 py-12">
          <h2 className="font-display text-3xl font-semibold text-sea-700">Tatil planını birlikte yapalım</h2>
          <p className="mx-auto mt-2 max-w-lg text-ink-soft">Konakları incele ya da doğrudan bize ulaş.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/properties">İlanları keşfet</ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              İletişime geç
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
