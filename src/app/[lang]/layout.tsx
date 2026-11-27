import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/public/Footer";
import { Navbar } from "@/components/public/Navbar";
import { NavigationProgress } from "@/components/public/NavigationProgress";
import { getDictionary, hasLocale, LOCALES } from "@/i18n";
import { I18nProvider } from "@/i18n/client";
import { fontVariables } from "../fonts";
import { siteUrl } from "../site";
import "../globals.css";

/**
 * Vitrin sitesinin kök düzeni. [lang] kök parametresi: "tr" (adres öneksiz) veya "en" (/en/...).
 * cacheComponents açıkken her kök parametre için en az bir değer gerekir.
 */
export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.defaultTitle, template: `%s | ${t.meta.siteName}` },
    description: t.meta.description,
    openGraph: {
      type: "website",
      locale: lang === "tr" ? "tr_TR" : "en_GB",
      siteName: t.meta.siteName,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0077B6",
};

export default async function PublicRootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col">
        <I18nProvider lang={lang}>
          <a
            href="#main"
            className="sr-only z-[60] rounded-full bg-sea-700 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {t.common.skipToContent}
          </a>
          <NavigationProgress />
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
