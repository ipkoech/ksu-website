"use client";

import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";
import { ResearchSectionGuide } from "./research-guidance";

interface SectionLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export function ResearchSectionIndex({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links: SectionLink[];
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="space-y-4 p-6">
        <ResearchSectionGuide title={title} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Card key={link.href} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{link.title}</CardTitle>
                </div>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href={link.href}>
                    Open
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
        </div>
      </div>
    </div>
  );
}
