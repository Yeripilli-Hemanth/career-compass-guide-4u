import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { careersQuery } from "@/lib/career-data";
import { Button } from "@/components/ui/button";

export function ExploringHome({ name }: { name: string | null }) {
  const { data: careers = [] } = useQuery(careersQuery);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-semibold">
          {name ? `Hi ${name.split(" ")[0]}, let's find what fits you` : "Let's find what fits you"}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          You don't need to decide anything today. Answer six quick questions and we'll suggest a few
          directions worth reading about.
        </p>
        <Button asChild className="mt-5">
          <Link to="/quiz">Take the interest quiz</Link>
        </Button>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Or just browse</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {careers.slice(0, 8).map((career) => (
            <Link
              key={career.id}
              to="/careers/$slug"
              params={{ slug: career.slug }}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <h3 className="text-sm font-medium">{career.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{career.short_description}</p>
            </Link>
          ))}
        </div>
        <Link to="/careers" className="mt-4 inline-block text-sm text-primary hover:underline">
          See all careers
        </Link>
      </section>
    </div>
  );
}
