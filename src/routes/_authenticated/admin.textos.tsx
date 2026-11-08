import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/admin-kit";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const Route = createFileRoute("/_authenticated/admin/textos")({ component: TextsAdmin });

function TextsAdmin() {
  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="Conteúdo do site" title="Textos institucionais" text="Edite os textos principais exibidos nas páginas do site." />
      <SettingsForm
        sections={[
          {
            title: "Topo da página inicial",
            fields: [
              { key: "hero_eyebrow", label: "Frase de abertura", hint: "Texto pequeno acima do título" },
              { key: "hero_title", label: "Título principal", hint: "A partir da segunda palavra, o texto aparece em verde" },
              { key: "hero_text", label: "Descrição", type: "textarea" },
            ],
          },
          {
            title: "A empresa",
            fields: [
              { key: "about_title", label: "Título" },
              { key: "about_text", label: "Texto institucional", type: "textarea" },
              { key: "about_bullets", label: "Diferenciais", type: "list" },
            ],
          },
          {
            title: "Seções",
            fields: [
              { key: "services_intro", label: "Introdução dos serviços", type: "textarea" },
              { key: "portfolio_intro", label: "Introdução do portfólio", type: "textarea" },
            ],
          },
          {
            title: "Chamada para orçamento",
            fields: [
              { key: "cta_title", label: "Título" },
              { key: "cta_text", label: "Texto", type: "textarea" },
            ],
          },
        ]}
      />
    </div>
  );
}
