import { supabase } from "@/integrations/supabase/client";

export type DemandLevel = "high" | "medium" | "low";
export type Stage = "exploring" | "studying" | "working";

export type Skill = {
  id: string;
  name: string;
  why_it_matters: string | null;
  demand_level: DemandLevel;
  free_resource_url: string | null;
  free_resource_label: string | null;
  skill_order: number;
  career_stage_id: string;
};

export type CareerStage = {
  id: string;
  stage_order: number;
  stage_name: string;
  skills: Skill[];
};

export type Career = {
  id: string;
  name: string;
  slug: string;
  field: string;
  short_description: string | null;
};

export type CareerDetail = Career & { career_stages: CareerStage[] };

export const careersQuery = {
  queryKey: ["careers"],
  queryFn: async (): Promise<Career[]> => {
    const { data, error } = await supabase
      .from("careers")
      .select("id, name, slug, field, short_description")
      .order("name");
    if (error) throw error;
    return data as Career[];
  },
  staleTime: 5 * 60 * 1000,
};

export const careerDetailQuery = (slug: string) => ({
  queryKey: ["career", slug],
  queryFn: async (): Promise<CareerDetail | null> => {
    const { data, error } = await supabase
      .from("careers")
      .select(
        "id, name, slug, field, short_description, career_stages(id, stage_order, stage_name, skills(id, name, why_it_matters, demand_level, free_resource_url, free_resource_label, skill_order, career_stage_id))",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const detail = data as unknown as CareerDetail;
    detail.career_stages = [...detail.career_stages]
      .sort((a, b) => a.stage_order - b.stage_order)
      .map((s) => ({ ...s, skills: [...s.skills].sort((a, b) => a.skill_order - b.skill_order) }));
    return detail;
  },
  staleTime: 5 * 60 * 1000,
});

export const careerByIdQuery = (id: string | null | undefined) => ({
  queryKey: ["career-by-id", id],
  enabled: !!id,
  queryFn: async (): Promise<CareerDetail | null> => {
    if (!id) return null;
    const { data, error } = await supabase
      .from("careers")
      .select(
        "id, name, slug, field, short_description, career_stages(id, stage_order, stage_name, skills(id, name, why_it_matters, demand_level, free_resource_url, free_resource_label, skill_order, career_stage_id))",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const detail = data as unknown as CareerDetail;
    detail.career_stages = [...detail.career_stages]
      .sort((a, b) => a.stage_order - b.stage_order)
      .map((s) => ({ ...s, skills: [...s.skills].sort((a, b) => a.skill_order - b.skill_order) }));
    return detail;
  },
});

export const userSkillsQuery = (userId: string | undefined) => ({
  queryKey: ["user-skills", userId],
  enabled: !!userId,
  queryFn: async () => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from("user_skills")
      .select("skill_id, status")
      .eq("user_id", userId);
    if (error) throw error;
    return data as { skill_id: string; status: "not_started" | "in_progress" | "completed" }[];
  },
});

export function flatSkills(career: CareerDetail | null | undefined): Skill[] {
  if (!career) return [];
  return career.career_stages.flatMap((s) => s.skills);
}
