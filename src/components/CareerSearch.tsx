import { useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { careersQuery } from "@/lib/career-data";
import { careerIcon } from "@/lib/career-icons";

export function CareerSearch({ placeholder = "Search a career, e.g. data analyst" }: { placeholder?: string }) {
  const { data: careers = [] } = useQuery(careersQuery);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return careers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.short_description ?? "").toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [careers, value]);

  const go = (slug: string) => {
    setOpen(false);
    void navigate({ to: "/careers/$slug", params: { slug } });
  };

  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="career-search" className="sr-only">
        Search careers
      </label>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id="career-search"
        type="search"
        aria-label="Search careers"
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-controls="career-search-results"
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (!matches.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % matches.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + matches.length) % matches.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            const picked = matches[active];
            if (picked) go(picked.slug);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="card-surface h-13 w-full rounded-2xl py-3.5 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50"
      />

      {open && matches.length > 0 ? (
        <ul
          id="career-search-results"
          role="listbox"
          aria-label="Career suggestions"
          className="card-surface absolute z-30 mt-2 w-full overflow-hidden rounded-2xl p-1.5 shadow-elevated"
        >
          {matches.map((c, i) => {
            const Icon = careerIcon(c.name);
            return (
              <li key={c.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={() => {
                    if (blurTimer.current) clearTimeout(blurTimer.current);
                  }}
                  onClick={() => go(c.slug)}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    i === active ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="truncate font-medium text-foreground">{c.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}