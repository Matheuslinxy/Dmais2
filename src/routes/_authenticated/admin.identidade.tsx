import type { CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/admin-kit";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { Logo } from "@/components/site/Logo";
import { safeHex } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/identidade")({ component: BrandAdmin });

function BrandAdmin() {
  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="Configurações" title="Identidade visual" text="Nome da empresa, logo e cor principal do site." />
      <SettingsForm
        sections={[
          {
            title: "Marca",
            fields: [
              { key: "company_name", label: "Nome da empresa" },
              { key: "logo_url", label: "Logo personalizada", type: "image", hint: "Opcional. Sem imagem, o site usa a logo Dmais padrão. Prefira PNG com fundo transparente." },
            ],
          },
          { title: "Cores", fields: [{ key: "primary_color", label: "Cor principal", type: "color", hint: "Usada em botões, destaques e brilhos. Padrão: verde neon #22E06B." }] },
        ]}
        aside={(v) => {
          const c = safeHex(v.primary_color);
          return (
            <div style={c ? ({ "--primary": c } as CSSProperties) : undefined} className="space-y-3 rounded-sm border border-border bg-panel p-5">
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">Pré-visualização</p>
              <div className="rounded-sm bg-ink p-4"><Logo logoUrl={v.logo_url} name={v.company_name} /></div>
              <div className="rounded-sm bg-foreground p-4"><Logo logoUrl={v.logo_url} name={v.company_name} tone="light" /></div>
              <span className="inline-flex rounded-sm bg-primary px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">Botão</span>
            </div>
          );
        }}
      />
    </div>
  );
}
