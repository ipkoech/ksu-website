import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-heri-blue px-6 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-xl font-semibold">HERI AFRICA</p>
          <p className="mt-2 max-w-sm text-sm text-white/75">
            Africa-led language education research hosted by Kisii University.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-heri-lime">
            Explore
          </p>
          <nav className="mt-3 grid gap-2 text-sm text-white/80">
            <Link href="/about">About Us</Link>
            <Link href="/our-work">Our Work</Link>
            <Link href="/research">Research</Link>
            <Link href="/news-insights">News &amp; Insights</Link>
          </nav>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-heri-lime">
            Connect
          </p>
          <nav className="mt-3 flex gap-5 text-sm text-white/80">
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/accessibility">Accessibility</Link>
          </nav>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/20 pt-5 text-xs text-white/60">
        © {new Date().getFullYear()} HERI Africa Language Education Research
        Chair. All rights reserved.
      </div>
    </footer>
  );
}
