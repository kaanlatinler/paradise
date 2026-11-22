import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div
      className={`mb-8 flex flex-col gap-4 sm:mb-10 ${
        centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-citrus-500 uppercase">{eyebrow}</p>
        ) : null}
        <h2 className="font-display text-3xl leading-tight font-semibold text-balance text-sea-700 sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-base leading-relaxed text-ink-soft">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
