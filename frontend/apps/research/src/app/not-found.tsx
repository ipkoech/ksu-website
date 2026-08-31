import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main id="research-main" className="relative isolate grid min-h-[68vh] place-items-center overflow-hidden bg-[#002f6c] px-4 py-20 text-white">
      <Image src="/images/research/research-projects-hero.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#002f6c]/95 via-[#003d7c]/90 to-[#005baa]/75" />
      <section className="relative max-w-2xl text-center">
        <p className="font-semibold uppercase tracking-[0.24em] text-[#f9a34a]">404 · Research portal</p>
        <h1 className="mt-4 font-serif text-4xl font-bold sm:text-6xl">This research page could not be found.</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/80">The record may have moved, changed its web address, or is no longer published.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded bg-[#f58220] px-5 py-3 font-semibold text-white hover:bg-[#dc6810]">Research home</Link>
          <Link href="/projects" className="rounded border border-white/45 bg-white/10 px-5 py-3 font-semibold text-white hover:bg-white/20">Browse projects</Link>
        </div>
      </section>
    </main>
  );
}
