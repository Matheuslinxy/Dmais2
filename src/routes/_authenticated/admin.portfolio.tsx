import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Images, Loader2, Pencil, Plus, Trash2, Eye, EyeOff, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminPageHeader, ConfirmDelete, EmptyState, ImageUpload, StatusPill } from "@/components/admin/admin-kit";
import { adminPortfolioQuery, adminServicesQuery, useDeleteRow, useSaveRow } from "@/lib/admin-data";
import { youtubeEmbed, type PortfolioItem } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/portfolio")({ component: PortfolioAdmin });

type Draft = Partial<PortfolioItem>;

function PortfolioAdmin() {
  const { data, isLoading } = useQuery(adminPortfolioQuery);
  const { data: services } = useQuery(adminServicesQuery);
  const [cat, setCat] = useState("todos");
  const [draft, setDraft] = useState<Draft | null>(null);
  const del = useDeleteRow("portfolio_items");
  const save = useSaveRow("portfolio_items");
  const cats = [{ slug: "todos", title: "Todos" }, ...(services ?? []), { slug: "outros", title: "Outros" }];
  const titleOf = (slug: string) => cats.find((c) => c.slug === slug)?.title ?? slug;
  const list = useMemo(() => (data ?? []).filter((p) => cat === "todos" || p.category === cat), [data, cat]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Conteúdo do site"
        title="Portfólio"
        text="Mostre os trabalhos realizados. Cada trabalho pertence a uma categoria de serviço."
        action={<Button variant="hero" size="lg" onClick={() => setDraft({ published: true, category: services?.[0]?.slug ?? "outros", sort_order: 0 })}><Plus /> Novo trabalho</Button>}
      />

      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c.slug}
            onClick={() => setCat(c.slug)}
            className={cn("rounded-sm border px-3 py-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-widest", cat === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary")}
          >
            {c.title} {c.slug !== "todos" && <span className="opacity-60">({(data ?? []).filter((p) => p.category === c.slug).length})</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Images className="size-10" />}
          title="Nenhum trabalho aqui"
          text="Adicione fotos dos trabalhos realizados para valorizar o portfólio do site."
          action={<Button variant="hero" onClick={() => setDraft({ published: true, category: cat === "todos" ? services?.[0]?.slug ?? "outros" : cat, sort_order: 0 })}><Plus /> Adicionar trabalho</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <article key={p.id} className="group overflow-hidden rounded-sm border border-border bg-panel">
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-105", !p.published && "grayscale")} />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">{p.video_url ? <Youtube className="size-10" /> : <Images className="size-10" />}</div>
                )}
                <div className="absolute left-3 top-3"><StatusPill on={p.published} onLabel="Publicado" offLabel="Rascunho" /></div>
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/70 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="hero" onClick={() => setDraft(p)}><Pencil /> Editar</Button>
                  <Button size="icon" variant="secondary" onClick={() => save.mutate({ id: p.id, published: !p.published })} aria-label="Alternar publicação">
                    {p.published ? <EyeOff /> : <Eye />}
                  </Button>
                  <ConfirmDelete what={`o trabalho “${p.title}”`} onConfirm={() => del.mutate(p.id)}>
                    <Button size="icon" variant="destructive" aria-label="Excluir"><Trash2 /></Button>
                  </ConfirmDelete>
                </div>
              </div>
              <div className="p-4">
                <p className="font-mono text-[0.65rem] font-bold uppercase tracking-widest text-primary">{titleOf(p.category)}</p>
                <h3 className="mt-1 truncate font-bold">{p.title}</h3>
              </div>
            </article>
          ))}
        </div>
      )}

      {draft && <WorkDialog draft={draft} cats={cats.filter((c) => c.slug !== "todos")} onClose={() => setDraft(null)} />}
    </div>
  );
}

function WorkDialog({ draft, cats, onClose }: { draft: Draft; cats: { slug: string; title: string }[]; onClose: () => void }) {
  const [d, setD] = useState<Draft>(draft);
  const save = useSaveRow("portfolio_items");
  const set = (p: Draft) => setD((x) => ({ ...x, ...p }));
  const embed = youtubeEmbed(d.video_url);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!d.title?.trim()) return;
    save.mutate(
      {
        id: d.id,
        title: d.title.trim(),
        description: d.description ?? "",
        category: d.category ?? "outros",
        image_url: d.image_url ?? null,
        video_url: d.video_url?.trim() || null,
        sort_order: Number(d.sort_order ?? 0),
        published: d.published ?? true,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle className="display text-2xl">{d.id ? "Editar trabalho" : "Novo trabalho"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <ImageUpload value={d.image_url} onChange={(url) => set({ image_url: url })} folder="portfolio" label="Foto do trabalho" />
            {embed && <iframe src={embed} title="Pré-visualização do vídeo" className="aspect-video w-full rounded-sm" />}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input required value={d.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea rows={3} value={d.description ?? ""} onChange={(e) => set({ description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select value={d.category ?? "outros"} onChange={(e) => set({ category: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                {cats.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Link de vídeo do YouTube (opcional)</Label>
              <Input placeholder="https://youtu.be/..." value={d.video_url ?? ""} onChange={(e) => set({ video_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ordem de exibição</Label>
              <Input type="number" value={d.sort_order ?? 0} onChange={(e) => set({ sort_order: Number(e.target.value) })} />
            </div>
            <label className="flex items-center justify-between rounded-sm border border-border p-3">
              <span className="text-sm font-medium">Publicar no site</span>
              <Switch checked={d.published ?? true} onCheckedChange={(v) => set({ published: v })} />
            </label>
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="hero" disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Salvar trabalho</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
