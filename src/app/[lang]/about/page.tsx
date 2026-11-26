import type { Metadata } from "next";
import { Suspense } from "react";
import { cmsValue, getCms } from "@/components/public/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t, href } = await getI18n();
  return {
    title: t.meta.aboutTitle,
    description: t.meta.aboutDescription,
    alternates: { canonical: href("/about"), languages: { tr: "/about", en: "/en/about" } },
  };
}

async function AboutText() {
  const [{ lang }, cms] = await Promise.all([getI18n(), getCms()]);
  const text = cmsValue(cms, "about_text", lang);
  return <div className="space-y-4 text-lg leading-relaxed whitespace-pre-line text-ink/90">{text}</div>;
}

export default async function AboutPage() {
  const { t, href } = await getI18n();
  return (
    <>
      <section className="relative overflow-hidden bg-sea-700 text-white">
        <div aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-citrus-400/90" />
        <div aria-hidden className="absolute -bottom-32 left-1/3 size-96 rounded-full bg-sea-500/50" />
        <div className="relative container-page py-16 sm:py-24">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-citrus-400 uppercase">{t.about.eyebrow}</p>
          <h1 className="max-w-2xl font-display text-4xl leading-tight font-semibold text-balance sm:text-5xl">{t.about.title}</h1>
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
          {t.about.values.map((v) => (
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
          <h2 className="font-display text-3xl font-semibold text-sea-700">{t.about.ctaTitle}</h2>
          <p className="mx-auto mt-2 max-w-lg text-ink-soft">{t.about.ctaText}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href={href("/properties")}>{t.about.ctaListings}</ButtonLink>
            <ButtonLink href={href("/contact")} variant="outline">
              {t.about.ctaContact}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
