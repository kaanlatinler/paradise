"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";
import { useI18n } from "@/i18n/client";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  /** "dark" lightbox gibi tam ekran görsel içerikler için */
  tone?: "light" | "dark";
}

/**
 * Yerel <dialog> tabanlı modal: odak hapsi, Esc ile kapanma ve arka plan kilidi tarayıcıdan gelir.
 */
export function Modal({ open, onClose, label, children, tone = "light" }: ModalProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isDark = tone === "dark";

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={
        isDark
          ? "m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-white backdrop:bg-ink/80"
          : "m-auto w-[min(92vw,40rem)] rounded-3xl bg-white p-0 text-ink shadow-lift backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
      }
    >
      <div className="relative h-full">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className={`absolute top-3 right-3 z-10 grid size-10 place-items-center rounded-full transition ${
            isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-sand text-ink hover:bg-sand-dark"
          }`}
        >
          <Icon name="x" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
