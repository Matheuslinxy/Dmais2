import { useRef, useState, type ReactNode } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function AdminPageHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-4 text-4xl md:text-5xl">{title}</h1>
        {text && <p className="mt-3 max-w-2xl text-muted-foreground">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export async function uploadMedia(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return `/api/public/media/${path}`;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  aspect = "aspect-[4/3]",
  label = "Imagem",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder: string;
  aspect?: string;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Envie um arquivo de imagem."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("A imagem deve ter no máximo 10 MB."); return; }
    setBusy(true);
    try {
      onChange(await uploadMedia(file, folder));
      toast.success("Imagem enviada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no envio.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files[0]);
        }}
        className={cn("group relative overflow-hidden rounded-sm border border-dashed border-border bg-ink", aspect)}
      >
        {value ? (
          <img src={value} alt="Pré-visualização" className="h-full w-full object-cover" />
        ) : (
          <button type="button" onClick={() => ref.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
            <ImagePlus className="size-8" />
            <span className="text-sm">Clique ou arraste uma imagem</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-ink/80">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
        {value && !busy && (
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-ink/85 p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button type="button" size="sm" variant="secondary" onClick={() => ref.current?.click()}><Upload /> Trocar</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}><Trash2 /> Remover</Button>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

export function ConfirmDelete({ onConfirm, what, children }: { onConfirm: () => void; what: string; children: ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {what}?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita. O item deixará de aparecer no site imediatamente.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-sm border border-dashed border-border bg-panel px-6 py-16 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <p className="display mt-4 text-2xl">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function StatusPill({ on, onLabel = "Visível", offLabel = "Oculto" }: { on: boolean; onLabel?: string; offLabel?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-widest", on ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
      <span className={cn("size-1.5 rounded-full", on ? "bg-primary" : "bg-muted-foreground")} />
      {on ? onLabel : offLabel}
    </span>
  );
}
