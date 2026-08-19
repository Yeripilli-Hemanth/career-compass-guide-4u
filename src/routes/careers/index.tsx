import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { careersQuery } from "@/lib/career-data";
import { PageShell } from "@/components/PageShell";
import { CareerCard } from "@/components/CareerCard";

export const Route = createFileRoute("/careers/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(careersQuery),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Browse tech careers — Career compass" },
      {
        name: "description",
        content:
          "Browse 23 computer science careers, from frontend developer to AI engineer, each with a full skill roadmap and free resources.",
      },
      { property: "og:title", content: "Browse tech careers — Career compass" },
      {
        property: "og:description",
        content: "23 computer science career roadmaps with in-demand skills and free learning resources.",
      },
      { property: "og:url", content: "https://career-compass-guide-4u.lovable.app/careers" },
    ],
    links: [{ rel: "canonical", href: "https://career-compass-guide-4u.lovable.app/careers" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Browse tech careers",
          url: "https://career-compass-guide-4u.lovable.app/careers",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: (loaderData ?? []).map((career, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: career.name,
              url: `https://career-compass-guide-4u.lovable.app/careers/${career.slug}`,
            })),
          },
        }),
      },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  const { data: careers } = useSuspenseQuery(careersQuery);
  const [search, setSearch] = useState("");

  const filtered = careers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageShell>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Careers in computer science</h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Every roadmap has four stages, in-demand skills and free resources.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        New here? Read the{" "}
        <Link
          to="/guides/computer-science-career-paths"
          className="text-primary hover:underline"
        >
          guide to computer science career paths
        </Link>{" "}
        to narrow down first, or the{" "}
        <Link to="/guides/entry-level-tech-jobs" className="text-primary hover:underline">
          guide to entry level tech jobs
        </Link>{" "}
        if you want a first job soon.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search careers"
            aria-label="Search careers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="card-surface h-12 w-full rounded-xl pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50"
          />
        </div>
        <span className="inline-flex min-h-10 items-center rounded-full border border-primary/40 bg-accent px-3.5 text-sm font-medium text-accent-foreground">
          Computer science
        </span>
        <span className="inline-flex min-h-10 items-center rounded-full border border-border px-3.5 text-sm text-muted-foreground">
          Other fields — coming soon
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No career matches that yet. Try a shorter search, like "data".
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((career) => (
            <CareerCard key={career.id} career={career} tags={[career.field, "4 stages"]} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
