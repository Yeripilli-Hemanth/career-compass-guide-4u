import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { careerByIdQuery, userSkillsQuery, flatSkills } from "@/lib/career-data";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { PageShell } from "@/components/PageShell";
import { DemandTag } from "@/components/DemandTag";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Skill gap plan — Career compass" },
      {
        name: "description",
        content: "Compare the skills you already have against your target tech role and get a time-boxed catch-up plan.",
      },
      { property: "og:title", content: "Skill gap plan — Career compass" },
      { property: "og:description", content: "See exactly which skills stand between you and your target role." },
    ],
  }),
  component: PlanPage,
});

const timeframes = ["3 months", "6 months", "12 months"];

function PlanPage() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: career } = useQuery(careerByIdQuery(profile?.target_career_id));
  const { data: userSkills = [] } = useQuery(userSkillsQuery(user?.id));

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [timeframe, setTimeframe] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    setSelected(new Set(userSkills.filter((s) => s.status === "completed").map((s) => s.skill_id)));
  }, [userSkills]);

  useEffect(() => {
    if (profile?.target_timeframe) setTimeframe(profile.target_timeframe);
  }, [profile?.target_timeframe]);

  const all = useMemo(() => flatSkills(career), [career]);
  const missing = all.filter((s) => !selected.has(s.id));

  if (!profile) return <PageShell>Loading…</PageShell>;

  if (!profile.target_career_id) {
    return (
      <PageShell>
        <h1 className="text-2xl font-semibold">Pick a target role first</h1>
        <p className="mt-2 text-muted-foreground">
          A gap plan needs something to compare against.
        </p>
        <Button asChild className="mt-4">
          <Link to="/profile">Choose a target role</Link>
        </Button>
      </PageShell>
    );
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaved(false);
  }

  async function savePlan() {
    if (!user) return;
    const rows = all.map((s) => ({
      user_id: user.id,
      skill_id: s.id,
      status: selected.has(s.id) ? ("completed" as const) : ("not_started" as const),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("user_skills").upsert(rows);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (timeframe) {
      await supabase.from("profiles").update({ target_timeframe: timeframe }).eq("id", user.id);
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    }
    queryClient.invalidateQueries({ queryKey: ["user-skills", user.id] });
    setSaved(true);
    toast.success("Your catch-up plan is saved");
  }

  const perMonth = timeframe ? Math.ceil(missing.length / parseInt(timeframe, 10)) : null;

  return (
    <PageShell>
      <h1 className="text-2xl font-semibold">Your gap to {career?.name.toLowerCase()}</h1>
      <p className="mt-2 text-muted-foreground">
        Tick everything you can already do at work. We'll prioritise what's left by demand.
      </p>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{selected.size}</p>
          <p className="mt-1 text-sm text-muted-foreground">skills you already have</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{missing.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">gap to close</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted-foreground">Skills for this role</h2>
        <div className="mt-3 space-y-6">
          {career?.career_stages.map((stage) => (
            <div key={stage.id}>
              <h3 className="text-sm font-medium">
                Stage {stage.stage_order} · {stage.stage_name}
              </h3>
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-card">
                {stage.skills.map((skill) => (
                  <li key={skill.id} className="flex items-center gap-3 p-3">
                    <Checkbox
                      id={skill.id}
                      checked={selected.has(skill.id)}
                      onCheckedChange={() => toggle(skill.id)}
                    />
                    <label htmlFor={skill.id} className="flex-1 text-sm">
                      {skill.name}
                    </label>
                    <DemandTag level={skill.demand_level} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted-foreground">Close the gap in</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {timeframes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                timeframe === t ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {perMonth ? (
          <p className="mt-3 text-sm text-muted-foreground">
            That's about {perMonth} skill{perMonth === 1 ? "" : "s"} a month, starting with the high-demand
            ones.
          </p>
        ) : null}
      </section>

      <Button className="mt-6" onClick={savePlan}>
        {saved ? "Plan saved" : "Save my catch-up plan"}
      </Button>
    </PageShell>
  );
}
