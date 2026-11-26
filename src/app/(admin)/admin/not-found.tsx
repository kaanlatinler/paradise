import Link from "next/link";
import { AdminContainer } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <AdminContainer>
      <div className="grid min-h-[50vh] place-items-center text-center">
        <div>
          <p className="font-display text-6xl font-semibold text-citrus-500">404</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-sea-700">Kayıt bulunamadı</h1>
          <p className="mt-2 text-sm text-ink-soft">Aradığınız sayfa veya kayıt silinmiş olabilir.</p>
          <Link href="/admin" className="mt-6 inline-flex text-sm font-semibold text-sea-700 hover:underline">
            Genel bakışa dön
          </Link>
        </div>
      </div>
    </AdminContainer>
  );
}
