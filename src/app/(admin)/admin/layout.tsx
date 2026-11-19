import React from "react";
import Link from "next/link";
import { logoutAdminAction } from "@/actions/admin-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
            <Link href="/admin" className="hover:text-sky-800">
              Dashboard
            </Link>
            <Link href="/admin/properties" className="hover:text-sky-800">
              İlanlar
            </Link>
            <Link href="/admin/reservations" className="hover:text-sky-800">
              Rezervasyonlar
            </Link>
            <Link href="/admin/content" className="hover:text-sky-800">
              Dinamik İçerik (CMS)
            </Link>
          </nav>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Çıkış Yap
            </button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
