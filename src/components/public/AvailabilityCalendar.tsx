"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/i18n/client";
import { addDays, formatMonth, toDayKey } from "./format";

export interface BookedRange {
  checkIn: string; // ISO
  checkOut: string; // ISO
  status: string;
}

/** Dolu geceler kümesi: giriş günü dahil, çıkış günü hariç (çıkış günü başka misafirin giriş günü olabilir). */
export function bookedNightSet(ranges: BookedRange[]): Set<string> {
  const set = new Set<string>();
  for (const r of ranges) {
    let d = toDayKey(r.checkIn);
    const end = toDayKey(r.checkOut);
    let guard = 0;
    while (d < end && guard++ < 1000) {
      set.add(d);
      d = addDays(d, 1);
    }
  }
  return set;
}

export function rangeIsFree(checkIn: string, checkOut: string, booked: Set<string>): boolean {
  let d = checkIn;
  let guard = 0;
  while (d < checkOut && guard++ < 1000) {
    if (booked.has(d)) return false;
    d = addDays(d, 1);
  }
  return true;
}


function monthOf(day: string) {
  return day.slice(0, 7); // YYYY-MM
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

function monthGrid(month: string): (string | null)[] {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // Pazartesi başlangıçlı
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${month}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

interface Props {
  booked: Set<string>;
  today: string | undefined;
  checkIn: string;
  checkOut: string;
  onChange: (range: { checkIn: string; checkOut: string }) => void;
}

/**
 * Müsaitlik takvimi ve tarih aralığı seçici.
 * 1. tık: giriş, 2. tık: çıkış. Arada dolu gece varsa seçim yeni giriş olarak başlar.
 */
export function AvailabilityCalendar({ booked, today, checkIn, checkOut, onChange }: Props) {
  const { lang, t } = useI18n();
  const [viewMonth, setViewMonth] = useState<string>();
  const [hover, setHover] = useState<string>();

  const month = viewMonth ?? (checkIn ? monthOf(checkIn) : today ? monthOf(today) : undefined);
  const cells = useMemo(() => (month ? monthGrid(month) : []), [month]);

  if (!month) {
    return <div className="h-[19rem] animate-pulse rounded-2xl bg-sand/60" aria-hidden />;
  }

  const canGoBack = !today || month > monthOf(today);
  const selectingCheckOut = Boolean(checkIn && !checkOut);

  function isDisabled(day: string): boolean {
    if (today && day < today) return true;
    if (selectingCheckOut && day > checkIn) {
      // Çıkış günü olarak seçilebilir mi? (aradaki geceler boş olmalı)
      return !rangeIsFree(checkIn, day, booked);
    }
    return booked.has(day);
  }

  function select(day: string) {
    if (selectingCheckOut && day > checkIn && rangeIsFree(checkIn, day, booked)) {
      onChange({ checkIn, checkOut: day });
      return;
    }
    if (booked.has(day)) return;
    onChange({ checkIn: day, checkOut: "" });
  }

  const previewEnd = selectingCheckOut && hover && hover > checkIn && rangeIsFree(checkIn, hover, booked) ? hover : undefined;
  const rangeEnd = checkOut || previewEnd;

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth(shiftMonth(month, -1))}
          disabled={!canGoBack}
          aria-label={t.calendar.prevMonth}
          className="grid size-9 place-items-center rounded-full text-ink transition hover:bg-sand disabled:opacity-30"
        >
          <Icon name="chevron-left" size={18} />
        </button>
        <p className="font-display text-base font-semibold text-ink capitalize" aria-live="polite">
          {formatMonth(month, lang)}
        </p>
        <button
          type="button"
          onClick={() => setViewMonth(shiftMonth(month, 1))}
          aria-label={t.calendar.nextMonth}
          className="grid size-9 place-items-center rounded-full text-ink transition hover:bg-sand"
        >
          <Icon name="chevron-right" size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[0.7rem] font-bold tracking-wide text-ink-soft uppercase">
        {t.calendar.weekdays.map((w) => (
          <span key={w} className="py-1.5">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => setHover(undefined)}>
        {cells.map((day, i) => {
          if (!day) return <span key={`e-${i}`} />;
          const disabled = isDisabled(day);
          const isBooked = booked.has(day);
          const isStart = day === checkIn;
          const isEnd = day === rangeEnd;
          const inRange = Boolean(checkIn && rangeEnd && day > checkIn && day < rangeEnd);
          const isToday = day === today;

          return (
            <div
              key={day}
              className={`relative ${inRange ? "bg-sea-50" : ""} ${isStart && rangeEnd ? "rounded-l-full bg-sea-50" : ""} ${
                isEnd && checkIn ? "rounded-r-full bg-sea-50" : ""
              }`}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => select(day)}
                onMouseEnter={() => setHover(day)}
                aria-pressed={isStart || isEnd}
                aria-label={`${day}${isBooked ? t.calendar.bookedSuffix : ""}`}
                className={`relative mx-auto grid aspect-square w-full max-w-10 place-items-center rounded-full text-sm font-semibold transition ${
                  isStart || (isEnd && checkIn)
                    ? "bg-sea-500 text-white"
                    : isBooked
                      ? "cursor-not-allowed text-ink-soft/50 line-through decoration-citrus-500 decoration-2"
                      : disabled
                        ? "cursor-not-allowed text-ink-soft/35"
                        : "text-ink hover:bg-sea-100"
                } ${isToday && !isStart ? "ring-1 ring-citrus-400" : ""}`}
              >
                {Number(day.slice(8))}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-sea-500" /> {t.calendar.selected}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-ink-soft/60 line-through decoration-citrus-500 decoration-2">12</span> {t.calendar.booked}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full ring-1 ring-citrus-400" /> {t.calendar.today}
        </span>
      </div>
    </div>
  );
}
