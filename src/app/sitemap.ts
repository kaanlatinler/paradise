import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getFilteredProperties } from "@/actions/properties";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** [Geliştirici B] Dinamik site haritası: statik vitrin sayfaları + yayındaki tüm ilanlar */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // İstek anında üret (build sırasında veritabanına bağlanmaya çalışmasın)
  await connection();

  const staticPages: MetadataRoute.Sitemap = ["", "/properties", "/about", "/contact"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "/properties" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const propertyPages: MetadataRoute.Sitemap = [];
  try {
    let page = 1;
    let totalPages = 1;
    do {
      const res = await getFilteredProperties({ page, pageSize: 50 });
      totalPages = res.totalPages;
      for (const p of res.items) {
        propertyPages.push({
          url: `${siteUrl}/properties/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "weekly",
          priority: p.isFeatured ? 0.9 : 0.8,
        });
      }
      page++;
    } while (page <= totalPages && page <= 20);
  } catch (err) {
    console.error("Sitemap ilanları alınamadı:", err);
  }

  return [...staticPages, ...propertyPages];
}
