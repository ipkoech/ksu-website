"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon: LucideIcon;
    iconColor?: "blue" | "green" | "purple" | "orange" | "red";
}

const iconColorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
};

export function StatsCard({ title, value, change, changeLabel, icon: Icon, iconColor = "blue" }: StatsCardProps) {
    const isPositive = change && change > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
            className="p-6 rounded-xl border border-border bg-card shadow-sm transition-shadow"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", iconColorClasses[iconColor])}>
                    <Icon className="h-5 w-5" />
                </div>
                {change !== undefined && (
                    isPositive ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                    )
                )}
            </div>
            <h3 className="font-medium text-muted-foreground mb-1">{title}</h3>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change !== undefined && (
                <p className={cn("text-sm mt-1", isPositive ? "text-success" : "text-destructive")}>
                    {isPositive ? "+" : ""}{change}% {changeLabel || "from last period"}
                </p>
            )}
        </motion.div>
    );
}
