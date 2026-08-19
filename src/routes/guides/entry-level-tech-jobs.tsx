import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { careersQuery } from "@/lib/career-data";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

const URL = "https://career-compass-guide-4u.lovable.app/guides/entry-level-tech-jobs";
const TITLE = "Entry level tech jobs: how to get your first one | Career Compass";
const DESCRIPTION =
  "Which entry level tech jobs are realistic without experience, what each one asks for, and the free skills roadmap to reach it. Written for students and career switchers.";

const JOBS: {
  slug: string;
  heading: string;
  whoItSuits: string;
  firstSkills: string;
  proof: string;
}[] = [
  {
    slug: "frontend-developer",
    heading: "Junior frontend developer",
    whoItSuits:
      "You like seeing your work on screen the same day you write it, and you would rather design layouts than tune databases.",
    firstSkills: "HTML, CSS, JavaScript, then one framework such as React.",
    proof: "Three deployed pages or small apps, each with a public link and a short README.",
  },
  {
    slug: "backend-developer",
    heading: "Junior backend developer",
    whoItSuits:
      "You prefer logic, data and correctness to visual polish, and you enjoy tracing why something broke.",
    firstSkills: "One language (Python, Java or Node), SQL, HTTP and REST APIs.",
    proof: "A deployed API with authentication and a real database behind it.",
  },
  {
    slug: "data-analyst",
    heading: "Junior data analyst",
    whoItSuits:
      "You like questions and spreadsheets more than building software, and you can explain a number to a non-technical person.",
    firstSkills: "Spreadsheets, SQL, one visualisation tool, basic statistics.",
    proof: "Two or three dashboards built on public datasets, with the findings written up.",
  },
  {
    slug: "qa-test-engineer",
    heading: "QA / test engineer",
    whoItSuits:
      "You are methodical, notice details others miss, and want a technical role that does not require years of coding first.",
    firstSkills: "Test case design, bug reporting, SQL basics, then automation with Selenium or Playwright.",
    proof: "A public test suite for an open-source project or a documented bug report set.",
  },
  {
    slug: "ui-ux-designer",
    heading: "Junior UI/UX designer",
    whoItSuits:
      "You care about how people use a product and can defend a layout decision with a reason.",
    firstSkills: "Design fundamentals, Figma, user research basics, accessibility.",
    proof: "A portfolio of two to three case studies showing the problem, not just the final screens.",
  },
  {
    slug: "cybersecurity-analyst",
    heading: "Entry level cybersecurity analyst",
    whoItSuits:
      "You like defensive, investigative work and are comfortable with networks and operating systems.",
    firstSkills: "Networking, Linux, security fundamentals, log analysis.",
    proof: "A home lab writeup plus a free foundational certification.",
  },
  {
    slug: "cloud-engineer",
    heading: "Junior cloud engineer",
    whoItSuits:
      "You enjoy automation and infrastructure more than product features. Often entered after a support or development role.",
    firstSkills: "Linux, networking, one cloud provider's core services, scripting.",
    proof: "An infrastructure-as-code project deployed on a free cloud tier.",
  },
  {
    slug: "mobile-app-developer",
    heading: "Junior mobile app developer",
    whoItSuits:
      "You want a narrow, deep platform and something you can hand to a friend to try.",
    firstSkills: "Kotlin or Swift (or React Native), UI layout, local storage, APIs.",
    proof: "One published app, or a demo video plus source code.",
  },
];

export const Route = createFileRoute("/guides/entry-level-tech-jobs")({
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
          headline: "Entry level tech jobs: how to get your first one",
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
              name: "Entry level tech jobs",
              item: URL,
            },
          ],
        }),
      },
    ],
  }),
  component: EntryLevelGuide,
});

function EntryLevelGuide() {
  const { data: careers } = useSuspenseQuery(careersQuery);
  const bySlug = new Map(careers.map((c) => [c.slug, c]));

  return (
    <PageShell>
      <article className="max-w-3xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Entry level tech jobs: how to get your first one
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Most tech job listings ask for experience you cannot have yet. A smaller set of roles is
          genuinely open to people with no professional background, as long as you can show work.
          This guide covers the entry level tech jobs worth targeting first, what each one actually
          asks for, and the free stage-by-stage roadmap that gets you there.
        </p>

        <h2 className="mt-10 text-lg font-medium">What "entry level" really means</h2>
        <p className="mt-2 text-muted-foreground">
          Employers hiring at this level are not looking for experience — they are looking for
          evidence that you can learn and finish things. In practice that means three signals:
          foundational skills you can demonstrate live, two or three finished projects with public
          links, and the ability to explain your decisions out loud. A degree helps with screening,
          but a portfolio is what gets you through the technical conversation.
        </p>
        <p className="mt-3 text-muted-foreground">
          Roles differ a lot in how open they are. Frontend, data analysis, QA and design hire
          juniors regularly. Infrastructure, security and machine learning roles usually expect a
          first job elsewhere before they hire — you can still target them, just plan a two-step
          route through an adjacent role.
        </p>

        <h2 className="mt-12 text-lg font-medium">Entry level roles worth targeting</h2>
        <div className="mt-4 space-y-4">
          {JOBS.map((job) => {
            const career = bySlug.get(job.slug);
            return (
              <section
                key={job.slug}
                className="rounded-lg border border-border bg-card p-5"
              >
                <h3 className="text-base font-medium">{job.heading}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{job.whoItSuits}</p>
                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium">First skills:</dt>
                    <dd className="text-muted-foreground">{job.firstSkills}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium">Proof to show:</dt>
                    <dd className="text-muted-foreground">{job.proof}</dd>
                  </div>
                </dl>
                {career ? (
                  <Link
                    to="/careers/$slug"
                    params={{ slug: job.slug }}
                    className="mt-3 inline-block text-sm text-primary hover:underline"
                  >
                    See the {career.name.toLowerCase()} roadmap
                  </Link>
                ) : null}
              </section>
            );
          })}
        </div>

        <h2 className="mt-12 text-lg font-medium">A realistic first-year plan</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>
            Pick one role and open its roadmap. Work through stage 1 completely before comparing
            yourself to anyone else.
          </li>
          <li>
            Build one small project per stage. Finished and deployed beats ambitious and abandoned.
          </li>
          <li>
            Write down what each project does and one problem you solved in it — this becomes your
            interview material.
          </li>
          <li>
            Start applying at stage 3, not stage 4. Interview feedback is faster than more tutorials.
          </li>
          <li>
            Treat internships, freelance work and open-source contributions as equivalent
            experience, because most employers do.
          </li>
        </ol>

        <h2 className="mt-12 text-lg font-medium">Next step</h2>
        <p className="mt-2 text-muted-foreground">
          If none of the roles above clearly stands out, take the short interest quiz — it suggests
          two or three based on how you prefer to work. If you want the wider picture first, read
          the guide to all 23 computer science career paths.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/quiz">Take the interest quiz</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/computer-science-career-paths">All career paths guide</Link>
          </Button>
        </div>
      </article>
    </PageShell>
  );
}