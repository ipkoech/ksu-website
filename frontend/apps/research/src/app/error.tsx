"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Research route error", error);
  }, [error]);

  return (
    <main id="research-main" className="relative isolate grid min-h-[68vh] place-items-center overflow-hidden bg-[#002f6c] px-4 py-20 text-white">
      <Image src="/images/research/research-innovation-hero.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#002f6c]/95 via-[#003d7c]/90 to-[#005baa]/75" />
      <section className="relative max-w-2xl text-center">
        <p className="font-semibold uppercase tracking-[0.24em] text-[#f9a34a]">Kisii University Research</p>
        <h1 className="mt-4 font-serif text-4xl font-bold sm:text-6xl">We could not load this page.</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/80">Please try again. If the problem continues, return to the research portal and choose another section.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="rounded bg-[#f58220] px-5 py-3 font-semibold text-white hover:bg-[#dc6810]">Try again</button>
          <Link href="/" className="rounded border border-white/45 bg-white/10 px-5 py-3 font-semibold text-white hover:bg-white/20">Research home</Link>
        </div>
      </section>
    </main>
  );
}
