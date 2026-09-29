"use client";
import { WorkspaceFeedback } from "@ksu/ui/components/workspace-feedback";
export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <WorkspaceFeedback title="This working area could not be rendered" tone="error" onRetry={reset}>
    A rendering error interrupted the page. Retrying rendering does not replay a save or workflow command. Check the record before making another change.
  </WorkspaceFeedback>;
}
