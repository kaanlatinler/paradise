import type { ReactNode } from "react";

type Tone = "citrus" | "sea" | "sand" | "white";

const tones: Record<Tone, string> = {
  citrus: "bg-citrus-400 text-ink",
  sea: "bg-sea-50 text-sea-700 ring-1 ring-sea-100",
  sand: "bg-sand text-ink-soft",
  white: "bg-white/90 text-ink backdrop-blur",
};

export function Badge({
  children,
  tone = "sea",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
