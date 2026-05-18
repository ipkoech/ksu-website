import { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { Library, BookOpen, Users, ArrowLeftRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Library Dashboard",
};

const stats = [
  { title: "Total Resources", value: "45,230", icon: Library },
  { title: "Active Loans", value: "892", icon: BookOpen },
  { title: "Registered Patrons", value: "8,456", icon: Users },
  { title: "Returns Today", value: "45", icon: ArrowLeftRight },
];

export default function LibraryDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Library Dashboard"
        description="Manage library resources, circulation, and patrons"
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
