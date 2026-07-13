"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileStack, Image as ImageIcon, LayoutTemplate, Workflow } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/shared/page-header";
import { usePermissions } from "@/hooks/use-permissions";
import { PageTransition } from "@/lib/animations";
import {
  pageCmsStatsApi,
  pageSectionsApi,
  partnershipSpotlightsApi,
  type PageCmsStats,
  type PageSection,
  type PartnershipSpotlight,
} from "@/lib/api/page-cms";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: typeof LayoutTemplate;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
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
  const [stats, setStats] = useState<PageCmsStats | null>(null);
  const [statsUnavailable, setStatsUnavailable] = useState(false);
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
      setStatsUnavailable(false);
      const [statsResult, activityResult] = await Promise.allSettled([
        pageCmsStatsApi.get(),
        Promise.all([
          canViewSections ? pageSectionsApi.listAdmin({ page: 1, per_page: 6 }) : Promise.resolve({ data: [] }),
          canManageSpotlights ? partnershipSpotlightsApi.listAdmin({ page: 1, per_page: 6 }) : Promise.resolve({ data: [] }),
        ]),
      ]);
      if (cancelled) return;

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data);
      } else {
        setStats(null);
        setStatsUnavailable(true);
      }

      if (activityResult.status === "fulfilled") {
        const [sectionsResponse, spotlightsResponse] = activityResult.value;
        setSections(sectionsResponse.data ?? []);
        setSpotlights(spotlightsResponse.data ?? []);
      } else {
        setError("Failed to load page CMS activity.");
      }
      if (!cancelled) {
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [canManageSpotlights, canViewSections]);

  const statValue = (value: number | undefined) => (statsUnavailable ? "Unavailable" : value ?? 0);

  return (
    <PageTransition>
      <PageHeader
        title="Page CMS"
        description="Manage structured page sections, spotlight content, media attachments, and editorial workflow."
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Overview unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Drafts" value={statValue(stats?.draft_count)} description="Sections awaiting editorial submission." icon={LayoutTemplate} />
        <StatCard title="In Review" value={statValue(stats?.in_review_count)} description="Sections waiting on editorial review." icon={Workflow} />
        <StatCard title="Changes Requested" value={statValue(stats?.changes_requested_count)} description="Sections returned for revision." icon={Workflow} />
        <StatCard title="Approved" value={statValue(stats?.approved_count)} description="Sections ready for publication." icon={FileStack} />
        <StatCard title="Scheduled" value={statValue(stats?.scheduled_count)} description="Sections with a future publication window." icon={Workflow} />
        <StatCard title="Published" value={statValue(stats?.published_count)} description="Sections currently live in public composition." icon={FileStack} />
        <StatCard title="Expired" value={statValue(stats?.expired_count)} description="Sections outside their publication window." icon={FileStack} />
        <StatCard title="Validation Blockers" value={statValue(stats?.validation_blocker_count)} description="Sections that cannot progress until blockers are resolved." icon={LayoutTemplate} />
        <StatCard title="Spotlights" value={statValue(stats?.spotlight_count)} description="Partnership spotlight records in Page CMS." icon={ImageIcon} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Sections</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Create sections, update item content, attach media by role, and move records through review and publishing.
              </p>
            </div>
            {canViewSections ? (
              <Button asChild>
                <Link href="/page-cms/sections">Open Sections</Link>
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
                  href={`/page-cms/sections/${section.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:border-primary"
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

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Spotlights</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage partnership spotlight content and supporting media with the current backend spotlight endpoints.
              </p>
            </div>
            {canManageSpotlights ? (
              <Button variant="outline" asChild>
                <Link href="/page-cms/spotlights">Open Spotlights</Link>
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
              spotlights.slice(0, 6).map((spotlight) => (
                <div key={spotlight.id} className="rounded-lg border p-3">
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
