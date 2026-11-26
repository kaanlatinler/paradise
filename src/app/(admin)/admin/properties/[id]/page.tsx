import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { AdminContainer, AdminPageHeader } from "@/components/admin/ui";
import { LoadingBadge } from "@/components/public/LoadingBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "İlanı Düzenle" };

async function EditPropertyContent({ params }: { params: PageProps<"/admin/properties/[id]">["params"] }) {
  await requireAdminSession();
  const { id } = await params;

  const [property, amenities] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        amenities: { select: { amenityId: true } },
      },
    }),
    prisma.amenity.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <>
      <AdminPageHeader
        title="İlanı Düzenle"
        description={property.title}
        action={
          property.status === "PUBLISHED" ? (
            <Link
              href={`/properties/${property.slug}`}
              target="_blank"
              className="inline-flex h-10 items-center rounded-full border border-sea-500/30 bg-white px-4 text-sm font-semibold text-sea-700 hover:bg-sea-50"
            >
              Sitede gör
            </Link>
          ) : null
        }
      />
      <PropertyForm
        amenities={amenities}
        initialData={{
          id: property.id,
          title: property.title,
          slug: property.slug,
          description: property.description,
          type: property.type,
          status: property.status,
          city: property.city,
          district: property.district,
          address: property.address ?? "",
          pricePerNight: property.pricePerNight.toString(),
          capacity: property.capacity,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          isFeatured: property.isFeatured,
          amenityIds: property.amenities.map((a) => a.amenityId),
          images: property.images.map((img) => ({
            url: img.url,
            altText: img.altText ?? property.title,
            order: img.order,
            isCover: img.isCover,
          })),
        }}
      />
    </>
  );
}

export default function EditPropertyPage({ params }: PageProps<"/admin/properties/[id]">) {
  return (
    <AdminContainer>
      <Link href="/admin/properties" className="mb-3 inline-flex text-sm font-semibold text-sea-700 hover:underline">
        ← İlanlara dön
      </Link>
      <Suspense
        fallback={
          <>
            <LoadingBadge />
            <Skeleton className="h-[40rem] rounded-2xl" />
          </>
        }
      >
        <EditPropertyContent params={params} />
      </Suspense>
    </AdminContainer>
  );
}
