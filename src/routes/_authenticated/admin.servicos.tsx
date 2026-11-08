import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminPageHeader, ConfirmDelete, EmptyState, ImageUpload, StatusPill } from "@/components/admin/admin-kit";
import { ServiceIcon, SERVICE_ICONS } from "@/components/site/ServiceIcon";
import { adminServicesQuery, useDeleteRow, useSaveRow, useSwapOrder } from "@/lib/admin-data";
import { slugify, type Service } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/servicos")({ component: ServicesAdmin });

type Draft = Partial<Service>;

function ServicesAdmin() {
  const { data, isLoading } = useQuery(adminServicesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const del = useDeleteRow("services");
  const swap = useSwapOrder("services");
  const list = data ?? [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Conteúdo do site"
        title="Serviços"
        text="Os serviços aparecem na página inicial, na página de serviços e como categorias do portfólio."
        action={<Button variant="hero" size="lg" onClick={() => setDraft({ icon: "square", active: true, sort_order: (list.at(-1)?.sort_order ?? 0) + 1 })}><Plus /> Novo serviço</Button>}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={<Wrench className="size-10" />} title="Nenhum serviço" text="Cadastre os serviços oferecidos pela empresa." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((s, i) => (
            <article key={s.id} className={cn("flex gap-5 rounded-sm border border-border bg-panel p-5", !s.active && "opacity-60")}>
              <div className="relative size-24 shrink-0 overflow-hidden rounded-sm border border-border bg-ink">
                {s.image_url ? <img src={s.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-primary"><ServiceIcon name={s.icon} className="size-8" /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
                  <StatusPill on={s.active} onLabel="Ativo" offLabel="Inativo" />
                </div>
                <h3 className="mt-1 truncate text-lg font-bold">{s.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Button size="sm" variant="secondary" onClick={() => setDraft(s)}><Pencil /> Editar</Button>
                  <Button size="icon" variant="ghost" disabled={i === 0 || swap.isPending} onClick={() => swap.mutate({ a: s, b: list[i - 1]! })} aria-label="Subir"><ArrowUp /></Button>
                  <Button size="icon" variant="ghost" disabled={i === list.length - 1 || swap.isPending} onClick={() => swap.mutate({ a: s, b: list[i + 1]! })} aria-label="Descer"><ArrowDown /></Button>
                  <ConfirmDelete what={`o serviço “${s.title}”`} onConfirm={() => del.mutate(s.id)}>
                    <Button size="icon" variant="ghost" className="ml-auto text-destructive" aria-label="Excluir"><Trash2 /></Button>
                  </ConfirmDelete>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {draft && <ServiceDialog draft={draft} onClose={() => setDraft(null)} />}
    </div>
  );
}

function ServiceDialog({ draft, onClose }: { draft: Draft; onClose: () => void }) {
  const [d, setD] = useState<Draft>(draft);
  const save = useSaveRow("services");
  const set = (p: Draft) => setD((x) => ({ ...x, ...p }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!d.title?.trim()) return;
    save.mutate(
      {
        id: d.id,
        title: d.title.trim(),
        slug: d.slug?.trim() || slugify(d.title),
        description: d.description ?? "",
        icon: d.icon ?? "square",
        image_url: d.image_url ?? null,
        sort_order: Number(d.sort_order ?? 0),
        active: d.active ?? true,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle className="display text-2xl">{d.id ? "Editar serviço" : "Novo serviço"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-6 md:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input required value={d.title ?? ""} onChange={(e) => set({ title: e.target.value, ...(d.id ? {} : { slug: slugify(e.target.value) }) })} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea rows={4} value={d.description ?? ""} onChange={(e) => set({ description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Identificador (categoria)</Label>
                <Input value={d.slug ?? ""} onChange={(e) => set({ slug: slugify(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Ordem de exibição</Label>
                <Input type="number" value={d.sort_order ?? 0} onChange={(e) => set({ sort_order: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SERVICE_ICONS).map(([key, { label }]) => (
                  <button
                    type="button"
                    key={key}
                    title={label}
                    onClick={() => set({ icon: key })}
                    className={cn("grid size-10 place-items-center rounded-sm border", d.icon === key ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary")}
                  >
                    <ServiceIcon name={key} className="size-5" />
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between rounded-sm border border-border p-3">
              <span className="text-sm font-medium">Exibir no site</span>
              <Switch checked={d.active ?? true} onCheckedChange={(v) => set({ active: v })} />
            </label>
          </div>
          <ImageUpload value={d.image_url} onChange={(url) => set({ image_url: url })} folder="services" label="Imagem (opcional)" />
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="hero" disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Salvar serviço</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
