"use client";

import React, { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdminAction } from "@/actions/admin-auth";
import { Spinner } from "@/components/ui/Spinner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Proxy, korumalı sayfadan gelindiyse ?callbackUrl= ekler; yalnızca panel içi adreslere dönülür
  const callback = searchParams.get("callbackUrl");
  const target = callback && callback.startsWith("/admin") && !callback.startsWith("/admin/login") ? callback : "/admin";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await loginAdminAction({ email, password });
      if (!res.success) {
        setErrorMsg(res.error ?? "Giriş başarısız.");
        return;
      }
      router.push(target);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-lift">
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 40 40" className="size-10" aria-hidden>
          <circle cx="20" cy="17" r="9" fill="#FF9F1C" />
          <path d="M3 26c3 0 3-2.5 6.5-2.5S13 26 16.5 26s3.5-2.5 7-2.5 3.5 2.5 7 2.5S34 23.5 37 23.5V37H3z" fill="#0077B6" />
        </svg>
        <div>
          <h1 className="font-display text-2xl font-semibold text-sea-700">Yönetim Paneli</h1>
          <p className="text-sm text-ink-soft">Paradise Emlak personel girişi</p>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
          {errorMsg}
        </div>
      )}

      <label className="block">
        <span className="field-label">E-posta</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
        />
      </label>

      <label className="block">
        <span className="field-label">Şifre</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-sea-500 text-sm font-semibold text-white transition hover:bg-sea-700 disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Spinner size={18} /> Giriş yapılıyor…
          </>
        ) : (
          "Giriş Yap"
        )}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-sea-900 p-4">
      <div aria-hidden className="absolute -top-32 -right-24 size-96 rounded-full bg-citrus-400/80" />
      <div aria-hidden className="absolute -bottom-40 -left-24 size-[28rem] rounded-full bg-sea-500/40" />
      <div className="relative w-full max-w-md">
        <Suspense fallback={<div className="h-96 rounded-3xl bg-white/90" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
