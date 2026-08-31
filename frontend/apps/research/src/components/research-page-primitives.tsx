import type { ReactNode } from "react";

export function ResearchPageShell({
  children,
  tone = "white",
}: {
  children: ReactNode;
  tone?: "white" | "subtle";
}) {
  return (
    <main
      id="research-main"
      className={`min-h-screen text-foreground ${tone === "subtle" ? "bg-surface-subtle" : "bg-white"}`}
    >
      {children}
    </main>
  );
}

export function ResearchPageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1680px] ${className}`}>
      {children}
    </div>
  );
}

export function ResearchListingRegion({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label="Research records"
      className={`px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 ${className}`}
    >
      <ResearchPageContainer>{children}</ResearchPageContainer>
    </section>
  );
}

export function ResearchResultsFrame({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
}) {
  return (
    <div className={sidebar ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start" : "min-w-0"}>
      <div className="min-w-0">{children}</div>
      {sidebar ? <aside className="min-w-0 xl:sticky xl:top-28">{sidebar}</aside> : null}
    </div>
  );
}

export function ResearchDetailLayout({
  main,
  sidebar,
}: {
  main: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-5">{main}</div>
      <aside className="min-w-0">{sidebar}</aside>
    </div>
  );
}
