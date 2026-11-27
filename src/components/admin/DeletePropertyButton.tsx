"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePropertyAction } from "@/actions/admin-properties";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";

/**
 * İlanı kalıcı olarak siler (görseller, özellik bağları ve rezervasyonlar da silinir — cascade).
 * Geri alınamaz olduğu için ilan başlığı yazılarak onaylanır; yayından kaldırmak için "Arşiv" önerilir.
 */
export function DeletePropertyButton({
  propertyId,
  title,
  reservationCount,
}: {
  propertyId: string;
  title: string;
  reservationCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${title} ilanını sil`}
        className="grid size-9 place-items-center rounded-full text-rose-600 transition hover:bg-rose-50"
      >
        <Icon name="x" size={18} />
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-rose-200 bg-rose-50 p-3 text-left" role="group" aria-label="Silme onayı">
      <p className="text-xs font-medium text-rose-800">
        Bu işlem geri alınamaz.
        {reservationCount > 0 ? ` İlana bağlı ${reservationCount} rezervasyon kaydı da silinir.` : ""} Yalnızca yayından kaldırmak için
        düzenleyip durumunu “Arşiv” yapın. Onaylamak için ilan başlığını yazın:
      </p>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        aria-label="Onay için ilan başlığı"
        placeholder={title}
        className="field mt-2 h-9 py-1.5 text-xs"
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-rose-700">{error}</p> : null}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={pending || typed.trim() !== title.trim()}
          onClick={() =>
            startTransition(async () => {
              const res = await deletePropertyAction(propertyId);
              if (!res.success) {
                setError(res.error ?? "İlan silinemedi.");
                return;
              }
              router.refresh();
            })
          }
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-rose-600 px-3 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
        >
          {pending ? <Spinner size={12} /> : null} Kalıcı olarak sil
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setTyped("");
          }}
          className="h-8 rounded-full px-3 text-xs font-semibold text-ink-soft hover:bg-white"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}
