import type { DemandLevel } from "@/lib/career-data";

const styles: Record<DemandLevel, string> = {
  high: "bg-demand-high text-demand-high-foreground",
  medium: "bg-demand-medium text-demand-medium-foreground",
  low: "bg-demand-low text-demand-low-foreground",
};

export function DemandTag({ level }: { level: DemandLevel }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[level]}`}
    >
      {level} demand
    </span>
  );
}
