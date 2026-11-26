"use client";

import { useLinkStatus } from "next/link";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Bir <Link> içinde kullanılır: tıklandıktan sonra yeni sayfa gelene kadar
 * en yakın `relative` kapsayıcının (ör. ilan kartı) üzerine yarı saydam katman ve spinner koyar.
 * Her zaman render edilir, yalnızca opaklığı değişir (layout kayması olmaz).
 */
export function LinkPendingOverlay({ className = "rounded-3xl" }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-10 grid place-items-center bg-white/55 text-sea-500 backdrop-blur-[1px] transition-opacity duration-200 ${className} ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    >
      {pending ? <Spinner size={28} /> : null}
    </span>
  );
}
