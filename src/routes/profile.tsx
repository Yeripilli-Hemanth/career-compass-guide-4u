import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { careersQuery, careerByIdQuery, userSkillsQuery, flatSkills, type Stage } from "@/lib/career-data";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Career compass" },
      { name: "description", content: "Update your stage, target career and review the skills you've completed." },
      { property: "og:title", content: "Your profile — Career compass" },
      { property: "og:description", content: "Manage your career roadmap settings and completed skills." },
    ],
  }),
  component: ProfilePage,
});

const stageLabels: Record<Stage, string> = {
  exploring: "Still exploring",
  studying: "Studying towards a role",
  working: "Working and pivoting",
};

function ProfilePage() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: careers = [] } = useQuery(careersQuery);
  const { data: career } = useQuery(careerByIdQuery(profile?.target_career_id));
  const { data: userSkills = [] } = useQuery(userSkillsQuery(user?.id));

  const [stage, setStage] = useState<Stage>("exploring");
  const [targetCareerId, setTargetCareerId] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.stage) setStage(profile.stage);
    setTargetCareerId(profile?.target_career_id ?? "");
  }, [profile?.stage, profile?.target_career_id]);

  if (!profile) return <PageShell>Loading…</PageShell>;

  const completedIds = new Set(
    userSkills.filter((s) => s.status === "completed").map((s) => s.skill_id),
  );
  const completedSkills = flatSkills(career).filter((s) => completedIds.has(s.id));

  async function save() {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ stage, target_career_id: targetCareerId || null })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Profile updated");
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-semibold">Your profile</h1>
      <p className="mt-2 text-muted-foreground">{profile.full_name ?? user?.email}</p>

      <section className="mt-8 space-y-2">
        <Label>Where you are right now</Label>
        {(Object.keys(stageLabels) as Stage[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStage(value)}
            className={`block w-full rounded-lg border p-3 text-left text-sm transition-colors ${
              stage === value ? "border-primary bg-accent" : "border-border bg-card hover:border-primary"
            }`}
          >
            {stageLabels[value]}
          </button>
        ))}
      </section>

      <section className="mt-6 space-y-1.5">
        <Label htmlFor="target">Target career</Label>
        <select
          id="target"
          value={targetCareerId}
          onChange={(e) => setTargetCareerId(e.target.value)}
          className="h-10 w-full max-w-sm rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="">Not chosen yet</option>
          {careers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      <Button className="mt-6" onClick={save}>
        Save changes
      </Button>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-muted-foreground">Completed skills</h2>
        {completedSkills.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing marked done yet.{" "}
            <Link to="/careers" className="text-primary hover:underline">
              Open a roadmap
            </Link>{" "}
            and start ticking skills off.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-card">
            {completedSkills.map((s) => (
              <li key={s.id} className="p-3 text-sm">
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
