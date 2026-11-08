import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Public, read-only: everything the public site shows. RLS limits anon to
// active services, published work and visible reviews.
export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });

  const [settings, services, portfolio, reviews] = await Promise.all([
    sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("services").select("*").eq("active", true).order("sort_order"),
    sb.from("portfolio_items").select("*").eq("published", true).order("sort_order").order("created_at", { ascending: false }),
    sb.from("reviews").select("*").eq("visible", true).order("sort_order"),
  ]);

  if (settings.error) throw new Error(settings.error.message);

  return {
    settings: settings.data,
    services: services.data ?? [],
    portfolio: portfolio.data ?? [],
    reviews: reviews.data ?? [],
  };
});
