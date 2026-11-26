import { NotFoundContent } from "@/components/public/NotFoundContent";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  return <NotFoundContent i18n={await getI18n()} />;
}
