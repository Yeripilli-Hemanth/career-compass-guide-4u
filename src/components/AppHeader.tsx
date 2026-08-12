import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export function AppHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          Career compass
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/careers" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Careers
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>
                Profile
              </Link>
              <button type="button" onClick={() => signOut()} className="hover:text-foreground">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="hover:text-foreground">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
