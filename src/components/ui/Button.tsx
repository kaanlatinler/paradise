import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  // Turunçgil: rezervasyon / birincil dönüşüm aksiyonları
  primary:
    "bg-citrus-500 text-white shadow-[0_8px_20px_-8px_rgb(251_133_0/0.7)] hover:bg-citrus-600 focus-visible:outline-citrus-500",
  // Akdeniz mavisi: navigasyon, arama, ikincil birincil aksiyonlar
  secondary: "bg-sea-500 text-white hover:bg-sea-700 focus-visible:outline-sea-500",
  outline:
    "border border-sea-500/30 bg-white text-sea-700 hover:border-sea-500 hover:bg-sea-50 focus-visible:outline-sea-500",
  ghost: "text-sea-700 hover:bg-sea-50 focus-visible:outline-sea-500",
  light: "bg-white/95 text-sea-700 backdrop-blur hover:bg-white focus-visible:outline-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className = "", type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...rest} />;
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({ variant = "primary", size = "md", className = "", ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...rest} />;
}
