import { PropertyGridSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

/** Başlık bandı iskeleti (İlanlar, İletişim gibi sayfaların üst kısmı) */
function HeaderBandSkeleton() {
  return (
    <section className="border-b border-sand-dark/60 bg-sand/60">
      <div className="container-page py-10 sm:py-14">
        <Skeleton className="mb-3 h-3 w-24" />
        <Skeleton className="h-10 w-full max-w-xl sm:h-12" />
        <Skeleton className="mt-4 h-5 w-full max-w-md" />
      </div>
    </section>
  );
}

export function ListingResultsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[18.5rem_1fr]">
      <Skeleton className="hidden h-[34rem] rounded-3xl lg:block" />
      <div>
        <Skeleton className="mb-5 h-8 w-48" />
        <PropertyGridSkeleton count={6} />
      </div>
    </div>
  );
}

export function ListingPageSkeleton() {
  return (
    <div role="status" aria-label="İlanlar yükleniyor">
      <HeaderBandSkeleton />
      <div className="container-page py-8 sm:py-12">
        <ListingResultsSkeleton />
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="container-page pt-8 pb-14" role="status" aria-label="İlan yükleniyor">
      <Skeleton className="mb-5 h-4 w-60" />
      <Skeleton className="mb-3 h-10 w-full max-w-xl" />
      <Skeleton className="mb-6 h-5 w-72" />
      <Skeleton className="h-[20rem] rounded-3xl sm:h-[32rem]" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-[36rem] rounded-3xl" />
      </div>
    </div>
  );
}

/** Diğer vitrin sayfaları için genel yükleme ekranı */
export function GenericPageLoading() {
  return (
    <div role="status" aria-label="Sayfa yükleniyor">
      <HeaderBandSkeleton />
      <div className="container-page grid place-items-center py-20 text-sea-500">
        <Spinner size={32} />
        <p className="mt-3 text-sm font-medium text-ink-soft">Yükleniyor…</p>
      </div>
    </div>
  );
}
