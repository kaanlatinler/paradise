"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface Country {
  iso: string;
  name: string;
  dial: string;
  /** Ulusal numara için beklenen hane sayısı (biliniyorsa) */
  digits?: number;
  placeholder: string;
}

/**
 * Misafir profiline göre sıralı ülke listesi (Türkiye varsayılan).
 * Not: Bayrak emojileri Windows'ta harf olarak göründüğü için ISO kodu kullanılır.
 */
export const COUNTRIES: Country[] = [
  { iso: "TR", name: "Türkiye", dial: "+90", digits: 10, placeholder: "5xx xxx xx xx" },
  { iso: "DE", name: "Almanya", dial: "+49", placeholder: "1512 3456789" },
  { iso: "GB", name: "Birleşik Krallık", dial: "+44", digits: 10, placeholder: "7400 123456" },
  { iso: "RU", name: "Rusya", dial: "+7", digits: 10, placeholder: "912 345 67 89" },
  { iso: "UA", name: "Ukrayna", dial: "+380", digits: 9, placeholder: "50 123 4567" },
  { iso: "NL", name: "Hollanda", dial: "+31", digits: 9, placeholder: "6 12345678" },
  { iso: "AT", name: "Avusturya", dial: "+43", placeholder: "664 123456" },
  { iso: "CH", name: "İsviçre", dial: "+41", digits: 9, placeholder: "78 123 45 67" },
  { iso: "BE", name: "Belçika", dial: "+32", digits: 9, placeholder: "470 12 34 56" },
  { iso: "FR", name: "Fransa", dial: "+33", digits: 9, placeholder: "6 12 34 56 78" },
  { iso: "IT", name: "İtalya", dial: "+39", placeholder: "312 345 6789" },
  { iso: "PL", name: "Polonya", dial: "+48", digits: 9, placeholder: "512 345 678" },
  { iso: "SE", name: "İsveç", dial: "+46", digits: 9, placeholder: "70 123 45 67" },
  { iso: "NO", name: "Norveç", dial: "+47", digits: 8, placeholder: "406 12 345" },
  { iso: "DK", name: "Danimarka", dial: "+45", digits: 8, placeholder: "20 12 34 56" },
  { iso: "GR", name: "Yunanistan", dial: "+30", digits: 10, placeholder: "691 234 5678" },
  { iso: "BG", name: "Bulgaristan", dial: "+359", digits: 9, placeholder: "87 123 4567" },
  { iso: "RO", name: "Romanya", dial: "+40", digits: 9, placeholder: "712 345 678" },
  { iso: "AZ", name: "Azerbaycan", dial: "+994", digits: 9, placeholder: "50 123 45 67" },
  { iso: "GE", name: "Gürcistan", dial: "+995", digits: 9, placeholder: "555 12 34 56" },
  { iso: "KZ", name: "Kazakistan", dial: "+7", digits: 10, placeholder: "771 000 9998" },
  { iso: "IR", name: "İran", dial: "+98", digits: 10, placeholder: "912 345 6789" },
  { iso: "IL", name: "İsrail", dial: "+972", digits: 9, placeholder: "50 234 5678" },
  { iso: "AE", name: "Birleşik Arap Emirlikleri", dial: "+971", digits: 9, placeholder: "50 123 4567" },
  { iso: "SA", name: "Suudi Arabistan", dial: "+966", digits: 9, placeholder: "51 234 5678" },
  { iso: "QA", name: "Katar", dial: "+974", digits: 8, placeholder: "3312 3456" },
  { iso: "US", name: "ABD / Kanada", dial: "+1", digits: 10, placeholder: "201 555 0123" },
];

/** Türkiye için 3-3-2-2, diğerleri için 3'lü gruplama */
function formatNational(iso: string, digits: string): string {
  if (iso === "TR") {
    const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)];
    return parts.filter(Boolean).join(" ");
  }
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

/** Kullanıcı girdisinden yalnızca rakamları alır; baştaki 0'ları (ör. 0532) ve yapıştırılan ülke kodunu atar. */
function normalizeDigits(raw: string, country: Country, max: number): string {
  let d = raw.replace(/\D/g, "");
  const code = country.dial.slice(1);
  if (raw.trim().startsWith("+") && d.startsWith(code)) d = d.slice(code.length);
  else if (raw.trim().startsWith("00") && d.startsWith(`00${code}`)) d = d.slice(2 + code.length);
  d = d.replace(/^0+/, "");
  return d.slice(0, max);
}

export function isPhoneComplete(country: Country, national: string): boolean {
  return country.digits ? national.length === country.digits : national.length >= 6 && national.length <= 13;
}

interface PhoneInputProps {
  /** Tam numara: "+90 532 123 45 67" (sunucuya gönderilecek değer) */
  onChange: (fullNumber: string, complete: boolean) => void;
  invalid?: boolean;
}

export function PhoneInput({ onChange, invalid }: PhoneInputProps) {
  const id = useId();
  const [iso, setIso] = useState("TR");
  const [national, setNational] = useState("");
  const country = COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES[0];
  const max = country.digits ?? 13;

  function emit(nextCountry: Country, digits: string) {
    const formatted = formatNational(nextCountry.iso, digits);
    onChange(digits ? `${nextCountry.dial} ${formatted}` : "", isPhoneComplete(nextCountry, digits));
  }

  return (
    <div>
      <label htmlFor={`${id}-number`} className="field-label">
        Telefon
      </label>
      <div
        className={`flex rounded-xl border bg-white transition focus-within:ring-2 ${
          invalid
            ? "border-citrus-500 focus-within:ring-citrus-500/20"
            : "border-sand-dark focus-within:border-sea-500 focus-within:ring-sea-500/20"
        }`}
      >
        {/* Görünen kısa etiket + üstünde şeffaf yerel select (mobilde yerel seçici açılır) */}
        <div className="relative flex shrink-0 items-center gap-1 border-r border-sand-dark pr-2 pl-3 text-sm font-semibold text-ink">
          <span className="rounded bg-sand px-1 py-0.5 text-[0.65rem] tracking-wide text-ink-soft">{country.iso}</span>
          <span>{country.dial}</span>
          <Icon name="chevron-down" size={14} className="text-ink-soft" />
          <select
            aria-label="Ülke kodu"
            value={iso}
            onChange={(e) => {
              const next = COUNTRIES.find((c) => c.iso === e.target.value) ?? COUNTRIES[0];
              const digits = national.slice(0, next.digits ?? 13);
              setIso(next.iso);
              setNational(digits);
              emit(next, digits);
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.name} ({c.dial})
              </option>
            ))}
          </select>
        </div>
        <input
          id={`${id}-number`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          placeholder={country.placeholder}
          value={formatNational(country.iso, national)}
          onChange={(e) => {
            const digits = normalizeDigits(e.target.value, country, max);
            setNational(digits);
            emit(country, digits);
          }}
          aria-invalid={invalid || undefined}
          className="min-w-0 flex-1 rounded-r-xl bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none"
        />
      </div>
      {invalid ? (
        <p className="mt-1 text-xs font-medium text-citrus-600">
          {country.digits
            ? `${country.name} numarası ${country.digits} haneli olmalıdır (başında 0 olmadan).`
            : "Lütfen geçerli bir telefon numarası girin."}
        </p>
      ) : null}
    </div>
  );
}
