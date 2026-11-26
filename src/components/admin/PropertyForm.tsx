"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PropertyStatus, PropertyType } from "@prisma/client";
import {
  upsertPropertyAction,
  UpsertPropertyInput,
} from "@/actions/admin-properties";
import { Spinner } from "@/components/ui/Spinner";

export interface AmenityOption {
  id: string;
  name: string;
  slug: string;
}

export interface PropertyImageItem {
  url: string;
  altText?: string;
  order: number;
  isCover: boolean;
}

export interface InitialPropertyData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  city: string;
  district: string;
  address?: string;
  pricePerNight: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  isFeatured: boolean;
  amenityIds: string[];
  images: PropertyImageItem[];
}

interface PropertyFormProps {
  amenities: AmenityOption[];
  initialData?: InitialPropertyData;
}

function slugifyTurkish(text: string): string {
  const map: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    ş: "s",
    ü: "u",
  };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PropertyForm({ amenities, initialData }: PropertyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(initialData?.slug),
  );

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [type, setType] = useState<PropertyType>(
    initialData?.type ?? PropertyType.VILLA,
  );
  const [status, setStatus] = useState<PropertyStatus>(
    initialData?.status ?? PropertyStatus.DRAFT,
  );
  const [city, setCity] = useState(initialData?.city ?? "Antalya");
  const [district, setDistrict] = useState(initialData?.district ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [pricePerNight, setPricePerNight] = useState(
    initialData?.pricePerNight ?? "",
  );
  const [capacity, setCapacity] = useState(initialData?.capacity ?? 4);
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms ?? 2);
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms ?? 2);
  const [isFeatured, setIsFeatured] = useState(
    initialData?.isFeatured ?? false,
  );
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>(
    initialData?.amenityIds ?? [],
  );
  const [images, setImages] = useState<PropertyImageItem[]>(
    initialData?.images ?? [],
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugifyTurkish(val));
    }
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      Array.from(fileList).forEach((file) => formData.append("files", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Görseller yüklenemedi.");
        return;
      }

      setImages((prev) => {
        const startOrder = prev.length;
        const added: PropertyImageItem[] = (
          data.files as { url: string }[]
        ).map((f, idx) => ({
          url: f.url,
          altText: title || "İlan görseli",
          order: startOrder + idx,
          isCover: prev.length === 0 && idx === 0,
        }));
        return [...prev, ...added];
      });
    } catch {
      setErrorMsg("Görsel yükleme sırasında ağ hatası oluştu.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const setCoverImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isCover: idx === index,
      })),
    );
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((img, idx) => ({ ...img, order: idx }));
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      const hasCover = filtered.some((img) => img.isCover);
      return filtered.map((img, idx) => ({
        ...img,
        order: idx,
        isCover: hasCover ? img.isCover : idx === 0,
      }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload: UpsertPropertyInput = {
      id: initialData?.id,
      title,
      slug,
      description,
      type,
      status,
      city,
      district,
      address,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      isFeatured,
      amenityIds: selectedAmenityIds,
      images: images.map((img, idx) => ({ ...img, order: idx })),
    };

    startTransition(async () => {
      const result = await upsertPropertyAction(payload);
      if (!result.success) {
        setErrorMsg(result.error ?? "Kayıt başarısız.");
        return;
      }

      setSuccessMsg(
        initialData?.id ? "İlan güncellendi." : "Yeni ilan oluşturuldu.",
      );
      router.push("/admin/properties");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-sand-dark/70 bg-white p-5 shadow-card sm:p-7"
    >
      {errorMsg && (
        <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="field-label">İlan Başlığı</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Örn: Turunç Bahçeli Havuzlu Villa"
            className="field"
          />
        </div>

        <div>
          <label className="field-label">URL Slug</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlugManuallyEdited(true);
              setSlug(e.target.value);
            }}
            placeholder="turunc-bahceli-havuzlu-villa"
            className="field"
          />
          <p className="mt-1 truncate text-xs text-ink-soft">Adres: /properties/{slug || "…"}</p>
        </div>

        <div>
          <label className="field-label">Kategori</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PropertyType)}
            className="field"
          >
            <option value={PropertyType.VILLA}>Villa</option>
            <option value={PropertyType.HOUSE}>Müstakil Ev</option>
            <option value={PropertyType.APART}>Apart</option>
          </select>
        </div>

        <div>
          <label className="field-label">Yayın Durumu</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PropertyStatus)}
            className="field"
          >
            <option value={PropertyStatus.DRAFT}>Taslak</option>
            <option value={PropertyStatus.PUBLISHED}>Yayında</option>
            <option value={PropertyStatus.ARCHIVED}>Arşivlendi</option>
          </select>
        </div>

        <div>
          <label className="field-label">Şehir</label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="field-label">İlçe / Bölge</label>
          <input
            type="text"
            required
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Örn: Kaş, Finike, Kalkan"
            className="field"
          />
        </div>

        <div>
          <label className="field-label">
            Gecelik Fiyat (₺)
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            className="field"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="field-label">Misafir</label>
            <input
              type="number"
              min="1"
              required
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="field"
            />
          </div>
          <div>
            <label className="field-label">Oda</label>
            <input
              type="number"
              min="0"
              required
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="field"
            />
          </div>
          <div>
            <label className="field-label">Banyo</label>
            <input
              type="number"
              min="1"
              required
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
              className="field"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="field-label">
          Açık Adres / Mevki
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="field"
        />
      </div>

      <div>
        <label className="field-label">
          İlan Açıklaması
        </label>
        <textarea
          rows={4}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="field"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isFeatured"
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="size-4 accent-citrus-500"
        />
        <label htmlFor="isFeatured" className="text-sm font-medium text-ink">
          Anasayfada Öne Çıkan İlan Olarak Göster
        </label>
      </div>

      <div>
        <p className="field-label">Özellikler</p>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity) => {
            const active = selectedAmenityIds.includes(amenity.id);
            return (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-sea-500 bg-sea-500 text-white"
                    : "border-sand-dark bg-white text-ink-soft hover:border-sea-500/50"
                }`}
              >
                {amenity.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="field-label mb-0">İlan Görselleri</span>
          <label
            className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-sea-500/30 bg-white px-4 text-sm font-semibold text-sea-700 transition hover:border-sea-500 hover:bg-sea-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sea-500 ${
              isUploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {isUploading ? <Spinner size={16} /> : null}
            {isUploading ? "Yükleniyor…" : "Görsel ekle"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={isUploading}
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
        </div>

        <p className="text-xs text-ink-soft">
          JPEG, PNG, WebP veya AVIF · dosya başına en fazla 8 MB. İlk görsel kapak olur; sıralamayı oklarla değiştirebilirsiniz.
        </p>

        {images.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <div key={`${img.url}-${idx}`} className="rounded-xl border border-sand-dark/70 p-2">
                <img
                  src={img.url}
                  alt={img.altText || title}
                  className="h-36 w-full rounded-lg object-cover"
                />
                <div className="mt-2 flex items-center justify-between gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setCoverImage(idx)}
                    className={`rounded-full px-2.5 py-1 font-semibold ${
                      img.isCover
                        ? "bg-citrus-500 text-white"
                        : "bg-sand text-ink-soft hover:bg-sand-dark"
                    }`}
                  >
                    {img.isCover ? "Kapak" : "Kapak Yap"}
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Görseli öne al"
                      className="rounded-full border border-sand-dark px-2 py-0.5 disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(idx, 1)}
                      disabled={idx === images.length - 1}
                      aria-label="Görseli geri al"
                      className="rounded-full border border-sand-dark px-2 py-0.5 disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="rounded-full bg-rose-50 px-2.5 py-0.5 font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-sand-dark/60 pt-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-11 rounded-full px-5 text-sm font-semibold text-ink-soft hover:bg-sand"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-citrus-500 px-6 text-sm font-semibold text-white hover:bg-citrus-600 disabled:opacity-60"
        >
          {isPending ? <Spinner size={16} /> : null}
          {isPending
            ? "Kaydediliyor…"
            : initialData?.id
              ? "Değişiklikleri Kaydet"
              : "İlanı Oluştur"}
        </button>
      </div>
    </form>
  );
}
