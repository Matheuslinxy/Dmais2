import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { AboutBlock, Marquee, PageHeader, ReviewsBlock } from "@/components/site/sections";
import { siteContentQuery } from "@/lib/content";

export const Route = createFileRoute("/empresa")({
  head: () => ({
    meta: [
      { title: "A empresa | Dmais Comunicação Visual" },
      { name: "description", content: "Conheça a Dmais Comunicação Visual: atendimento próximo e soluções personalizadas em Goiânia e região." },
      { property: "og:title", content: "A empresa | Dmais Comunicação Visual" },
      { property: "og:description", content: "Sua ideia. Nossa comunicação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: CompanyPage,
});

function CompanyPage() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const s = data.settings;
  return (
    <SiteShell>
      <PageHeader eyebrow="A empresa" title={s?.about_title || "Sua ideia. Nossa comunicação."} text={s?.city ? `Comunicação visual em ${s.city}.` : undefined} />
      <AboutBlock s={s} />
      <Marquee items={["Ideia boa merece ser vista", ...data.services.map((x) => x.title)]} />
      <ReviewsBlock s={s} reviews={data.reviews} />
    </SiteShell>
  );
}
