import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { careersQuery } from "@/lib/career-data";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

const URL = "https://career-compass-guide-4u.lovable.app/guides/computer-science-career-paths";
const TITLE = "Computer science careers: 23 paths explained | Career Compass";
const DESCRIPTION =
  "A plain-language guide to computer science career paths — what each role does, how the fields differ, and how to pick one. Links to a free roadmap for all 23 roles.";

const GROUPS: { name: string; blurb: string; slugs: string[] }[] = [
  {
    name: "Core development",
    blurb:
      "Building software people use directly. The widest entry point into tech, and the group with the most junior openings.",
    slugs: [
      "frontend-developer",
      "backend-developer",
      "full-stack-developer",
      "mobile-app-developer",
      "game-developer",
    ],
  },
  {
    name: "Data and AI",
    blurb:
      "Working with data as the product: reporting on it, modelling it, moving it, or building on top of AI models.",
    slugs: [
      "data-analyst",
      "data-scientist",
      "machine-learning-engineer",
      "ai-engineer",
      "data-engineer",
    ],
  },
  {
    name: "Infrastructure and operations",
    blurb:
      "Keeping systems running and deployable. Usually easier to enter after some development or systems experience.",
    slugs: [
      "devops-engineer",
      "cloud-engineer",
      "site-reliability-engineer",
      "database-administrator",
    ],
  },
  {
    name: "Security",
    blurb: "Defending systems, and testing them by attacking them legally.",
    slugs: ["cybersecurity-analyst", "penetration-tester"],
  },
  {
    name: "Quality and product",
    blurb:
      "Deciding what gets built and confirming it works. Strong fit if you like software but prefer communication over long coding sessions.",
    slugs: ["qa-test-engineer", "product-manager", "business-analyst"],
  },
  {
    name: "Specialised and emerging",
    blurb:
      "Narrower fields with distinct toolchains. Rewarding if the domain genuinely interests you, harder to switch into cold.",
    slugs: [
      "blockchain-developer",
      "ar-vr-developer",
      "embedded-systems-engineer",
      "ui-ux-designer",
    ],
  },
];

export const Route = createFileRoute("/guides/computer-science-career-paths")({
  loader: ({ context }) => context.queryClient.ensureQueryData(careersQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Computer science careers: 23 paths explained",
          description: DESCRIPTION,
          url: URL,
          mainEntityOfPage: URL,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Guides",
              item: "https://career-compass-guide-4u.lovable.app/guides/computer-science-career-paths",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Computer science career paths",
              item: URL,
            },
          ],
        }),
      },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  const { data: careers } = useSuspenseQuery(careersQuery);
  const bySlug = new Map(careers.map((c) => [c.slug, c]));

  return (
    <PageShell>
      <article className="max-w-3xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Computer science careers: 23 paths explained
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          "Computer science" is not one job. It splits into a handful of families that share a
          foundation — programming, data structures, how the web works — and then diverge sharply in
          the day-to-day work. This guide explains each family in plain language so you can narrow
          down before you commit study time, and links to a free stage-by-stage roadmap for every
          role.
        </p>

        <h2 className="mt-10 text-lg font-medium">How to use this guide</h2>
        <p className="mt-2 text-muted-foreground">
          Read the group descriptions first and rule out the ones that clearly do not appeal to you.
          Then open two or three role roadmaps and compare the stage 1 and stage 2 skills — the
          earliest skills tell you what the first year of learning actually feels like, which is a
          better test of fit than a job title. Every roadmap on this site lists skills by stage,
          tags each one by current demand, and points to a free resource.
        </p>

        {GROUPS.map((group) => (
          <section key={group.name} className="mt-10">
            <h2 className="text-lg font-medium">{group.name}</h2>
            <p className="mt-2 text-muted-foreground">{group.blurb}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {group.slugs.map((slug) => {
                const career = bySlug.get(slug);
                if (!career) return null;
                return (
                  <Link
                    key={slug}
                    to="/careers/$slug"
                    params={{ slug }}
                    className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
                  >
                    <h3 className="text-sm font-medium">{career.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {career.short_description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <h2 className="mt-12 text-lg font-medium">Choosing between the groups</h2>
        <p className="mt-2 text-muted-foreground">
          If you want to see the result of your work on a screen quickly, start in core development.
          If you enjoy statistics and questions more than interfaces, start in data and AI — data
          analyst is the shallowest entry point, and machine learning or AI engineering builds on
          top of it. Infrastructure, security and reliability roles reward people who like
          systems, debugging and automation, and are commonly entered after a first development or
          support job rather than straight from college. Quality and product roles suit people who
          are technical but energised by coordination and communication.
        </p>
        <p className="mt-3 text-muted-foreground">
          The overlap between these groups is large. Almost every path begins with the same
          foundation, so an early choice is a direction, not a life sentence — switching after a
          year mostly means replacing stage 3 and stage 4 skills, not starting again.
        </p>

        <h2 className="mt-12 text-lg font-medium">Next step</h2>
        <p className="mt-2 text-muted-foreground">
          Not sure which group fits? Take the short interest quiz — it suggests two or three roles
          based on how you like to work.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/quiz">Take the interest quiz</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/careers">Browse all careers</Link>
          </Button>
        </div>
      </article>
    </PageShell>
  );
}
