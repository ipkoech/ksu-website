import Link from "next/link";
import {
  Eye,
  Landmark,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";
import { CampusPageHeader } from "@ksu/ui/components";
import GovernanceChart from "@/components/about/GovernanceChart";
import { PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getGovernanceData, type BackendBoard } from "@/lib/about-data";

function boardMatches(board: BackendBoard, terms: string[]) {
  const haystack =
    `${board.slug} ${board.name} ${board.board_type}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

function present(value?: string | null) {
  const text = value?.trim();
  return text && text.length ? text : null;
}

function IdentityCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-2xl ring-1 ring-primary/10 bg-white p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-primary/10 bg-[color-mix(in_srgb,hsl(var(--primary))_6%,white)] text-primary">
        <Icon aria-hidden className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-bold leading-tight text-foreground">
        {title}
      </h2>
      <div className="mt-3 h-0.5 w-10 bg-secondary" />
      <p className="mt-5 text-sm leading-7 text-muted-foreground">{body}</p>
    </article>
  );
}

function BoardIdentityGrid({
  board,
  mandateTitle,
}: {
  board?: BackendBoard | null;
  mandateTitle: string;
}) {
  const items = [
    present(board?.mandate) || present(board?.description)
      ? {
          title: mandateTitle,
          body: present(board?.mandate) || present(board?.description),
          icon: ShieldCheck,
        }
      : null,
    present(board?.mission)
      ? { title: "Mission", body: present(board?.mission), icon: Target }
      : null,
    present(board?.vision)
      ? { title: "Vision", body: present(board?.vision), icon: Eye }
      : null,
  ].filter((item): item is { title: string; body: string; icon: LucideIcon } =>
    Boolean(item?.body),
  );

  if (!items.length) return null;

  return (
    <section className="border-t border-border bg-[color-mix(in_srgb,hsl(var(--primary))_6%,white)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid max-w-none gap-4 md:grid-cols-3">
        {items.map((item) => (
          <IdentityCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            body={item.body}
          />
        ))}
      </div>
    </section>
  );
}

export default async function GovernancePage() {
  const data = await getGovernanceData();
  const council = data.boards.find((board) => boardMatches(board, ["council"]));
  const councilDescription =
    present(council?.description) ??
    present(council?.mandate) ??
    "University Council governance structure is shown from published backend board assignments.";

  return (
    <PageShell>
      <AboutPageLenis>
        <CampusPageHeader
          image="main-admin"
          variant="feature"
          titleWeight="normal"
          eyebrow="How the university is governed"
          title="Governance"
          description={councilDescription}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Governance" },
          ]}
          actions={
            <Link
              href="/about/university-council"
              className="inline-flex min-h-11 items-center rounded-2xl bg-secondary px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-white active:scale-[0.98]"
            >
              View University Council
            </Link>
          }
        />

        <section className="bg-white">
          <div className="max-w-none px-4 py-5 sm:px-6 lg:px-8">
            <aside className="rounded-2xl ring-1 ring-primary/10 bg-[color-mix(in_srgb,hsl(var(--primary))_6%,white)] p-5 lg:max-w-[520px]">
              <Landmark aria-hidden className="h-8 w-8 text-primary" />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                University Council
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {council?.members.length || council?.member_count || 0}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Published council profiles ordered by hierarchy level.
              </p>
            </aside>
          </div>
        </section>

        <BoardIdentityGrid
          board={council}
          mandateTitle="What the Council does"
        />

        <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-none rounded-2xl ring-1 ring-primary/10 bg-white p-4 sm:p-6">
            <GovernanceChart
              councilOnly
              title="University Council organogram"
              description="Council members are grouped by the hierarchy levels published in the backend. Select a person card to open the staff detail page."
              councilDescription={councilDescription}
              councilMembers={council?.members ?? []}
            />
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
