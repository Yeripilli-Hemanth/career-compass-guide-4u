import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Download } from "lucide-react";
import { careerDetailQuery } from "@/lib/career-data";
import { useRoadmapProgress } from "@/lib/use-roadmap-progress";
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

const demandFilters = [
  { key: "all", label: "All skills" },
  { key: "high", label: "High demand" },
  { key: "medium", label: "Medium demand" },
  { key: "low", label: "Low demand" },
] as const;

type DemandFilter = (typeof demandFilters)[number]["key"];

function CareerDetailPage() {
  const { slug } = Route.useParams();
  const { data: career } = useSuspenseQuery(careerDetailQuery(slug));
  const { completed, toggle, isSignedIn } = useRoadmapProgress(slug);
  const [demand, setDemand] = useState<DemandFilter>("all");
  const [hideDone, setHideDone] = useState(false);
  const [activeStage, setActiveStage] = useState(1);

  const stages = career?.career_stages ?? [];
  const allSkills = stages.flatMap((s) => s.skills);
  const doneCount = allSkills.filter((s) => completed.has(s.id)).length;
  const percent = allSkills.length ? Math.round((doneCount / allSkills.length) * 100) : 0;

  const matches = (skill: { id: string; demand_level: string }) =>
    (demand === "all" || skill.demand_level === demand) && (!hideDone || !completed.has(skill.id));
  const visibleCount = allSkills.filter(matches).length;

  const goToStage = (order: number) => {
    setActiveStage(order);
    document.getElementById(`stage-${order}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!career) return null;

  return (
    <PageShell>
      <nav className="text-sm text-muted-foreground no-print">
        <Link to="/careers" className="hover:text-foreground">
          Careers
        </Link>
        <span className="px-1">/</span>
        <span>{career.name}</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{career.name}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{career.short_description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3 no-print">
        <Button asChild>
          <Link to={isSignedIn ? "/plan" : "/auth"}>
            {isSignedIn ? "Open your plan" : "Track this roadmap"}
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* progress summary */}
      <div className="card-surface print-block mt-8 rounded-2xl p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium">
            {doneCount} of {allSkills.length} skills done
          </p>
          <p className="text-sm text-muted-foreground">{percent}% complete</p>
        </div>
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Roadmap progress"
        >
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
        {!isSignedIn ? (
          <p className="mt-3 text-xs text-muted-foreground no-print">
            Progress is saved in this browser. Sign in to keep it across devices.
          </p>
        ) : null}
      </div>

      {/* stepper */}
      <ol className="mt-6 grid grid-cols-2 gap-2 pb-2 no-print sm:flex sm:gap-3">
        {stages.map((stage) => {
          const total = stage.skills.length;
          const done = stage.skills.filter((s) => completed.has(s.id)).length;
          const isActive = activeStage === stage.stage_order;
          const isDone = total > 0 && done === total;
          return (
            <li key={stage.id} className="min-w-0 sm:flex-1">
              <button
                type="button"
                onClick={() => goToStage(stage.stage_order)}
                aria-current={isActive ? "step" : undefined}
                className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                  isActive ? "border-primary bg-accent" : "border-border bg-card/60 hover:bg-accent/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isDone ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : stage.stage_order}
                  </span>
                  <span className="truncate text-sm font-medium">{stage.stage_name}</span>
                </span>
                <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-primary transition-all"
                    style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
                  />
                </span>
                <span className="mt-1.5 block text-xs text-muted-foreground">
                  {done} of {total} done
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2 no-print">
        {demandFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={demand === f.key}
            onClick={() => setDemand(f.key)}
            className={`min-h-9 rounded-full border px-3 text-sm transition-colors ${
              demand === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={hideDone}
          onClick={() => setHideDone((v) => !v)}
          className={`min-h-9 rounded-full border px-3 text-sm transition-colors ${
            hideDone
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          Hide completed
        </button>
        <span className="ml-auto text-xs text-muted-foreground">{visibleCount} skills shown</span>
      </div>

      <div className="mt-8 space-y-10">
        {stages.map((stage) => {
          const skills = stage.skills.filter(matches);
          const done = stage.skills.filter((s) => completed.has(s.id)).length;
          return (
            <section key={stage.id} id={`stage-${stage.stage_order}`} className="relative pl-8 sm:pl-10">
              <span
                aria-hidden
                className="absolute left-3 top-8 bottom-0 w-px bg-border sm:left-4 no-print"
              />
              <span
                aria-hidden
                className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground sm:left-1"
              >
                {stage.stage_order}
              </span>
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="text-lg font-medium">{stage.stage_name}</h2>
                <span className="text-sm text-muted-foreground">
                  {done} of {stage.skills.length} done
                </span>
              </div>
              <div className="mt-3 grid gap-3">
                {skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skills match the current filters.</p>
                ) : (
                  skills.map((skill) => {
                    const isDone = completed.has(skill.id);
                    return (
                      <div key={skill.id} className="print-block">
                        <SkillCard
                          skill={skill}
                          action={
                            <button
                              type="button"
                              onClick={() => void toggle(skill.id)}
                              aria-pressed={isDone}
                              className={`no-print inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors ${
                                isDone
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Check className="h-3.5 w-3.5" />
                              {isDone ? "Done" : "Mark done"}
                            </button>
                          }
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
