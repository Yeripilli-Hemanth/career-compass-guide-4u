import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { careerIcon } from "@/lib/career-icons";
import type { Career } from "@/lib/career-data";

export function CareerCard({ career, tags }: { career: Career; tags?: string[] }) {
  const Icon = careerIcon(career.name);
  const isHighDemand = ["ai-engineer", "data-analyst", "cybersecurity-analyst"].includes(
    career.slug,
  );
  return (
    <Link
      to="/careers/$slug"
      params={{ slug: career.slug }}
      className="group card-surface relative flex h-full flex-col rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated focus-visible:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex items-center gap-2">
          {isHighDemand ? (
            <span className="rounded-full bg-demand-high px-2 py-0.5 text-xs font-medium text-demand-high-foreground">
              High demand
            </span>
          ) : null}
          <ArrowUpRight
            className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </div>
      </div>
      <h3 className="mt-4 text-base font-semibold">{career.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {career.short_description}
      </p>
      {tags?.length ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}