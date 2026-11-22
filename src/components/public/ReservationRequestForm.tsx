"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { createReservationRequest } from "@/actions/reservations";
import { Icon } from "@/components/ui/Icon";
import { AvailabilityCalendar, bookedNightSet, rangeIsFree, type BookedRange } from "./AvailabilityCalendar";
import { formatDay, formatPrice, nightsBetween } from "./format";
import { PhoneInput } from "./PhoneInput";
import { useToday } from "./useToday";

interface Props {
  propertyId: string;
  propertyTitle: string;
  pricePerNight: string;
  capacity: number;
  bookedRanges: BookedRange[];
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

type Success = { reservationId: string; nights: number; totalPrice: string };

export function ReservationRequestForm({
  propertyId,
  propertyTitle,
  pricePerNight,
  capacity,
  bookedRanges,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: Props) {
  const today = useToday();
  const booked = useMemo(() => bookedNightSet(bookedRanges), [bookedRanges]);

  const initialValid =
    initialCheckIn && initialCheckOut && initialCheckOut > initialCheckIn && rangeIsFree(initialCheckIn, initialCheckOut, booked);

  const [range, setRange] = useState({
    checkIn: initialValid ? initialCheckIn! : "",
    checkOut: initialValid ? initialCheckOut! : "",
  });
  const [guestCount, setGuestCount] = useState(Math.min(Math.max(initialGuests ?? 2, 1), capacity));
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [phoneComplete, setPhoneComplete] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);
  const [pending, startTransition] = useTransition();

  const pastSelection = Boolean(today && range.checkIn && range.checkIn < today);
  const nights = range.checkIn && range.checkOut ? nightsBetween(range.checkIn, range.checkOut) : 0;
  const price = Number(pricePerNight);
  const total = nights * price;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!range.checkIn || !range.checkOut) {
      setError("Lütfen takvimden giriş ve çıkış tarihlerini seçin.");
      return;
    }
    if (!phoneComplete) {
      setPhoneTouched(true);
      setError("Lütfen telefon numaranızı ülke koduna uygun şekilde eksiksiz girin.");
      return;
    }
    if (pastSelection) {
      setError("Geçmiş bir tarih seçilemez.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createReservationRequest({
          propertyId,
          guestName,
          guestEmail,
          guestPhone,
          guestCount,
          checkIn: range.checkIn,
          checkOut: range.checkOut,
          notes: notes.trim() || undefined,
        });
        if (res.success && res.reservationId) {
          setSuccess({
            reservationId: res.reservationId,
            nights: res.nights ?? nights,
            totalPrice: res.totalPrice ?? String(total),
          });
        } else {
          setError(res.error || "Talep gönderilemedi. Lütfen tekrar deneyin.");
        }
      } catch {
        setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
      }
    });
  }

  if (success) {
    return (
      <div className="p-6 text-center" role="status">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-citrus-50 text-citrus-500">
          <Icon name="check" size={28} />
        </span>
        <h3 className="font-display text-2xl font-semibold text-sea-700">Talebin alındı!</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          <strong className="text-ink">{propertyTitle}</strong> için {formatDay(range.checkIn)} – {formatDay(range.checkOut)}{" "}
          tarihleri arasındaki ({success.nights} gece) rezervasyon talebin ekibimize iletildi. En kısa sürede{" "}
          <strong className="text-ink">{guestEmail}</strong> veya telefonla dönüş yapacağız.
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-sand/70 p-4 text-left text-sm">
          <div>
            <dt className="text-ink-soft">Tahmini toplam</dt>
            <dd className="font-display text-lg font-semibold text-citrus-500">{formatPrice(success.totalPrice)}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Talep no</dt>
            <dd className="truncate font-mono text-xs font-semibold text-ink">{success.reservationId}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-ink-soft">Talebin onaylanana kadar “beklemede” durumundadır; ödeme alınmaz.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-6">
      <div className="flex items-end justify-between">
        <p>
          <span className="font-display text-3xl font-semibold text-citrus-500">{formatPrice(pricePerNight)}</span>
          <span className="text-sm text-ink-soft"> / gece</span>
        </p>
        <span className="text-xs font-semibold text-ink-soft">En fazla {capacity} kişi</span>
      </div>

      <div className="rounded-2xl border border-sand-dark p-3.5">
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
          <div className={`rounded-xl px-3 py-2 bg-sand/60`}>
            <p className="text-[0.65rem] font-bold tracking-wide text-ink-soft uppercase">Giriş</p>
            <p className="font-semibold text-ink">{range.checkIn ? formatDay(range.checkIn, "short") : "Tarih seç"}</p>
          </div>
          <div className={`rounded-xl px-3 py-2 ${range.checkIn && !range.checkOut ? "bg-sea-50 ring-2 ring-sea-500" : "bg-sand/60"}`}>
            <p className="text-[0.65rem] font-bold tracking-wide text-ink-soft uppercase">Çıkış</p>
            <p className="font-semibold text-ink">{range.checkOut ? formatDay(range.checkOut, "short") : "Tarih seç"}</p>
          </div>
        </div>
        <AvailabilityCalendar
          booked={booked}
          today={today}
          checkIn={range.checkIn}
          checkOut={range.checkOut}
          onChange={(r) => {
            setRange(r);
            setError(null);
          }}
        />
        {range.checkIn ? (
          <button
            type="button"
            onClick={() => setRange({ checkIn: "", checkOut: "" })}
            className="mt-2 text-xs font-semibold text-sea-700 hover:underline"
          >
            Tarihleri temizle
          </button>
        ) : null}
      </div>

      <label className="block">
        <span className="field-label">Misafir sayısı</span>
        <select value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="field">
          {Array.from({ length: capacity }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} misafir
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3">
        <label className="block">
          <span className="field-label">Ad Soyad</span>
          <input
            required
            minLength={2}
            autoComplete="name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="field"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <label className="block">
            <span className="field-label">E-posta</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="field"
            />
          </label>
          <PhoneInput
            invalid={phoneTouched && !phoneComplete}
            onChange={(full, complete) => {
              setGuestPhone(full);
              setPhoneComplete(complete);
            }}
          />
        </div>
        <label className="block">
          <span className="field-label">Not (isteğe bağlı)</span>
          <textarea
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Varış saati, bebek yatağı ihtiyacı vb."
            className="field resize-none"
          />
        </label>
      </div>

      {nights > 0 ? (
        <dl className="space-y-2 rounded-2xl bg-sand/60 p-4 text-sm">
          <div className="flex justify-between text-ink-soft">
            <dt>
              {formatPrice(price)} × {nights} gece
            </dt>
            <dd>{formatPrice(total)}</dd>
          </div>
          <div className="flex justify-between border-t border-sand-dark pt-2 font-semibold text-ink">
            <dt>Tahmini toplam</dt>
            <dd className="font-display text-lg text-citrus-500">{formatPrice(total)}</dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-xl bg-citrus-50 px-3.5 py-2.5 text-sm font-medium text-citrus-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-citrus-500 text-base font-semibold text-white shadow-[0_8px_20px_-8px_rgb(251_133_0/0.7)] transition hover:bg-citrus-600 disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Rezervasyon Talebi Gönder"}
      </button>
      <p className="text-center text-xs text-ink-soft">Talep göndermek ücretsizdir; onay sonrası seninle iletişime geçeriz.</p>
    </form>
  );
}
