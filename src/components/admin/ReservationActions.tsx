"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateReservationStatusAction } from "@/actions/admin-reservations";
import { Spinner } from "@/components/ui/Spinner";

type Target = "APPROVED" | "REJECTED" | "CANCELLED";

const CONFIRM: Record<Target, { question: string; yes: string; className: string }> = {
  APPROVED: {
    question: "Onaylansın mı? Çakışan bekleyen talepler otomatik reddedilir.",
    yes: "Evet, onayla",
    className: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  REJECTED: { question: "Talep reddedilsin mi?", yes: "Evet, reddet", className: "bg-rose-600 text-white hover:bg-rose-700" },
  CANCELLED: {
    question: "İptal edilsin mi? Tarihler yeniden müsait olur.",
    yes: "Evet, iptal et",
    className: "bg-slate-700 text-white hover:bg-slate-800",
  },
};

/**
 * Rezervasyon durum düğmeleri: bekleyen → onayla/reddet, onaylı → iptal et.
 * Geri alınması zor işlemler için satır içi iki adımlı onay kullanılır.
 */
export function ReservationActions({ reservationId, status }: { reservationId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<Target | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(target: Target) {
    setError(null);
    startTransition(async () => {
      const res = await updateReservationStatusAction({ reservationId, status: target });
      if (!res.success) setError(res.error ?? "İşlem başarısız.");
      setConfirming(null);
      router.refresh();
    });
  }

  const btn = "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition disabled:opacity-50";

  if (confirming) {
    const c = CONFIRM[confirming];
    return (
      <div className="flex flex-col items-start gap-2 rounded-xl bg-sand/60 p-2.5 md:items-end" role="group" aria-label="İşlem onayı">
        <p className="text-xs font-medium text-ink">{c.question}</p>
        <div className="flex gap-2">
          <button type="button" disabled={pending} onClick={() => run(confirming)} className={`${btn} ${c.className}`}>
            {pending ? <Spinner size={14} /> : null} {c.yes}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(null)}
            className={`${btn} border border-sand-dark bg-white text-ink-soft hover:bg-sand`}
          >
            Vazgeç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5 md:items-end">
      <div className="flex flex-wrap gap-2">
        {status === "PENDING" ? (
          <>
            <button type="button" onClick={() => setConfirming("APPROVED")} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
              Onayla
            </button>
            <button
              type="button"
              onClick={() => setConfirming("REJECTED")}
              className={`${btn} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}
            >
              Reddet
            </button>
          </>
        ) : null}
        {status === "APPROVED" ? (
          <button
            type="button"
            onClick={() => setConfirming("CANCELLED")}
            className={`${btn} border border-sand-dark bg-white text-ink-soft hover:bg-sand`}
          >
            İptal et
          </button>
        ) : null}
      </div>
      {error ? <p className="max-w-xs text-xs font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}
