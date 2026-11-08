import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/admin-kit";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({ component: SiteSettingsAdmin });

function SiteSettingsAdmin() {
  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="Configurações" title="Configurações do site" text="Números de destaque exibidos no topo e na seção de avaliações. Deixe em branco para ocultar." />
      <SettingsForm
        sections={[
          {
            title: "Indicadores",
            fields: [
              { key: "google_rating", label: "Nota no Google", placeholder: "4,7" },
              { key: "google_reviews_count", label: "Quantidade de avaliações no Google", placeholder: "13" },
              { key: "instagram_posts", label: "Publicações no Instagram", placeholder: "+189" },
            ],
          },
        ]}
      />
    </div>
  );
}
