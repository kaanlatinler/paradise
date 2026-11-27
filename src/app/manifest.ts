import type { MetadataRoute } from "next";

/** Web uygulaması bildirimi: telefonda "Ana ekrana ekle" ile marka renkleri ve ikonla açılır. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paradise Emlak — Günlük Kiralık Villa, Ev & Apart",
    short_name: "Paradise",
    description: "Akdeniz kıyısında günlük kiralık villa, müstakil ev ve apartlar.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F6",
    theme_color: "#0077B6",
    lang: "tr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
