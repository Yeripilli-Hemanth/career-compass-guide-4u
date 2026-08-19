import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Compass, Sparkles, Target } from "lucide-react";
import { careersQuery } from "@/lib/career-data";
import { CareerCard } from "@/components/CareerCard";
import { CareerSearch } from "@/components/CareerSearch";
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
      <section className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Free forever · {careers.length || 23} computer science roadmaps
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
          Know which skills matter, and how to build them
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Career compass turns {careers.length || 23} computer science careers into clear, stage-by-stage
          roadmaps — every skill tagged by demand, every resource free.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="min-h-12 rounded-xl px-6 text-base">
            <Link to="/quiz">
              <Compass className="mr-2 h-4.5 w-4.5" aria-hidden="true" />
              Take the interest quiz
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-h-12 rounded-xl px-6 text-base">
            <Link to="/auth">
              <Target className="mr-2 h-4.5 w-4.5" aria-hidden="true" />
              Get your roadmap
            </Link>
          </Button>
        </div>

        <div className="mt-6">
          <CareerSearch />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          New to this? Read the{" "}
          <Link to="/guides/computer-science-career-paths" className="text-primary hover:underline">
            guide to computer science career paths
          </Link>
          {" "}or the{" "}
          <Link to="/guides/entry-level-tech-jobs" className="text-primary hover:underline">
            guide to entry level tech jobs
          </Link>
          .
        </p>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
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
          <div key={item.title} className="card-surface rounded-2xl p-5">
            <h2 className="text-sm font-semibold">{item.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Popular roadmaps</h2>
          <Link to="/careers" className="text-sm font-medium text-primary hover:underline">
            Browse all
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {careers.slice(0, 6).map((career) => (
            <CareerCard key={career.id} career={career} tags={[career.field, "4 stages", "Free resources"]} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
