"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Archive,
  ArrowUpDown,
  Eye,
  FileText,
  Plus,
  Send,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";
import { governanceAdminApi, type CouncilDashboard as CouncilDashboardStats } from "@/lib/api/organization";

const statItems: Array<{
  key: keyof CouncilDashboardStats;
  label: string;
  description: string;
}> = [
  {
    key: "active_members_count",
    label: "Active Members",
    description: "Current Council appointments",
  },
  {
    key: "published_profiles_count",
    label: "Published Profiles",
    description: "Visible on the public site",
  },
  {
    key: "draft_profiles_count",
    label: "Draft Profiles",
    description: "Needs review before publishing",
  },
  {
    key: "inactive_profiles_count",
    label: "Inactive Members",
    description: "Ended or archived appointments",
  },
  {
    key: "vacant_positions_count",
    label: "Vacant Positions",
    description: "Configured open seats",
  },
];

const actionItems = [
  {
    label: "Add Council Member",
    description: "Create an appointment profile and attach a person.",
    icon: Plus,
    tab: "members",
  },
  {
    label: "Manage Display Order",
    description: "Arrange chairperson, members, and secretary.",
    icon: ArrowUpDown,
    tab: "order",
  },
  {
    label: "Preview Public Page",
    description: "Review the public Council page before publishing.",
    icon: Eye,
    tab: "preview",
  },
  {
    label: "Publish Changes",
    description: "Move approved profiles and page content live.",
    icon: Send,
    tab: "members",
  },
  {
    label: "View Archived Members",
    description: "Review former Council appointments.",
    icon: Archive,
    tab: "archive",
  },
];

export function CouncilDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ["governance", "university-council", "dashboard"],
    queryFn: () => governanceAdminApi.dashboard(),
  });
  const stats = dashboardQuery.data?.data;

  return (
    <div>
      <PageHeader
        title="University Governance"
        description="Manage Council members, page content, official order, preview, and publication workflow."
      />

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <section className="rounded-lg border bg-background">
          <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">University Council</Badge>
                <Badge variant="outline">Workflow managed</Badge>
              </div>
              <h2 className="mt-3 text-lg font-semibold">Council Overview</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add members, manage official order, preview public cards, and publish only after approval.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Last update{" "}
              <span className="font-medium text-foreground">
                {stats?.last_update_date ? new Date(stats.last_update_date).toLocaleDateString() : "Unavailable"}
              </span>
            </div>
          </div>

          <div className="grid gap-px bg-border md:grid-cols-2 xl:grid-cols-5">
            {statItems.map((item) => (
              <div key={item.key} className="bg-background p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">
                  {dashboardQuery.isLoading
                    ? "..."
                    : dashboardQuery.isError
                      ? "Unavailable"
                      : Number(stats?.[item.key] ?? 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-5">
          {actionItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={`#${item.tab}`}
                className="group flex min-h-28 flex-col justify-between rounded-lg border bg-background p-4 transition hover:border-primary/50 hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className="size-5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Open</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{item.label}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </a>
            );
          })}
        </section>

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 lg:w-fit lg:grid-cols-5">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="order">Order</TabsTrigger>
            <TabsTrigger value="page-content">Page Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          <TabsContent id="members" value="members">
            <WorkspacePanel
              icon={Users}
              title="Council Members"
              description="Create profiles, review appointment details, and move records through the publication workflow."
              actionLabel="Add Council Member"
            />
          </TabsContent>
          <TabsContent id="order" value="order">
            <WorkspacePanel
              icon={ArrowUpDown}
              title="Official Display Order"
              description="Arrange the Chairperson, Council Members, and Secretary in the order used on the public page."
              actionLabel="Manage Display Order"
            />
          </TabsContent>
          <TabsContent id="page-content" value="page-content">
            <WorkspacePanel
              icon={FileText}
              title="Hero And Mandate"
              description="Manage the Council page title, introductory copy, hero image, mandate, and document CTA."
              actionLabel="Edit Page Content"
            />
          </TabsContent>
          <TabsContent id="preview" value="preview">
            <WorkspacePanel
              icon={Eye}
              title="Public Preview"
              description="Review the Council page using the same grouping and card structure visitors will see."
              actionLabel="Preview Public Page"
            />
          </TabsContent>
          <TabsContent id="archive" value="archive">
            <WorkspacePanel
              icon={Archive}
              title="Archived Members"
              description="Review former members, ended terms, inactive appointments, and archived profiles."
              actionLabel="View Archived Members"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function WorkspacePanel({
  icon: Icon,
  title,
  description,
  actionLabel,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  actionLabel: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1 max-w-2xl">{description}</CardDescription>
          </div>
        </div>
        <Button type="button" variant="outline">
          <UserCheck className="size-4" />
          {actionLabel}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
          This workspace is ready for Council operations. Select a primary action above to continue.
        </div>
        <div className="mt-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/governance">Back to governance dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
