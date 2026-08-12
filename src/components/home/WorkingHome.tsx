import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { careerByIdQuery, userSkillsQuery, flatSkills } from "@/lib/career-data";
import { useAuth } from "@/hooks/useAuth";
import { DemandTag } from "@/components/DemandTag";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/hooks/useProfile";

export function WorkingHome({ profile }: { profile: Profile }) {
  const { user } = useAuth();
  const { data: career } = useQuery(careerByIdQuery(profile.target_career_id));
  const { data: userSkills = [] } = useQuery(userSkillsQuery(user?.id));

  if (!profile.target_career_id) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-lg font-semibold">Choose the role you're moving towards</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a target role and we'll compare it against the skills you already have.
        </p>
        <Button asChild className="mt-4">
          <Link to="/profile">Choose a target role</Link>
        </Button>
      </div>
    );
  }

  if (!career) return <p className="text-muted-foreground">Loading your gap analysis…</p>;

  const have = new Set(userSkills.filter((s) => s.status === "completed").map((s) => s.skill_id));
  const all = flatSkills(career);
  const missing = all.filter((s) => !have.has(s.id));
  const prioritised = [...missing].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 } as const;
    return rank[a.demand_level] - rank[b.demand_level];
  });

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-muted-foreground">
          {profile.current_role ? `From ${profile.current_role} to` : "Target role"}
        </p>
        <h1 className="text-2xl font-semibold">{career.name}</h1>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{have.size}</p>
          <p className="mt-1 text-sm text-muted-foreground">skills you already have</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{missing.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">gap to close</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Missing skills, most in demand first</h2>
        {have.size === 0 ? (
          <p className="mb-3 text-sm text-muted-foreground">
            Tell us what you already know and this list gets a lot shorter.
          </p>
        ) : null}
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {prioritised.slice(0, 10).map((skill) => (
            <li key={skill.id} className="flex items-center justify-between gap-3 p-3">
              <span className="text-sm">{skill.name}</span>
              <DemandTag level={skill.demand_level} />
            </li>
          ))}
        </ul>
      </section>

      <Button asChild>
        <Link to="/plan">
          {profile.target_timeframe ? "Update your catch-up plan" : "Generate a catch-up plan"}
        </Link>
      </Button>
    </div>
  );
}
