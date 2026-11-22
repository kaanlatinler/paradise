"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

const desktopBase = "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors";
const mobileBase = "block rounded-2xl px-4 py-3 text-base font-semibold transition-colors";

function isActive(pathname: string | null, href: string) {
  const path = href.split("?")[0];
  if (!pathname) return false;
  if (href.includes("?")) return false; // sorgu parametreli kısayollar aktif sayılmaz
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

export function NavLinks({ variant = "desktop", onNavigate }: { variant?: "desktop" | "mobile"; onNavigate?: () => void }) {
  const pathname = usePathname();
  const base = variant === "desktop" ? desktopBase : mobileBase;

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`${base} ${
              active ? "bg-sea-50 text-sea-700" : "text-ink hover:bg-sand/70 hover:text-sea-700"
            }`}
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
  const base = variant === "desktop" ? desktopBase : mobileBase;
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={`${base} text-ink hover:text-sea-700`}>
          {item.label}
        </Link>
      ))}
    </>
  );
}
