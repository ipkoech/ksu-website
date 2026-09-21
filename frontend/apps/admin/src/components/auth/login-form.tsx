"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Button,
  Input,
  PasswordInput,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Alert,
  AlertDescription,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useAuth } from "@ksu/auth";
import { portalAccessApi, workspacesApi } from "@ksu/api-client";
import { CheckCircle2 } from "lucide-react";
import { isSafeInternalPath, resolvePortalAccessDestination } from "@/lib/auth-routing";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  mfa_code: z.string().max(64).optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

function loginErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("mfa")) {
    return "Enter a current authenticator code or an unused recovery code.";
  }

  if (
    message.includes("credential") ||
    message.includes("password") ||
    message.includes("unauthorized")
  ) {
    return "Email or password is incorrect.";
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "We could not reach the admin service. Check your connection and try again.";
  }

  return "Sign in failed. Check your details and try again.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout, switchService } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [isRedirecting, startTransition] = useTransition();

  const redirect = useMemo(() => {
    const value = searchParams.get("redirect");
    if (isSafeInternalPath(value)) {
      return value;
    }
    return null;
  }, [searchParams]);
  const reason = searchParams.get("reason");

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", mfa_code: "" },
  });

  async function onSubmit(values: LoginValues) {
    setError(null);

    try {
      const { user, services } = await login({ ...values, mfa_code: values.mfa_code?.trim() || undefined });

      if (user.mustChangePassword) {
        startTransition(() => {
          router.push("/change-password");
        });
        return;
      }

      if (services.length === 0) {
        startTransition(() => router.push("/access-denied"));
        return;
      }

      const access = await portalAccessApi.get();
      const workspaces = access.data.workspaces ?? [];
      const selectedWorkspace = access.data.preferred_workspace ?? (workspaces.length === 1 ? workspaces[0] : null);
      if (selectedWorkspace && !selectedWorkspace.selection_required) {
        const scope = selectedWorkspace.selected_scope ??
          (selectedWorkspace.scopes.length === 1 ? selectedWorkspace.scopes[0] : undefined);
        await workspacesApi.activate(selectedWorkspace.workspace, {
          scope,
        });
      } else if (workspaces.length > 1 || selectedWorkspace?.selection_required) {
        const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
        startTransition(() => router.push(`/workspace-selection${query}`));
        return;
      }
      if (workspaces.length === 0 && access.data.portals.length === 0) {
        startTransition(() => router.push("/access-denied"));
        return;
      }
      const destination = resolvePortalAccessDestination(
        access.data.portals,
        user,
        redirect && redirectChecked ? redirect : null,
      );

      toast.success("Login successful", { description: `Welcome back, ${user.name}!` });

      if (destination.service) {
        switchService(destination.service);
      }

      startTransition(() => {
        router.push(destination.href);
      });
    } catch (err) {
      setError(loginErrorMessage(err));
    }
  }

  // Mark redirect as checked after first render to ensure it doesn't interfere with form
  useEffect(() => {
    setRedirectChecked(true);
  }, []);

  if (reason === "session-expired") {
    return <div className="space-y-4 text-center" role="alert"><div><h2 className="text-lg font-semibold text-[#102a43]">Your session has expired</h2><p className="mt-2 text-sm text-muted-foreground">For your security, please sign in again to continue.</p></div><Button type="button" className="w-full" onClick={() => router.replace("/login")}>Sign in again</Button><Button type="button" variant="outline" className="w-full" onClick={() => logout().then(() => router.replace("/login"))}>Sign out</Button></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!error && reason === "session-expired" && (
          <Alert>
            <AlertDescription>
              Your session expired. Sign in again to continue.
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="username"
                  placeholder="you@kisiiuniversity.ac.ke"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mfa_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authenticator or recovery code (if enabled)</FormLabel>
              <FormControl>
                <Input autoComplete="one-time-code" maxLength={64} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          loading={form.formState.isSubmitting || isRedirecting}
        >
          {isRedirecting ? "Redirecting..." : "Sign In"}
        </Button>

        {isRedirecting && (
          <div
            className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Login successful! Taking you to your dashboard...</span>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </Form>
  );
}
