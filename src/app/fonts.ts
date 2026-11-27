import { Fraunces, Manrope } from "next/font/google";

// Türkçe karakterler (ğ, ş, ı, İ) için latin-ext alt kümesi zorunlu
export const headingFont = Fraunces({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const fontVariables = `${headingFont.variable} ${bodyFont.variable}`;

