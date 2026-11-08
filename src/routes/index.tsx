import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { AboutBlock, ContactBlock, Hero, Marquee, PortfolioSection, ReviewsBlock, ServicesGrid } from "@/components/site/sections";
import { siteContentQuery } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dmais Comunicação Visual | Sua marca em destaque em Goiânia" },
      { name: "description", content: "Fachadas, letreiros, placas, faixas, banners e adesivos em Goiânia. Peça seu orçamento pelo WhatsApp." },
      { property: "og:title", content: "Dmais Comunicação Visual | Sua marca em destaque" },
      { property: "og:description", content: "Fachadas, letreiros, placas, faixas, banners e adesivos em Goiânia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const s = data.settings;
  return (
    <SiteShell>
      <Hero s={s} />
      <Marquee items={data.services.map((x) => x.title)} />
      <ServicesGrid services={data.services} intro={s?.services_intro} />
      <AboutBlock s={s} />
      <PortfolioSection items={data.portfolio} services={data.services} intro={s?.portfolio_intro} />
      <ReviewsBlock s={s} reviews={data.reviews} />
      <ContactBlock s={s} services={data.services} />
    </SiteShell>
  );
}
