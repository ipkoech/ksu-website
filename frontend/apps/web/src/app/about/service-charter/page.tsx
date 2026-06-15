import Link from "next/link";
import { Button, ScrollReveal } from "@ksu/ui/components";
import {
  AboutIllustratedHeading,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { serviceCharterUrl } from "@/lib/about-data";

export default function ServiceCharterPage() {
  return (
    <PageShell>
      <section className="container py-10 md:py-14">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Our Service Charter" },
          ]}
        />
        <div className="mt-8">
          <AboutIllustratedHeading
            eyebrow="Our Service Charter"
            title="Service commitments and accountability"
            body="The service charter sets out the university's public service commitments, expected standards, and accountability information."
            illustration={aboutIllustrations.serviceCharter}
            alt="University service desk staff assisting students with public service information"
          />
        </div>
      </section>

      <ScrollReveal as="section" className="container pb-16">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <p className="max-w-4xl text-base leading-8 text-slate-600">
            Open the official charter to review service standards, public
            commitments, and accountability information.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild>
              <Link href={serviceCharterUrl}>Open service charter</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/administration">See administration</Link>
            </Button>
          </div>
        </article>
      </ScrollReveal>
    </PageShell>
  );
}
