import { notFound } from "next/navigation";

/** Panel içindeki bilinmeyen adresler, kenar menülü admin 404 sayfasına düşer. */
export default function AdminCatchAll() {
  notFound();
}
