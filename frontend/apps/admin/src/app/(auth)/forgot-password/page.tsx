import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot Password" description="Enter your email address to request a reset link"><ForgotPasswordForm /></AuthCard>
  );
}
