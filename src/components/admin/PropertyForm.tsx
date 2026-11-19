"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PropertyStatus, PropertyType } from "@prisma/client";
import {
  upsertPropertyAction,
  UpsertPropertyInput,
} from "@/actions/admin-properties";

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
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">İlan Başlığı</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Örn: Turunç Bahçeli Havuzlu Villa"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">URL Slug</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlugManuallyEdited(true);
              setSlug(e.target.value);
            }}
            placeholder="turunc-bahceli-havuzlu-villa"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Kategori</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PropertyType)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value={PropertyType.VILLA}>Villa</option>
            <option value={PropertyType.HOUSE}>Müstakil Ev</option>
            <option value={PropertyType.APART}>Apart</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Yayın Durumu</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PropertyStatus)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value={PropertyStatus.DRAFT}>Taslak</option>
            <option value={PropertyStatus.PUBLISHED}>Yayında</option>
            <option value={PropertyStatus.ARCHIVED}>Arşivlendi</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Şehir</label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">İlçe / Bölge</label>
          <input
            type="text"
            required
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Örn: Kaş, Finike, Kalkan"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Gecelik Fiyat (₺)
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Misafir</label>
            <input
              type="number"
              min="1"
              required
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Oda</label>
            <input
              type="number"
              min="0"
              required
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Banyo</label>
            <input
              type="number"
              min="1"
              required
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Açık Adres / Mevki
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          İlan Açıklaması
        </label>
        <textarea
          rows={4}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isFeatured"
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="isFeatured" className="text-sm font-medium">
          Anasayfada Öne Çıkan İlan Olarak Göster
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Özellikler</p>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity) => {
            const active = selectedAmenityIds.includes(amenity.id);
            return (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "border-sky-700 bg-sky-700 text-white"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
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
          <label className="text-sm font-medium">İlan Görselleri</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={isUploading}
            onChange={handleFileUpload}
            className="text-sm"
          />
        </div>

        {isUploading && (
          <p className="text-xs text-amber-700">Görseller yükleniyor...</p>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <div key={`${img.url}-${idx}`} className="rounded-lg border p-2">
                <img
                  src={img.url}
                  alt={img.altText || title}
                  className="h-36 w-full rounded object-cover"
                />
                <div className="mt-2 flex items-center justify-between gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setCoverImage(idx)}
                    className={`rounded px-2 py-1 ${
                      img.isCover
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {img.isCover ? "Kapak" : "Kapak Yap"}
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(idx, -1)}
                      disabled={idx === 0}
                      className="rounded border px-1.5 py-0.5 disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(idx, 1)}
                      disabled={idx === images.length - 1}
                      className="rounded border px-1.5 py-0.5 disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="rounded bg-red-50 px-2 py-0.5 text-red-600"
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

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="rounded-lg bg-sky-800 px-5 py-2 text-sm font-medium text-white hover:bg-sky-900 disabled:opacity-50"
        >
          {isPending
            ? "Kaydediliyor..."
            : initialData?.id
              ? "Değişiklikleri Kaydet"
              : "İlanı Oluştur"}
        </button>
      </div>
    </form>
  );
}
