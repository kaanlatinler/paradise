"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { updateSiteContentsAction } from "@/actions/admin-cms";
import { Spinner } from "@/components/ui/Spinner";
import { AdminCard } from "./ui";

interface FieldDef {
  key: string;
  label: string;
  group: string;
  multiline?: boolean;
  type?: "text" | "url" | "email" | "tel";
  hint?: string;
  /** İngilizce karşılığı "<key>_en" anahtarında tutulur */
  translatable?: boolean;
}

const SECTIONS: { title: string; description: string; fields: FieldDef[] }[] = [
  {
    title: "Anasayfa (Hero)",
    description: "Anasayfanın en üstündeki büyük başlık alanı.",
    fields: [
      { key: "hero_title", label: "Başlık", group: "hero", translatable: true },
      { key: "hero_subtitle", label: "Alt başlık", group: "hero", multiline: true, translatable: true },
      {
        key: "hero_banner_url",
        label: "Arka plan görseli (URL)",
        group: "hero",
        type: "url",
        hint: "images.unsplash.com veya /uploads/... adresleri otomatik optimize edilir.",
      },
    ],
  },
  {
    title: "İletişim",
    description: "Menüde, alt bilgide ve iletişim sayfasında gösterilir.",
    fields: [
      { key: "contact_phone", label: "Telefon", group: "contact", type: "tel", hint: "WhatsApp bağlantısı da bu numaradan oluşturulur." },
      { key: "contact_email", label: "E-posta", group: "contact", type: "email" },
    ],
  },
  {
    title: "Hakkımızda",
    description: "Hakkımızda sayfasındaki tanıtım metni.",
    fields: [{ key: "about_text", label: "Metin", group: "about", multiline: true, translatable: true }],
  },
];

const KNOWN_KEYS = new Set(SECTIONS.flatMap((s) => s.fields.flatMap((f) => (f.translatable ? [f.key, `${f.key}_en`] : [f.key]))));

export function ContentEditor({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const otherKeys = useMemo(() => Object.keys(initial).filter((k) => !KNOWN_KEYS.has(k)).sort(), [initial]);
  const dirty = useMemo(
    () => Object.keys(values).filter((k) => (values[k] ?? "") !== (initial[k] ?? "")),
    [values, initial],
  );

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  function groupOf(key: string) {
    const base = key.replace(/_en$/, "");
    for (const s of SECTIONS) for (const f of s.fields) if (f.key === base) return f.group;
    return "general";
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (dirty.length === 0) {
      setMessage({ ok: true, text: "Değişiklik yok." });
      return;
    }
    const items = dirty.map((key) => ({ key, value: values[key] ?? "", group: groupOf(key) }));
    startTransition(async () => {
      const res = await updateSiteContentsAction(items);
      if (res.success) {
        setMessage({ ok: true, text: `${items.length} içerik kaydedildi. Site hemen güncellendi.` });
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error ?? "Kaydedilemedi." });
      }
    });
  }

  function renderInput(key: string, field: FieldDef, lang: "tr" | "en") {
    const common = {
      id: `cms-${key}`,
      value: values[key] ?? "",
      onChange: (e: { target: { value: string } }) => set(key, e.target.value),
      lang,
      className: "field",
    };
    return field.multiline ? <textarea rows={key.startsWith("about") ? 6 : 3} {...common} className="field resize-y" /> : <input type={field.type ?? "text"} {...common} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {SECTIONS.map((section) => (
        <AdminCard key={section.title} className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">{section.title}</h2>
          <p className="mb-5 text-sm text-ink-soft">{section.description}</p>
          <div className="space-y-5">
            {section.fields.map((field) => (
              <div key={field.key}>
                {field.translatable ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor={`cms-${field.key}`} className="field-label">
                        {field.label} · Türkçe
                      </label>
                      {renderInput(field.key, field, "tr")}
                    </div>
                    <div>
                      <label htmlFor={`cms-${field.key}_en`} className="field-label">
                        {field.label} · English
                      </label>
                      {renderInput(`${field.key}_en`, field, "en")}
                      <p className="mt-1 text-xs text-ink-soft">Boş bırakılırsa İngilizce sitede hazır çeviri metni gösterilir.</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor={`cms-${field.key}`} className="field-label">
                      {field.label}
                    </label>
                    {renderInput(field.key, field, "tr")}
                  </div>
                )}
                {field.hint ? <p className="mt-1 text-xs text-ink-soft">{field.hint}</p> : null}
              </div>
            ))}
          </div>
        </AdminCard>
      ))}

      {otherKeys.length > 0 ? (
        <AdminCard className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Diğer içerikler</h2>
          <p className="mb-5 text-sm text-ink-soft">Veritabanında bulunan ek anahtarlar.</p>
          <div className="space-y-4">
            {otherKeys.map((key) => (
              <div key={key}>
                <label htmlFor={`cms-${key}`} className="field-label normal-case">
                  {key}
                </label>
                <input id={`cms-${key}`} value={values[key] ?? ""} onChange={(e) => set(key, e.target.value)} className="field" />
              </div>
            ))}
          </div>
        </AdminCard>
      ) : null}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl bg-white/95 p-3 shadow-lift ring-1 ring-sand-dark/60 backdrop-blur">
        {message ? (
          <p role="status" className={`mr-auto text-sm font-medium ${message.ok ? "text-emerald-700" : "text-rose-700"}`}>
            {message.text}
          </p>
        ) : dirty.length > 0 ? (
          <p className="mr-auto text-sm text-ink-soft">{dirty.length} kaydedilmemiş değişiklik</p>
        ) : null}
        <button
          type="button"
          disabled={pending || dirty.length === 0}
          onClick={() => {
            setValues(initial);
            setMessage(null);
          }}
          className="h-11 rounded-full px-5 text-sm font-semibold text-ink-soft hover:bg-sand disabled:opacity-40"
        >
          Geri al
        </button>
        <button
          type="submit"
          disabled={pending || dirty.length === 0}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-citrus-500 px-6 text-sm font-semibold text-white hover:bg-citrus-600 disabled:opacity-50"
        >
          {pending ? <Spinner size={16} /> : null} Kaydet
        </button>
      </div>
    </form>
  );
}
