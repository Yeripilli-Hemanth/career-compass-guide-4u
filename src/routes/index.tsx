import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { careersQuery } from "@/lib/career-data";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { ExploringHome } from "@/components/home/ExploringHome";
import { StudyingHome } from "@/components/home/StudyingHome";
import { WorkingHome } from "@/components/home/WorkingHome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Career compass — free CSE career roadmaps" },
      {
        name: "description",
        content:
          "Find out which tech skills are in demand and how to build them, stage by stage, with free resources. Built for students and early professionals.",
      },
      { property: "og:title", content: "Career compass — free CSE career roadmaps" },
      {
        property: "og:description",
        content:
          "Personalised roadmaps for 23 computer science careers, with in-demand skills and free learning resources.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const { profile, isLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading && profile && !profile.stage) {
      navigate({ to: "/onboarding" });
    }
  }, [user, profile, isLoading, navigate]);

  if (loading) return null;
  if (!user) return <Landing />;
  if (isLoading || !profile) return <PageShell>Loading…</PageShell>;

  return (
    <PageShell>
      {profile.stage === "exploring" ? <ExploringHome name={profile.full_name} /> : null}
      {profile.stage === "studying" ? <StudyingHome profile={profile} /> : null}
      {profile.stage === "working" ? <WorkingHome profile={profile} /> : null}
    </PageShell>
  );
}

function Landing() {
  const { data: careers = [] } = useQuery(careersQuery);
  return (
    <PageShell>
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Know which skills matter, and how to build them
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Career compass turns {careers.length || 23} computer science careers into clear, stage-by-stage
          roadmaps — every skill tagged by demand, every resource free.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/auth">Get your roadmap</Link>
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">
          Or{" "}
          <Link to="/careers" className="text-primary hover:underline">
            browse the careers first
          </Link>
          .
        </p>
      </section>

      <section className="mt-14 grid gap-3 sm:grid-cols-3">
        {[
          {
            title: "Still exploring",
            body: "A short interest quiz and careers to read about, with no pressure to decide.",
          },
          {
            title: "Studying towards a role",
            body: "A progress tracker that always tells you the single next skill to learn.",
          },
          {
            title: "Working and pivoting",
            body: "A gap analysis between what you already know and what the target role needs.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-medium">{item.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
