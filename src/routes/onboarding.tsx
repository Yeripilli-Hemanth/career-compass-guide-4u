import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { careersQuery, type Stage } from "@/lib/career-data";
import { useAuth } from "@/hooks/useAuth";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your roadmap — Career compass" },
      { name: "description", content: "Answer three quick questions so your career roadmap fits where you are today." },
      { property: "og:title", content: "Set up your roadmap — Career compass" },
      { property: "og:description", content: "Three quick questions to personalise your career roadmap." },
    ],
  }),
  component: Onboarding,
});

const stageOptions: { value: Stage; label: string; hint: string }[] = [
  { value: "exploring", label: "I'm still figuring out what to do", hint: "School or early college, nothing decided yet" },
  { value: "studying", label: "I've picked a direction and I'm studying for it", hint: "College student or self-learner working towards a role" },
  { value: "working", label: "I'm working and want to switch or level up", hint: "Employed and moving into a new role" },
];

function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: careers = [] } = useQuery(careersQuery);

  const [stage, setStage] = useState<Stage | null>(null);
  const [currentRole, setCurrentRole] = useState("");
  const [targetCareerId, setTargetCareerId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  async function save() {
    if (!user || !stage) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        stage,
        current_role: stage === "working" ? currentRole || null : null,
        target_career_id: stage === "exploring" ? null : targetCareerId || null,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    navigate({ to: "/" });
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Which sounds like you right now?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This decides what your home screen shows. You can change it any time.
          </p>
          <div className="mt-4 space-y-2">
            {stageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStage(option.value)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  stage === option.value ? "border-primary bg-accent" : "border-border bg-card hover:border-primary"
                }`}
              >
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{option.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium">Field of interest</h2>
          <div className="mt-2 flex gap-2">
            <span className="rounded-md border border-primary bg-accent px-3 py-1.5 text-sm text-accent-foreground">
              Computer science
            </span>
            <span className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground">
              Something else — coming soon
            </span>
          </div>
        </div>

        {stage === "working" ? (
          <div className="space-y-1.5">
            <Label htmlFor="role">What do you do today?</Label>
            <Input
              id="role"
              placeholder="e.g. support engineer"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
            />
          </div>
        ) : null}

        {stage === "studying" || stage === "working" ? (
          <div className="space-y-1.5">
            <Label htmlFor="target">Which role are you targeting?</Label>
            <select
              id="target"
              value={targetCareerId}
              onChange={(e) => setTargetCareerId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="">Choose a role</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <Button onClick={save} disabled={!stage || busy} size="lg">
          Continue
        </Button>
      </div>
    </PageShell>
  );
}
