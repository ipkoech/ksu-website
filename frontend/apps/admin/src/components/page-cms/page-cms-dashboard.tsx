// Shared Page CMS dashboard implementation used by the canonical route.
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FileStack, Image as ImageIcon, LayoutTemplate, Sparkles, Workflow } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { usePermissions } from "@/hooks/use-permissions";
import { PageTransition } from "@/lib/animations";
import { pageSectionsApi, partnershipSpotlightsApi, type PageSection, type PartnershipSpotlight } from "@/lib/api/page-cms";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof LayoutTemplate;
}) {
  return (
    <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PageCmsDashboardPage() {
  const { hasAnyPermission } = usePermissions();
  const [sections, setSections] = useState<PageSection[]>([]);
  const [spotlights, setSpotlights] = useState<PartnershipSpotlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canViewSections = hasAnyPermission([
    "page_sections.view",
    "page_sections.create",
    "page_sections.update",
    "page_sections.delete",
    "page_sections.review",
    "page_sections.publish",
    "page_sections.manage",
    "section_items.manage",
    "homepage.view",
    "homepage.manage",
    "homepage.publish",
    "school_homepage.manage",
    "research_homepage.manage",
    "library_homepage.manage",
  ]);
  const canManageSpotlights = hasAnyPermission(["partnership_spotlights.manage", "admin:*"]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [sectionsResponse, spotlightsResponse] = await Promise.all([
          canViewSections ? pageSectionsApi.listAdmin({ page: 1, per_page: 100 }) : Promise.resolve({ data: [] }),
          canManageSpotlights ? partnershipSpotlightsApi.listAdmin({ page: 1, per_page: 100 }) : Promise.resolve({ data: [] }),
        ]);
        if (cancelled) return;
        setSections(sectionsResponse.data ?? []);
        setSpotlights(spotlightsResponse.data ?? []);
      } catch {
        if (!cancelled) {
          setError("Failed to load page CMS overview.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [canManageSpotlights, canViewSections]);

  const stats = useMemo(() => {
    const inReview = sections.filter((section) => section.status === "in_review").length;
    const published = sections.filter((section) => section.status === "published").length;
    const enabled = sections.filter((section) => section.is_enabled).length;

    return {
      total: sections.length,
      inReview,
      published,
      enabled,
      spotlights: spotlights.length,
    };
  }, [sections, spotlights.length]);

  return (
    <PageTransition>
      <section className="mb-5 overflow-hidden rounded-2xl border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.86))] p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.86))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="size-3.5 text-orange-600" />
              Homepage composition command centre
            </div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Page CMS</h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
              Use sections for structured page blocks and spotlights for research partner promotions. Actions here map directly to the Page CMS backend workflow.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <MiniMetric label="Enabled" value={stats.enabled} />
            <MiniMetric label="Published" value={stats.published} />
            <MiniMetric label="Review" value={stats.inReview} />
          </div>
        </div>
      </section>

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Overview unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Sections" value={stats.total} description="Structured sections available across managed pages." icon={LayoutTemplate} />
        <StatCard title="In Review" value={stats.inReview} description="Sections waiting on editorial review." icon={Workflow} />
        <StatCard title="Published" value={stats.published} description="Sections currently live in public composition." icon={FileStack} />
        <StatCard title="Spotlights" value={stats.spotlights} description="Homepage partnership spotlights currently returned by composition." icon={ImageIcon} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-muted/20">
            <div>
              <CardTitle>Sections</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Create sections, update item content, attach media by role, and move records through review and publishing.
              </p>
            </div>
            {canViewSections ? (
              <Button asChild>
                <Link href="/corporate-communication/page-cms/sections">
                  Open Sections
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3">
            {!canViewSections ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Your current access covers spotlight management, but not the section list.
              </p>
            ) : isLoading ? (
              <p className="text-sm text-muted-foreground">Loading section activity...</p>
            ) : sections.length ? (
              sections.slice(0, 6).map((section) => (
                <Link
                  key={section.id}
                  href={`/corporate-communication/page-cms/sections/${section.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border bg-background p-3 transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{section.title || section.section_key}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {section.page_key} · {section.scope_type} · {section.layout_variant}
                    </p>
                  </div>
                  <Badge variant={section.status === "published" ? "default" : "secondary"}>{section.status.replace(/_/g, " ")}</Badge>
                </Link>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No page sections have been created yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-muted/20">
            <div>
              <CardTitle>Spotlights</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage partnership spotlight content and supporting media with the current backend spotlight endpoints.
              </p>
            </div>
            {canManageSpotlights ? (
              <Button variant="outline" asChild>
                <Link href="/corporate-communication/page-cms/spotlights">
                  Open Spotlights
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3">
            {!canManageSpotlights ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Spotlight admin tools are not included in your current permissions.
              </p>
            ) : isLoading ? (
              <p className="text-sm text-muted-foreground">Loading spotlight activity...</p>
            ) : spotlights.length ? (
              spotlights.slice(0, 5).map((spotlight) => (
                <div key={spotlight.id} className="rounded-2xl border bg-background p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium">{spotlight.headline}</p>
                    <Badge variant={spotlight.is_enabled ? "default" : "secondary"}>
                      {spotlight.is_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    CTA: {spotlight.primary_cta_source.replace(/_/g, " ")} · Status: {spotlight.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No spotlight records are available in admin.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[118px] rounded-2xl border bg-background/80 p-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
