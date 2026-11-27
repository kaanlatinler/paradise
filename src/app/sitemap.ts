import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getFilteredProperties } from "@/actions/properties";
import { siteUrl } from "./site";

/** Her sayfanın Türkçe (öneksiz) ve İngilizce (/en) adresleri birbirine hreflang ile bağlanır. */
function entry(path: string, extra: Partial<MetadataRoute.Sitemap[number]> = {}): MetadataRoute.Sitemap {
  const tr = `${siteUrl}${path === "/" ? "" : path}`;
  const en = `${siteUrl}/en${path === "/" ? "" : path}`;
  const alternates = { languages: { tr, en } };
  return [
    { url: tr, alternates, ...extra },
    { url: en, alternates, ...extra },
  ];
}

/** [Geliştirici B] Dinamik site haritası: statik vitrin sayfaları + yayındaki tüm ilanlar, iki dilde */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // İstek anında üret (build sırasında veritabanına bağlanmaya çalışmasın)
  await connection();

  const staticPages: MetadataRoute.Sitemap = ["/", "/properties", "/about", "/contact"].flatMap((path) =>
    entry(path, {
      changeFrequency: path === "/properties" ? "daily" : "monthly",
      priority: path === "/" ? 1 : 0.7,
    }),
  );

  const propertyPages: MetadataRoute.Sitemap = [];
  try {
    let page = 1;
    let totalPages = 1;
    do {
      const res = await getFilteredProperties({ page, pageSize: 50 });
      totalPages = res.totalPages;
      for (const p of res.items) {
        propertyPages.push(
          ...entry(`/properties/${p.slug}`, {
            lastModified: p.updatedAt,
            changeFrequency: "weekly",
            priority: p.isFeatured ? 0.9 : 0.8,
          }),
        );
      }
      page++;
    } while (page <= totalPages && page <= 20);
  } catch (err) {
    console.error("Sitemap ilanları alınamadı:", err);
  }

  return [...staticPages, ...propertyPages];
}
