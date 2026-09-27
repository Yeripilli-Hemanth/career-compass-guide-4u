import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, Check, Compass, GraduationCap } from "lucide-react";
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
      { property: "og:url", content: "https://career-compass-guide-4u.lovable.app/profile" },
    ],
    links: [{ rel: "canonical", href: "https://career-compass-guide-4u.lovable.app/profile" }],
  }),
  component: ProfilePage,
});

const stageLabels: Record<Stage, string> = {
  exploring: "Still exploring",
  studying: "Studying towards a role",
  working: "Working and pivoting",
};

const stageIcons = {
  exploring: Compass,
  studying: GraduationCap,
  working: BriefcaseBusiness,
} satisfies Record<Stage, typeof Compass>;

function ProfilePage() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<Stage>("exploring");
  const [targetCareerId, setTargetCareerId] = useState("");
  const { data: careers = [] } = useQuery(careersQuery);
  const { data: career } = useQuery(careerByIdQuery(targetCareerId || profile?.target_career_id));
  const { data: userSkills = [] } = useQuery(userSkillsQuery(user?.id));

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
  const totalSkills = flatSkills(career).length;
  const progress = totalSkills ? Math.round((completedSkills.length / totalSkills) * 100) : 0;
  const displayName = profile.full_name?.trim().split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

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
      <header>
        <h1 className="text-2xl font-semibold">Hey {displayName}, here's where you stand</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {career ? `Your ${career.name} roadmap progress` : "Choose a target career to start tracking progress"}
        </p>
        <div className="mt-5 max-w-2xl border-y border-border py-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">
              {completedSkills.length} of {totalSkills} skills done
            </span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-label="Roadmap skills completed"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <section className="mt-8">
        <Label>Where you are right now</Label>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {(Object.keys(stageLabels) as Stage[]).map((value) => {
            const Icon = stageIcons[value];
            const selected = stage === value;
            return (
              <Button
                key={value}
                type="button"
                variant="outline"
                aria-pressed={selected}
                onClick={() => setStage(value)}
                className={`relative h-auto min-h-28 items-start justify-start rounded-lg p-4 text-left transition-colors ${
                  selected
                    ? "border-primary bg-accent text-accent-foreground hover:bg-accent"
                    : "border-border bg-card hover:border-primary hover:bg-card"
                }`}
              >
                <span className="flex flex-col items-start gap-4 whitespace-normal">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="pr-5 text-sm font-medium">{stageLabels[value]}</span>
                </span>
                {selected ? (
                  <Check className="absolute right-3 top-3 h-4 w-4 text-primary" aria-hidden="true" />
                ) : null}
              </Button>
            );
          })}
        </div>
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
