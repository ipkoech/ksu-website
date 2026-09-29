"use client";
import type { ReactNode } from "react";
import { Button } from "./button";

/** Reusable feedback with one explicit recovery action, not silent fallbacks. */
export function WorkspaceFeedback({ title, children, tone = "neutral", onRetry, retryLabel = "Retry" }:
  { title: string; children?: ReactNode; tone?: "neutral" | "error" | "success"; onRetry?: () => void; retryLabel?: string }) {
  return <section className={`rounded-xl border p-5 ${tone === "error" ? "border-destructive/30 bg-destructive/5" :
    tone === "success" ? "border-primary/20 bg-primary/5" : "border-border bg-muted/30"}`}
    role={tone === "error" ? "alert" : "status"}>
    <h2 className="font-semibold">{title}</h2>
    {children && <div className="mt-2 text-sm leading-relaxed">{children}</div>}
    {onRetry && <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>{retryLabel}</Button>}
  </section>;
}
export function WorkspaceLoading({ label = "Loading your assigned workspace…" }: { label?: string }) {
  return <div role="status" aria-live="polite" className="space-y-4 p-6">
    <p className="text-sm text-muted-foreground">{label}</p>
    {[0, 1, 2].map(index => <div key={index} aria-hidden="true" className="h-12 rounded-lg bg-muted motion-safe:animate-pulse" />)}
  </div>;
}
export function WorkspaceStatus({ value }: { value: string | null }) {
  return <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold capitalize">
    {value ? value.replace(/_/g, " ") : "No editorial workflow"}
  </span>;
}
