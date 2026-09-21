import Link from "next/link";
import { Download, Info } from "lucide-react";
import { CampusPageHeader } from "@ksu/ui/components";
import type { UniversityCouncilPageData } from "@/lib/about-data";
import GovernanceChart from "./GovernanceChart";

function text(value?: string | null, fallback = "") {
  const trimmed = value?.trim();
  return trimmed && trimmed.length ? trimmed : fallback;
}

function safeCouncilCtaHref(value?: string | null) {
  const href = value?.trim();
  if (!href) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return href;

  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function UniversityCouncilPage({
  data,
}: {
  data: UniversityCouncilPageData;
}) {
  const title = text(data.page.title, "University Council");
  const description = text(
    data.page.description,
    "The University Council provides strategic direction, oversight, and policy guidance for Kisii University.",
  );
  const mandate = data.mandate;
  const documentCtaHref = safeCouncilCtaHref(mandate?.document_cta?.href);
  // What the Council is for. Only worth its own passage when it actually says
  // something beyond the page description already carried by the header.

  return (
    <div className="bg-white">
      <CampusPageHeader
        image="main-admin"
        variant="compact"
        titleWeight="normal"
        eyebrow="Governance"
        title={
          <>
            University <em className="italic">Council</em>
          </>
        }
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About KSU", href: "/about" },
          { label: title },
        ]}
        actions={
          documentCtaHref ? (
            <Link
              href={documentCtaHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/45 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-colors duration-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white active:scale-[0.98]"
            >
              {text(mandate?.document_cta?.label, "Council Charter")}
              <Download aria-hidden className="h-4 w-4" />
            </Link>
          ) : null
        }
      />

      <section className="px-5 py-4 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl justify-end">
          <details className="group relative">
            <summary
              aria-label="About the University Council"
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 [&::-webkit-details-marker]:hidden"
            >
              <Info aria-hidden className="h-5 w-5" />
            </summary>
            <div className="absolute right-0 z-30 mt-3 w-[min(22rem,calc(100vw-2.5rem))] rounded-2xl border border-border bg-white p-5 text-left shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                {text(mandate?.label, "University Council")}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl text-primary">
                {text(mandate?.heading, "Council mandate")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {text(mandate?.description, description)}
              </p>
              <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
                The Council provides institutional oversight, policy direction and strategic stewardship. The Chairperson leads the Council, members provide governance oversight, and the Secretary supports its official records and communication.
              </p>
            </div>
          </details>
        </div>
      </section>
      <section className="px-5 pb-5 sm:px-8 lg:px-10"><GovernanceChart data={data} /></section>
    </div>
  );
}
