"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { startNavigationProgress } from "./NavigationProgress";
import { Icon } from "@/components/ui/Icon";
import { addDays, isPropertyType, PROPERTY_TYPES } from "./format";
import { useToday } from "./useToday";
import { useI18n } from "@/i18n/client";
import { listingHref } from "./lib/search-params";

export const POPULAR_CITIES = ["Antalya", "Muğla", "İzmir", "Aydın", "Mersin", "Balıkesir"];

/**
 * Anasayfadaki hızlı arama barı: konum / tarih / misafir → (dile göre) /properties?...
 */
export function SearchFilterBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { lang, t } = useI18n();
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
      setError(t.search.bothDates);
      return;
    }
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError(t.search.checkoutAfter);
      return;
    }
    setError(null);
    const target = listingHref(lang, {
      type: isPropertyType(type) ? type : undefined,
      city: city.trim() || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: guests > 0 ? guests : undefined,
    });
    startNavigationProgress();
    startTransition(() => router.push(target));
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label={t.search.aria}
      className={`rounded-3xl bg-white/95 p-3 shadow-lift backdrop-blur sm:p-4 ${className}`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1.1fr_1fr_1fr_0.8fr_auto] lg:items-end">
        <label className="block">
          <span className="field-label">{t.search.type}</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="field">
            <option value="">{t.common.all}</option>
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt.key} value={pt.key}>
                {t.types[pt.key].label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">{t.search.city}</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            list="popular-cities"
            placeholder={t.search.cityPlaceholder}
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
          <span className="field-label">{t.search.checkIn}</span>
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
          <span className="field-label">{t.search.checkOut}</span>
          <input
            type="date"
            value={checkOut}
            min={checkIn ? addDays(checkIn, 1) : today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="field"
          />
        </label>

        <label className="block">
          <span className="field-label">{t.search.guests}</span>
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
          {pending ? <Spinner size={18} /> : <Icon name="search" size={18} />} {pending ? t.common.searching : t.common.search}
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
