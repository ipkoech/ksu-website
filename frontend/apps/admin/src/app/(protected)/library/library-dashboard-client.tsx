"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Building2,
  Database,
  FileText,
  HelpCircle,
  Library,
  Ticket,
  Users,
} from "lucide-react";
import { libraryApi } from "@ksu/api-client";
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

type CountResponse = {
  data?: unknown[];
  meta?: {
    total?: number;
  };
};

const countParams = { page: 1, per_page: 1 };

const libraryAreas = [
  {
    title: "Catalog",
    description: "Manage branch-scoped print and digital catalog resources.",
    href: "/library/catalog",
    icon: Library,
  },
  {
    title: "Circulation",
    description:
      "Loan and reservation workflows are served by the library API.",
    href: "/library/circulation",
    icon: BookOpen,
  },
  {
    title: "Patrons",
    description: "No dedicated patron admin endpoint is currently exposed.",
    href: "/library/patrons",
    icon: Users,
  },
  {
    title: "Branches",
    description: "Maintain public branch records, contacts, and active states.",
    href: "/library/branches",
    icon: Building2,
  },
  {
    title: "Electronic resources",
    description:
      "Manage databases, e-book platforms, and online access metadata.",
    href: "/library/electronic",
    icon: Database,
  },
  {
    title: "Regulations",
    description: "Publish borrowing, access, conduct, and fee regulations.",
    href: "/library/regulations",
    icon: FileText,
  },
  {
    title: "Inquiries",
    description: "Review Ask a Librarian submissions and record replies.",
    href: "/library/inquiries",
    icon: HelpCircle,
  },
  {
    title: "Support tickets",
    description: "Manage access, service, resource request, and complaint tickets.",
    href: "/library/tickets",
    icon: Ticket,
  },
];

export function LibraryDashboardClient() {
  const branches = useQuery({
    queryKey: ["library", "branches", "count"],
    queryFn: () =>
      libraryApi.get<CountResponse>("/api/v1/library/branches", {
        ...countParams,
        active_only: true,
      }),
  });
  const loans = useQuery({
    queryKey: ["library", "loans", "count"],
    queryFn: () =>
      libraryApi.get<CountResponse>("/api/v1/library/loans", countParams),
  });
  const inquiries = useQuery({
    queryKey: ["library", "inquiries", "count"],
    queryFn: () =>
      libraryApi.get<CountResponse>("/api/v1/library/inquiries", countParams),
  });
  const tickets = useQuery({
    queryKey: ["library", "tickets", "count"],
    queryFn: () =>
      libraryApi.get<CountResponse>("/api/v1/library/tickets", countParams),
  });

  const stats = [
    {
      title: "Library branches",
      value: formatCount(branches.data, branches.isLoading, branches.isError),
      description: "From /api/v1/library/branches",
      icon: Library,
      href: "/library/branches",
    },
    {
      title: "Loans",
      value: formatCount(loans.data, loans.isLoading, loans.isError),
      description: "From /api/v1/library/loans",
      icon: BookOpen,
      href: "/library/circulation",
    },
    {
      title: "Inquiries",
      value: formatCount(
        inquiries.data,
        inquiries.isLoading,
        inquiries.isError,
      ),
      description: "From /api/v1/library/inquiries",
      icon: HelpCircle,
      href: "/library/inquiries",
    },
    {
      title: "Support tickets",
      value: formatCount(tickets.data, tickets.isLoading, tickets.isError),
      description: "From /api/v1/library/tickets",
      icon: Ticket,
      href: "/library/tickets",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Library Dashboard"
        description="Manage library branches, circulation, and support states using the library service contract."
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

        <Card>
          <CardHeader>
            <CardTitle>Library work areas</CardTitle>
            <CardDescription>
              Navigation is aligned to the service modules currently visible in
              the admin shell.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {libraryAreas.map((area) => {
              const Icon = area.icon;

              return (
                <Button
                  key={area.href}
                  variant="outline"
                  className="h-auto justify-start p-4"
                  asChild
                >
                  <Link href={area.href}>
                    <Icon className="mr-3 h-5 w-5 text-primary" />
                    <span className="text-left">
                      <span className="block font-medium">{area.title}</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        {area.description}
                      </span>
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
