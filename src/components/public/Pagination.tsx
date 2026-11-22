import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({
  currentPage,
  totalPages,
  hrefFor,
}: {
  currentPage: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const linkBase = "grid size-10 place-items-center rounded-full text-sm font-semibold transition";

  return (
    <nav aria-label="Sayfalama" className="mt-12 flex items-center justify-center gap-1.5">
      {currentPage > 1 ? (
        <Link href={hrefFor(currentPage - 1)} aria-label="Önceki sayfa" className={`${linkBase} text-ink hover:bg-sand`}>
          <Icon name="chevron-left" size={18} />
        </Link>
      ) : null}
      {pageWindow(currentPage, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-ink-soft">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`${linkBase} ${p === currentPage ? "bg-sea-500 text-white" : "text-ink hover:bg-sand"}`}
          >
            {p}
          </Link>
        ),
      )}
      {currentPage < totalPages ? (
        <Link href={hrefFor(currentPage + 1)} aria-label="Sonraki sayfa" className={`${linkBase} text-ink hover:bg-sand`}>
          <Icon name="chevron-right" size={18} />
        </Link>
      ) : null}
    </nav>
  );
}
