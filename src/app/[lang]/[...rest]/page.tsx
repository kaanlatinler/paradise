import { notFound } from "next/navigation";

/**
 * Proxy, bilinmeyen Türkçe adresleri de /tr/... altına yönlendirir; burada yakalanıp
 * menülü, iki dilli 404 sayfası gerçek 404 durum koduyla gösterilir.
 */
export default function CatchAllNotFound() {
  notFound();
}
