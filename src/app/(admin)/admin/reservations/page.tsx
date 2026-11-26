import type { Metadata } from "next";
import { Suspense } from "react";
import { getAdminProperties, getAdminReservations } from "@/actions/queries";
import { BlockDatesForm } from "@/components/admin/BlockDatesForm";
import { ReservationsBoard } from "@/components/admin/ReservationsBoard";
import { AdminContainer, AdminPageHeader } from "@/components/admin/ui";
import { LoadingBadge } from "@/components/public/LoadingBadge";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "Rezervasyonlar" };

async function ReservationsContent({ searchParams }: { searchParams: PageProps<"/admin/reservations">["searchParams"] }) {
  const [rows, properties, sp] = await Promise.all([getAdminReservations(), getAdminProperties(), searchParams]);
  const status = typeof sp.status === "string" ? sp.status : undefined;

  return (
    <>
      <AdminPageHeader
        title="Rezervasyonlar"
        description="Talepleri onaylayın, reddedin veya iptal edin; gerekirse tarihleri takvimde kapatın."
      />
      <div className="mb-4 flex justify-end">
        <BlockDatesForm properties={properties.map((p) => ({ id: p.id, title: p.title }))} />
      </div>
      <ReservationsBoard rows={rows} initialStatus={status} />
    </>
  );
}

export default function AdminReservationsPage(props: PageProps<"/admin/reservations">) {
  return (
    <AdminContainer>
      <Suspense
        fallback={
          <>
            <LoadingBadge />
            <Skeleton className="mb-6 h-12 w-72" />
            <Skeleton className="h-[28rem] rounded-2xl" />
          </>
        }
      >
        <ReservationsContent searchParams={props.searchParams} />
      </Suspense>
    </AdminContainer>
  );
}
