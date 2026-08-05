import { Reveal } from "../../components/motion/reveal";
import { SiteShell } from "../../components/site-shell";

export default function AccessibilityPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-6 py-20">
        <Reveal>
          <h1 className="text-5xl font-semibold text-heri-blue">
            Accessibility
          </h1>
          <p className="mt-6 text-lg leading-8 text-heri-ink/75">
            We are committed to an accessible HERI Africa experience, including
            keyboard navigation, readable contrast, meaningful alternative text,
            and reduced-motion support.
          </p>
        </Reveal>
      </main>
    </SiteShell>
  );
}
