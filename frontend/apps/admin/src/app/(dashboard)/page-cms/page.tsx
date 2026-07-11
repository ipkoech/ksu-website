"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FileStack, Image as ImageIcon, LayoutTemplate, Workflow } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { pageCmsApi, pageSectionsApi, type PageComposition, type PageSection } from "@/lib/api/page-cms";

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
  const [sections, setSections] = useState<PageSection[]>([]);
  const [composition, setComposition] = useState<PageComposition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [sectionsResponse, homepageResponse] = await Promise.all([
          pageSectionsApi.listAdmin({ page: 1, per_page: 100 }),
          pageCmsApi.getHomepage(),
        ]);
        if (cancelled) return;
        setSections(sectionsResponse.data ?? []);
        setComposition(homepageResponse.data ?? null);
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
  }, []);

  const stats = useMemo(() => {
    const inReview = sections.filter((section) => section.status === "in_review").length;
    const published = sections.filter((section) => section.status === "published").length;
    const enabled = sections.filter((section) => section.is_enabled).length;

    return {
      total: sections.length,
      inReview,
      published,
      enabled,
      spotlights: composition?.partnership_spotlights?.length ?? 0,
    };
  }, [composition?.partnership_spotlights, sections]);

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
        <StatCard title="Sections" value={stats.total} description="Structured sections available across managed pages." icon={LayoutTemplate} />
        <StatCard title="In Review" value={stats.inReview} description="Sections waiting on editorial review." icon={Workflow} />
        <StatCard title="Published" value={stats.published} description="Sections currently live in public composition." icon={FileStack} />
        <StatCard title="Spotlights" value={stats.spotlights} description="Homepage partnership spotlights currently returned by composition." icon={ImageIcon} />
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
            <Button asChild>
              <Link href="/page-cms/sections">Open Sections</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
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
            <Button variant="outline" asChild>
              <Link href="/page-cms/spotlights">Open Spotlights</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading spotlight activity...</p>
            ) : composition?.partnership_spotlights?.length ? (
              composition.partnership_spotlights.slice(0, 5).map((spotlight) => (
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
                No homepage spotlights are currently visible in public composition.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
