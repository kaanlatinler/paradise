"use client";

import { Suspense, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import Link from "next/link";
import { NavLinks, NavLinksStatic } from "./NavLinks";

export function MobileMenu({ contactSlot }: { contactSlot?: ReactNode }) {
  const [open, setOpen] = useState(false);

  // Next 16 (cacheComponents) sayfaları gizleyip durumu korur; geri dönüldüğünde menü açık kalmasın
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        className="grid size-11 place-items-center rounded-full text-ink transition hover:bg-sand"
      >
        <Icon name={open ? "x" : "menu"} size={22} />
      </button>

      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-[4.25rem] bottom-0 z-40 overflow-y-auto border-t border-sand-dark bg-shell px-4 pt-4 pb-10"
        >
          <nav aria-label="Mobil menü" className="space-y-1">
            <Suspense fallback={<NavLinksStatic variant="mobile" />}>
              <NavLinks variant="mobile" onNavigate={() => setOpen(false)} />
            </Suspense>
          </nav>
          <div className="mt-6 space-y-3 border-t border-sand-dark pt-6">
            <Link
              href="/properties"
              onClick={() => setOpen(false)}
              className={buttonClasses("primary", "lg", "w-full")}
            >
              Müsait Konakları Gör
            </Link>
            {contactSlot}
          </div>
        </div>
      ) : null}
    </div>
  );
}
