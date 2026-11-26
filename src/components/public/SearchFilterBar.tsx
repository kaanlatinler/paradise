"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { startNavigationProgress } from "./NavigationProgress";
import { Icon } from "@/components/ui/Icon";
import { addDays, PROPERTY_TYPES } from "./format";
import { useToday } from "./useToday";

export const POPULAR_CITIES = ["Antalya", "Muğla", "İzmir", "Aydın", "Mersin", "Balıkesir"];

/**
 * Anasayfadaki hızlı arama barı: konum / tarih / misafir → /properties?...
 */
export function SearchFilterBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const today = useToday();
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
      setError("Lütfen giriş ve çıkış tarihlerinin ikisini de seçin.");
      return;
    }
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError("Çıkış tarihi giriş tarihinden sonra olmalıdır.");
      return;
    }
    setError(null);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (city.trim()) params.set("city", city.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests > 0) params.set("guests", String(guests));
    startNavigationProgress();
    startTransition(() => router.push(`/properties${params.size ? `?${params}` : ""}`));
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Konaklama ara"
      className={`rounded-3xl bg-white/95 p-3 shadow-lift backdrop-blur sm:p-4 ${className}`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1.1fr_1fr_1fr_0.8fr_auto] lg:items-end">
        <label className="block">
          <span className="field-label">Konak Tipi</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="field">
            <option value="">Tümü</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Şehir</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            list="popular-cities"
            placeholder="Nereye gidiyorsun?"
            className="field"
            autoComplete="off"
          />
          <datalist id="popular-cities">
            {POPULAR_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="field-label">Giriş</span>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && e.target.value && checkOut <= e.target.value) setCheckOut("");
            }}
            className="field"
          />
        </label>

        <label className="block">
          <span className="field-label">Çıkış</span>
          <input
            type="date"
            value={checkOut}
            min={checkIn ? addDays(checkIn, 1) : today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="field"
          />
        </label>

        <label className="block">
          <span className="field-label">Misafir</span>
          <input
            type="number"
            min={1}
            max={30}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
            className="field"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-[2.875rem] items-center justify-center gap-2 rounded-xl bg-sea-500 px-6 text-sm font-semibold text-white transition hover:bg-sea-700 disabled:opacity-70 sm:col-span-2 lg:col-span-1"
        >
          {pending ? <Spinner size={18} /> : <Icon name="search" size={18} />} {pending ? "Aranıyor…" : "Ara"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 px-1 text-sm font-medium text-citrus-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}
