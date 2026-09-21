"use client";
import { useRouter } from "next/navigation";
import { Button } from "@ksu/ui/components";
import { useAuth } from "@ksu/auth";
import { AuthCard } from "@/components/auth/auth-card";

export default function AccessDeniedPage() {
  const router = useRouter(); const { logout } = useAuth();
  return <AuthCard title="Access unavailable" description="No administrator workspace access is currently assigned to this account."><div className="space-y-3"><p className="text-sm text-muted-foreground">Contact your university administrator if you believe you should have access.</p><Button className="w-full" onClick={() => router.refresh()}>Check access again</Button><Button variant="outline" className="w-full" onClick={() => logout().then(() => router.replace("/login"))}>Sign out</Button></div></AuthCard>;
}
