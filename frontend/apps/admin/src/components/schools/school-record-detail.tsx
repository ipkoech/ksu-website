"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { schoolPortalApi } from "@ksu/api-client";
import { SchoolWorkspace, SchoolWorkspaceHeader } from "./shared/school-workspace";
import { SchoolStaffDetail } from "./school-staff-detail";
import { SchoolInquiryDetail } from "./school-inquiry-detail";

export function SchoolRecordDetail({ resource, id }: { resource: string; id: string }) {
  const supported = ["departments", "programmes", "inquiries", "publications"].includes(resource);
  const query = useQuery({ queryKey: ["school-record", resource, id], enabled: supported && resource !== "inquiries", queryFn: async () => { if (resource === "departments") return (await schoolPortalApi.departments.get(id)).data; if (resource === "programmes") return (await schoolPortalApi.programmes.get(id)).data; return (await schoolPortalApi.publications.get(id)).data; } });
  if (["team", "staff", "lecturers"].includes(resource)) return <SchoolStaffDetail id={id} />;
  if (!supported) return <SchoolWorkspace><Alert variant="destructive"><AlertTitle>Detail view unavailable</AlertTitle><AlertDescription>This resource does not expose a supported scoped detail view.</AlertDescription></Alert></SchoolWorkspace>;
  if (resource === "inquiries") return <SchoolInquiryDetail id={id} />;
  const title = resource.replace(/[-_]/g, " ").replace(/\b\w/g, (v) => v.toUpperCase());
  if (query.isPending) return <SchoolWorkspace><Loader2 className="size-6 animate-spin" aria-label="Loading record" /></SchoolWorkspace>;
  if (query.error) return <SchoolWorkspace><Alert variant="destructive"><AlertTitle>Record unavailable</AlertTitle><AlertDescription>{query.error.message}</AlertDescription></Alert></SchoolWorkspace>;
  const data = query.data as unknown as Record<string, unknown> | undefined;
  return <SchoolWorkspace><SchoolWorkspaceHeader eyebrow="School administration" title={`${title} detail`} description="View the authorized record in the active school scope." icon={FileText} actions={<Button asChild variant="outline"><Link href={`/schools/${resource}`}><ArrowLeft className="mr-2 size-4" />Back</Link></Button>} /><Card><CardHeader><CardTitle>{String(data?.name ?? data?.title ?? "Record")}</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{Object.entries(data ?? {}).filter(([key]) => !["id", "created_at", "updated_at"].includes(key)).slice(0, 16).map(([key, value]) => <div key={key} className="rounded-md border p-3"><p className="text-xs capitalize text-muted-foreground">{key.replace(/_/g, " ")}</p><p className="mt-1 break-words text-sm font-medium">{typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}</p></div>)}</CardContent></Card></SchoolWorkspace>;
}
