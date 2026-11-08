import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHeader, PortfolioGallery } from "@/components/site/sections";
import { siteContentQuery } from "@/lib/content";

export const Route = createFileRoute("/portfolio")({
  validateSearch: (search: Record<string, unknown>): { categoria?: string | undefined } => ({
    categoria: typeof search["categoria"] === "string" ? search["categoria"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Portfólio | Dmais Comunicação Visual" },
      { name: "description", content: "Confira trabalhos realizados pela Dmais Comunicação Visual: fachadas, letreiros, placas, banners e adesivos." },
      { property: "og:title", content: "Portfólio | Dmais Comunicação Visual" },
      { property: "og:description", content: "Trabalhos realizados pela Dmais Comunicação Visual." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const { categoria } = Route.useSearch();
  return (
    <SiteShell>
      <PageHeader eyebrow="Portfólio" title="Ideias que ganham forma." text="Confira alguns dos trabalhos realizados pela Dmais Comunicação Visual." />
      <section className="py-16">
        <div className="container-site">
          <PortfolioGallery key={categoria ?? "todos"} items={data.portfolio} services={data.services} initialCategory={categoria} />
        </div>
      </section>
    </SiteShell>
  );
}
