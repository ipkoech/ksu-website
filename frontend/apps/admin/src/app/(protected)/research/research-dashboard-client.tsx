"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileText, FlaskConical, HandCoins } from "lucide-react";
import { researchApi } from "@ksu/api-client";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";
import { formatCount } from "@/lib/counts";

type CountResponse = {
  data?: unknown[];
  meta?: {
    total?: number;
  };
};

const countParams = { page: 1, per_page: 1 };

const researchAreas = [
  {
    title: "Projects",
    description: "Manage research project records and their public status.",
    href: "/research/projects",
    icon: FlaskConical,
  },
  {
    title: "Publications",
    description: "Review publication records from the research service.",
    href: "/research/publications",
    icon: BookOpen,
  },
  {
    title: "Grants",
    description: "Track grant records and funding workflows exposed by the research API.",
    href: "/research/grants",
    icon: HandCoins,
  },
];

export function ResearchDashboardClient() {
  const projects = useQuery({
    queryKey: ["research", "projects", "count"],
    queryFn: () => researchApi.get<CountResponse>("/api/v1/projects", countParams),
  });
  const publications = useQuery({
    queryKey: ["research", "publications", "count"],
    queryFn: () => researchApi.get<CountResponse>("/api/v1/publications", countParams),
  });
  const grants = useQuery({
    queryKey: ["research", "grants", "count"],
    queryFn: () => researchApi.get<CountResponse>("/api/v1/grants", countParams),
  });

  const stats = [
    {
      title: "Research projects",
      value: formatCount(projects.data, projects.isLoading, projects.isError),
      description: "From /api/v1/projects",
      icon: FlaskConical,
      href: "/research/projects",
    },
    {
      title: "Publications",
      value: formatCount(publications.data, publications.isLoading, publications.isError),
      description: "From /api/v1/publications",
      icon: BookOpen,
      href: "/research/publications",
    },
    {
      title: "Grants",
      value: formatCount(grants.data, grants.isLoading, grants.isError),
      description: "From /api/v1/grants",
      icon: HandCoins,
      href: "/research/grants",
    },
    {
      title: "Reporting",
      value: "Not configured",
      description: "No aggregate research reporting endpoint is wired",
      icon: FileText,
      href: "/research",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Research Dashboard"
        description="Manage research projects, publications, and grants using source-backed research service states."
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link key={stat.title} href={stat.href} className="block">
                <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Research work areas</CardTitle>
            <CardDescription>Navigation reflects the research backend modules currently exposed by the admin shell.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {researchAreas.map((area) => {
              const Icon = area.icon;

              return (
                <Button key={area.href} variant="outline" className="h-auto justify-start p-4" asChild>
                  <Link href={area.href}>
                    <Icon className="mr-3 h-5 w-5 text-primary" />
                    <span className="text-left">
                      <span className="block font-medium">{area.title}</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">{area.description}</span>
                    </span>
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
