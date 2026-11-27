"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { blockPropertyDatesAction } from "@/actions/admin-reservations";
import { Spinner } from "@/components/ui/Spinner";
import { AdminCard } from "./ui";

/**
 * Bakım, sahip kullanımı veya telefonla alınan rezervasyonlar için tarihleri takvimde kapatır.
 * (Onaylı, 0 ₺ tutarlı bir kayıt oluşturur; iptal edilerek tekrar açılabilir.)
 */
export function BlockDatesForm({ properties }: { properties: { id: string; title: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await blockPropertyDatesAction({ propertyId, checkIn, checkOut, notes: notes || undefined });
      if (res.success) {
        setMessage({ ok: true, text: "Tarihler takvimde kapatıldı." });
        setCheckIn("");
        setCheckOut("");
        setNotes("");
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error ?? "Tarihler kapatılamadı." });
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-sea-500/30 bg-white px-4 text-sm font-semibold text-sea-700 hover:border-sea-500 hover:bg-sea-50"
      >
        Tarih kapat
      </button>
    );
  }

  return (
    <AdminCard className="w-full p-5">
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1.4fr_auto] md:items-end">
        <label className="block">
          <span className="field-label">İlan</span>
          <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="field" required>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Başlangıç</span>
          <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="field px-2.5" />
        </label>
        <label className="block">
          <span className="field-label">Bitiş</span>
          <input type="date" required min={checkIn || undefined} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="field px-2.5" />
        </label>
        <label className="block">
          <span className="field-label">Not</span>
          <input value={notes} maxLength={300} onChange={(e) => setNotes(e.target.value)} placeholder="Örn: Bakım, sahip kullanımı" className="field" />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending || !propertyId}
            className="inline-flex h-[2.875rem] items-center gap-2 rounded-xl bg-sea-500 px-4 text-sm font-semibold text-white hover:bg-sea-700 disabled:opacity-60"
          >
            {pending ? <Spinner size={16} /> : null} Kapat
          </button>
          <button type="button" onClick={() => setOpen(false)} className="h-[2.875rem] rounded-xl px-3 text-sm font-semibold text-ink-soft hover:bg-sand">
            Vazgeç
          </button>
        </div>
      </form>
      {message ? (
        <p role="status" className={`mt-3 text-sm font-medium ${message.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {message.text}
        </p>
      ) : null}
    </AdminCard>
  );
}
