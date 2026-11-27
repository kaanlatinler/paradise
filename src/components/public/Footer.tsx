import Link from "next/link";
import { Suspense } from "react";
import { cmsValue, getCms } from "@/components/public/lib/data";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/i18n/server";
import { listingHref } from "./lib/search-params";
import { Logo } from "./Logo";
import { PROPERTY_TYPES } from "./format";

async function FooterContact() {
  const cms = await getCms();
  const phone = cmsValue(cms, "contact_phone");
  const email = cmsValue(cms, "contact_email");

  return (
    <ul className="space-y-3 text-sm">
      <li>
        <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2.5 hover:text-citrus-400">
          <Icon name="phone" size={16} className="text-citrus-400" /> {phone}
        </a>
      </li>
      <li>
        <a href={`mailto:${email}`} className="inline-flex items-center gap-2.5 break-all hover:text-citrus-400">
          <Icon name="mail" size={16} className="text-citrus-400" /> {email}
        </a>
      </li>
    </ul>
  );
}

export async function Footer() {
  const { lang, t, href } = await getI18n();

  return (
    <footer className="mt-auto bg-sea-900 text-white/80">
      {/* dalga geçişi */}
      <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="block h-8 w-full -translate-y-px bg-shell sm:h-12" aria-hidden>
        <path d="M0 48V20c120 18 240 26 360 18S600 6 720 6s240 24 360 30 240-6 360-22v34z" className="fill-sea-900" />
      </svg>

      <div className="container-page grid gap-10 pt-8 pb-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <Logo tone="light" href={href("/")} label={t.common.homeAria} />
          <p className="max-w-xs text-sm leading-relaxed">{t.footer.about}</p>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg text-white">{t.footer.stays}</h2>
          <ul className="space-y-2.5 text-sm">
            {PROPERTY_TYPES.map((type) => (
              <li key={type.key}>
                <Link href={listingHref(lang, { type: type.key })} className="hover:text-citrus-400">
                  {t.types[type.key].plural}
                </Link>
              </li>
            ))}
            <li>
              <Link href={listingHref(lang, { featured: true })} className="hover:text-citrus-400">
                {t.footer.featured}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg text-white">{t.footer.company}</h2>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href={href("/about")} className="hover:text-citrus-400">
                {t.nav.about}
              </Link>
            </li>
            <li>
              <Link href={href("/contact")} className="hover:text-citrus-400">
                {t.nav.contact}
              </Link>
            </li>
            <li>
              <Link href={href("/properties")} className="hover:text-citrus-400">
                {t.footer.allListings}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg text-white">{t.footer.reachUs}</h2>
          <Suspense
            fallback={
              <div className="space-y-3">
                <Skeleton className="h-4 w-40 opacity-20" />
                <Skeleton className="h-4 w-52 opacity-20" />
              </div>
            }
          >
            <FooterContact />
          </Suspense>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footer.rights}</p>
          <p>{t.footer.priceNote}</p>
        </div>
      </div>
    </footer>
  );
}
