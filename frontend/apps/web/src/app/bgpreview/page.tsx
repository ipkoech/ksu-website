import { AmbientPageBackground } from "@ksu/ui";

// Temporary harness for reviewing both background variants side by side.
export default function Page() {
  return (
    <div className="ksu-landing">
      <AmbientPageBackground
        as="section"
        variant="poster"
        intensity="medium"
        plateImage="/images/headers/main-admin.jpg"
        className="min-h-[900px]"
      >
        <div className="mx-auto max-w-4xl px-8 py-28 text-center">
          <h1 className="text-[3rem] font-normal leading-tight text-brand-overlay">
            Poster
          </h1>
          <p className="mx-auto mt-3 max-w-[52ch] text-brand-overlay/70">
            Corner dot lattices in cyan and orange, bleeding off the edge, over
            a ghosted campus plate. Static.
          </p>
          <a className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-secondary px-7 py-3 font-medium text-white" href="#a">
            Study With Us
          </a>
        </div>
      </AmbientPageBackground>

      <AmbientPageBackground as="section" variant="poster" intensity="medium" className="min-h-[700px]">
        <div className="mx-auto max-w-4xl px-8 py-28 text-center">
          <h2 className="text-[2.5rem] font-normal text-brand-overlay">Poster, no plate</h2>
        </div>
      </AmbientPageBackground>

      <AmbientPageBackground as="section" variant="academic" intensity="soft" className="min-h-[700px]">
        <div className="mx-auto max-w-4xl px-8 py-28 text-center">
          <h2 className="text-[2.5rem] font-normal text-brand-overlay">Academic</h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-brand-overlay/70">
            Unchanged. Still on the eight interior surfaces.
          </p>
        </div>
      </AmbientPageBackground>
    </div>
  );
}
