import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // [Geliştirici B] Birden fazla kök düzen (vitrin [lang] + admin) olduğu için eşleşmeyen adreslere genel 404 sayfası
  experimental: {
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // [Geliştirici B] next/image ile seed/CMS'teki Unsplash görsellerinin optimize edilebilmesi için.
  // Admin yüklemeleri (/uploads/...) yerel olduğundan ayrıca izin gerektirmez.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
