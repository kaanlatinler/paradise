import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { cmsValue, getCms } from "../_lib/data";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Paradise Emlak rezervasyon ve bilgi hattı: telefon, WhatsApp ve e-posta ile bize ulaşın.",
  alternates: { canonical: "/contact" },
};

async function ContactCards() {
  const cms = await getCms();
  const phone = cmsValue(cms, "contact_phone");
  const email = cmsValue(cms, "contact_email");
  const tel = phone.replace(/[^\d+]/g, "");
  const wa = tel.replace(/^\+/, "");

  const cards = [
    { icon: "phone", title: "Telefon", value: phone, href: `tel:${tel}`, cta: "Hemen ara" },
    {
      icon: "message-circle",
      title: "WhatsApp",
      value: phone,
      href: `https://wa.me/${wa}?text=${encodeURIComponent("Merhaba, konaklama hakkında bilgi almak istiyorum.")}`,
      cta: "Mesaj gönder",
      external: true,
    },
    { icon: "mail", title: "E-posta", value: email, href: `mailto:${email}`, cta: "E-posta yaz" },
  ];

  return (
    <ul className="grid gap-5 md:grid-cols-3">
      {cards.map((c) => (
        <li key={c.title}>
          <a
            href={c.href}
            target={c.external ? "_blank" : undefined}
            rel={c.external ? "noopener noreferrer" : undefined}
            className="group flex h-full flex-col rounded-3xl bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-sea-50 text-sea-500 transition group-hover:bg-sea-500 group-hover:text-white">
              <Icon name={c.icon} size={24} />
            </span>
            <h2 className="text-xs font-bold tracking-wide text-ink-soft uppercase">{c.title}</h2>
            <p className="mt-1 font-display text-xl font-semibold break-all text-ink">{c.value}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-citrus-500">
              {c.cta} <Icon name="arrow-right" size={16} />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-sand-dark/60 bg-sand/60">
        <div className="container-page py-12 sm:py-16">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-citrus-500 uppercase">İletişim</p>
          <h1 className="font-display text-4xl font-semibold text-sea-700 sm:text-5xl">Sana nasıl yardımcı olabiliriz?</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Müsaitlik, fiyat veya konaklama detayları için bize dilediğin kanaldan ulaş. Rezervasyon talebini doğrudan ilan
            sayfasından da gönderebilirsin.
          </p>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <Suspense
          fallback={
            <div className="grid gap-5 md:grid-cols-3">
              <Skeleton className="h-56 rounded-3xl" />
              <Skeleton className="h-56 rounded-3xl" />
              <Skeleton className="h-56 rounded-3xl" />
            </div>
          }
        >
          <ContactCards />
        </Suspense>

        <div className="mt-10 grid gap-6 rounded-3xl bg-sea-700 p-8 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <div className="flex gap-4">
            <Icon name="clock" size={28} className="mt-1 shrink-0 text-citrus-400" />
            <div>
              <h2 className="font-display text-2xl font-semibold">Hızlı dönüş</h2>
              <p className="mt-1 text-white/80">Rezervasyon taleplerini sırayla inceliyor, en kısa sürede seninle iletişime geçiyoruz.</p>
            </div>
          </div>
          <ButtonLink href="/properties" size="lg">
            Konakları incele
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
