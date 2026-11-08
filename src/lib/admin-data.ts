import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

// Admin reads/writes go through the browser client; RLS (has_role admin) enforces access.
export const adminServicesQuery = queryOptions({
  queryKey: ["admin", "services"],
  queryFn: async () => {
    const { data, error } = await supabase.from("services").select("*").order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const adminPortfolioQuery = queryOptions({
  queryKey: ["admin", "portfolio"],
  queryFn: async () => {
    const { data, error } = await supabase.from("portfolio_items").select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const adminReviewsQuery = queryOptions({
  queryKey: ["admin", "reviews"],
  queryFn: async () => {
    const { data, error } = await supabase.from("reviews").select("*").order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const adminSettingsQuery = queryOptions({
  queryKey: ["admin", "settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return data;
  },
});

type TableName = "services" | "portfolio_items" | "reviews";

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["site-content"] });
  };
}

export function useSaveRow<T extends TableName>(table: T) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (row: Record<string, unknown> & { id?: string | undefined }) => {
      const { id, ...rest } = row as { id?: string } & Record<string, unknown>;
      const q = id
        ? (supabase.from(table) as any).update(rest).eq("id", id)
        : (supabase.from(table) as any).insert(rest);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Alterações salvas.");
    },
    onError: (e: Error) => toast.error(e.message.includes("duplicate") ? "Já existe um item com esse identificador." : e.message),
  });
}

export function useDeleteRow(table: TableName) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Item excluído.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Swap sort_order between two rows (reorder up/down). */
export function useSwapOrder(table: TableName) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ a, b }: { a: { id: string; sort_order: number }; b: { id: string; sort_order: number } }) => {
      const ao = a.sort_order === b.sort_order ? b.sort_order + 1 : b.sort_order;
      const r1 = await (supabase.from(table) as any).update({ sort_order: ao }).eq("id", a.id);
      const r2 = await (supabase.from(table) as any).update({ sort_order: a.sort_order }).eq("id", b.id);
      if (r1.error || r2.error) throw r1.error ?? r2.error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSaveSettings() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (patch: TablesUpdate<"site_settings">) => {
      const { error } = await supabase.from("site_settings").update(patch).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Configurações atualizadas no site.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
