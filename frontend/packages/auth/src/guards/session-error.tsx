"use client";

export function SessionError({ retry }: { retry: () => Promise<void> }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center" role="alert">
        <p>Unable to verify your session. Please try again.</p>
        <button
          type="button"
          className="min-h-11 rounded-md bg-primary px-4 py-2 text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => void retry()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
