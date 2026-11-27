import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getI18n } from "@/i18n/server";

export default async function PropertyNotFound() {
  const { t, href } = await getI18n();
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-sand text-sea-500">
          <Icon name="home" size={30} />
        </span>
        <h1 className="font-display text-3xl font-semibold text-sea-700">{t.detail.notFoundTitle}</h1>
        <p className="mt-3 text-ink-soft">{t.detail.notFoundText}</p>
        <ButtonLink href={href("/properties")} className="mt-8">
          {t.detail.notFoundCta}
        </ButtonLink>
      </div>
    </div>
  );
}
