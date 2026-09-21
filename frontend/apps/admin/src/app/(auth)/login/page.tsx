import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthCard title="Admin Portal" description="Sign in to manage Kisii University systems"><LoginForm /><p className="mt-5 text-center text-xs text-muted-foreground">Administrator access is provisioned by Kisii University.</p></AuthCard>
    </Suspense>
  );
}
