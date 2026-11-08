import { useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Wrench,
  Images,
  Star,
  FileText,
  Phone,
  Palette,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel | Dmais Comunicação Visual" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.rpc("has_role", { _user_id: context.user.id, _role: "admin" });
    return { isAdmin: Boolean(data) };
  },
  component: AdminLayout,
});

type NavItem = { to: "/admin" | "/admin/servicos" | "/admin/portfolio" | "/admin/avaliacoes" | "/admin/textos" | "/admin/contato" | "/admin/identidade" | "/admin/configuracoes"; label: string; icon: typeof Wrench; exact?: boolean };

const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: "Visão geral", items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    title: "Conteúdo do site",
    items: [
      { to: "/admin/servicos", label: "Serviços", icon: Wrench },
      { to: "/admin/portfolio", label: "Portfólio", icon: Images },
      { to: "/admin/avaliacoes", label: "Avaliações", icon: Star },
      { to: "/admin/textos", label: "Textos institucionais", icon: FileText },
      { to: "/admin/contato", label: "Informações de contato", icon: Phone },
    ],
  },
  {
    title: "Configurações",
    items: [
      { to: "/admin/identidade", label: "Identidade visual", icon: Palette },
      { to: "/admin/configuracoes", label: "Configurações do site", icon: Settings },
    ],
  },
];

function AdminLayout() {
  const { isAdmin, user } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = GROUPS.flatMap((g) => g.items).find((i) => i.to === pathname);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background bg-grid p-6">
        <div className="max-w-md rounded-sm border border-border bg-panel p-10 text-center">
          <ShieldAlert className="mx-auto size-10 text-destructive" />
          <h1 className="display mt-5 text-3xl">Acesso não autorizado</h1>
          <p className="mt-3 text-sm text-muted-foreground">A conta {user.email} não tem permissão de administrador.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="industrial" asChild><Link to="/">Voltar ao site</Link></Button>
            <Button variant="hero" onClick={signOut}>Sair</Button>
          </div>
        </div>
      </div>
    );
  }

  const sidebar = (
    <aside className="flex h-full flex-col bg-sidebar">
      <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-6">
        <Link to="/admin" onClick={() => setOpen(false)}><Logo /></Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu"><X /></button>
      </div>
      <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-6">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <p className="px-3 font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">{g.title}</p>
            <ul className="mt-3 space-y-1">
              {g.items.map((it) => (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: Boolean(it.exact) }}
                    className="group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-primary"
                  >
                    <it.icon className="size-4" />
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-sidebar-border p-4">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/75 hover:bg-sidebar-accent">
          <ExternalLink className="size-4" /> Ver site
        </a>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-sidebar-accent">
          <LogOut className="size-4" /> Sair da área administrativa
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[272px_1fr]">
      <div className="sticky top-0 hidden h-screen border-r border-sidebar-border lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/80" onClick={() => setOpen(false)} />
          <div className={cn("absolute inset-y-0 left-0 w-72 border-r border-sidebar-border animate-in slide-in-from-left")}>{sidebar}</div>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-border bg-background/90 px-6 backdrop-blur md:px-10">
          <div className="flex items-center gap-4">
            <Button variant="industrial" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu /></Button>
            <div>
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">Dmais · Painel de controle</p>
              <p className="font-display text-lg font-black uppercase">{current?.label ?? "Painel"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Administrador</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-sm bg-primary font-display font-black uppercase text-primary-foreground">
              {(user.email ?? "A")[0]}
            </span>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
