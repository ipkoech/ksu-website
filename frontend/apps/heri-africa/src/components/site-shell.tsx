import Link from "next/link";

const links = [
  ["About", "/about"],
  ["Our Work", "/our-work"],
  ["Research", "/research"],
  ["Our Team", "/team"],
  ["News & Insights", "/news-insights"],
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-3" href="#main-content">Skip to content</a>
      <div className="bg-heri-lime px-6 py-2 text-center text-xs font-semibold text-heri-ink">Advancing language education and foundational literacy across Africa</div>
      <header className="sticky top-0 z-40 border-b border-heri-teal/15 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link className="text-lg font-bold tracking-tight text-heri-blue" href="/">HERI AFRICA <span className="block text-[10px] font-normal tracking-[0.16em] text-heri-teal">Language Education Research Chair</span></Link>
          <nav aria-label="Primary navigation" className="hidden gap-5 text-sm font-medium lg:flex">{links.map(([label, href]) => <Link className="transition-colors hover:text-heri-teal focus:outline-none focus:ring-2 focus:ring-heri-lime" href={href} key={href}>{label}</Link>)}</nav>
          <Link className="rounded-full bg-heri-lime px-4 py-2 text-xs font-bold text-heri-ink transition-colors hover:bg-heri-teal hover:text-white focus:outline-none focus:ring-2 focus:ring-heri-teal" href="/partner-with-us">Partner With Us</Link>
        </div>
      </header>
      <div id="main-content">{children}</div>
      <footer className="bg-heri-blue px-6 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xl font-semibold">HERI AFRICA</p><p className="mt-2 max-w-sm text-sm text-white/75">Africa-led language education research hosted by Kisii University.</p></div><div className="flex gap-5 text-sm text-white/80"><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/accessibility">Accessibility</Link></div></div>
      </footer>
    </>
  );
}
