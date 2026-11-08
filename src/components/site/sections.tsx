import { useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Star, Phone, MapPin, Instagram, Navigation, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ServiceIcon } from "./ServiceIcon";
import heroImg from "@/assets/hero-facade.jpg";
import workshopImg from "@/assets/workshop.jpg";
import {
  BRAND_FALLBACK,
  buildQuoteMessage,
  whatsappLink,
  youtubeEmbed,
  type PortfolioItem,
  type Review,
  type Service,
  type Settings,
} from "@/lib/content";
import { cn } from "@/lib/utils";

const company = (s: Settings | null) => s?.company_name || BRAND_FALLBACK;

export function PageHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string | undefined }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-grid">
      <div className="container-site py-20 md:py-28">
        <p className="eyebrow animate-rise">{eyebrow}</p>
        <h1 className="display mt-6 max-w-4xl text-5xl animate-rise md:text-7xl">{title}</h1>
        {text && <p className="mt-6 max-w-2xl text-lg text-muted-foreground animate-rise">{text}</p>}
      </div>
    </section>
  );
}

export function Hero({ s }: { s: Settings | null }) {
  const wa = whatsappLink(s?.whatsapp, "Olá! Gostaria de solicitar um orçamento.");
  const [first, ...rest] = (s?.hero_title || "Sua marca em destaque.").split(" ");
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <img src={heroImg} alt="Fachada com letreiro luminoso verde à noite" width={1536} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-hero-fade" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-bottom-fade" />
      <div className="container-site py-24 md:py-36">
        <p className="eyebrow animate-rise">{s?.hero_eyebrow}</p>
        <h1 className="display mt-6 max-w-3xl text-6xl animate-rise sm:text-7xl md:text-[7.5rem]">
          {first} <span className="text-glow">{rest.join(" ")}</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground animate-rise">{s?.hero_text}</p>
        <div className="mt-10 flex flex-wrap gap-3 animate-rise">
          <Button asChild variant="hero" size="xl">
            <a href={wa} target="_blank" rel="noreferrer">Solicitar orçamento <ArrowUpRight /></a>
          </Button>
          <Button asChild variant="industrial" size="xl">
            <Link to="/servicos">Conhecer serviços</Link>
          </Button>
        </div>
        <dl className="mt-14 flex flex-wrap gap-10">
          {s?.instagram_posts && (
            <div>
              <dt className="display text-4xl text-primary">{s.instagram_posts}</dt>
              <dd className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">publicações no Instagram</dd>
            </div>
          )}
          {s?.google_rating && (
            <div>
              <dt className="display text-4xl text-primary">{s.google_rating}/5</dt>
              <dd className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">avaliação no Google*</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const list = [...items, ...items];
  return (
    <div className="overflow-hidden border-b border-border bg-primary py-4 text-primary-foreground">
      <div className="flex w-max animate-marquee gap-10">
        {list.map((t, i) => (
          <span key={i} className="display flex items-center gap-10 text-2xl">
            {t} <span aria-hidden>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ServicesGrid({ services, intro, showHeading = true }: { services: Service[]; intro?: string | undefined; showHeading?: boolean }) {
  return (
    <section className="py-24">
      <div className="container-site">
        {showHeading && (
          <div className="grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <p className="eyebrow">O que fazemos</p>
              <h2 className="display mt-5 text-5xl md:text-6xl">Soluções para sua marca aparecer.</h2>
            </div>
            <p className="text-lg text-muted-foreground">{intro}</p>
          </div>
        )}
        <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", showHeading && "mt-14")}>
          {services.map((sv, i) => (
            <Link key={sv.id} to="/portfolio" search={{ categoria: sv.slug }} className="card-industrial group flex flex-col overflow-hidden">
              {sv.image_url && (
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={sv.image_url} alt={sv.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-7">
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-sm border border-primary/40 text-primary">
                    <ServiceIcon name={sv.icon} className="size-6" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="display mt-8 text-2xl">{sv.title}</h3>
                <p className="mt-3 flex-1 text-muted-foreground">{sv.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-primary">
                  Ver trabalhos <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutBlock({ s }: { s: Settings | null }) {
  const wa = whatsappLink(s?.whatsapp, `Olá! Quero conhecer as soluções da ${company(s)}.`);
  return (
    <section className="border-y border-border bg-panel py-24">
      <div className="container-site grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <img src={workshopImg} alt="Produção de comunicação visual na oficina" loading="lazy" width={1280} height={1024} className="aspect-[5/4] w-full rounded-sm object-cover" />
          <div className="absolute -bottom-5 -left-5 hidden h-5 w-40 hazard sm:block" />
          <div className="absolute -right-4 -top-4 hidden rounded-sm border-2 border-primary bg-ink px-6 py-5 sm:block">
            <span className="display text-5xl">D<span className="text-primary">+</span></span>
          </div>
        </div>
        <div>
          <p className="eyebrow">{company(s)}</p>
          <h2 className="display mt-5 text-5xl md:text-6xl">{s?.about_title}</h2>
          <p className="mt-6 text-lg text-muted-foreground">{s?.about_text}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {(s?.about_bullets ?? []).map((b) => (
              <li key={b} className="flex items-center gap-3 font-semibold">
                <span className="grid size-6 place-items-center rounded-sm bg-primary text-primary-foreground"><Check className="size-4" /></span>
                {b}
              </li>
            ))}
          </ul>
          <Button asChild variant="hero" size="xl" className="mt-10">
            <a href={wa} target="_blank" rel="noreferrer">Converse com a Dmais <ArrowUpRight /></a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function PortfolioGallery({
  items,
  services,
  initialCategory,
  limit,
}: {
  items: PortfolioItem[];
  services: Service[];
  initialCategory?: string | undefined;
  limit?: number | undefined;
}) {
  const [cat, setCat] = useState(initialCategory ?? "todos");
  const shown = useMemo(() => {
    const list = cat === "todos" ? items : items.filter((i) => i.category === cat);
    return limit ? list.slice(0, limit) : list;
  }, [items, cat, limit]);
  const titleOf = (slug: string) => services.find((s) => s.slug === slug)?.title ?? slug;

  return (
    <div>
      {!limit && (
        <div className="flex flex-wrap gap-2">
          {[{ slug: "todos", title: "Todos" }, ...services].map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className={cn(
                "rounded-sm border px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-colors",
                cat === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-sm border border-dashed border-border bg-panel px-6 py-20 text-center">
          <ImageOff className="size-10 text-muted-foreground" />
          <p className="display mt-5 text-2xl">Em breve, novos trabalhos aqui.</p>
          <p className="mt-2 max-w-md text-muted-foreground">Enquanto isso, acompanhe nossos projetos no Instagram ou peça seu orçamento.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((it) => {
            const embed = youtubeEmbed(it.video_url);
            return (
              <figure key={it.id} className="card-industrial group overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                  {embed ? (
                    <iframe src={embed} title={it.title} className="h-full w-full" allowFullScreen loading="lazy" />
                  ) : it.image_url ? (
                    <img src={it.image_url} alt={it.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground"><ImageOff /></div>
                  )}
                  <span className="absolute left-3 top-3 rounded-sm bg-ink/85 px-2 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-widest text-primary">
                    {titleOf(it.category)}
                  </span>
                </div>
                <figcaption className="p-5">
                  <h3 className="display text-xl">{it.title}</h3>
                  {it.description && <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PortfolioSection({ items, services, intro }: { items: PortfolioItem[]; services: Service[]; intro?: string | undefined }) {
  return (
    <section className="py-24">
      <div className="container-site">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <p className="eyebrow">Ideias que ganham forma</p>
            <h2 className="display mt-5 text-5xl md:text-6xl">Um mundo de possibilidades visuais.</h2>
          </div>
          <p className="text-lg text-muted-foreground">{intro}</p>
        </div>
        <PortfolioGallery items={items} services={services} limit={6} />
        <div className="mt-10">
          <Button asChild variant="industrial" size="xl">
            <Link to="/portfolio">Ver portfólio completo <ArrowUpRight /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ReviewsBlock({ s, reviews }: { s: Settings | null; reviews: Review[] }) {
  if (reviews.length === 0) return null;
  return (
    <section className="border-y border-border bg-panel py-24">
      <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.6fr]">
        <div>
          <p className="eyebrow">Quem conhece, recomenda</p>
          <h2 className="display mt-5 text-5xl">Confiança que aparece.</h2>
          <p className="mt-5 text-muted-foreground">A experiência dos clientes também faz parte da história da Dmais.</p>
          {s?.google_rating && (
            <div className="mt-8 inline-flex items-center gap-5 rounded-sm border border-primary/40 bg-ink p-6">
              <span className="display text-6xl text-primary">{s.google_rating}</span>
              <div>
                <div className="flex text-primary">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest">Nota no Google</p>
                {s.google_reviews_count && <p className="text-xs text-muted-foreground">{s.google_reviews_count} avaliações informadas</p>}
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <blockquote key={r.id} className="card-industrial flex flex-col p-7">
              <div className="flex text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("size-4", i < r.rating ? "fill-current" : "opacity-30")} />
                ))}
              </div>
              <p className="mt-5 flex-1 text-lg font-semibold">“{r.text}”</p>
              <footer className="mt-6 border-t border-border pt-4 text-sm">
                <span className="font-bold">{r.author}</span>
                <span className="block text-muted-foreground">{r.source}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactBlock({ s, services }: { s: Settings | null; services: Service[] }) {
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [details, setDetails] = useState("");
  const options = [...services.map((x) => x.title), "Outro serviço"];

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !service) return;
    window.open(whatsappLink(s?.whatsapp, buildQuoteMessage(name, service, details, company(s))), "_blank", "noopener");
  }

  const info = [
    { icon: Phone, label: "WhatsApp / Telefone", value: s?.phone_display, href: whatsappLink(s?.whatsapp, "Olá!") },
    { icon: MapPin, label: "Localização", value: [s?.address, s?.city].filter(Boolean).join(" · ") },
    { icon: Instagram, label: "Instagram", value: s?.instagram_handle, href: s?.instagram_url },
    { icon: Navigation, label: "Como chegar", value: "Abrir localização no Google Maps", href: s?.maps_url },
  ];

  return (
    <section className="py-24">
      <div className="container-site grid gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Vamos tirar sua ideia do papel?</p>
          <h2 className="display mt-5 text-5xl md:text-6xl">{s?.cta_title}</h2>
          <p className="mt-6 text-lg text-muted-foreground">{s?.cta_text}</p>
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {info.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex items-center gap-5 py-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-sm border border-primary/40 text-primary"><Icon className="size-5" /></span>
                <div className="min-w-0">
                  <p className="font-mono text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer" className="font-semibold hover:text-primary">{value} ↗</a>
                  ) : (
                    <p className="font-semibold">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={submit} className="relative self-start rounded-sm border border-border bg-panel p-8 md:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-bar" />
          <h3 className="display text-3xl">Solicite um orçamento</h3>
          <p className="mt-2 text-sm text-muted-foreground">Preencha os campos e enviaremos sua mensagem para o WhatsApp.</p>
          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="q-name" className="font-mono text-xs uppercase tracking-widest">Seu nome *</Label>
              <Input id="q-name" required value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-sm bg-ink" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-service" className="font-mono text-xs uppercase tracking-widest">Qual serviço você precisa? *</Label>
              <select
                id="q-service"
                required
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="h-12 w-full rounded-sm border border-input bg-ink px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Selecione um serviço</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-details" className="font-mono text-xs uppercase tracking-widest">Conte um pouco sobre seu projeto</Label>
              <Textarea id="q-details" rows={5} value={details} onChange={(e) => setDetails(e.target.value)} className="rounded-sm bg-ink" />
            </div>
            <Button type="submit" variant="hero" size="xl" className="w-full">Enviar pelo WhatsApp <ArrowUpRight /></Button>
          </div>
        </form>
      </div>
    </section>
  );
}
