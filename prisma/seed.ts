
import "dotenv/config";
import crypto from "crypto";
import { PropertyType, PropertyStatus, Role } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

function createPasswordHash(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

async function main() {
  // Admin şifresi koda gömülmez: SEED_ADMIN_PASSWORD ortam değişkeninden okunur.
  // Mevcut admin kullanıcısının şifresi seed tekrar çalıştırıldığında EZİLMEZ
  // (şifre değiştirmek için: npx tsx scripts/change-admin-password.ts).
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword || seedPassword.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD ortam değişkeni en az 12 karakter olarak tanımlanmalı (.env).");
  }
  const adminPasswordHash = createPasswordHash(seedPassword);

  await prisma.user.upsert({
    where: { email: "admin@akdenizstay.com" },
    update: { role: Role.ADMIN },
    create: {
      email: "admin@akdenizstay.com",
      name: "Sistem Yöneticisi",
      phone: "+90 500 000 00 00",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  // 2. Ortak Özellikler (Amenities)
  const amenityData = [
    { name: "Özel Havuz", slug: "ozel-havuz", icon: "waves" },
    { name: "Denize Sıfır", slug: "denize-sifir", icon: "anchor" },
    { name: "Turunçgil Bahçesi", slug: "turuncgil-bahcesi", icon: "sun" },
    { name: "Wi-Fi", slug: "wi-fi", icon: "wifi" },
    { name: "Klima", slug: "klima", icon: "wind" },
    { name: "Barbekü & Mangal", slug: "barbeku-mangal", icon: "flame" },
    { name: "Ücretsiz Otopark", slug: "ucretsiz-otopark", icon: "car" },
  ];

  const amenitiesMap = new Map<string, string>();
  for (const item of amenityData) {
    const created = await prisma.amenity.upsert({
      where: { slug: item.slug },
      update: { name: item.name, icon: item.icon },
      create: item,
    });
    amenitiesMap.set(item.slug, created.id);
  }

  // 3. Örnek İlanlar (Villa, Apart, Ev)
  const properties = [
    {
      title: "Turunç Bahçeli Sonsuzluk Havuzlu Villa",
      slug: "turunc-bahceli-sonsuzluk-havuzlu-villa",
      description:
        "Portakal ve limon ağaçları arasında, Akdeniz manzaralı sonsuzluk havuzuna sahip geniş aile villası. Gün batımında terasta keyifli akşamlar için ideal.",
      type: PropertyType.VILLA,
      status: PropertyStatus.PUBLISHED,
      city: "Antalya",
      district: "Kaş",
      address: "Çukurbağ Yarımadası Mevkii",
      pricePerNight: "14500.00",
      capacity: 8,
      bedrooms: 4,
      bathrooms: 4,
      isFeatured: true,
      amenitySlugs: ["ozel-havuz", "turuncgil-bahcesi", "wi-fi", "klima", "barbeku-mangal", "ucretsiz-otopark"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
          altText: "Sonsuzluk havuzlu Akdeniz villası dış görünüm",
          order: 0,
          isCover: true,
        },
        {
          url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
          altText: "Güneşlenen teras ve oturma alanı",
          order: 1,
          isCover: false,
        },
      ],
    },
    {
      title: "Koy Manzaralı Modern Sahil Apartı",
      slug: "koy-manzarali-modern-sahil-aparti",
      description:
        "Berrak koya yürüme mesafesinde, ferah beyaz ve mavi tonlarında dekore edilmiş modern apart daire. Çiftler ve küçük aileler için uygundur.",
      type: PropertyType.APART,
      status: PropertyStatus.PUBLISHED,
      city: "Antalya",
      district: "Finike",
      address: "Sahil Caddesi No: 24",
      pricePerNight: "4800.00",
      capacity: 4,
      bedrooms: 1,
      bathrooms: 1,
      isFeatured: true,
      amenitySlugs: ["denize-sifir", "wi-fi", "klima", "ucretsiz-otopark"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
          altText: "Ferah sahil apartı salon ve balkon",
          order: 0,
          isCover: true,
        },
      ],
    },
    {
      title: "Kum & Güneş Avlulu Müstakil Taş Ev",
      slug: "kum-gunes-avlulu-mustakil-tas-ev",
      description:
        "Sakin bir sokakta yer alan, gölgeli avlusu ve doğal taş dokusuyla öne çıkan müstakil ev. Uzun süreli konaklamalar için konforlu yaşam alanı sunar.",
      type: PropertyType.HOUSE,
      status: PropertyStatus.PUBLISHED,
      city: "Muğla",
      district: "Fethiye",
      address: "Kayaköy Yolu Üzeri",
      pricePerNight: "7200.00",
      capacity: 6,
      bedrooms: 3,
      bathrooms: 2,
      isFeatured: false,
      amenitySlugs: ["turuncgil-bahcesi", "wi-fi", "klima", "barbeku-mangal"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
          altText: "Avlulu müstakil ev cephesi",
          order: 0,
          isCover: true,
        },
      ],
    },
  ];

  for (const prop of properties) {
    const existing = await prisma.property.findUnique({ where: { slug: prop.slug } });
    if (!existing) {
      await prisma.property.create({
        data: {
          title: prop.title,
          slug: prop.slug,
          description: prop.description,
          type: prop.type,
          status: prop.status,
          city: prop.city,
          district: prop.district,
          address: prop.address,
          pricePerNight: prop.pricePerNight,
          capacity: prop.capacity,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          isFeatured: prop.isFeatured,
          images: {
            create: prop.images,
          },
          amenities: {
            create: prop.amenitySlugs
              .map((slug) => amenitiesMap.get(slug))
              .filter((id): id is string => Boolean(id))
              .map((amenityId) => ({ amenityId })),
          },
        },
      });
    }
  }

  // 4. Dinamik Site İçerikleri (CMS)
  const siteContents = [
    { key: "hero_title", value: "Deniz, Güneş ve Turunç Kokusu Arasında Tatil", group: "hero" },
    {
      key: "hero_subtitle",
      value: "Özenle seçilmiş villalar, sahil apartları ve müstakil evlerle Akdeniz'i keşfet.",
      group: "hero",
    },
    {
      key: "hero_banner_url",
      value: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      group: "hero",
    },
    { key: "contact_phone", value: "+90 242 000 00 00", group: "contact" },
    { key: "contact_email", value: "rezervasyon@akdenizstay.com", group: "contact" },
    {
      key: "about_text",
      value:
        "Akdeniz'in kıyı şeridinde güvenilir, şeffaf ve özenli kiralama deneyimi sunuyoruz.",
      group: "about",
    },
  ];

  for (const item of siteContents) {
    await prisma.siteContent.upsert({
      where: { key: item.key },
      update: { value: item.value, group: item.group },
      create: item,
    });
  }

  console.log("Seed işlemi başarıyla tamamlandı.");
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });