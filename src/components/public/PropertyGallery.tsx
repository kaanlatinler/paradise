"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { canOptimizeImage } from "./format";

interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
}

export function PropertyGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const count = images.length;

  // Sayfadan ayrılıp geri dönüldüğünde lightbox açık kalmasın (Activity ile korunan durum)
  useLayoutEffect(() => () => setIndex(null), []);

  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + count) % count)), [count]);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % count)), [count]);

  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, prev, next]);

  if (count === 0) {
    return (
      <div className="grid aspect-[16/9] place-items-center rounded-3xl bg-sand text-ink-soft">
        <Icon name="image" size={40} />
      </div>
    );
  }

  const [hero, ...rest] = images;
  const thumbs = rest.slice(0, 4);

  return (
    <>
      {/* Mobil: yatay kaydırmalı şerit */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:hidden">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setIndex(i)}
            className="relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-sand"
            aria-label={`Fotoğraf ${i + 1} / ${count}: büyüt`}
          >
            <Image
              src={img.url}
              alt={img.altText ?? title}
              fill
              priority={i === 0}
              unoptimized={!canOptimizeImage(img.url)}
              sizes="85vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Tablet/masaüstü: mozaik */}
      <div
        className={`hidden gap-3 sm:grid ${
          thumbs.length > 0 ? "sm:h-[26rem] sm:grid-cols-4 sm:grid-rows-2 lg:h-[32rem]" : "sm:h-[28rem]"
        }`}
      >
        <button
          type="button"
          onClick={() => setIndex(0)}
          className={`group relative overflow-hidden rounded-3xl bg-sand ${
            thumbs.length > 0 ? (thumbs.length === 1 ? "col-span-2 row-span-2" : "col-span-2 row-span-2") : "h-full"
          }`}
          aria-label="Kapak fotoğrafını büyüt"
        >
          <Image
            src={hero.url}
            alt={hero.altText ?? title}
            fill
            priority
            unoptimized={!canOptimizeImage(hero.url)}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        </button>
        {thumbs.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setIndex(i + 1)}
            className={`group relative overflow-hidden rounded-3xl bg-sand ${
              thumbs.length === 1 ? "col-span-2 row-span-2" : thumbs.length === 2 ? "col-span-2" : ""
            } ${thumbs.length === 3 && i === 2 ? "col-span-2" : ""}`}
            aria-label={`Fotoğraf ${i + 2} / ${count}: büyüt`}
          >
            <Image
              src={img.url}
              alt={img.altText ?? title}
              fill
              unoptimized={!canOptimizeImage(img.url)}
              sizes="25vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            {i === thumbs.length - 1 && count > 5 ? (
              <span className="absolute inset-0 grid place-items-center bg-ink/50 text-lg font-semibold text-white">
                +{count - 5} fotoğraf
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIndex(0)}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-sand-dark bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-sea-500"
      >
        <Icon name="image" size={16} /> Tüm fotoğraflar ({count})
      </button>

      <Modal open={index !== null} onClose={() => setIndex(null)} label={`${title} fotoğraf galerisi`} tone="dark">
        {index !== null ? (
          <div className="flex h-dvh flex-col">
            <div className="relative flex-1">
              <Image
                key={images[index].id}
                src={images[index].url}
                alt={images[index].altText ?? title}
                fill
                unoptimized={!canOptimizeImage(images[index].url)}
                sizes="100vw"
                className="object-contain p-4 sm:p-12"
              />
              {count > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Önceki fotoğraf"
                    className="absolute top-1/2 left-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                  >
                    <Icon name="chevron-left" size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Sonraki fotoğraf"
                    className="absolute top-1/2 right-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                  >
                    <Icon name="chevron-right" size={24} />
                  </button>
                </>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-4 text-sm text-white/80">
              <p className="truncate">{images[index].altText ?? title}</p>
              <p className="shrink-0 font-semibold">
                {index + 1} / {count}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
