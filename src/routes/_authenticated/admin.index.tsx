import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Images, Star, Wrench, FileText, Phone, Palette, Plus, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPortfolioQuery, adminReviewsQuery, adminServicesQuery, adminSettingsQuery } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/admin-kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const services = useQuery(adminServicesQuery);
  const portfolio = useQuery(adminPortfolioQuery);
  const reviews = useQuery(adminReviewsQuery);
  const settings = useQuery(adminSettingsQuery);

  const stats = [
    { label: "Serviços", value: services.data?.length, hidden: services.data?.filter((s) => !s.active).length, icon: Wrench, to: "/admin/servicos" as const },
    { label: "Trabalhos no portfólio", value: portfolio.data?.length, hidden: portfolio.data?.filter((s) => !s.published).length, icon: Images, to: "/admin/portfolio" as const },
    { label: "Avaliações", value: reviews.data?.length, hidden: reviews.data?.filter((s) => !s.visible).length, icon: Star, to: "/admin/avaliacoes" as const },
  ];

  const shortcuts = [
    { label: "Novo trabalho", text: "Adicione fotos ao portfólio", to: "/admin/portfolio" as const, icon: Plus },
    { label: "Textos do site", text: "Título, apresentação e chamadas", to: "/admin/textos" as const, icon: FileText },
    { label: "Contato e WhatsApp", text: "Telefone, endereço e redes", to: "/admin/contato" as const, icon: Phone },
    { label: "Identidade visual", text: "Logo, nome e cor principal", to: "/admin/identidade" as const, icon: Palette },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Visão geral"
        title={`Olá, equipe ${settings.data?.company_name?.split(" ")[0] ?? "Dmais"}.`}
        text="Gerencie os trabalhos, serviços e informações exibidas no site. Tudo o que você salvar aqui aparece no site na hora."
        action={<Button asChild variant="industrial"><a href="/" target="_blank" rel="noreferrer">Ver site <ArrowUpRight /></a></Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card-industrial group p-6">
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-sm border border-primary/40 text-primary"><s.icon className="size-5" /></span>
              <ArrowUpRight className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            {s.value === undefined ? (
              <Skeleton className="mt-6 h-12 w-20" />
            ) : (
              <p className="display mt-6 text-6xl">{s.value}</p>
            )}
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
            {!!s.hidden && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><EyeOff className="size-3.5" />{s.hidden} oculto(s) no site</p>
            )}
          </Link>
        ))}
      </div>

      <section>
        <h2 className="display text-2xl">Atalhos</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((s) => (
            <Link key={s.label} to={s.to} className="group flex items-start gap-4 rounded-sm border border-border bg-panel p-5 transition-colors hover:border-primary/50">
              <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground"><s.icon className="size-5" /></span>
              <div>
                <p className="font-bold group-hover:text-primary">{s.label}</p>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="display text-2xl">Últimos trabalhos</h2>
          <Link to="/admin/portfolio" className="font-mono text-xs uppercase tracking-widest text-primary">Gerenciar →</Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {portfolio.isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
          {portfolio.data?.slice(0, 6).map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-sm border border-border bg-ink">
              {p.image_url ? <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><Images /></div>}
              <span className="absolute inset-x-0 bottom-0 truncate bg-ink/85 px-2 py-1 text-xs">{p.title}</span>
            </div>
          ))}
          {portfolio.data?.length === 0 && (
            <p className="col-span-full rounded-sm border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhum trabalho cadastrado ainda. <Link to="/admin/portfolio" className="text-primary">Adicionar o primeiro</Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
