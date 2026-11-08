import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { ContactBlock, PageHeader } from "@/components/site/sections";
import { siteContentQuery } from "@/lib/content";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato e orçamento | Dmais Comunicação Visual" },
      { name: "description", content: "Peça seu orçamento de comunicação visual pelo WhatsApp. Atendemos Goiânia e região." },
      { property: "og:title", content: "Contato | Dmais Comunicação Visual" },
      { property: "og:description", content: "Peça seu orçamento pelo WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: ContactPage,
});

function ContactPage() {
  const { data } = useSuspenseQuery(siteContentQuery);
  return (
    <SiteShell>
      <PageHeader eyebrow="Contato" title="Vamos tirar sua ideia do papel?" />
      <ContactBlock s={data.settings} services={data.services} />
    </SiteShell>
  );
}
