import { ImageResponse } from "next/og";
import { getDictionary, hasLocale } from "@/i18n";

/** Sosyal medya paylaşım görseli (1200×630): marka renkleri + dile göre başlık */
export const alt = "Paradise Emlak";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = getDictionary(hasLocale(lang) ? lang : "tr");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #023E8A 0%, #0077B6 100%)",
          color: "white",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "#FF9F1C",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 9999, background: "#FF9F1C", display: "flex" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 44, fontWeight: 700 }}>Paradise</span>
            <span style={{ fontSize: 18, letterSpacing: 8, color: "#FFE6C2" }}>EMLAK</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <span style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 700 }}>{t.meta.defaultTitle.split("—")[1]?.trim() ?? t.meta.siteName}</span>
          <span style={{ marginTop: 20, fontSize: 28, color: "rgba(255,255,255,0.85)", fontFamily: "sans-serif" }}>
            {t.hero.eyebrow}
          </span>
        </div>
        <div style={{ display: "flex", height: 12, borderRadius: 9999, background: "#F4F1DE", width: 260 }} />
      </div>
    ),
    size,
  );
}
