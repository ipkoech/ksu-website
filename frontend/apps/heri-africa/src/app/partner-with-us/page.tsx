import { SiteShell } from "../../components/site-shell";
import { PartnershipForm } from "../../components/forms/partnership-form";

export default function PartnerPage() {
  return <SiteShell><main className="mx-auto max-w-5xl px-6 py-20"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-heri-teal">Collaborate for impact</p><h1 className="mt-4 text-5xl font-semibold text-heri-blue">Partner with HERI Africa.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-heri-ink/75">Work with us to co-create knowledge, strengthen systems, and ensure every learner can read, understand, and thrive.</p><div className="mt-12"><PartnershipForm /></div></main></SiteShell>;
}
