import type { Metadata } from "next";
import { Suspense } from "react";
import { getSiteContentMap } from "@/actions/admin-cms";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { AdminContainer, AdminPageHeader } from "@/components/admin/ui";
import { LoadingBadge } from "@/components/public/LoadingBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { requireAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Site İçerikleri" };

async function ContentLoader() {
  await requireAdminSession();
  const map = await getSiteContentMap();
  return <ContentEditor initial={map} />;
}

export default function AdminContentPage() {
  return (
    <AdminContainer>
      <AdminPageHeader
        title="Site İçerikleri"
        description="Anasayfa başlığı, iletişim bilgileri ve Hakkımızda metnini buradan güncelleyin. Çevrilebilir alanların İngilizcesi de buradan girilir."
      />
      <Suspense
        fallback={
          <>
            <LoadingBadge />
            <Skeleton className="h-[36rem] rounded-2xl" />
          </>
        }
      >
        <ContentLoader />
      </Suspense>
    </AdminContainer>
  );
}
