import { AppState } from "@ksu/ui/components";

export default function NotFound() {
  return (
    <AppState
      variant="not-found"
      title="Admin page not found"
      description="The admin page may have moved or your account may not have access to it."
      primaryLabel="Go to sign in"
      primaryHref="/login"
    />
  );
}
