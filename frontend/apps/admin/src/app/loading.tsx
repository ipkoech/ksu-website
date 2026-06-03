import { AppState } from "@ksu/ui/components";

export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <AppState
        variant="loading"
        title="Loading admin portal"
        description="Preparing the requested admin workspace."
        primaryLabel="Go to sign in"
        primaryHref="/login"
      />
    </div>
  );
}
