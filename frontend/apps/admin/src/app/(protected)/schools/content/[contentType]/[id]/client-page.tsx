"use client";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Skeleton,
} from "@ksu/ui/components";
import { schoolPortalApi, type SchoolContentType } from "@ksu/api-client";
import {
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";

export default function SchoolContentDetailPage() {
  const params = useParams<{ contentType: string; id: string }>();
  const contentType = params.contentType as SchoolContentType;
  const query = useQuery({
    queryKey: ["school-content", contentType, params.id],
    queryFn: async () =>
      (await schoolPortalApi.content.get(contentType, params.id)).data,
  });
  const queryClient = useQueryClient();
  const workflow = useMutation({
    mutationFn: (action: "submit" | "withdraw") => schoolPortalApi.content.action(contentType, params.id, action),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["school-content", contentType, params.id] }),
  });
  if (query.isPending)
    return (
      <SchoolWorkspace>
        <Skeleton className="h-64" />
      </SchoolWorkspace>
    );
  if (query.error)
    return (
      <SchoolWorkspace>
        <Alert variant="destructive">
          <AlertTitle>Content unavailable</AlertTitle>
          <AlertDescription>{query.error.message}</AlertDescription>
        </Alert>
      </SchoolWorkspace>
    );
  const record = query.data as Record<string, unknown> | undefined;
  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="Content & publications"
        title={String(record?.title ?? record?.name ?? "Content detail")}
        description="View and review this authorized school-scoped content record."
        icon={FileText}
        actions={<div className="flex gap-2"><Button onClick={() => workflow.mutate("submit")} disabled={workflow.isPending}>Submit for review</Button><Button variant="outline" onClick={() => workflow.mutate("withdraw")} disabled={workflow.isPending}>Withdraw</Button></div>}
      />
      <Card>
        <CardHeader>
          <CardTitle>Content record</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {Object.entries(record ?? {}).map(([key, value]) => (
            <div key={key} className="rounded border p-3">
              <p className="text-xs capitalize text-muted-foreground">
                {key.replace(/_/g, " ")}
              </p>
              <p className="mt-1 text-sm">
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value ?? "—")}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </SchoolWorkspace>
  );
}
