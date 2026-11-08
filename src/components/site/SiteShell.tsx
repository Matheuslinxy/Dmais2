import { useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Menu, X, MessageCircle, ArrowUpRight, Instagram, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { BRAND_FALLBACK, safeHex, siteContentQuery, whatsappLink } from "@/lib/content";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/servicos", label: "Serviços" },
  { to: "/empresa", label: "A empresa" },
  { to: "/portfolio", label: "Portfólio" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const { data } = useSuspenseQuery(siteContentQuery);
  const s = data.settings;
  const company = s?.company_name || BRAND_FALLBACK;
  const [open, setOpen] = useState(false);
  const brand = safeHex(s?.primary_color);
  const style = brand ? ({ "--primary": brand } as CSSProperties) : undefined;
  const wa = whatsappLink(s?.whatsapp, `Olá! Vim pelo site da ${company} e gostaria de um orçamento.`);

  return (
    <div style={style} className="min-h-screen bg-background text-foreground">
      <div className="h-1 bg-brand-bar" />
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="container-site flex h-20 items-center justify-between gap-6">
          <Link to="/" aria-label={company}>
            <Logo logoUrl={s?.logo_url} name={company} />
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary data-[status=active]:text-primary"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="hero" className="hidden sm:inline-flex">
              <a href={wa} target="_blank" rel="noreferrer">
                Fazer orçamento <ArrowUpRight />
              </a>
            </Button>
            <Button variant="industrial" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menu">
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border bg-background lg:hidden">
            <div className="container-site flex flex-col py-4">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: n.to === "/" }}
                  className="border-b border-border py-4 font-display text-2xl font-black uppercase data-[status=active]:text-primary"
                >
                  {n.label}
                </Link>
              ))}
              <Button asChild variant="hero" size="xl" className="mt-6">
                <a href={wa} target="_blank" rel="noreferrer">Fazer orçamento <ArrowUpRight /></a>
              </Button>
            </div>
          </nav>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-ink">
        <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo logoUrl={s?.logo_url} name={company} />
            <p className="mt-5 max-w-sm text-sm text-muted-foreground">{s?.hero_text}</p>
          </div>
          <div>
            <p className="eyebrow">Navegação</p>
            <ul className="mt-5 space-y-3 text-sm">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-muted-foreground hover:text-primary">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Contato</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li><a href={wa} target="_blank" rel="noreferrer" className="hover:text-primary">{s?.phone_display}</a></li>
              {s?.instagram_url && (
                <li><a href={s.instagram_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary"><Instagram className="size-4" />{s.instagram_handle}</a></li>
              )}
              <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{s?.address} · {s?.city}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="container-site flex flex-col justify-between gap-2 py-6 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground sm:flex-row">
            <span>© {new Date().getFullYear()} {company}. Todos os direitos reservados.</span>
            <Link to="/admin" className="hover:text-primary">Área administrativa</Link>
          </div>
        </div>
      </footer>

      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow animate-pulse-glow transition-transform hover:scale-110"
      >
        <MessageCircle className="size-6" />
      </a>
    </div>
  );
}
