"use client";

import Link from "next/link";
import { Calendar, FileText, ImageIcon, Megaphone, Newspaper } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";

const contentLinks = [
  { title: "News", href: "/research/content/news", icon: Newspaper },
  { title: "Blogs", href: "/research/content/blogs", icon: FileText },
  { title: "Events", href: "/research/content/events", icon: Calendar },
  { title: "Announcements", href: "/research/content/announcements", icon: Megaphone },
  { title: "Sliders", href: "/research/content/sliders", icon: ImageIcon },
];

export default function ResearchContentPage() {
  return (
    <div>
      <PageHeader
        title="Research Content"
        description="Research content is managed through the main content service with research scope."
      />
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        {contentLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Card key={link.href}>
              <CardHeader>
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{link.title}</CardTitle>
                <CardDescription>Main content model scoped to research.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href={link.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
