"use client";

import { motion } from "framer-motion";
import { Users, FileText, Briefcase, BarChart3 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";

export default function DashboardPage() {
    const stats = [
        {
            title: "Total Users",
            value: "2,543",
            change: 12,
            changeLabel: "vs last month",
            icon: Users,
            iconColor: "blue" as const,
        },
        {
            title: "Total Content",
            value: "1,234",
            change: 8,
            changeLabel: "vs last month",
            icon: FileText,
            iconColor: "green" as const,
        },
        {
            title: "Active Programs",
            value: "45",
            change: -2,
            changeLabel: "vs last month",
            icon: Briefcase,
            iconColor: "purple" as const,
        },
        {
            title: "Engagement Rate",
            value: "68%",
            change: 5,
            changeLabel: "vs last month",
            icon: BarChart3,
            iconColor: "orange" as const,
        },
    ];

    return (
        <PageTransition>
            <PageHeader
                title="Dashboard"
                description="Welcome to Kisii University Admin Portal"
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <StatsCard {...stat} />
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
                {/* Recent Activity - Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-lg border border-border bg-card p-6"
                >
                    <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                                <p className="text-sm text-muted-foreground">Activity {i} placeholder</p>
                                <span className="text-xs text-muted-foreground">2h ago</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions - Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-lg border border-border bg-card p-6"
                >
                    <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                    <div className="space-y-2">
                        {["Create News", "Manage Users", "View Reports"].map((action) => (
                            <button
                                key={action}
                                className="w-full rounded-md bg-muted px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/80"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
}
