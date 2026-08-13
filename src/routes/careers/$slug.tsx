import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { careerDetailQuery } from "@/lib/career-data";
import { PageShell } from "@/components/PageShell";
import { SkillCard } from "@/components/SkillCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/careers/$slug")({
  loader: async ({ context, params }) => {
    const career = await context.queryClient.ensureQueryData(careerDetailQuery(params.slug));
    if (!career) throw notFound();
    return {
      name: career.name,
      slug: career.slug,
      description: career.short_description,
      stages: career.career_stages.map((s) => ({
        stage_order: s.stage_order,
        stage_name: s.stage_name,
        skills: s.skills.map((k) => k.name),
      })),
    };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Career not found — Career compass" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} roadmap | Career Compass`;
    const description =
      loaderData.description ??
      `A stage-by-stage roadmap for becoming a ${loaderData.name.toLowerCase()}.`;
    const url = `https://career-compass-guide-4u.lovable.app/careers/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to become a ${loaderData.name.toLowerCase()}`,
            description,
            url,
            totalTime: "P12M",
            estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
            step: loaderData.stages.map((stage, i) => ({
              "@type": "HowToSection",
              position: i + 1,
              name: stage.stage_name,
              itemListElement: stage.skills.map((skill, j) => ({
                "@type": "HowToStep",
                position: j + 1,
                name: skill,
                url: `${url}#stage-${stage.stage_order}`,
              })),
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Careers", item: "https://career-compass-guide-4u.lovable.app/careers" },
              { "@type": "ListItem", position: 2, name: loaderData.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: CareerDetailPage,
});

function CareerDetailPage() {
  const { slug } = Route.useParams();
  const { data: career } = useSuspenseQuery(careerDetailQuery(slug));
  if (!career) return null;

  return (
    <PageShell>
      <nav className="text-sm text-muted-foreground">
        <Link to="/careers" className="hover:text-foreground">
          Careers
        </Link>
        <span className="px-1">/</span>
        <span>{career.name}</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{career.name}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{career.short_description}</p>

      <Button asChild className="mt-5">
        <Link to="/auth">Track this roadmap</Link>
      </Button>

      <div className="mt-10 space-y-10">
        {career.career_stages.map((stage) => (
          <section key={stage.id} id={`stage-${stage.stage_order}`}>
            <div className="flex items-baseline gap-3">
              <span className="text-sm text-muted-foreground">Stage {stage.stage_order}</span>
              <h2 className="text-lg font-medium">{stage.stage_name}</h2>
            </div>
            <div className="mt-3 grid gap-3">
              {stage.skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
