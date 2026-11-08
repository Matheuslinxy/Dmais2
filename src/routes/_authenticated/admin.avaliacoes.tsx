import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Star, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader, ConfirmDelete, EmptyState, StatusPill } from "@/components/admin/admin-kit";
import { adminReviewsQuery, useDeleteRow, useSaveRow } from "@/lib/admin-data";
import type { Review } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/avaliacoes")({ component: ReviewsAdmin });

type Draft = Partial<Review>;

function Stars({ n, onPick }: { n: number; onPick?: (n: number) => void }) {
  return (
    <div className="flex text-primary">
      {Array.from({ length: 5 }).map((_, i) => (
        <button type="button" key={i} disabled={!onPick} onClick={() => onPick?.(i + 1)} aria-label={`${i + 1} estrelas`}>
          <Star className={cn("size-4", onPick && "size-6", i < n ? "fill-current" : "opacity-30")} />
        </button>
      ))}
    </div>
  );
}

function ReviewsAdmin() {
  const { data, isLoading } = useQuery(adminReviewsQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const del = useDeleteRow("reviews");
  const save = useSaveRow("reviews");
  const list = data ?? [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Conteúdo do site"
        title="Avaliações"
        text="Depoimentos de clientes exibidos na seção “Confiança que aparece”. Use apenas avaliações reais."
        action={<Button variant="hero" size="lg" onClick={() => setDraft({ rating: 5, visible: true, source: "Avaliação pública do Google", sort_order: list.length + 1 })}><Plus /> Nova avaliação</Button>}
      />
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : list.length === 0 ? (
        <EmptyState icon={<Star className="size-10" />} title="Nenhuma avaliação" text="Adicione depoimentos de clientes." />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border bg-panel">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Avaliação</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-bold">{r.author}</p>
                    <p className="text-xs text-muted-foreground">{r.source}</p>
                  </TableCell>
                  <TableCell className="hidden max-w-sm md:table-cell"><p className="line-clamp-2 text-sm text-muted-foreground">“{r.text}”</p></TableCell>
                  <TableCell><Stars n={r.rating} /></TableCell>
                  <TableCell><StatusPill on={r.visible} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setDraft(r)} aria-label="Editar"><Pencil /></Button>
                      <Button size="icon" variant="ghost" onClick={() => save.mutate({ id: r.id, visible: !r.visible })} aria-label="Alternar exibição">{r.visible ? <EyeOff /> : <Eye />}</Button>
                      <ConfirmDelete what={`a avaliação de ${r.author}`} onConfirm={() => del.mutate(r.id)}>
                        <Button size="icon" variant="ghost" className="text-destructive" aria-label="Excluir"><Trash2 /></Button>
                      </ConfirmDelete>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {draft && <ReviewDialog draft={draft} onClose={() => setDraft(null)} />}
    </div>
  );
}

function ReviewDialog({ draft, onClose }: { draft: Draft; onClose: () => void }) {
  const [d, setD] = useState<Draft>(draft);
  const save = useSaveRow("reviews");
  const set = (p: Draft) => setD((x) => ({ ...x, ...p }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!d.author?.trim() || !d.text?.trim()) return;
    save.mutate(
      { id: d.id, author: d.author.trim(), text: d.text.trim(), rating: d.rating ?? 5, source: d.source ?? "", visible: d.visible ?? true, sort_order: Number(d.sort_order ?? 0) },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="display text-2xl">{d.id ? "Editar avaliação" : "Nova avaliação"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label>Nome do cliente *</Label><Input required value={d.author ?? ""} onChange={(e) => set({ author: e.target.value })} /></div>
          <div className="space-y-2"><Label>Texto da avaliação *</Label><Textarea required rows={4} value={d.text ?? ""} onChange={(e) => set({ text: e.target.value })} /></div>
          <div className="space-y-2"><Label>Nota</Label><Stars n={d.rating ?? 5} onPick={(n) => set({ rating: n })} /></div>
          <div className="grid grid-cols-[1fr_120px] gap-4">
            <div className="space-y-2"><Label>Origem</Label><Input value={d.source ?? ""} onChange={(e) => set({ source: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={d.sort_order ?? 0} onChange={(e) => set({ sort_order: Number(e.target.value) })} /></div>
          </div>
          <label className="flex items-center justify-between rounded-sm border border-border p-3">
            <span className="text-sm font-medium">Exibir no site</span>
            <Switch checked={d.visible ?? true} onCheckedChange={(v) => set({ visible: v })} />
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="hero" disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
