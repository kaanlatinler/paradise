"use client";

import { useSyncExternalStore } from "react";
import { todayKey } from "./format";

const subscribe = () => () => {};
const getServerSnapshot = () => undefined;

/**
 * Bugünün tarihini ("YYYY-MM-DD") yalnızca istemcide üretir; sunucuda/prerender'da undefined döner.
 * cacheComponents açıkken render sırasında sunucuda `new Date()` kullanmak prerender hatasına yol açar.
 */
export function useToday(): string | undefined {
  return useSyncExternalStore<string | undefined>(subscribe, todayKey, getServerSnapshot);
}
