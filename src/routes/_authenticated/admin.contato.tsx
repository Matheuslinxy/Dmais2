import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/admin-kit";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { whatsappLink } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/contato")({ component: ContactAdmin });

function ContactAdmin() {
  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="Conteúdo do site" title="Informações de contato" text="Telefone, WhatsApp, endereço e redes sociais usados em todo o site." />
      <SettingsForm
        sections={[
          {
            title: "WhatsApp e telefone",
            fields: [
              { key: "whatsapp", label: "Número do WhatsApp", hint: "Com código do país e DDD, só números. Ex.: 5562981504537", placeholder: "5562981504537" },
              { key: "phone_display", label: "Telefone exibido", placeholder: "(62) 98150-4537" },
            ],
          },
          {
            title: "Endereço",
            fields: [
              { key: "address", label: "Endereço" },
              { key: "city", label: "Cidade / Estado" },
              { key: "maps_url", label: "Link do Google Maps" },
            ],
          },
          {
            title: "Redes sociais",
            fields: [
              { key: "instagram_handle", label: "Usuário do Instagram", placeholder: "@usuario" },
              { key: "instagram_url", label: "Link do Instagram" },
            ],
          },
        ]}
        aside={(v) => (
          <div className="rounded-sm border border-border bg-panel p-5 text-sm">
            <p className="font-bold">Testar WhatsApp</p>
            <p className="mt-1 text-muted-foreground">Abre uma conversa com o número informado.</p>
            <a className="mt-3 inline-block font-mono text-xs uppercase tracking-widest text-primary" href={whatsappLink(v.whatsapp, "Teste do site")} target="_blank" rel="noreferrer">Abrir conversa ↗</a>
          </div>
        )}
      />
    </div>
  );
}
