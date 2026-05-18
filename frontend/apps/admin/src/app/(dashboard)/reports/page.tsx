"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { BarChart3, PieChart, TrendingUp, Users } from "lucide-react";
import { Button } from "@ksu/ui/button";

interface ReportCard {
    title: string;
    description: string;
    icon: React.ReactNode;
    metrics: string;
}

export default function ReportsPage() {
    const reports: ReportCard[] = [
        {
            title: "User Analytics",
            description: "Detailed user engagement and activity metrics",
            icon: <Users className="h-6 w-6" />,
            metrics: "2,543 active users",
        },
        {
            title: "Content Performance",
            description: "Track performance of published content",
            icon: <BarChart3 className="h-6 w-6" />,
            metrics: "1,234 items published",
        },
        {
            title: "Traffic Analytics",
            description: "Website traffic and user behavior analysis",
            icon: <TrendingUp className="h-6 w-6" />,
            metrics: "45.2K page views",
        },
        {
            title: "System Health",
            description: "Monitor system performance and uptime",
            icon: <PieChart className="h-6 w-6" />,
            metrics: "99.9% uptime",
        },
    ];

    return (
        <PageTransition>
            <PageHeader
                title="Reports"
                description="View analytics and system reports"
            />

            <div className="grid gap-6 md:grid-cols-2">
                {reports.map((report, index) => (
                    <motion.div
                        key={report.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-lg border border-border bg-card p-6"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-lg bg-muted p-3 text-primary">
                                {report.icon}
                            </div>
                            <Button variant="outline" size="sm">View Report</Button>
                        </div>
                        <h3 className="mb-1 text-lg font-semibold">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {report.description}
                        </p>
                        <p className="text-sm font-medium text-primary">
                            {report.metrics}
                        </p>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 rounded-lg border border-border bg-card p-6"
            >
                <h2 className="mb-4 text-lg font-semibold">Export Reports</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Monthly Summary</p>
                            <p className="text-sm text-muted-foreground">
                                Generate a monthly summary report
                            </p>
                        </div>
                        <Button variant="outline">Download</Button>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                        <div>
                            <p className="font-medium">Annual Report</p>
                            <p className="text-sm text-muted-foreground">
                                Generate an annual comprehensive report
                            </p>
                        </div>
                        <Button variant="outline">Download</Button>
                    </div>
                </div>
            </motion.div>
        </PageTransition>
    );
}
