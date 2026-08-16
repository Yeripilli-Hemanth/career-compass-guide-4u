import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const linkBase =
  "inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const items = (
    <>
      <Link
        to="/careers"
        className={linkBase}
        activeProps={{ className: "text-foreground bg-secondary" }}
        onClick={() => setOpen(false)}
      >
        Careers
      </Link>
      <Link
        to="/guides/computer-science-career-paths"
        className={linkBase}
        activeProps={{ className: "text-foreground bg-secondary" }}
        onClick={() => setOpen(false)}
      >
        Guide
      </Link>
      {user ? (
        <>
          <Link
            to="/profile"
            className={linkBase}
            activeProps={{ className: "text-foreground bg-secondary" }}
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className={linkBase}
          >
            Sign out
          </button>
        </>
      ) : (
        <Link
          to="/auth"
          className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={() => setOpen(false)}
        >
          Sign in
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Compass className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          Career compass
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {items}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary sm:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav aria-label="Mobile" className="flex flex-col gap-1 border-t border-border/70 px-4 py-3 sm:hidden">
          {items}
        </nav>
      ) : null}
    </header>
  );
}
