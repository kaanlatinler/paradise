import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

// Türkçe karakterler (ğ, ş, ı, İ) için latin-ext alt kümesi zorunlu
const heading = Fraunces({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Paradise Emlak — Günlük Kiralık Villa, Ev & Apart",
    template: "%s | Paradise Emlak",
  },
  description:
    "Akdeniz kıyısında özenle seçilmiş günlük kiralık villalar, müstakil evler ve sahil apartları. Müsaitliği gör, rezervasyon talebini dakikalar içinde gönder.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Paradise Emlak",
  },
};

export const viewport: Viewport = {
  themeColor: "#0077B6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" data-scroll-behavior="smooth" className={`${heading.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
