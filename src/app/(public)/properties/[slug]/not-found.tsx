import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function PropertyNotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-sand text-sea-500">
          <Icon name="home" size={30} />
        </span>
        <h1 className="font-display text-3xl font-semibold text-sea-700">Bu ilan artık yayında değil</h1>
        <p className="mt-3 text-ink-soft">
          Aradığın konak kaldırılmış ya da adresi değişmiş olabilir. Benzer konakları keşfetmeye ne dersin?
        </p>
        <ButtonLink href="/properties" className="mt-8">
          Tüm ilanlara göz at
        </ButtonLink>
      </div>
    </div>
  );
}
