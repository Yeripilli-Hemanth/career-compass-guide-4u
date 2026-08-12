import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">{children}</main>;
}
