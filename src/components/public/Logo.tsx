import Link from "next/link";

/** Güneş (turunç) + dalga (Akdeniz mavisi) amblemi ve yazı logosu */
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Paradise Emlak — Anasayfa">
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <circle cx="20" cy="17" r="9" className="fill-citrus-400 transition-transform duration-500 group-hover:-translate-y-0.5" />
        <path d="M3 26c3 0 3-2.5 6.5-2.5S13 26 16.5 26s3.5-2.5 7-2.5 3.5 2.5 7 2.5S34 23.5 37 23.5V37H3z" className="fill-sea-500" />
        <path d="M3 31c3 0 3-2 6.5-2s3.5 2 7 2 3.5-2 7-2 3.5 2 7 2 3.5-2 6.5-2" className="fill-none stroke-white/70" strokeWidth="1.5" />
      </svg>
      <span className="leading-none">
        <span className={`block font-display text-xl font-semibold tracking-tight ${tone === "light" ? "text-white" : "text-sea-700"}`}>
          Paradise
        </span>
        <span className={`block text-[0.65rem] font-bold tracking-[0.25em] uppercase ${tone === "light" ? "text-citrus-400" : "text-citrus-500"}`}>
          Emlak
        </span>
      </span>
    </Link>
  );
}
