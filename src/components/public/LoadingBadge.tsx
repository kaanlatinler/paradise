"use client";

import { useEffect, useState } from "react";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { useI18n } from "@/i18n/client";

/**
 * Ekranın altında, ortada yüzen "Yükleniyor…" göstergesi (marka logolu).
 * Suspense fallback'lerine ve iskelet ekranlarına eklenir; içerik gelince fallback ile birlikte kaybolur.
 * Kısa yüklemelerde göz kırpmasın diye kısa bir gecikmeyle belirir. Aynı anda birden fazla
 * fallback açıksa hepsi aynı konumda üst üste durur, tek gösterge gibi görünür.
 */
export function LoadingBadge({ delay = 200 }: { delay?: number }) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const id = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[65] flex justify-center px-4">
      <div
        role="status"
        className="animate-fade-in inline-flex items-center gap-2.5 rounded-full bg-white/95 py-1.5 pr-4 pl-1.5 shadow-lift ring-1 ring-sand-dark/60 backdrop-blur"
      >
        <BrandLoader size={30} />
        <span className="text-sm font-semibold text-sea-700">{t.common.loading}</span>
      </div>
    </div>
  );
}
