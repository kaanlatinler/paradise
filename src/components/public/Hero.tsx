import Image from "next/image";
import { Suspense } from "react";
import { getCms, cmsValue } from "@/app/(public)/_lib/data";
import { Skeleton } from "@/components/ui/Skeleton";
import { canOptimizeImage } from "./format";
import { SearchFilterBar } from "./SearchFilterBar";

async function HeroContent() {
  const cms = await getCms();
  const title = cmsValue(cms, "hero_title");
  const subtitle = cmsValue(cms, "hero_subtitle");
  const banner = cmsValue(cms, "hero_banner_url");

  return (
    <>
      <Image
        src={banner}
        alt=""
        fill
        priority
        unoptimized={!canOptimizeImage(banner)}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-b from-sea-900/55 via-sea-900/25 to-sea-900/70" />
      <div className="relative container-page flex min-h-[inherit] flex-col justify-center pt-16 pb-40 sm:pb-36">
        <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold tracking-[0.2em] text-white uppercase backdrop-blur">
          <span className="size-2 rounded-full bg-citrus-400" /> Akdeniz’de günlük kiralık
        </p>
        <h1 className="max-w-3xl font-display text-4xl leading-[1.05] font-semibold text-balance text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-white/90 sm:text-lg">{subtitle}</p>
      </div>
    </>
  );
}

function HeroFallback() {
  return (
    <div className="relative container-page flex min-h-[inherit] flex-col justify-center pt-16 pb-40">
      <Skeleton className="mb-4 h-7 w-56 opacity-40" />
      <Skeleton className="h-14 w-full max-w-2xl opacity-40" />
      <Skeleton className="mt-3 h-14 w-3/4 max-w-xl opacity-40" />
      <Skeleton className="mt-6 h-6 w-full max-w-md opacity-40" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative">
      <div className="relative min-h-[34rem] overflow-hidden bg-linear-to-br from-sea-700 to-sea-500 sm:min-h-[38rem]">
        <Suspense fallback={<HeroFallback />}>
          <HeroContent />
        </Suspense>
      </div>
      {/* Arama barı statik kabukta: CMS beklenmeden hemen etkileşime açılır */}
      <div className="relative z-10 container-page -mt-28 sm:-mt-24">
        <SearchFilterBar />
      </div>
    </section>
  );
}
