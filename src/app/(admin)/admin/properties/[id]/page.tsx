import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/admin/PropertyForm";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
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
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">İlanı Düzenle</h1>
        <p className="text-sm text-slate-600">{property.title}</p>
      </div>
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
    </div>
  );
}
