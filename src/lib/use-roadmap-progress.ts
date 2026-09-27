import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { userSkillsQuery } from "@/lib/career-data";

const storageKey = (slug: string) => `cc-progress:${slug}`;

/**
 * Tracks completed skills for a roadmap.
 * Signed in -> user_skills in the backend. Signed out -> local browser storage.
 */
export function useRoadmapProgress(slug: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [local, setLocal] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug));
      setLocal(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setLocal([]);
    }
    setHydrated(true);
  }, [slug]);

  const remote = useQuery(userSkillsQuery(user?.id));

  const completed = useMemo(() => {
    if (user) {
      return new Set((remote.data ?? []).filter((r) => r.status === "completed").map((r) => r.skill_id));
    }
    return new Set(hydrated ? local : []);
  }, [user, remote.data, local, hydrated]);

  const toggle = useCallback(
    async (skillId: string) => {
      const done = completed.has(skillId);
      if (!user) {
        setLocal((prev) => {
          const next = done ? prev.filter((id) => id !== skillId) : [...prev, skillId];
          try {
            window.localStorage.setItem(storageKey(slug), JSON.stringify(next));
          } catch {
            /* storage unavailable */
          }
          return next;
        });
        return;
      }
      await supabase.from("user_skills").upsert(
        {
          user_id: user.id,
          skill_id: skillId,
          status: done ? "not_started" : "completed",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,skill_id" },
      );
      await queryClient.invalidateQueries({ queryKey: ["user-skills", user.id] });
    },
    [completed, user, slug, queryClient],
  );

  return { completed, toggle, isSignedIn: !!user };
}
