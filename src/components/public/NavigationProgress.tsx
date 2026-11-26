"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const START_EVENT = "paradise:navigation-start";

/** Programatik geçişlerden (router.push) önce çağır: üstteki ilerleme çubuğunu başlatır. */
export function startNavigationProgress() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(START_EVENT));
}

type Phase = "idle" | "loading" | "done";

function isInternalNavigation(e: MouseEvent): boolean {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  const anchor = (e.target as Element | null)?.closest?.("a");
  if (!anchor || anchor.hasAttribute("download")) return false;
  const target = anchor.getAttribute("target");
  if (target && target !== "_self") return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // Yalnızca hash değişiyorsa sayfa yüklenmez
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

/** Rota (yol + sorgu) değiştiğinde çubuğu tamamlar. useSearchParams Suspense ister. */
function RouteChangeWatcher({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}?${searchParams.toString()}`;
  const lastKey = useRef(key);
  const callback = useRef(onChange);

  useEffect(() => {
    callback.current = onChange;
  });

  useEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    callback.current();
  }, [key]);

  return null;
}

/**
 * Sayfanın en üstünde turunçgil renkli ince ilerleme çubuğu.
 * Site içi bağlantı tıklamalarında ve startNavigationProgress() çağrılarında başlar,
 * yeni sayfa geldiğinde tamamlanıp kaybolur.
 */
export function NavigationProgress() {
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function start() {
    clearTimers();
    setPhase("loading");
    // Güvenlik: bir şekilde tamamlanmazsa 15 sn sonra kapat
    timers.current.push(window.setTimeout(finish, 15_000));
  }

  function finish() {
    clearTimers();
    setPhase((p) => (p === "idle" ? p : "done"));
    timers.current.push(window.setTimeout(() => setPhase("idle"), 500));
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (isInternalNavigation(e)) start();
    }
    function onStart() {
      start();
    }
    document.addEventListener("click", onClick);
    window.addEventListener(START_EVENT, onStart);
    window.addEventListener("popstate", onStart);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener(START_EVENT, onStart);
      window.removeEventListener("popstate", onStart);
      clearTimers();
    };
    // start/finish yalnızca ref ve setState kullanır; dinleyiciler bir kez kurulur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeWatcher onChange={finish} />
      </Suspense>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]"
      >
        <div
          className={`h-full rounded-r-full bg-linear-to-r from-citrus-400 to-citrus-500 shadow-[0_0_10px_rgb(251_133_0/0.6)] ${
            phase === "loading"
              ? "animate-progress opacity-100"
              : phase === "done"
                ? "w-full opacity-0 transition-[width,opacity] duration-300 ease-out"
                : "w-0 opacity-0"
          }`}
        />
      </div>
      {phase === "loading" ? (
        <span className="sr-only" role="status">
          Sayfa yükleniyor
        </span>
      ) : null}
    </>
  );
}
