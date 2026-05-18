import { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { FlaskConical, BookOpen, DollarSign, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Research Dashboard",
};

const stats = [
  { title: "Active Projects", value: "42", icon: FlaskConical },
  { title: "Publications", value: "156", icon: BookOpen },
  { title: "Grant Funding", value: "KES 45M", icon: DollarSign },
  { title: "Researchers", value: "89", icon: Users },
];

export default function ResearchDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Research Dashboard"
        description="Manage research projects, publications, and grants"
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
