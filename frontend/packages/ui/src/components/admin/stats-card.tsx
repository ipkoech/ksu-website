"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { cn } from "../../lib";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  href?: string;
  className?: string;
}

export function StatsCard({ title, value, icon, trend, href, className }: StatsCardProps) {
  const content = (
    <Card className={cn("transition-shadow hover:shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {trend ? (
          <div className={cn("mt-2 inline-flex items-center gap-1 text-xs", trend.isPositive ? "text-emerald-600" : "text-rose-600")}>
            {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend.value)}%
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
