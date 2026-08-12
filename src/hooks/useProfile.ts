import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Stage } from "@/lib/career-data";

export type Profile = {
  id: string;
  full_name: string | null;
  stage: Stage | null;
  current_role: string | null;
  target_career_id: string | null;
  target_timeframe: string | null;
};

export function useProfile() {
  const { user, loading } = useAuth();
  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, stage, current_role, target_career_id, target_timeframe")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
  return { ...query, authLoading: loading, profile: query.data ?? null };
}
