import { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <AuthCard title="Reset Password" description="Enter your new password below"><ResetPasswordForm /></AuthCard>
    </Suspense>
  );
}
