import { Suspense } from "react";
import { cmsValue, getCms } from "@/components/public/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getI18n } from "@/i18n/server";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks, NavLinksStatic } from "./NavLinks";

/** CMS'ten gelen telefon numarasıyla hızlı arama bağlantısı (dinamik veri → Suspense içinde). */
async function QuickCall({ variant }: { variant: "desktop" | "mobile" }) {
  const cms = await getCms();
  const phone = cmsValue(cms, "contact_phone");
  const tel = phone.replace(/[^\d+]/g, "");

  if (variant === "mobile") {
    return (
      <a
        href={`tel:${tel}`}
        className="flex items-center justify-center gap-2 rounded-full border border-sea-500/30 bg-white py-3 text-sm font-semibold text-sea-700"
      >
        <Icon name="phone" size={18} /> {phone}
      </a>
    );
  }

  return (
    <a
      href={`tel:${tel}`}
      className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-sea-700 transition hover:bg-sea-50 2xl:inline-flex"
    >
      <span className="grid size-8 place-items-center rounded-full bg-sea-50">
        <Icon name="phone" size={16} />
      </span>
      {phone}
    </a>
  );
}

export async function Navbar() {
  const { t, href } = await getI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-sand-dark/60 bg-shell/85 backdrop-blur-md supports-[backdrop-filter]:bg-shell/70">
      <div className="container-page flex h-[4.25rem] items-center justify-between gap-4">
        <Logo href={href("/")} label={t.common.homeAria} />

        <nav aria-label={t.nav.mainMenu} className="hidden items-center gap-1 lg:flex">
          <Suspense fallback={<NavLinksStatic />}>
            <NavLinks />
          </Suspense>
        </nav>

        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <QuickCall variant="desktop" />
          </Suspense>
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <ButtonLink href={href("/properties")} variant="primary" size="sm">
              {t.nav.reserve}
            </ButtonLink>
          </div>
          <MobileMenu
            contactSlot={
              <Suspense fallback={null}>
                <QuickCall variant="mobile" />
              </Suspense>
            }
          />
        </div>
      </div>
    </header>
  );
}
