import type { Metadata } from "next";
import { fontVariables } from "../fonts";
import { siteUrl } from "../site";
import "../globals.css";

/**
 * Yönetim paneli kök düzeni. Vitrin (app/[lang]) ile ayrı kök düzenler kullanılır;
 * panel yalnızca Türkçedir ve arama motorlarına kapalıdır.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Yönetim Paneli | Paradise Emlak", template: "%s | Paradise Yönetim" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${fontVariables} h-full`}>
      <body className="min-h-full bg-shell">{children}</body>
    </html>
  );
}
