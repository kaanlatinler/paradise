import { lang as rootLang } from "next/root-params";
import { DEFAULT_LOCALE, hasLocale, makeI18n, type I18n, type Locale } from "./index";

/**
 * Sunucu bileşenlerinde aktif dili okur (app/[lang] kök parametresi).
 * Prop aktarmaya gerek kalmadan her sunucu bileşeninden çağrılabilir.
 */
export async function getLocale(): Promise<Locale> {
  const value = await rootLang();
  return hasLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getI18n(): Promise<I18n> {
  return makeI18n(await getLocale());
}
