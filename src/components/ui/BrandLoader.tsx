/**
 * Marka yükleyicisi: dalgaların üzerinde yükselip alçalan turunç güneş.
 * Sunucu ve istemci bileşenlerinde kullanılabilir (hook yok). Hareket azaltma tercihinde animasyon durur
 * (globals.css → prefers-reduced-motion).
 */
export function BrandLoader({ size = 56, label, className = "" }: { size?: number; label?: string; className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center gap-3 ${className}`} role={label ? "status" : undefined}>
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden className="overflow-hidden rounded-full">
        <defs>
          <clipPath id="brand-loader-clip">
            <circle cx="20" cy="20" r="20" />
          </clipPath>
        </defs>
        <g clipPath="url(#brand-loader-clip)">
          <rect width="40" height="40" className="fill-sea-50" />
          <circle cx="20" cy="17" r="8" className="animate-sun-bob fill-citrus-400" />
          {/* Dalgalar: kesintisiz akış için desen iki kat genişlikte çizilir */}
          <g className="animate-wave-flow">
            <path
              d="M0 26c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2 2.5-2 5-2 2.5 2 5 2 2.5-2 5-2 2.5 2 5 2 2.5-2 5-2 2.5 2 5 2 2.5-2 5-2 2.5 2 5 2V40H0z"
              className="fill-sea-500"
            />
            <path
              d="M0 31c2.5 0 2.5-1.5 5-1.5S7.5 31 10 31s2.5-1.5 5-1.5 2.5 1.5 5 1.5 2.5-1.5 5-1.5 2.5 1.5 5 1.5 2.5-1.5 5-1.5 2.5 1.5 5 1.5 2.5-1.5 5-1.5 2.5 1.5 5 1.5 2.5-1.5 5-1.5 2.5 1.5 5 1.5"
              className="fill-none stroke-white/70"
              strokeWidth="1.4"
            />
          </g>
        </g>
      </svg>
      {label ? <span className="text-sm font-semibold text-sea-700">{label}</span> : null}
    </span>
  );
}
