import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, LogoIcon } from "@ksu/ui/components";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <Suspense>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <LogoIcon size="lg" className="mx-auto mb-4" priority />
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>
            Sign in to manage Kisii University systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </Suspense>
  );
}
