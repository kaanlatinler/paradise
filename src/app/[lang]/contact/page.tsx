import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/public/ContactForm";
import { cmsValue, getCms } from "@/components/public/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t, href } = await getI18n();
  return {
    title: t.meta.contactTitle,
    description: t.meta.contactDescription,
    alternates: { canonical: href("/contact"), languages: { tr: "/contact", en: "/en/contact" } },
  };
}

async function ContactChannels() {
  const [{ t }, cms] = await Promise.all([getI18n(), getCms()]);
  const phone = cmsValue(cms, "contact_phone");
  const email = cmsValue(cms, "contact_email");
  const tel = phone.replace(/[^\d+]/g, "");
  const wa = tel.replace(/^\+/, "");

  const cards = [
    { icon: "phone", title: t.contact.phone, value: phone, href: `tel:${tel}`, cta: t.contact.callNow },
    {
      icon: "message-circle",
      title: t.contact.whatsapp,
      value: phone,
      href: `https://wa.me/${wa}?text=${encodeURIComponent(t.contact.whatsappGreeting)}`,
      cta: t.contact.sendMessage,
      external: true,
    },
    { icon: "mail", title: t.contact.email, value: email, href: `mailto:${email}`, cta: t.contact.writeEmail },
  ];

  return (
    <>
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
      <div className="mt-10">
        <ContactForm phone={phone} email={email} />
      </div>
    </>
  );
}

export default async function ContactPage() {
  const { t, href } = await getI18n();
  return (
    <>
      <section className="border-b border-sand-dark/60 bg-sand/60">
        <div className="container-page py-12 sm:py-16">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-citrus-500 uppercase">{t.contact.eyebrow}</p>
          <h1 className="font-display text-4xl font-semibold text-sea-700 sm:text-5xl">{t.contact.title}</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">{t.contact.intro}</p>
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
          <ContactChannels />
        </Suspense>

        <div className="mt-10 grid gap-6 rounded-3xl bg-sea-700 p-8 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <div className="flex gap-4">
            <Icon name="clock" size={28} className="mt-1 shrink-0 text-citrus-400" />
            <div>
              <h2 className="font-display text-2xl font-semibold">{t.contact.fastTitle}</h2>
              <p className="mt-1 text-white/80">{t.contact.fastText}</p>
            </div>
          </div>
          <ButtonLink href={href("/properties")} size="lg">
            {t.contact.browse}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
