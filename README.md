# Paradise Emlak — Günlük Kiralık Villa, Ev & Apart Platformu

Deniz, kum, güneş ve turunçgil esintilerinden ilham alan **turuncu, mavi ve beyaz** temalı; dinamik içerik (CMS), gelişmiş arama/filtreleme, müsaitlik kontrollü rezervasyon talepleri ve yönetim paneline sahip günlük kiralık villa ve tatil konutu web uygulaması.

---

## Tech Stack & Mimari

- **Framework:** Next.js (App Router) & TypeScript
- **Veritabanı & ORM:** PostgreSQL (Supabase) + Prisma ORM (`@prisma/adapter-pg`)
- **Doğrulama & Güvenlik:** Zod, `scrypt` parola hashleme, HMAC-SHA256 imzalı `HttpOnly` oturum çerezi, bellek içi Rate Limiting
- **UI & Stil:** Tailwind CSS (Akdeniz Mavisi, Turunçgil Turuncusu, Kum & Beyaz paleti)

---

## İki Kişilik Ekip İş Bölümü & Klasör Sınırları

Git çakışmalarını en aza indirmek için sorumluluklar iki kola ayrılmıştır:

- **Geliştirici A (Backend, Veritabanı & Admin Paneli):**
  - `prisma/` (`schema.prisma`, `seed.ts`) ve `prisma7.config.ts`
  - `src/lib/` (`prisma.ts`, `auth.ts`, `rate-limit.ts`)
  - `src/actions/` (`properties.ts`, `reservations.ts`, `queries.ts`, `admin-*.ts`)
  - `src/app/(admin)/` ve `src/components/admin/`
  - `src/app/api/upload/`
- **Geliştirici B (Frontend, UI/UX & Müşteri Vitrin Akışı):**
  - `src/app/(public)/` ve `src/components/public/`
  - Anasayfa, ilan listeleme/filtreleme, ilan detay galerisi, rezervasyon talep formu ve kurumsal sayfalar

---

## Ortam Değişkenleri (`.env`)

Proje kök dizininde `.env` dosyasını oluşturup aşağıdaki değişkenleri tanımla:

```env
DATABASE_URL="postgresql://postgres.<ref>:<password>@<pooler-host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<ref>:<password>@<pooler-host>:5432/postgres"
AUTH_SECRET="en-az-32-karakterlik-guclu-rastgele-bir-anahtar"
```
# 1. Bağımlılıkları kur
npm install

# 2. Prisma client üret ve migration uygula
npx prisma generate
npx prisma migrate dev --name init

# 3. Örnek ilanlar, özellikler, CMS içerikleri ve admin kullanıcısı için seed çalıştır
npx prisma db seed

# 4. Geliştirme sunucusunu başlat
npm run dev
---

## Güncel Yapı (Kasım 2026 güncellemesi)

### İki dil desteği (TR / EN)
- Vitrin sayfaları `src/app/[lang]/` altındadır ve bu klasör sitenin **kök düzenidir** (`html lang` dile göre ayarlanır).
- **Türkçe** adresler öneksizdir (`/`, `/properties`, `/properties/[slug]`); `src/proxy.ts` bunları içeride `/tr/...` rotasına yeniden yazar.
- **İngilizce** adresler `/en` önekiyle çalışır (`/en/properties`). `/tr/...` ile gelen istekler kalıcı olarak öneksiz adrese yönlendirilir.
- Arayüz metinleri: `src/i18n/dictionaries/tr.ts` ve `en.ts` (TypeScript iki sözlüğün aynı yapıda olmasını zorunlu kılar).
  - Sunucu bileşenleri: `const { t, lang, href } = await getI18n()` (`src/i18n/server.ts`, `next/root-params` ile).
  - İstemci bileşenleri: `const { t, lang, href } = useI18n()` (`src/i18n/client.tsx`).
  - Bağlantılar için her zaman `href("/yol")` kullanın; dil önekini otomatik ekler.
- İlan başlık/açıklamaları veritabanında tek dildedir (Türkçe). CMS'teki `hero_title`, `hero_subtitle`, `about_text` için İngilizce karşılıklar `<anahtar>_en` olarak admin › Site İçerikleri sayfasından girilir.

### Yönetim paneli (`/admin`)
- `src/app/(admin)/` ayrı bir kök düzendir (yalnızca Türkçe, arama motorlarına kapalı). Erişim `src/proxy.ts` içinde imzalı oturum çereziyle korunur.
- Sayfalar: **Genel Bakış** (doluluk, gelir, bekleyen talepler), **Rezervasyonlar** (onay/ret/iptal, takvimde tarih kapatma), **İlanlar** (liste, ekle, düzenle, sil), **Site İçerikleri** (CMS, TR + EN).

### Diğer
- `src/middleware.ts` → `src/proxy.ts` (Next 16 adlandırması; admin koruması birebir taşındı).
- `getFilteredProperties` artık `sortBy` alır (`recommended | price_asc | price_desc | capacity_desc | newest`); `getPropertyLocations()` filtrelerdeki şehir/ilçe listesini verir.
- Seed, admin şifresini **`SEED_ADMIN_PASSWORD`** ortam değişkeninden okur ve mevcut admin şifresini ezmez.
- Admin şifresini değiştirmek için: `npx tsx scripts/change-admin-password.ts`
- Eşleşmeyen adresler için `src/app/global-not-found.tsx` (`experimental.globalNotFound`).
