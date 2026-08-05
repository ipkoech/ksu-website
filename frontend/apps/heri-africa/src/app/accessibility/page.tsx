import type { Metadata } from "next";
import { Reveal } from "../../components/motion/reveal";
import { SiteShell } from "../../components/site-shell";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "The accessibility commitments and features of the HERI Africa Language Education Research Chair website.",
};

const features = [
  [
    "Keyboard navigation",
    "Every interactive element, including the hero carousel, menus and forms, can be reached and operated with a keyboard. A skip-to-content link is the first focusable element on every page.",
  ],
  [
    "Reduced motion",
    "All animations, including scroll reveals, the hero carousel and the partner marquee, are disabled or simplified when your device requests reduced motion.",
  ],
  [
    "Contrast and text",
    "Colour combinations are chosen to meet WCAG 2.1 AA contrast requirements, and text scales with your browser's zoom and font-size settings.",
  ],
  [
    "Screen readers",
    "Pages use semantic headings and landmarks, images carry meaningful alternative text, decorative imagery is hidden from assistive technology, and carousel controls are labelled.",
  ],
] as const;

export default function AccessibilityPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
        <Reveal>
          <h1 className="text-5xl font-bold text-heri-blue">
            Accessibility Statement
          </h1>
          <div className="mt-4 h-1 w-10 bg-heri-lime" />
          <p className="mt-6 text-lg leading-8 text-heri-ink/75">
            We want every visitor, including people using assistive technology,
            to be able to read our research and reach our team. This site aims
            to conform to WCAG 2.1 level AA.
          </p>
        </Reveal>
        <div className="mt-10 space-y-8">
          {features.map(([heading, body]) => (
            <Reveal key={heading}>
              <section>
                <h2 className="text-2xl font-bold text-heri-blue">{heading}</h2>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {body}
                </p>
              </section>
            </Reveal>
          ))}
          <Reveal>
            <section className="rounded-2xl bg-heri-cream/60 p-7">
              <h2 className="text-2xl font-bold text-heri-blue">
                Tell us if something is hard to use
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                If any part of this site is difficult to access, email{" "}
                <a
                  className="font-semibold text-heri-teal hover:text-heri-blue"
                  href="mailto:heri-language@kisiiuniversity.ac.ke"
                >
                  heri-language@kisiiuniversity.ac.ke
                </a>{" "}
                and describe the page and the problem. We treat accessibility
                reports as bugs and prioritise fixing them.
              </p>
            </section>
          </Reveal>
        </div>
      </main>
    </SiteShell>
  );
}
