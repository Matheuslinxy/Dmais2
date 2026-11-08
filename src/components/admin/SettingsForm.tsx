import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { adminSettingsQuery, useSaveSettings } from "@/lib/admin-data";
import { ImageUpload } from "./admin-kit";
import type { Settings } from "@/lib/content";

type Key = Exclude<keyof Settings, "id" | "updated_at">;

export type Field = {
  key: Key;
  label: string;
  type?: "text" | "textarea" | "list" | "color" | "image";
  hint?: string;
  placeholder?: string;
};

export type Section = { title: string; description?: string; fields: Field[] };

export function SettingsForm({ sections, aside }: { sections: Section[]; aside?: (values: Partial<Settings>) => ReactNode }) {
  const { data, isLoading } = useQuery(adminSettingsQuery);
  const save = useSaveSettings();
  const [v, setV] = useState<Partial<Settings>>({});
  const keys = sections.flatMap((s) => s.fields.map((f) => f.key));

  useEffect(() => {
    if (data) setV(data);
  }, [data]);

  const dirty = data ? keys.some((k) => JSON.stringify(data[k]) !== JSON.stringify(v[k])) : false;
  const set = (k: Key, val: unknown) => setV((x) => ({ ...x, [k]: val }));

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const patch: Record<string, unknown> = {};
    keys.forEach((k) => (patch[k] = v[k]));
    save.mutate(patch);
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        {sections.map((sec) => (
          <section key={sec.title} className="rounded-sm border border-border bg-panel">
            <header className="border-b border-border px-6 py-4">
              <h2 className="font-display text-lg font-black uppercase">{sec.title}</h2>
              {sec.description && <p className="text-sm text-muted-foreground">{sec.description}</p>}
            </header>
            <div className="grid gap-5 p-6">
              {sec.fields.map((f) => (
                <FieldInput key={f.key} field={f} value={v[f.key]} onChange={(val) => set(f.key, val)} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-sm border border-border bg-panel p-5">
          <p className="text-sm text-muted-foreground">{dirty ? "Você tem alterações não salvas." : "Tudo salvo e publicado no site."}</p>
          <Button type="submit" variant="hero" size="lg" className="mt-4 w-full" disabled={!dirty || save.isPending}>
            {save.isPending ? <Loader2 className="animate-spin" /> : <Save />} Salvar alterações
          </Button>
          {dirty && data && (
            <Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => setV(data)}>Descartar</Button>
          )}
        </div>
        {aside?.(v)}
      </aside>
    </form>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = `f-${field.key}`;
  const label = (
    <div>
      <Label htmlFor={id}>{field.label}</Label>
      {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
    </div>
  );

  if (field.type === "image") {
    return (
      <div className="max-w-xs">
        <ImageUpload value={value as string | null} onChange={onChange} folder="brand" aspect="aspect-[3/1]" label={field.label} />
        {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
      </div>
    );
  }
  if (field.type === "textarea") {
    return <div className="space-y-2">{label}<Textarea id={id} rows={4} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} /></div>;
  }
  if (field.type === "color") {
    const c = (value as string) || "#22E06B";
    return (
      <div className="space-y-2">
        {label}
        <div className="flex items-center gap-3">
          <input type="color" value={c} onChange={(e) => onChange(e.target.value)} className="size-12 cursor-pointer rounded-sm border border-border bg-transparent" aria-label={field.label} />
          <Input id={id} value={c} onChange={(e) => onChange(e.target.value)} className="max-w-[140px] font-mono uppercase" />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("#22E06B")}>Restaurar padrão</Button>
        </div>
      </div>
    );
  }
  if (field.type === "list") {
    const items = (value as string[]) ?? [];
    return (
      <div className="space-y-2">
        {label}
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex gap-2">
              <Input value={it} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
              <Button type="button" size="icon" variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remover"><X /></Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="secondary" onClick={() => onChange([...items, ""])}><Plus /> Adicionar item</Button>
        </div>
      </div>
    );
  }
  return <div className="space-y-2">{label}<Input id={id} placeholder={field.placeholder} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} /></div>;
}
