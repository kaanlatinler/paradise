import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAllAmenities } from "@/actions/queries";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { AdminContainer, AdminPageHeader } from "@/components/admin/ui";
import { LoadingBadge } from "@/components/public/LoadingBadge";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "Yeni İlan" };

async function NewPropertyForm() {
  const amenities = await getAllAmenities();
  return <PropertyForm amenities={amenities} />;
}

export default function NewPropertyPage() {
  return (
    <AdminContainer>
      <Link href="/admin/properties" className="mb-3 inline-flex text-sm font-semibold text-sea-700 hover:underline">
        ← İlanlara dön
      </Link>
      <AdminPageHeader
        title="Yeni İlan Ekle"
        description="Villa, müstakil ev veya apart kaydı oluşturup görsellerini ve özelliklerini ekleyin."
      />
      <Suspense
        fallback={
          <>
            <LoadingBadge />
            <Skeleton className="h-[40rem] rounded-2xl" />
          </>
        }
      >
        <NewPropertyForm />
      </Suspense>
    </AdminContainer>
  );
}
