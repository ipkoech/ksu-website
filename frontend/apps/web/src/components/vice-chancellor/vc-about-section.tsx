import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StaffAssignment } from "@ksu/api-client";
import { personDisplayName } from "@/lib/person-name";
import { PublicImage } from "@/components/public/public-image";
import { AboutReveal } from "@/components/about/about-reveal";

/**
 * Who the Vice-Chancellor is.
 *
 * Every line comes from the person record: the biography, the academic rank,
 * the specialism and the institutional role. Nothing is characterised or
 * embellished here, because this is a named individual and the record is the
 * only thing entitled to describe him.
 */
export function VcAboutSection({
  assignment,
  portraitUrl,
}: {
  assignment: StaffAssignment | null;
  portraitUrl?: string | null;
}) {
  const person = assignment?.person;
  if (!person) return null;

  const bio = person.full_bio?.trim() || person.bio?.trim();
  if (!bio) return null;

  const name = personDisplayName(person, "The Vice Chancellor");
  const role = assignment?.title || "Vice Chancellor";
  const rank = person.academic_rank?.trim();
  const field = person.specialization?.trim();

  // Long biographies read as a wall; splitting on blank lines keeps the
  // record's own paragraphing where the editor put it.
  const paragraphs = bio.split(/\n{2,}/).filter(Boolean);

  // The record's own structured facts, in the order a reader asks for them:
  // what he does here, what rank he holds, what he works on.
  const facts = [
    { label: "Office", value: role },
    rank ? { label: "Academic rank", value: rank } : null,
    field ? { label: "Field", value: field } : null,
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));

  return (
    <section
      id="vc-about"
      aria-labelledby="vc-about-heading"
      className="scroll-mt-24 border-y border-primary/10 bg-surface-subtle py-14 sm:py-20"
    >
      <div className="container">
        <AboutReveal>
          <div className="max-w-3xl">
            <h2
              id="vc-about-heading"
              className="font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl"
            >
              About the <em className="italic">Vice-Chancellor</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              The record of the person holding the office &mdash; his career,
              his rank and the field he works in.
            </p>
          </div>
        </AboutReveal>

        <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,.62fr)_minmax(0,1.38fr)] lg:gap-14">
          <AboutReveal variant="left">
            {/* The supplied portrait is a cut-out that already carries a white
                background, so the frame is white too — a coloured ground shows
                through as a hard rectangle behind the figure. Held at 3/4
                rather than 4/5, where the figure floated in an empty field. */}
            <figure className="min-w-0">
              <div className="relative aspect-[3/4] overflow-hidden bg-white ring-1 ring-primary/15">
                <PublicImage
                  src={portraitUrl}
                  alt={`${name}, ${role}`}
                  ratio="fill"
                  className="absolute inset-0"
                  imageClassName="object-cover object-top"
                  sizes="(min-width: 1024px) 26vw, 100vw"
                />
              </div>
              <figcaption className="mt-4">
                <p className="font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary">
                  {name}
                </p>
                <p className="mt-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {role}
                </p>
              </figcaption>
            </figure>
          </AboutReveal>

          <AboutReveal variant="right" delay={100}>
            <div className="min-w-0">
              {/* The structured record sits above the prose rather than below
                  the portrait, where it was separated from the biography it
                  summarises. Hairlines rather than boxes, per the house rule. */}
              <dl className="grid gap-x-10 gap-y-5 border-y border-primary/15 py-6 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="min-w-0">
                    <dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-secondary">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-foreground first-letter:uppercase">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 space-y-5">
                {paragraphs.map((para, index) => (
                  <p
                    key={index}
                    className="text-base leading-8 text-muted-foreground"
                  >
                    {para}
                  </p>
                ))}
              </div>

              <Link
                href="/about/vice-chancellor/profile"
                className="group mt-8 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
              >
                Full professional profile
                <ArrowRight
                  className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1 motion-reduce:transform-none"
                  aria-hidden
                />
              </Link>
            </div>
          </AboutReveal>
        </div>
      </div>
    </section>
  );
}

export default VcAboutSection;
