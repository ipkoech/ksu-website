import { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { FileText, Users, Calendar, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Main Dashboard",
};

const stats = [
  {
    title: "Published News",
    value: "24",
    description: "+3 this week",
    icon: FileText,
  },
  {
    title: "Active Staff",
    value: "156",
    description: "12 departments",
    icon: Users,
  },
  {
    title: "Upcoming Events",
    value: "8",
    description: "Next 30 days",
    icon: Calendar,
  },
  {
    title: "Page Views",
    value: "12.5K",
    description: "+15% from last month",
    icon: Eye,
  },
];

export default function MainDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to the University Portal management dashboard"
      />

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
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
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest content updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">News article published</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Create News",
                  "Add Event",
                  "Upload Media",
                  "View Reports",
                ].map((action) => (
                  <button
                    key={action}
                    className="rounded-lg border p-3 text-left text-sm font-medium transition-colors hover:bg-accent"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
