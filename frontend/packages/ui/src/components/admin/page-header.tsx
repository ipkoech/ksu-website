"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "../ui";

export interface PageHeaderAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: PageHeaderAction;
  secondaryActions?: PageHeaderAction[];
  backHref?: string;
  children?: React.ReactNode;
}

function ActionButton({ action }: { action: PageHeaderAction }) {
  if (action.href) {
    return (
      <Button asChild type="button" variant={action.variant ?? "outline"}>
        <Link href={action.href}>{action.label}</Link>
      </Button>
    );
  }

  return (
    <Button type="button" variant={action.variant ?? "outline"} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  primaryAction,
  secondaryActions = [],
  backHref,
  children,
}: PageHeaderProps) {
  return (
    <div className="border-b bg-background px-6 py-5">
      {breadcrumbs.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={`${item.label}-${index}`}>
              {item.href ? <Link href={item.href} className="hover:text-foreground">{item.label}</Link> : <span>{item.label}</span>}
              {index < breadcrumbs.length - 1 ? <ChevronRight className="h-4 w-4" /> : null}
            </React.Fragment>
          ))}
        </div>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          {backHref ? (
            <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          ) : null}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {description ? <p className="mt-1 text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {secondaryActions.map((action) => (
            <ActionButton key={action.label} action={action} />
          ))}
          {primaryAction ? <ActionButton action={{ ...primaryAction, variant: primaryAction.variant ?? "default" }} /> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
