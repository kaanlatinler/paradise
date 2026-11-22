"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  listingHref,
  SORT_OPTIONS,
  type ListingQuery,
  type SortKey,
} from "@/app/(public)/properties/_lib/search-params";

export function SortSelect({ query }: { query: ListingQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
      <span className="hidden sm:inline">Sırala:</span>
      <select
        value={query.sort}
        disabled={pending}
        onChange={(e) => {
          const sort = e.target.value as SortKey;
          startTransition(() => router.push(listingHref({ ...query, sort, page: 1 }), { scroll: false }));
        }}
        className="rounded-full border border-sand-dark bg-white px-3.5 py-2 text-sm font-semibold text-ink focus:border-sea-500 focus:outline-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
