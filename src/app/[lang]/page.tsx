import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getFilteredProperties } from "@/actions/properties";
import { Hero } from "@/components/public/Hero";
import { LoadingBadge } from "@/components/public/LoadingBadge";
import { PropertyCard } from "@/components/public/PropertyCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import { PROPERTY_TYPES } from "@/components/public/format";
import { listingHref } from "@/components/public/lib/search-params";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PropertyGridSkeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { href } = await getI18n();
  return {
    alternates: { canonical: href("/"), languages: { tr: "/", en: "/en" } },
  };
}

async function FeaturedProperties() {
  const { t } = await getI18n();
  const { items } = await getFilteredProperties({ featuredOnly: true, pageSize: 6 });

  // Öne çıkan ilan yoksa vitrin boş kalmasın: en güncel ilanları göster
  const list = items.length > 0 ? items : (await getFilteredProperties({ pageSize: 6 })).items;

  if (list.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-sand-dark bg-white p-10 text-center text-ink-soft">
        {t.home.comingSoon}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p, i) => (
        <PropertyCard key={p.id} property={p} priority={i < 3} />
      ))}
    </div>
  );
}

const CATEGORY_TINTS: Record<string, string> = {
  VILLA: "from-citrus-400 to-citrus-500",
  HOUSE: "from-sea-400 to-sea-500",
  APART: "from-sea-500 to-sea-700",
};

export default async function HomePage() {
  const { lang, t, href } = await getI18n();

  return (
    <>
      <Hero />

      {/* Kategori kartları */}
      <section className="container-page py-16 sm:py-20" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="sr-only">
          {t.home.categoriesHeading}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PROPERTY_TYPES.map((type) => (
            <Link
              key={type.key}
              href={listingHref(lang, { type: type.key })}
              className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className={`mb-5 grid size-14 place-items-center rounded-2xl bg-linear-to-br text-white ${CATEGORY_TINTS[type.key]}`}>
                <Icon name={type.icon} size={28} />
              </span>
              <h3 className="font-display text-2xl font-semibold text-ink">{t.types[type.key].plural}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{t.types[type.key].blurb}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-sea-700 transition-all group-hover:gap-2.5">
                {t.home.explore} <Icon name="arrow-right" size={16} />
              </span>
              <span aria-hidden className="absolute -right-8 -bottom-8 size-32 rounded-full bg-sand opacity-60 transition group-hover:scale-110" />
            </Link>
          ))}
        </div>
      </section>

      {/* Öne çıkan ilanlar */}
      <section className="bg-sand/60 py-16 sm:py-20" aria-labelledby="featured-heading">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.home.featuredEyebrow}
            title={t.home.featuredTitle}
            description={t.home.featuredDescription}
            action={
              <ButtonLink href={href("/properties")} variant="outline">
                {t.home.allListings} <Icon name="arrow-right" size={16} />
              </ButtonLink>
            }
          />
          <Suspense
            fallback={
              <>
                <LoadingBadge />
                <PropertyGridSkeleton count={3} />
              </>
            }
          >
            <FeaturedProperties />
          </Suspense>
        </div>
      </section>

      {/* Neden biz */}
      <section className="container-page py-16 sm:py-20" aria-labelledby="perks-heading">
        <SectionHeading eyebrow={t.home.perksEyebrow} title={t.home.perksTitle} align="center" />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.perks.map((perk) => (
            <li key={perk.title} className="rounded-3xl border border-sand-dark/70 bg-white p-6">
              <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-citrus-50 text-citrus-500">
                <Icon name={perk.icon} size={24} />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">{perk.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{perk.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA bandı */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-sea-700 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div aria-hidden className="absolute -top-20 -right-16 size-64 rounded-full bg-citrus-400/90 blur-[2px]" />
          <div aria-hidden className="absolute -bottom-24 -left-10 size-72 rounded-full bg-sea-500/60" />
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold text-balance text-white sm:text-4xl">{t.home.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">{t.home.ctaText}</p>
            <ButtonLink href={href("/properties")} size="lg" className="mt-8">
              {t.home.ctaButton}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
