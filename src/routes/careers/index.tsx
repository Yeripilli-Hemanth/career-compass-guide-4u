import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { careersQuery } from "@/lib/career-data";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";

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
      <h1 className="text-2xl font-semibold">Careers in computer science</h1>
      <p className="mt-2 text-muted-foreground">
        Every roadmap has four stages, in-demand skills and free resources.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        New here? Read the{" "}
        <Link
          to="/guides/computer-science-career-paths"
          className="text-primary hover:underline"
        >
          guide to computer science career paths
        </Link>{" "}
        to narrow down first.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search careers"
          aria-label="Search careers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <span className="rounded-md border border-primary bg-accent px-3 py-1.5 text-sm text-accent-foreground">
          Computer science
        </span>
        <span className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground">
          Other fields — coming soon
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No career matches that yet. Try a shorter search, like "data".
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {filtered.map((career) => (
            <Link
              key={career.id}
              to="/careers/$slug"
              params={{ slug: career.slug }}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <h2 className="text-sm font-medium">{career.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{career.short_description}</p>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
