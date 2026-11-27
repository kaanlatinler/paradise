import { NextRequest, NextResponse } from "next/server";

/**
 * Next 16 Proxy (eski adıyla middleware). İki görevi var:
 *
 * 1) Admin koruması — /admin/** ve /api/upload/** için imzalı oturum çerezi doğrulanır
 *    (Geliştirici A'nın middleware.ts mantığı birebir korunmuştur).
 *
 * 2) Dil yönlendirmesi — vitrin sayfaları app/[lang] altında:
 *    - Türkçe (varsayılan) adresler öneksizdir: /properties  → içeride /tr/properties'e yeniden yazılır
 *    - İngilizce adresler /en önekiyle çalışır:  /en/properties
 *    - /tr/... ile gelen istekler kalıcı olarak öneksiz adrese yönlendirilir (tek kanonik adres)
 */

const SESSION_COOKIE_NAME = "paradise_admin_session";
const DEFAULT_LOCALE = "tr";
const PREFIXED_LOCALES = ["en"];

function base64UrlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function isValidAdminToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encoded, signature] = parts;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const verified = await crypto.subtle.verify("HMAC", key, base64UrlToBytes(signature), new TextEncoder().encode(encoded));

  if (!verified) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encoded))) as {
      role?: string;
      exp?: number;
    };
    const now = Math.floor(Date.now() / 1000);
    const hasRole = payload.role === "ADMIN" || payload.role === "STAFF";
    return Boolean(hasRole && payload.exp && payload.exp > now);
  } catch {
    return false;
  }
}

async function protectAdmin(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = secret ? await isValidAdminToken(token, secret) : false;

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function routeLocale(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";

  // İngilizce (önekli) adresler doğrudan [lang] rotasına gider
  if (PREFIXED_LOCALES.includes(firstSegment)) {
    return NextResponse.next();
  }

  // /tr/... → öneksiz kanonik adrese kalıcı yönlendirme
  // (opengraph-image gibi Next'in ürettiği meta veri adresleri hariç)
  if (firstSegment === DEFAULT_LOCALE) {
    if (pathname.includes("/opengraph-image")) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  // Öneksiz (Türkçe) adres → içeride /tr/... rotasına yeniden yaz (tarayıcı adresi değişmez)
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/upload")) {
    return protectAdmin(req);
  }

  return routeLocale(req);
}

export const config = {
  matcher: [
    /*
     * Şunlar hariç tüm istekler:
     * - _next (derleme dosyaları, görsel optimizasyonu)
     * - /api/* (yalnızca /api/upload korunur, aşağıda ayrıca eklendi)
     * - uzantılı dosyalar (favicon, icon.svg, sitemap.xml, robots.txt, manifest, /uploads/*.jpg ...)
     * - uzantısız kök meta veri adresi /apple-icon
     */
    "/((?!_next/|api/|apple-icon|.*\\..*).*)",
    "/api/upload/:path*",
  ],
};
