"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  listingHref,
  type ListingQuery,
} from "@/app/(public)/properties/_lib/search-params";
import { Icon } from "@/components/ui/Icon";
import { addDays, isPropertyType, PROPERTY_TYPES } from "./format";
import { POPULAR_CITIES } from "./SearchFilterBar";
import { useToday } from "./useToday";

interface AmenityOption {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

/**
 * İlan listeleme sayfasının gelişmiş filtre paneli. Durum URL'de tutulur; form gönderildiğinde
 * sayfa yeni searchParams ile sunucuda yeniden render edilir (getFilteredProperties).
 */
export function PropertyFilters({ initial, amenities }: { initial: ListingQuery; amenities: AmenityOption[] }) {
  const router = useRouter();
  const today = useToday();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [type, setType] = useState<string>(initial.type ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [district, setDistrict] = useState(initial.district ?? "");
  const [checkIn, setCheckIn] = useState(initial.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initial.checkOut ?? "");
  const [guests, setGuests] = useState(initial.guests ? String(initial.guests) : "");
  const [minPrice, setMinPrice] = useState(initial.minPrice ? String(initial.minPrice) : "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice ? String(initial.maxPrice) : "");
  const [selected, setSelected] = useState<string[]>(initial.amenities);
  const [featured, setFeatured] = useState(initial.featured);
  const [error, setError] = useState<string | null>(null);

  const activeCount =
    [initial.type, initial.city, initial.district, initial.guests, initial.minPrice, initial.maxPrice, initial.checkIn].filter(
      Boolean,
    ).length +
    initial.amenities.length +
    (initial.featured ? 1 : 0);

  function toggleAmenity(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  function navigate(href: string) {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
    setMobileOpen(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
      setError("Tarih filtresi için giriş ve çıkış tarihlerinin ikisini de seçin.");
      return;
    }
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError("Çıkış tarihi giriş tarihinden sonra olmalıdır.");
      return;
    }
    setError(null);
    navigate(
      listingHref({
        type: isPropertyType(type) ? type : undefined,
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        guests: Number(guests) || undefined,
        minPrice: Number(minPrice) || undefined,
        maxPrice: Number(maxPrice) || undefined,
        amenities: selected,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        featured,
        sort: initial.sort,
        page: 1,
      }),
    );
  }

  function reset() {
    setType("");
    setCity("");
    setDistrict("");
    setCheckIn("");
    setCheckOut("");
    setGuests("");
    setMinPrice("");
    setMaxPrice("");
    setSelected([]);
    setFeatured(false);
    setError(null);
    navigate(listingHref({ sort: initial.sort }));
  }

  return (
    <div>
      {/* Mobil aç/kapa düğmesi */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-controls="filter-panel"
        className="flex w-full items-center justify-between rounded-2xl border border-sand-dark bg-white px-4 py-3 text-sm font-semibold text-ink lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <Icon name="sliders" size={18} className="text-sea-500" /> Filtreler
          {activeCount > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-citrus-500 text-[0.7rem] text-white">
              {activeCount}
            </span>
          ) : null}
        </span>
        <Icon name="chevron-down" size={18} className={`transition ${mobileOpen ? "rotate-180" : ""}`} />
      </button>

      <form
        id="filter-panel"
        onSubmit={onSubmit}
        aria-label="İlan filtreleri"
        className={`${mobileOpen ? "mt-3 block" : "hidden"} space-y-5 rounded-3xl bg-white p-5 shadow-card lg:sticky lg:top-24 lg:block`}
      >
        <fieldset>
          <legend className="field-label">Konak Tipi</legend>
          <div className="grid grid-cols-2 gap-2">
            {[{ key: "", label: "Tümü" }, ...PROPERTY_TYPES].map((t) => (
              <label
                key={t.key || "all"}
                className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sea-500 ${
                  type === t.key
                    ? "border-sea-500 bg-sea-500 text-white"
                    : "border-sand-dark bg-white text-ink hover:border-sea-500/50"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t.key}
                  checked={type === t.key}
                  onChange={() => setType(t.key)}
                  className="sr-only"
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">Şehir</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              list="filter-cities"
              className="field"
              placeholder="Antalya"
              autoComplete="off"
            />
            <datalist id="filter-cities">
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="field-label">İlçe</span>
            <input value={district} onChange={(e) => setDistrict(e.target.value)} className="field" placeholder="Kaş" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
              className="field px-2.5"
            />
          </label>
          <label className="block">
            <span className="field-label">Çıkış</span>
            <input
              type="date"
              value={checkOut}
              min={checkIn ? addDays(checkIn, 1) : today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="field px-2.5"
            />
          </label>
        </div>

        <label className="block">
          <span className="field-label">Misafir Sayısı (en az)</span>
          <input
            type="number"
            min={1}
            max={30}
            inputMode="numeric"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="field"
            placeholder="2"
          />
        </label>

        <fieldset>
          <legend className="field-label">Gecelik Fiyat (₺)</legend>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={0}
              step={100}
              inputMode="numeric"
              aria-label="En düşük fiyat"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="field"
              placeholder="En az"
            />
            <input
              type="number"
              min={0}
              step={100}
              inputMode="numeric"
              aria-label="En yüksek fiyat"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="field"
              placeholder="En çok"
            />
          </div>
        </fieldset>

        {amenities.length > 0 ? (
          <fieldset>
            <legend className="field-label">Özellikler</legend>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => {
                const on = selected.includes(a.slug);
                return (
                  <label
                    key={a.id}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sea-500 ${
                      on ? "border-sea-500 bg-sea-50 text-sea-700" : "border-sand-dark text-ink-soft hover:border-sea-500/50"
                    }`}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggleAmenity(a.slug)} className="sr-only" />
                    <Icon name={on ? "check" : (a.icon ?? "sparkles")} size={14} />
                    {a.name}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="size-4 accent-citrus-500"
          />
          Yalnızca öne çıkan ilanlar
        </label>

        {error ? (
          <p role="alert" className="text-sm font-medium text-citrus-600">
            {error}
          </p>
        ) : null}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-sea-500 text-sm font-semibold text-white transition hover:bg-sea-700 disabled:opacity-60"
          >
            <Icon name="search" size={16} /> {pending ? "Aranıyor…" : "Filtrele"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="h-11 rounded-full px-4 text-sm font-semibold text-ink-soft transition hover:bg-sand"
          >
            Temizle
          </button>
        </div>
      </form>
    </div>
  );
}
