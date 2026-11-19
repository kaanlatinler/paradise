import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/admin/PropertyForm";

export default async function NewPropertyPage() {
  const amenities = await prisma.amenity.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Yeni İlan Ekle</h1>
        <p className="text-sm text-slate-600">
          Villa, müstakil ev veya apart kaydı oluşturup görsellerini ve
          özelliklerini ekle.
        </p>
      </div>
      <PropertyForm amenities={amenities} />
    </div>
  );
}
