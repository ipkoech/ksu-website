import {
  AboutIllustratedHeading,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { BoardMemberGrid } from "@/components/about/BoardMemberGrid";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getGovernanceBoard, getOverviewData } from "@/lib/about-data";

export default async function UniversityManagementPage() {
  const [managementBoard, overview] = await Promise.all([
    getGovernanceBoard("management-board"),
    getOverviewData(),
  ]);

  return (
    <PageShell>
      <AboutPageLenis>
      <section className="w-full px-4 py-10 sm:px-6 lg:px-8 md:py-14">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "University Management" },
          ]}
        />
        <div className="mt-8">
          <AboutIllustratedHeading
            eyebrow="University Management"
            title="The management page should mirror the official public roster rather than a generalized leadership directory."
            body="The live Kisii University site publishes the University Management Board separately from governance. This page follows that separation and presents the current official lineup."
            illustration={aboutIllustrations.management}
            alt="University management team coordinating campus operations"
          />
        </div>
      </section>

      <section className="w-full px-4 pb-12 sm:px-6 lg:px-8">
        <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300/30 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            {overview.vc_message_title || "Message from the Vice Chancellor"}
          </p>
          <blockquote className="mt-5 w-full font-[family-name:var(--font-display)] text-3xl leading-tight sm:text-4xl">
            {overview.vc_message ||
              "The Vice Chancellor welcomes students and stakeholders to a dynamic institution committed to academic excellence, research, and social responsibility."}
          </blockquote>
        </article>
      </section>

      <section className="w-full px-4 pb-16 sm:px-6 lg:px-8">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            University Management Board
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950 sm:text-4xl">
            {managementBoard?.description || "Current University Management Board"}
          </h2>
          <p className="mt-5 w-full text-base leading-8 text-slate-600">
            {managementBoard?.mandate ||
              "The University Management Board handles day-to-day administration and implementation of university policies and the strategic plan."}
          </p>
          <div className="mt-10">
            <BoardMemberGrid members={managementBoard?.members ?? []} />
          </div>
        </article>
      </section>
      </AboutPageLenis>
    </PageShell>
  );
}
