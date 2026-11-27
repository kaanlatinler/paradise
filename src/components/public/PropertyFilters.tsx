"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { amenityName } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { addDays, isPropertyType, PROPERTY_TYPES } from "./format";
import type { LocationOption } from "./lib/data";
import { listingHref, type ListingQuery } from "./lib/search-params";
import { startNavigationProgress } from "./NavigationProgress";
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
export function PropertyFilters({
  initial,
  amenities,
  locations,
}: {
  initial: ListingQuery;
  amenities: AmenityOption[];
  locations: LocationOption[];
}) {
  const router = useRouter();
  const { lang, t } = useI18n();
  const today = useToday();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  // URL'deki şehir/ilçe, veritabanındaki yazımla eşleştirilir (büyük/küçük harf duyarsız)
  const matchCity = locations.find((l) => l.city.toLocaleLowerCase("tr") === initial.city?.toLocaleLowerCase("tr"));
  const matchDistrict = matchCity?.districts.find(
    (d) => d.toLocaleLowerCase("tr") === initial.district?.toLocaleLowerCase("tr"),
  );

  const [type, setType] = useState<string>(initial.type ?? "");
  const [city, setCity] = useState(matchCity?.city ?? initial.city ?? "");
  const [district, setDistrict] = useState(matchDistrict ?? initial.district ?? "");
  const [checkIn, setCheckIn] = useState(initial.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initial.checkOut ?? "");
  const [guests, setGuests] = useState(initial.guests ? String(initial.guests) : "");
  const [minPrice, setMinPrice] = useState(initial.minPrice ? String(initial.minPrice) : "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice ? String(initial.maxPrice) : "");
  const [selected, setSelected] = useState<string[]>(initial.amenities);
  const [featured, setFeatured] = useState(initial.featured);
  const [error, setError] = useState<string | null>(null);

  const districtOptions = city
    ? (locations.find((l) => l.city === city)?.districts ?? [])
    : [...new Set(locations.flatMap((l) => l.districts))].sort((a, b) => a.localeCompare(b, "tr"));

  // URL'de listede olmayan bir değer varsa (eski bağlantı vb.) seçenek olarak korunur
  const cityOptions = locations.map((l) => l.city);
  if (city && !cityOptions.includes(city)) cityOptions.push(city);
  if (district && !districtOptions.includes(district)) districtOptions.push(district);

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
    startNavigationProgress();
    startTransition(() => {
      router.push(href, { scroll: false });
    });
    setMobileOpen(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
      setError(t.filters.bothDates);
      return;
    }
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError(t.filters.checkoutAfter);
      return;
    }
    setError(null);
    navigate(
      listingHref(lang, {
        type: isPropertyType(type) ? type : undefined,
        city: city || undefined,
        district: district || undefined,
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
    navigate(listingHref(lang, { sort: initial.sort }));
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
          <Icon name="sliders" size={18} className="text-sea-500" /> {t.filters.title}
          {activeCount > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-citrus-500 text-[0.7rem] text-white">{activeCount}</span>
          ) : null}
        </span>
        <Icon name="chevron-down" size={18} className={`transition ${mobileOpen ? "rotate-180" : ""}`} />
      </button>

      <form
        id="filter-panel"
        onSubmit={onSubmit}
        aria-label={t.filters.aria}
        className={`${mobileOpen ? "mt-3 block" : "hidden"} space-y-5 rounded-3xl bg-white p-5 shadow-card lg:sticky lg:top-24 lg:block`}
      >
        <fieldset>
          <legend className="field-label">{t.filters.type}</legend>
          <div className="grid grid-cols-2 gap-2">
            {[{ key: "", label: t.common.all }, ...PROPERTY_TYPES.map((pt) => ({ key: pt.key, label: t.types[pt.key].label }))].map(
              (option) => (
                <label
                  key={option.key || "all"}
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sea-500 ${
                    type === option.key
                      ? "border-sea-500 bg-sea-500 text-white"
                      : "border-sand-dark bg-white text-ink hover:border-sea-500/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={option.key}
                    checked={type === option.key}
                    onChange={() => setType(option.key)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ),
            )}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">{t.filters.city}</span>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setDistrict("");
              }}
              className="field px-2.5"
            >
              <option value="">{t.filters.anyCity}</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">{t.filters.district}</span>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="field px-2.5">
              <option value="">{t.filters.anyDistrict}</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">{t.filters.checkIn}</span>
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
            <span className="field-label">{t.filters.checkOut}</span>
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
          <span className="field-label">{t.filters.minGuests}</span>
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
          <legend className="field-label">{t.filters.price}</legend>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={0}
              step={100}
              inputMode="numeric"
              aria-label={t.filters.priceMinAria}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="field"
              placeholder={t.filters.priceMin}
            />
            <input
              type="number"
              min={0}
              step={100}
              inputMode="numeric"
              aria-label={t.filters.priceMaxAria}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="field"
              placeholder={t.filters.priceMax}
            />
          </div>
        </fieldset>

        {amenities.length > 0 ? (
          <fieldset>
            <legend className="field-label">{t.filters.amenities}</legend>
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
                    {amenityName(t, a)}
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
          {t.filters.featuredOnly}
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
            {pending ? <Spinner size={16} /> : <Icon name="search" size={16} />} {pending ? t.common.searching : t.filters.apply}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="h-11 rounded-full px-4 text-sm font-semibold text-ink-soft transition hover:bg-sand"
          >
            {t.filters.reset}
          </button>
        </div>
      </form>
    </div>
  );
}
