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
    return { name: career.name, description: career.short_description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Career not found — Career compass" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} roadmap — skills, stages and free resources`;
    const description =
      loaderData.description ??
      `A stage-by-stage roadmap for becoming a ${loaderData.name.toLowerCase()}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
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
          <section key={stage.id}>
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
