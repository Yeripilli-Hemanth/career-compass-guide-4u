import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { careerByIdQuery, userSkillsQuery, flatSkills } from "@/lib/career-data";
import { useAuth } from "@/hooks/useAuth";
import { SkillCard } from "@/components/SkillCard";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/hooks/useProfile";

export function StudyingHome({ profile }: { profile: Profile }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: career } = useQuery(careerByIdQuery(profile.target_career_id));
  const { data: userSkills = [] } = useQuery(userSkillsQuery(user?.id));

  if (!profile.target_career_id) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-lg font-semibold">Pick the role you're working towards</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a target career and your roadmap starts tracking progress from the first skill.
        </p>
        <Button asChild className="mt-4">
          <Link to="/profile">Choose a target career</Link>
        </Button>
      </div>
    );
  }

  if (!career) return <p className="text-muted-foreground">Loading your roadmap…</p>;

  const completed = new Set(
    userSkills.filter((s) => s.status === "completed").map((s) => s.skill_id),
  );
  const all = flatSkills(career);
  const percent = all.length ? Math.round((completed.size / all.length) * 100) : 0;
  const currentStage =
    career.career_stages.find((stage) => stage.skills.some((s) => !completed.has(s.id))) ??
    career.career_stages[career.career_stages.length - 1];
  const upNext = currentStage.skills.find((s) => !completed.has(s.id));

  async function markCompleted(skillId: string) {
    if (!user) return;
    await supabase
      .from("user_skills")
      .upsert({ user_id: user.id, skill_id: skillId, status: "completed", updated_at: new Date().toISOString() });
    queryClient.invalidateQueries({ queryKey: ["user-skills", user.id] });
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-muted-foreground">Working towards</p>
        <h1 className="text-2xl font-semibold">{career.name}</h1>
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Stage {currentStage.stage_order} of {career.career_stages.length} · {currentStage.stage_name}
            </span>
            <span className="text-muted-foreground">{percent}% complete</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-secondary">
            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {completed.size} of {all.length} skills marked done
          </p>
        </div>
      </section>

      {upNext ? (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Up next</h2>
          <SkillCard
            skill={upNext}
            action={
              <Button size="sm" onClick={() => markCompleted(upNext.id)}>
                Mark as done
              </Button>
            }
          />
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm">
            You've marked every skill on this roadmap as done. Explore a specialisation next.
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Completed skills</h2>
        {completed.size === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing here yet — finish the skill above and it lands in this list.
          </p>
        ) : (
          <ul className="space-y-2">
            {all
              .filter((s) => completed.has(s.id))
              .map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {s.name}
                </li>
              ))}
          </ul>
        )}
        <Link
          to="/careers/$slug"
          params={{ slug: career.slug }}
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          View the full roadmap
        </Link>
      </section>
    </div>
  );
}
