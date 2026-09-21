import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <Card className="w-full max-w-md border-slate-200 bg-white shadow-xl shadow-slate-900/10"><CardHeader className="space-y-4 text-center"><img src="/logos/ksu-logo.png" alt="Kisii University" className="mx-auto h-16 w-auto object-contain" /><div><CardTitle className="text-2xl font-semibold tracking-tight text-[#102a43]">{title}</CardTitle><CardDescription className="mt-2">{description}</CardDescription></div></CardHeader><CardContent>{children}</CardContent></Card>;
}
