"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, SearchX } from "lucide-react";
import { Button } from "../ui";

interface AppStateProps {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
  variant?: "error" | "not-found" | "loading";
}

export function AppState({
  title,
  description,
  primaryLabel = "Go home",
  primaryHref = "/",
  secondaryLabel,
  onSecondaryClick,
  variant = "error",
}: AppStateProps) {
  const Icon = variant === "not-found" ? SearchX : variant === "loading" ? RefreshCw : AlertTriangle;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <section className="w-full max-w-lg rounded-lg border bg-background p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className={variant === "loading" ? "h-6 w-6 animate-spin" : "h-6 w-6"} aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-normal text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href={primaryHref}>
              <Home className="h-4 w-4" aria-hidden />
              {primaryLabel}
            </Link>
          </Button>
          {secondaryLabel && onSecondaryClick ? (
            <Button type="button" variant="outline" onClick={onSecondaryClick}>
              <RefreshCw className="h-4 w-4" aria-hidden />
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
