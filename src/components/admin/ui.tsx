import type { ReactNode } from "react";

/** Admin sayfa başlığı */
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-sea-700 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-sand-dark/70 bg-white shadow-card ${className}`}>{children}</div>;
}

export function AdminContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</div>;
}

export type ReservationStatusKey = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export const RESERVATION_STATUS: Record<ReservationStatusKey, { label: string; className: string }> = {
  PENDING: { label: "Bekliyor", className: "bg-citrus-100 text-citrus-600 ring-citrus-400/40" },
  APPROVED: { label: "Onaylandı", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  REJECTED: { label: "Reddedildi", className: "bg-rose-50 text-rose-700 ring-rose-200" },
  CANCELLED: { label: "İptal", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export function ReservationStatusBadge({ status }: { status: string }) {
  const meta = RESERVATION_STATUS[status as ReservationStatusKey] ?? RESERVATION_STATUS.CANCELLED;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export type PropertyStatusKey = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export const PROPERTY_STATUS: Record<PropertyStatusKey, { label: string; className: string }> = {
  PUBLISHED: { label: "Yayında", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  DRAFT: { label: "Taslak", className: "bg-sand text-ink-soft ring-sand-dark" },
  ARCHIVED: { label: "Arşiv", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export function PropertyStatusBadge({ status }: { status: string }) {
  const meta = PROPERTY_STATUS[status as PropertyStatusKey] ?? PROPERTY_STATUS.DRAFT;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = { VILLA: "Villa", HOUSE: "Müstakil Ev", APART: "Apart" };

const trPrice = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
export function adminPrice(value: string | number) {
  const n = Number(value);
  return Number.isFinite(n) ? trPrice.format(n) : "—";
}

const trDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export function adminDate(iso: string) {
  return trDate.format(new Date(iso));
}

export function nightsOf(checkIn: string, checkOut: string) {
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000);
}
