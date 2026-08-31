import Image from "next/image";

import { SkeletonList } from "./skeleton-ui";

export function ResearchRouteLoading() {
  return (
    <main id="research-main" className="min-h-screen bg-white" aria-busy="true" aria-label="Loading research content">
      <section className="relative isolate overflow-hidden bg-[#002f6c] px-4 py-10 text-white sm:px-6 lg:px-8">
        <Image
          src="/images/research/research-home-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#002f6c] via-[#002f6c]/90 to-[#005baa]/55" />
        <div className="relative mx-auto max-w-[1680px]">
          <div className="mb-4 h-3 w-32 animate-pulse rounded-full bg-[#f58220]" />
          <div className="h-9 w-full max-w-xl animate-pulse rounded bg-white/25" />
          <p className="mt-4 text-sm text-white/80">Loading Kisii University research…</p>
        </div>
      </section>
      <div className="mx-auto max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12 xl:px-10 2xl:px-12">
        <SkeletonList />
      </div>
    </main>
  );
}
