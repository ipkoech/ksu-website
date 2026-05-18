import Link from "next/link";
import { Button } from "@ksu/ui/components";
import { BreadcrumbTrail, PageHeading, PageShell } from "@/components/site-shell";
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
          <PageHeading
            eyebrow="Our Service Charter"
            title="The service charter is part of the official About navigation and should remain directly accessible."
            body="The live Kisii University website exposes the service charter as a dedicated About page. The current public page is primarily a hosted visual/document resource, so this route acts as a clear access point."
          />
        </div>
      </section>

      <section className="container pb-16">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <p className="max-w-4xl text-base leading-8 text-slate-600">
            Use the official charter page to review the university's public service
            commitments and accountability information as published on the live site.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild>
              <Link href={serviceCharterUrl}>Open service charter</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/about/administrative-division">See administrative division</Link>
            </Button>
          </div>
        </article>
      </section>
    </PageShell>
  );
}
