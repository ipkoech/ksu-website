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
import { portalAccessApi } from "@ksu/api-client";
import { CheckCircle2 } from "lucide-react";
import { resolvePortalAccessDestination, resolvePostLoginDestination } from "@/lib/auth-routing";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

function loginErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

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
  const { login, switchService } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [isRedirecting, startTransition] = useTransition();

  const redirect = useMemo(() => {
    const value = searchParams.get("redirect");
    if (value && value.startsWith("/")) {
      return value;
    }
    return null;
  }, [searchParams]);
  const reason = searchParams.get("reason");

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setError(null);

    try {
      const { user, services } = await login(values);

      if (user.mustChangePassword) {
        startTransition(() => {
          router.push("/change-password");
        });
        return;
      }

      if (services.length === 0) {
        setError("You do not have access to any admin services.");
        return;
      }

      toast.success("Login successful", {
        description: `Welcome back, ${user.name}!`,
      });

      let destination = resolvePostLoginDestination(
        user,
        redirect && redirectChecked ? redirect : null,
      );

      try {
        const access = await portalAccessApi.get();
        destination = resolvePortalAccessDestination(
          access.data.portals,
          user,
          redirect && redirectChecked ? redirect : null,
        );
      } catch {
        destination = resolvePostLoginDestination(
          user,
          redirect && redirectChecked ? redirect : null,
        );
      }

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
