import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Panel kabuğu (kenar menü). Erişim kontrolü proxy.ts'de yapılır; giriş sayfasında kabuk gizlenir.
 * AdminShell aktif menü için usePathname kullandığından Suspense içinde render edilir.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-shell" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
