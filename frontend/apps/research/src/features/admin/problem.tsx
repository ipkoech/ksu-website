"use client";
import { WorkspaceFeedback } from "@ksu/ui/components/workspace-feedback";
import type { RWProblem } from "@ksu/api-client/research";

export function signInUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_RESEARCH_SIGN_IN_URL;
  if (!configured) return "/admin/login";
  try {
    const url = new URL(configured);
    if (url.username || url.password) return undefined;
    if (url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) return url.href;
  } catch { /* Configuration errors never become unsafe navigation. */ }
  return undefined;
}
export function Problem({ problem, onRetry, command = false, researchRecovery = true }: { problem: RWProblem; onRetry?: () => void; command?: boolean; researchRecovery?: boolean }) {
  const login = signInUrl();
  return <WorkspaceFeedback title={problem.title} tone="error" onRetry={problem.retryable ? onRetry : undefined}
    retryLabel={command ? "Retry the same command" : "Retry request"}>
    <p>{problem.message}</p>
    {(problem.kind === "session" || problem.kind === "forbidden") && login &&
      <p className="mt-3"><a href={login} target="_blank" rel="noopener noreferrer" className="underline">Open KSU sign-in in a new tab</a>, then return here.</p>}
    {problem.kind === "forbidden" && command && <p className="mt-3"><a href="/admin/account" target="_blank" rel="noopener noreferrer" className="underline">Check MFA in a new tab</a>. Verification does not grant additional permissions.</p>}
    {researchRecovery && (problem.uncertain || problem.title === "Command recovery required") && <p className="mt-3"><a href="/admin/recovery" target="_blank" rel="noopener noreferrer" className="underline">Open command recovery in a new tab</a>. No request is automatically replayed.</p>}
    {!researchRecovery && problem.uncertain && <p className="mt-3">This Main-service action is not part of the Research command ledger. Check the account or media record before starting another action; do not assume a missing acknowledgement means failure.</p>}
    {problem.kind === "conflict" && onRetry && !command && <button type="button" className="mt-3 underline" onClick={onRetry}>Reload current data</button>}
  </WorkspaceFeedback>;
}
