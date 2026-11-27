"use client";

import { createContext, useContext, type ReactNode } from "react";
import { makeI18n, type I18n, type Locale } from "./index";

const I18nContext = createContext<I18n>(makeI18n("tr"));

/** [lang] kök düzeninde bir kez sarılır; istemci bileşenleri useI18n() ile dili ve metinleri alır. */
export function I18nProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  return <I18nContext.Provider value={makeI18n(lang)}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
