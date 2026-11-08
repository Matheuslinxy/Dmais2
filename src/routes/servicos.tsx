import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { ContactBlock, PageHeader, ServicesGrid } from "@/components/site/sections";
import { siteContentQuery } from "@/lib/content";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços | Dmais Comunicação Visual" },
      { name: "description", content: "Fachadas, letreiros, placas, faixas e banners, adesivos, cavaletes e mais soluções de comunicação visual." },
      { property: "og:title", content: "Serviços | Dmais Comunicação Visual" },
      { property: "og:description", content: "Soluções de comunicação visual para sua marca aparecer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: ServicesPage,
});

function ServicesPage() {
  const { data } = useSuspenseQuery(siteContentQuery);
  return (
    <SiteShell>
      <PageHeader eyebrow="O que fazemos" title="Soluções para sua marca aparecer." text={data.settings?.services_intro} />
      <ServicesGrid services={data.services} showHeading={false} />
      <ContactBlock s={data.settings} services={data.services} />
    </SiteShell>
  );
}
