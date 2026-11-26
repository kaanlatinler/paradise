"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { splitLocale } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { navItems } from "./nav-items";

const desktopBase = "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors";
const mobileBase = "block rounded-2xl px-4 py-3 text-base font-semibold transition-colors";

function isActive(currentPath: string, itemPath: string) {
  if (itemPath.includes("?")) return false; // sorgu parametreli kısayollar aktif sayılmaz
  return itemPath === "/" ? currentPath === "/" : currentPath.startsWith(itemPath);
}

export function NavLinks({ variant = "desktop", onNavigate }: { variant?: "desktop" | "mobile"; onNavigate?: () => void }) {
  const { t, href } = useI18n();
  const pathname = usePathname();
  // Sunucuda /tr/..., tarayıcıda /... gelir; ikisi de aynı yola indirgenir
  const currentPath = splitLocale(pathname ?? "/").path;
  const base = variant === "desktop" ? desktopBase : mobileBase;

  return (
    <>
      {navItems(t).map((item) => {
        const active = isActive(currentPath, item.path);
        return (
          <Link
            key={item.path}
            href={href(item.path)}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`${base} ${active ? "bg-sea-50 text-sea-700" : "text-ink hover:bg-sand/70 hover:text-sea-700"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

/** Suspense fallback'i: aktif durumu olmayan aynı bağlantılar (layout kaymasını önler). */
export function NavLinksStatic({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const { t, href } = useI18n();
  const base = variant === "desktop" ? desktopBase : mobileBase;
  return (
    <>
      {navItems(t).map((item) => (
        <Link key={item.path} href={href(item.path)} className={`${base} text-ink hover:text-sea-700`}>
          {item.label}
        </Link>
      ))}
    </>
  );
}
