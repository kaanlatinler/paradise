import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import type { I18n } from "@/i18n";

/** 404 içeriği: hem [lang]/not-found (menülü) hem global-not-found (tam sayfa) kullanır. */
export function NotFoundContent({ i18n }: { i18n: I18n }) {
  const { t, href } = i18n;
  return (
    <div className="relative grid place-items-center overflow-hidden px-4 py-20 text-center">
      <div aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-citrus-400/25" />
      <div aria-hidden className="absolute -bottom-32 -left-20 size-96 rounded-full bg-sea-500/10" />
      <div className="relative max-w-md">
        <p className="font-display text-7xl font-semibold text-citrus-500">404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-sea-700">{t.notFound.title}</h1>
        <p className="mt-3 text-ink-soft">{t.notFound.text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={href("/")}>{t.notFound.home}</ButtonLink>
          <ButtonLink href={href("/properties")} variant="outline">
            {t.notFound.listings}
          </ButtonLink>
        </div>
        <p className="mt-8 text-sm text-ink-soft">
          {t.notFound.help}{" "}
          <Link href={href("/contact")} className="font-semibold text-sea-700 hover:underline">
            {t.notFound.contact}
          </Link>
        </p>
      </div>
    </div>
  );
}
