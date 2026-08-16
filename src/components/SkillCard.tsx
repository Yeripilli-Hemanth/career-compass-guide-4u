import { ExternalLink } from "lucide-react";
import { DemandTag } from "@/components/DemandTag";
import type { Skill } from "@/lib/career-data";

export function SkillCard({
  skill,
  action,
}: {
  skill: Skill;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-surface rounded-2xl p-4 transition-shadow hover:shadow-elevated sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold sm:text-base">{skill.name}</h3>
          {skill.why_it_matters ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{skill.why_it_matters}</p>
          ) : null}
        </div>
        <DemandTag level={skill.demand_level} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        {skill.free_resource_url ? (
          <a
            href={skill.free_resource_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {skill.free_resource_label ?? "Free resource"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span />
        )}
        {action}
      </div>
    </div>
  );
}
