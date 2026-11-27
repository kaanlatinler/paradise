"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ReservationActions } from "./ReservationActions";
import {
  AdminCard,
  adminDate,
  adminPrice,
  nightsOf,
  RESERVATION_STATUS,
  ReservationStatusBadge,
  type ReservationStatusKey,
} from "./ui";

export interface AdminReservationRow {
  id: string;
  propertyId: string;
  propertyTitle: string;
  location: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

const TABS: { key: "ALL" | ReservationStatusKey; label: string }[] = [
  { key: "PENDING", label: "Bekleyen" },
  { key: "APPROVED", label: "Onaylı" },
  { key: "REJECTED", label: "Reddedilen" },
  { key: "CANCELLED", label: "İptal" },
  { key: "ALL", label: "Tümü" },
];

/** Takvim blokajları "-" telefonla kaydedilir (blockPropertyDatesAction) */
function isBlock(r: AdminReservationRow) {
  return r.guestPhone === "-" && Number(r.totalPrice) === 0;
}

export function ReservationsBoard({ rows, initialStatus }: { rows: AdminReservationRow[]; initialStatus?: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>(
    TABS.some((t) => t.key === initialStatus) ? (initialStatus as ReservationStatusKey) : "PENDING",
  );
  const [query, setQuery] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    const todayIso = new Date().toISOString().slice(0, 10);
    return rows
      .filter((r) => tab === "ALL" || r.status === tab)
      .filter((r) => !upcomingOnly || r.checkOut.slice(0, 10) >= todayIso)
      .filter(
        (r) =>
          !q ||
          [r.guestName, r.guestEmail, r.guestPhone, r.propertyTitle, r.location, r.id]
            .join(" ")
            .toLocaleLowerCase("tr")
            .includes(q),
      );
  }, [rows, tab, query, upcomingOnly]);

  return (
    <AdminCard className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-sand-dark/70 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Rezervasyon durumu" className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                tab === t.key ? "bg-sea-500 text-white" : "text-ink-soft hover:bg-sand"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 text-xs ${tab === t.key ? "bg-white/20" : "bg-sand"}`}>{counts[t.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={upcomingOnly} onChange={(e) => setUpcomingOnly(e.target.checked)} className="size-4 accent-sea-500" />
            Yalnızca gelecek
          </label>
          <div className="relative">
            <Icon name="search" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Misafir, ilan, telefon…"
              aria-label="Rezervasyonlarda ara"
              className="field w-64 pl-9"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-14 text-center text-sm text-ink-soft">Bu görünümde rezervasyon yok.</p>
      ) : (
        <ul className="divide-y divide-sand-dark/60">
          {filtered.map((r) => (
            <li key={r.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{isBlock(r) ? "Takvim blokajı" : r.guestName}</p>
                  <ReservationStatusBadge status={r.status} />
                </div>
                <p className="mt-0.5 truncate text-sm text-ink-soft">
                  <Link href={`/admin/properties/${r.propertyId}`} className="hover:text-sea-700 hover:underline">
                    {r.propertyTitle}
                  </Link>{" "}
                  · {r.location}
                </p>
                {!isBlock(r) ? (
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-soft">
                    <a href={`tel:${r.guestPhone.replace(/[^\d+]/g, "")}`} className="text-sea-700 hover:underline">
                      {r.guestPhone}
                    </a>
                    <a href={`mailto:${r.guestEmail}`} className="break-all text-sea-700 hover:underline">
                      {r.guestEmail}
                    </a>
                    <span>{r.guestCount} misafir</span>
                  </p>
                ) : null}
                {r.notes ? <p className="mt-1.5 rounded-lg bg-sand/60 px-2.5 py-1.5 text-xs text-ink">“{r.notes}”</p> : null}
              </div>

              <div className="text-sm">
                <p className="font-semibold text-ink">
                  {adminDate(r.checkIn)} – {adminDate(r.checkOut)}
                </p>
                <p className="text-xs text-ink-soft">
                  {nightsOf(r.checkIn, r.checkOut)} gece
                  {!isBlock(r) ? (
                    <>
                      {" "}
                      · <span className="font-semibold text-citrus-600">{adminPrice(r.totalPrice)}</span>
                    </>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[0.7rem] text-ink-soft/80">Talep: {adminDate(r.createdAt)}</p>
              </div>

              <ReservationActions reservationId={r.id} status={r.status} />
            </li>
          ))}
        </ul>
      )}
      <p className="border-t border-sand-dark/60 px-5 py-3 text-xs text-ink-soft">
        Durumlar: {Object.values(RESERVATION_STATUS).map((s) => s.label).join(" · ")}. Bekleyen ve onaylı kayıtlar vitrin takviminde dolu görünür.
      </p>
    </AdminCard>
  );
}
