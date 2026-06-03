"use client";

import { AppState } from "@ksu/ui/components";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AppState
      title="Admin page failed to load"
      description="The admin portal could not load this page. Retry the request or sign in again if your session expired."
      primaryLabel="Go to sign in"
      primaryHref="/login"
      secondaryLabel="Try again"
      onSecondaryClick={reset}
    />
  );
}
