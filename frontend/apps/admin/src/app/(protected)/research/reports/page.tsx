"use client";

import Link from "next/link";
import { useState } from "react";
import { BarChart3, Bot, Database, Download, FileText, FlaskConical, HandCoins, Leaf, LineChart, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { researchServiceApi } from "@ksu/api-client";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";
import { ResearchSectionGuide } from "../_components/research-guidance";

const exportGroups = [
  {
    title: "Research Portfolio",
    description: "Projects, centers, programs, themes, and partnerships.",
    icon: FlaskConical,
    resources: [
      { label: "Projects", key: "research-projects" },
      { label: "Centers", key: "research-centers" },
      { label: "Programs", key: "research-programs" },
      { label: "Partners", key: "research-partners" },
    ],
  },
  {
    title: "Funding & Donations",
    description: "Grants, funders, endowments, donors, and giving records.",
    icon: HandCoins,
    resources: [
      { label: "Grants", key: "research-grants" },
      { label: "Funders", key: "research-funders" },
      { label: "Endowments", key: "research-endowments" },
      { label: "Donors", key: "research-donors" },
      { label: "Donations", key: "research-donations" },
    ],
  },
  {
    title: "Outputs & Publications",
    description: "Publications, journals, outputs, innovations, and report outputs.",
    icon: ScrollText,
    resources: [
      { label: "Publications", key: "research-publications" },
      { label: "Journals", key: "research-journals" },
      { label: "Outputs", key: "research-outputs" },
      { label: "Innovations", key: "research-innovations" },
    ],
  },
  {
    title: "Impact & Capacity",
    description: "Impact metrics, sustainability, training, mentorship, and scholarships.",
    icon: Leaf,
    resources: [
      { label: "Impact Metrics", key: "research-impact-metrics" },
      { label: "Sustainability", key: "research-sustainability" },
      { label: "Training", key: "research-training" },
      { label: "Mentorship", key: "research-mentorship" },
      { label: "Scholarships", key: "research-scholarships" },
    ],
  },
];

const standardReports = [
  {
    title: "Research Portfolio Summary",
    description: "A management view of active projects, programs, centers, and strategic themes.",
    href: "/research/projects",
    icon: BarChart3,
  },
  {
    title: "Funding Pipeline",
    description: "Grant opportunities, funders, endowments, and funded project records.",
    href: "/research/fundings",
    icon: HandCoins,
  },
  {
    title: "Publication & Output Review",
    description: "Publications, journals, datasets, technical reports, and other research outputs.",
    href: "/research/reports/outputs",
    icon: FileText,
  },
  {
    title: "Impact & Sustainability Review",
    description: "Impact metrics, sustainability projects, community stories, and farm outcomes.",
    href: "/research/impact",
    icon: LineChart,
  },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ExportButton({ resourceKey, label }: { resourceKey: string; label: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const queued = await researchServiceApi.startExport(resourceKey, { format: "csv" });
      toast.success("Export queued. Download will start when the file is ready.");
      const job = await waitForExportJob(queued.data.job_id);
      if (job.status !== "SUCCESS") {
        throw new Error(job.error || "Research export failed");
      }
      const blob = await researchServiceApi.downloadExportJob(queued.data.job_id);
      downloadBlob(blob, `${resourceKey}-export.csv`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Research export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      <Download data-icon="inline-start" />
      {isExporting ? "Preparing..." : label}
    </Button>
  );
}

async function waitForExportJob(jobId: string) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const response = await researchServiceApi.getExportJob(jobId);
    if (!["PENDING", "STARTED", "RETRY"].includes(response.data.status)) {
      return response.data;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Export is still processing. Check again shortly.");
}

export default function ResearchReportsPage() {
  return (
    <div>
      <PageHeader
        title="Research Reports"
        description="Export research datasets and prepare standard reporting workflows for the research office."
        primaryAction={{ label: "Report Outputs", href: "/research/reports/outputs" }}
        secondaryActions={[{ label: "All Outputs", href: "/research/outputs", variant: "outline" as const }]}
      />

      <div className="space-y-6 p-6">
        <ResearchSectionGuide title="Research Reports" />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Standard reports</CardTitle>
              <CardDescription>
                Start from a focused reporting path, then export the underlying datasets when needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {standardReports.map((report) => {
                const Icon = report.icon;
                return (
                  <Link
                    key={report.title}
                    href={report.href}
                    className="rounded-lg border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{report.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="size-5 text-primary" />
                <CardTitle>Ask AI reporting</CardTitle>
              </div>
              <CardDescription>
                Planned next phase for prompt-guided reports grounded in research backend data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                This section is prepared for AI-generated briefs, but the current release keeps reporting deterministic through exports and managed report outputs.
              </p>
              <Button variant="outline" size="sm" disabled>
                Ask AI Coming Later
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {exportGroups.map((group) => {
            const Icon = group.icon;
            return (
              <Card key={group.title}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <CardTitle>{group.title}</CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {group.resources.map((resource) => (
                      <ExportButton key={resource.key} resourceKey={resource.key} label={resource.label} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="size-5 text-primary" />
              <CardTitle>Export behavior</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-3">
            <p>Exports are generated from backend research records and require research admin permissions.</p>
            <p>CSV files use stable columns per resource so they can be reused in institutional reporting workflows.</p>
            <p>Formal public-facing reports remain managed as report-type research outputs.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
