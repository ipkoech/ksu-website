// Shared Page CMS dashboard implementation used by the canonical route.
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  FileStack,
  Image as ImageIcon,
  LayoutTemplate,
  Sparkles,
  Workflow,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@ksu/ui/components";
import { usePermissions } from "@ksu/auth";
import { PageTransition } from "@/lib/animations";
import {
  pageSectionsApi,
  partnershipSpotlightsApi,
  type PageSection,
  type PartnershipSpotlight,
} from "@/lib/api/page-cms";
import {
  PortalMetricGrid,
  PortalWorkspace,
  PortalWorkspaceHeader,
  type PortalMetric,
} from "@/components/portals/portal-workspace";

export default function PageCmsDashboardPage() {
  const { hasAnyScope } = usePermissions();

  const canViewSections = hasAnyScope([
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
  const canManageSpotlights = hasAnyScope([
    "partnership_spotlights.manage",
    "admin:*",
  ]);

  const sectionsQuery = useQuery({
    queryKey: ["page-cms", "sections", "admin"],
    queryFn: () => pageSectionsApi.listAdmin({ page: 1, per_page: 100 }),
    enabled: canViewSections,
  });

  const spotlightsQuery = useQuery({
    queryKey: ["page-cms", "spotlights", "admin"],
    queryFn: () => partnershipSpotlightsApi.listAdmin({ page: 1, per_page: 100 }),
    enabled: canManageSpotlights,
  });

  const sections: PageSection[] = sectionsQuery.data?.data ?? [];
  const spotlights: PartnershipSpotlight[] = spotlightsQuery.data?.data ?? [];
  const isLoading = sectionsQuery.isPending || spotlightsQuery.isPending;
  const error = sectionsQuery.error ?? spotlightsQuery.error;

  const stats = useMemo(() => {
    const inReview = sections.filter((s) => s.status === "in_review").length;
    const published = sections.filter((s) => s.status === "published").length;
    const enabled = sections.filter((s) => s.is_enabled).length;
    return { total: sections.length, inReview, published, enabled, spotlights: spotlights.length };
  }, [sections, spotlights.length]);

  const metrics: PortalMetric[] = [
    {
      label: "Sections",
      value: stats.total,
      detail: "Structured sections across pages",
      icon: LayoutTemplate,
      tone: "primary",
    },
    {
      label: "In Review",
      value: stats.inReview,
      detail: "Awaiting editorial review",
      icon: Workflow,
      tone: stats.inReview > 0 ? "warning" : "info",
    },
    {
      label: "Published",
      value: stats.published,
      detail: "Live in public composition",
      icon: FileStack,
      tone: "success",
    },
    {
      label: "Spotlights",
      value: stats.spotlights,
      detail: "Partnership spotlights",
      icon: ImageIcon,
      tone: "info",
    },
  ];

  return (
    <PageTransition>
      <PortalWorkspace>
        <PortalWorkspaceHeader
          eyebrow="Corporate Communication"
          title="Page CMS"
          description="Use sections for structured page blocks and spotlights for research partner promotions. Actions here map directly to the Page CMS backend workflow."
          icon={Sparkles}
        />

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Overview unavailable</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load page CMS overview."}
            </AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <PortalMetricGrid items={metrics} />
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Card className="overflow-hidden shadow-sm">
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
                      <p className="truncate font-medium">
                        {section.title || section.section_key}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {section.page_key} · {section.scope_type} · {section.layout_variant}
                      </p>
                    </div>
                    <Badge variant={section.status === "published" ? "default" : "secondary"}>
                      {section.status.replace(/_/g, " ")}
                    </Badge>
                  </Link>
                ))
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No page sections have been created yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm">
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
                      CTA: {spotlight.primary_cta_source.replace(/_/g, " ")} · Status:{" "}
                      {spotlight.status}
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
      </PortalWorkspace>
    </PageTransition>
  );
}
