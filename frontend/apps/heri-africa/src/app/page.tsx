import Link from "next/link";

export default function HeriHomePage() {
  return (
    <main className="min-h-screen bg-heri-cream">
      <header className="border-b border-heri-teal/20 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link className="text-xl font-semibold tracking-tight text-heri-blue" href="/">HERI AFRICA</Link>
          <nav aria-label="Primary navigation" className="hidden gap-6 text-sm font-medium md:flex">
            <Link href="/about">About</Link><Link href="/research">Research</Link><Link href="/team">Our Team</Link><Link href="/partner-with-us">Partner With Us</Link>
          </nav>
        </div>
      </header>
      <section className="bg-heri-teal px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-heri-lime">Hosted by Kisii University</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-7xl">Africa-led language research for transformative education.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">We advance policy-responsive and practice-oriented research in language education and foundational literacy across Africa.</p>
          <Link className="mt-8 inline-flex rounded-full bg-heri-lime px-6 py-3 font-semibold text-heri-ink transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-heri-teal" href="/our-work">Explore Our Work <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
      </section>
    </main>
  );
}
