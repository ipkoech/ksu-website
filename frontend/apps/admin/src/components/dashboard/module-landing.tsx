"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Building, Building2, CalendarDays, FileText, KeyRound, MessageSquare, Settings, UserRound, Users } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";

const moduleIcons = {
  bookOpen: BookOpen,
  building: Building,
  building2: Building2,
  calendarDays: CalendarDays,
  fileText: FileText,
  keyRound: KeyRound,
  messageSquare: MessageSquare,
  settings: Settings,
  userRound: UserRound,
  users: Users,
};

type ModuleIconName = keyof typeof moduleIcons;

export interface ModuleLandingItem {
  title: string;
  description: string;
  href: string;
  icon: ModuleIconName;
  status: string;
}

interface ModuleLandingProps {
  title: string;
  description: string;
  items: ModuleLandingItem[];
  backendNotes: string[];
}

export function ModuleLanding({ title, description, items, backendNotes }: ModuleLandingProps) {
  return (
    <PageTransition>
      <PageHeader title={title} description={description} />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = moduleIcons[item.icon];

          return (
            <Card key={item.href} className="flex h-full flex-col">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {item.status}
                </p>
                <Button asChild className="w-full justify-between">
                  <Link href={item.href}>
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Backend coverage</CardTitle>
          <CardDescription>Current implementation constraints for this admin section.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {backendNotes.map((note) => (
            <div key={note} className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
              {note}
            </div>
          ))}
        </CardContent>
      </Card>
    </PageTransition>
  );
}
