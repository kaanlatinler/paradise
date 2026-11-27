"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logoutAdminAction } from "@/actions/admin-auth";
import { Icon } from "@/components/ui/Icon";
import { NavigationProgress } from "@/components/public/NavigationProgress";

const NAV = [
  { href: "/admin", label: "Genel Bakış", icon: "home", exact: true },
  { href: "/admin/reservations", label: "Rezervasyonlar", icon: "calendar" },
  { href: "/admin/properties", label: "İlanlar", icon: "building" },
  { href: "/admin/content", label: "Site İçerikleri", icon: "sliders" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Yönetim paneli kabuğu: masaüstünde sabit kenar menü, mobilde açılır üst menü.
 * Giriş sayfasında kabuk gösterilmez (aynı layout altında olduğu için yol kontrolüyle).
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin/login")) return <>{children}</>;

  const nav = (
    <nav aria-label="Yönetim menüsü" className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="space-y-2 border-t border-white/10 pt-4">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white"
      >
        <Icon name="arrow-right" size={16} /> Siteyi görüntüle
      </Link>
      <form action={logoutAdminAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white"
        >
          <Icon name="x" size={16} /> Çıkış Yap
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="size-8" aria-hidden>
        <circle cx="20" cy="17" r="9" fill="#FF9F1C" />
        <path d="M3 26c3 0 3-2.5 6.5-2.5S13 26 16.5 26s3.5-2.5 7-2.5 3.5 2.5 7 2.5S34 23.5 37 23.5V37H3z" fill="#2B95CC" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-lg font-semibold text-white">Paradise</span>
        <span className="block text-[0.6rem] font-bold tracking-[0.25em] text-citrus-400 uppercase">Yönetim</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15.5rem_1fr]">
      <NavigationProgress />
      {/* Masaüstü kenar menü */}
      <aside className="sticky top-0 hidden h-dvh flex-col justify-between bg-sea-900 p-5 lg:flex">
        <div className="space-y-8">
          {brand}
          {nav}
        </div>
        {footer}
      </aside>

      {/* Mobil üst çubuk */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-sea-900 px-4 py-3 lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          className="grid size-10 place-items-center rounded-full text-white hover:bg-white/10"
        >
          <Icon name={open ? "x" : "menu"} size={22} />
        </button>
      </header>
      {open ? (
        <div className="fixed inset-x-0 top-16 bottom-0 z-30 space-y-6 overflow-y-auto bg-sea-900 p-4 lg:hidden">
          {nav}
          {footer}
        </div>
      ) : null}

      <div className="min-w-0">{children}</div>
    </div>
  );
}
