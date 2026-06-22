"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Download, FileUp, Play } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { importsApi, useCommitImport, useImportResource, usePreviewImport } from "@ksu/api-client";
import type { ImportCommitResult, ImportPreview, ImportPreviewRow } from "@ksu/api-client";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";

function statusVariant(status: ImportPreviewRow["status"]) {
  if (status === "valid") return "default";
  if (status === "duplicate") return "outline";
  return "destructive";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function ImportClientPage() {
  const params = useParams<{ resource: string }>();
  const resourceKey = params.resource;
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [commitResult, setCommitResult] = useState<ImportCommitResult | null>(null);

  const { data: resourceResponse, isLoading: isResourceLoading } = useImportResource(resourceKey);
  const previewImport = usePreviewImport();
  const commitImport = useCommitImport();
  const resource = resourceResponse?.data;

  const validRows = useMemo(
    () => preview?.rows.filter((row) => row.status === "valid") ?? [],
    [preview],
  );

  const handleTemplateDownload = async () => {
    try {
      const blob = await importsApi.downloadTemplate(resourceKey);
      downloadBlob(blob, `${resourceKey}-import-template.csv`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Template download failed");
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error("Choose a CSV or JSON file first");
      return;
    }
    setCommitResult(null);
    try {
      const response = await previewImport.mutateAsync({ resource: resourceKey, file });
      setPreview(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Preview failed");
    }
  };

  const handleCommit = async () => {
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    try {
      const response = await commitImport.mutateAsync({
        resource: resourceKey,
        data: { rows: validRows.map((row) => row.raw), mode: "partial" },
      });
      setCommitResult(response.data);
      toast.success(`Created ${response.data.created_rows} record${response.data.created_rows === 1 ? "" : "s"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
  };

  return (
    <PageTransition>
      <PageHeader
        title={resource ? `Import ${resource.label}` : "Import Records"}
        description={resource?.description}
        backHref="/dashboard"
      />

      {isResourceLoading ? (
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground">Loading import resource...</CardContent>
        </Card>
      ) : !resource ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Import resource not found.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
              <div className="space-y-2">
                <Label htmlFor="import-file">CSV or JSON file</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    setPreview(null);
                    setCommitResult(null);
                  }}
                />
              </div>
              <Button type="button" variant="outline" onClick={handleTemplateDownload}>
                <Download data-icon="inline-start" />
                Template
              </Button>
              <Button type="button" onClick={handlePreview} disabled={!file || previewImport.isPending}>
                <FileUp data-icon="inline-start" />
                {previewImport.isPending ? "Previewing..." : "Preview"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Columns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Sample</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resource.columns.map((column) => (
                      <TableRow key={column.key}>
                        <TableCell className="font-medium">{column.key}</TableCell>
                        <TableCell>{column.required ? <Badge>Required</Badge> : <Badge variant="outline">Optional</Badge>}</TableCell>
                        <TableCell className="max-w-[220px] truncate">{column.sample == null ? "-" : String(column.sample)}</TableCell>
                        <TableCell className="max-w-[340px] text-muted-foreground">{column.description || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {preview ? (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <SummaryCard title="Rows" value={preview.total_rows} />
                <SummaryCard title="Valid" value={preview.valid_rows} />
                <SummaryCard title="Invalid" value={preview.invalid_rows} />
                <SummaryCard title="Duplicates" value={preview.duplicate_rows} />
              </div>

              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Preview</CardTitle>
                  <Button onClick={handleCommit} disabled={validRows.length === 0 || commitImport.isPending}>
                    <Play data-icon="inline-start" />
                    {commitImport.isPending ? "Importing..." : `Import ${validRows.length} Valid Rows`}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">Row</TableHead>
                          <TableHead className="w-32">Status</TableHead>
                          <TableHead>Messages</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.rows.map((row) => (
                          <TableRow key={row.row_number}>
                            <TableCell>{row.row_number}</TableCell>
                            <TableCell>
                              <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {[...row.errors, ...row.warnings].length > 0
                                ? [...row.errors, ...row.warnings].join("; ")
                                : "Ready"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}

          {commitResult ? (
            <Alert variant={commitResult.failed_rows > 0 ? "warning" : "success"}>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Created {commitResult.created_rows}, skipped {commitResult.skipped_rows}, failed {commitResult.failed_rows}.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      )}
    </PageTransition>
  );
}
