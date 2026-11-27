"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useI18n } from "@/i18n/client";
import { listingHref, SORT_KEYS, type ListingQuery, type SortKey } from "./lib/search-params";
import { startNavigationProgress } from "./NavigationProgress";

/** Sunucu tarafında sıralar (getFilteredProperties → sortBy); tüm sayfalara uygulanır. */
export function SortSelect({ query }: { query: ListingQuery }) {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [pending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
      {pending ? <Spinner size={14} className="text-sea-500" /> : null}
      <span className="hidden sm:inline">{t.sort.label}</span>
      <select
        value={query.sort}
        disabled={pending}
        onChange={(e) => {
          const sort = e.target.value as SortKey;
          startNavigationProgress();
          startTransition(() => router.push(listingHref(lang, { ...query, sort, page: 1 }), { scroll: false }));
        }}
        className="rounded-full border border-sand-dark bg-white px-3.5 py-2 text-sm font-semibold text-ink focus:border-sea-500 focus:outline-none"
      >
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {t.sort[key]}
          </option>
        ))}
      </select>
    </label>
  );
}
