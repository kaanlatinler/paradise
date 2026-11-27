"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { fmt } from "@/i18n";
import { useI18n } from "@/i18n/client";

/**
 * Veritabanı gerektirmeyen iletişim formu: mesaj sitede saklanmaz,
 * kullanıcının seçtiği kanala (WhatsApp veya e-posta) hazır metin olarak aktarılır.
 */
export function ContactForm({ phone, email }: { phone: string; email: string }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function compose(): string | null {
    if (name.trim().length < 2 || message.trim().length < 5) {
      setError(t.contact.formRequired);
      return null;
    }
    setError(null);
    const intro = fmt(t.contact.formMessagePrefix, { name: name.trim() });
    return [intro, subject.trim() ? `${t.contact.formSubject}: ${subject.trim()}` : "", "", message.trim()]
      .filter((line, i) => line || i === 2)
      .join("\n");
  }

  function sendWhatsapp() {
    const text = compose();
    if (!text) return;
    const number = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  function sendEmail() {
    const text = compose();
    if (!text) return;
    const mailSubject = subject.trim() || t.contact.formTitle;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(text)}`;
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="rounded-3xl bg-white p-6 shadow-card sm:p-8" aria-labelledby="contact-form-title">
      <h2 id="contact-form-title" className="font-display text-2xl font-semibold text-sea-700">
        {t.contact.formTitle}
      </h2>
      <p className="mt-1.5 text-sm text-ink-soft">{t.contact.formIntro}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{t.contact.formName}</span>
          <input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="field" />
        </label>
        <label className="block">
          <span className="field-label">{t.contact.formSubject}</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t.contact.formSubjectPlaceholder}
            className="field"
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="field-label">{t.contact.formMessage}</span>
        <textarea
          required
          rows={5}
          maxLength={1500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="field resize-y"
        />
      </label>

      {error ? (
        <p role="alert" className="mt-3 rounded-xl bg-citrus-50 px-3.5 py-2.5 text-sm font-medium text-citrus-600">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={sendWhatsapp}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-sea-500 px-5 text-sm font-semibold text-white transition hover:bg-sea-700"
        >
          <Icon name="message-circle" size={18} /> {t.contact.formSendWhatsapp}
        </button>
        <button
          type="button"
          onClick={sendEmail}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-sea-500/30 bg-white px-5 text-sm font-semibold text-sea-700 transition hover:border-sea-500 hover:bg-sea-50"
        >
          <Icon name="mail" size={18} /> {t.contact.formSendEmail}
        </button>
      </div>
    </form>
  );
}
