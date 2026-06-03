"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Button,
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
import { resetPassword } from "@ksu/auth";
import { ArrowLeft, CheckCircle } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function resetPasswordErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("expired") || message.includes("token")) {
    return "This reset link is invalid or has expired. Request a new password reset link.";
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "We could not reach the admin service. Check your connection and try again.";
  }

  return "Password reset failed. Check the password requirements and try again.";
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const password = form.watch("password");
  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /[0-9]/.test(password) },
  ];

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setError(null);

    try {
      await resetPassword(token, values.password);
      setSuccess(true);
    } catch (err) {
      setError(resetPasswordErrorMessage(err));
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center" role="status" aria-live="polite">
        <Alert variant="destructive">
          <AlertDescription>
            Invalid or missing reset token. Please request a new password reset
            link.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-full">
          <Link href="/forgot-password">Request New Link</Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-6 w-6 text-success" />
        </div>
        <div>
          <h3 className="font-semibold">Password Reset Successful</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your password has been reset. You can now sign in with your new
            password.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-md border bg-muted/40 p-3" aria-live="polite">
          <p className="text-sm font-medium">Password requirements</p>
          <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
            {passwordChecks.map((check) => (
              <li
                key={check.label}
                className={check.valid ? "text-success" : undefined}
              >
                {check.valid ? "Met:" : "Needed:"} {check.label}
              </li>
            ))}
          </ul>
        </div>

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Confirm new password"
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
          loading={form.formState.isSubmitting}
        >
          Reset Password
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to login
          </Link>
        </div>
      </form>
    </Form>
  );
}
