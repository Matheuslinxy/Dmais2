import { queryOptions } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import { getSiteContent } from "./content.functions";

export type Settings = Tables<"site_settings">;
export type Service = Tables<"services">;
export type PortfolioItem = Tables<"portfolio_items">;
export type Review = Tables<"reviews">;

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
  staleTime: 60_000,
});

export const BRAND_FALLBACK = "Dmais Comunicação Visual";

export function whatsappLink(phone: string | undefined | null, message: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildQuoteMessage(name: string, service: string, details: string, company: string) {
  const lines = [
    `Olá! Vim pelo site da ${company} e gostaria de um orçamento.`,
    "",
    `Nome: ${name.trim()}`,
    `Serviço: ${service}`,
  ];
  if (details.trim()) lines.push(`Projeto: ${details.trim()}`);
  return lines.join("\n");
}

export function youtubeEmbed(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    else if (host === "youtube.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v") ?? "";
      else id = url.pathname.match(/^\/(embed|shorts)\/([^/]+)/)?.[2] ?? "";
    }
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Accept only #rgb / #rrggbb so a bad value never breaks the page colors. */
export function safeHex(color: string | null | undefined): string | undefined {
  return color && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : undefined;
}
