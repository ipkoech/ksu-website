"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  FileText,
  GraduationCap,
  ImageIcon,
  Newspaper,
  School,
  Users,
} from "lucide-react";
import {
  mediaApi,
  queryKeys,
  statsApi,
  useDepartments,
  useNewsList,
  usePersons,
  useProgrammes,
  useSchools,
  useStaffAssignments,
} from "@ksu/api-client";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";
import { formatCount } from "@/lib/counts";

const countParams = { page: 1, per_page: 1, fields: "id" };

const quickActions = [
  { label: "Create news", href: "/content/news/new", icon: Newspaper },
  { label: "Add event", href: "/content/events/new", icon: Calendar },
  { label: "Upload media", href: "/media", icon: ImageIcon },
  {
    label: "Manage programmes",
    href: "/academic/programmes",
    icon: GraduationCap,
  },
];

function adminStatValue(
  stats: Awaited<ReturnType<typeof statsApi.admin>> | undefined,
  key: string,
) {
  const value = stats?.data.stats.find((item) => item.key === key)?.value;
  return typeof value === "number" ? value.toLocaleString() : undefined;
}

export function MainDashboardClient() {
  const adminStats = useQuery({
    queryKey: ["main", "admin-stats"],
    queryFn: () => statsApi.admin(),
  });
  const news = useNewsList({ ...countParams, is_published: true });
  const schools = useSchools(countParams);
  const departments = useDepartments(countParams);
  const programmes = useProgrammes(countParams);
  const persons = usePersons(countParams);
  const staff = useStaffAssignments(countParams);
  const media = useQuery({
    queryKey: queryKeys.media.list(countParams),
    queryFn: () => mediaApi.list(countParams),
  });

  const stats = [
    {
      title: "Published news",
      value:
        adminStatValue(adminStats.data, "published_content") ??
        formatCount(news.data, news.isLoading, news.isError),
      description: "From the main stats API",
      icon: FileText,
      href: "/content/news",
    },
    {
      title: "Open intakes",
      value:
        adminStatValue(adminStats.data, "open_intakes") ??
        (adminStats.isLoading ? "--" : "Unavailable"),
      description: "Open institutional intake cycles",
      icon: Calendar,
      href: "/admissions",
    },
    {
      title: "Academic programmes",
      value:
        adminStatValue(adminStats.data, "programmes") ??
        formatCount(programmes.data, programmes.isLoading, programmes.isError),
      description: "From the main stats API",
      icon: GraduationCap,
      href: "/academic/programmes",
    },
    {
      title: "Media assets",
      value:
        adminStatValue(adminStats.data, "media") ??
        formatCount(media.data, media.isLoading, media.isError),
      description: "From the main stats API",
      icon: ImageIcon,
      href: "/media",
    },
  ];

  const modules = [
    {
      title: "Content",
      description: "News, events, announcements, blogs, and homepage sliders.",
      href: "/content",
      value: formatCount(news.data, news.isLoading, news.isError),
      valueLabel: "published news",
      icon: FileText,
    },
    {
      title: "Academic",
      description:
        "Schools, departments, and programme records used by the public site.",
      href: "/academic",
      value: formatCount(schools.data, schools.isLoading, schools.isError),
      valueLabel: "schools",
      icon: School,
    },
    {
      title: "People",
      description:
        "Person profiles and staff assignments for university entities.",
      href: "/people",
      value: formatCount(persons.data, persons.isLoading, persons.isError),
      valueLabel: "persons",
      icon: Users,
    },
    {
      title: "Organization",
      description:
        "Department and staff structures that feed directory experiences.",
      href: "/academic/departments",
      value: formatCount(
        departments.data,
        departments.isLoading,
        departments.isError,
      ),
      valueLabel: "departments",
      icon: School,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Main portal operations backed by content, academic, people, and media APIs."
        primaryAction={{ label: "Create news", href: "/content/news/new" }}
        secondaryActions={[{ label: "View content", href: "/content" }]}
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
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Main service modules</CardTitle>
              <CardDescription>
                Source-backed admin areas currently exposed in the main service.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {modules.map((module) => {
                const Icon = module.icon;

                return (
                  <Link
                    key={module.title}
                    href={module.href}
                    className="rounded-lg border bg-background p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{module.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {module.valueLabel}
                        </p>
                      </div>
                    </div>
                    <h3 className="font-semibold">{module.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                Common actions that map to implemented admin routes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Button
                    key={action.href}
                    variant="outline"
                    className="justify-start"
                    asChild
                  >
                    <Link href={action.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data coverage</CardTitle>
            <CardDescription>
              Counts are read from backend list endpoints. Analytics, traffic,
              and trend metrics are not shown until a reporting API is
              available.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border bg-background p-3">
              <p className="font-medium">Staff assignments</p>
              <p className="mt-1 text-muted-foreground">
                {formatCount(staff.data, staff.isLoading, staff.isError)}{" "}
                records
              </p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="font-medium">Departments</p>
              <p className="mt-1 text-muted-foreground">
                {formatCount(
                  departments.data,
                  departments.isLoading,
                  departments.isError,
                )}{" "}
                records
              </p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="font-medium">People</p>
              <p className="mt-1 text-muted-foreground">
                {formatCount(persons.data, persons.isLoading, persons.isError)}{" "}
                records
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
