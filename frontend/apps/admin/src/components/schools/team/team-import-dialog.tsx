"use client";

import { useEffect, useState } from "react";
import {
  importsApi,
  schoolPortalApi,
  type ImportPreview,
} from "@ksu/api-client";
import { Download, Loader2, Upload } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ksu/ui/components";

export function TeamImportDialog({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => Promise<void>;
}) {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mode, setMode] = useState<"partial" | "all_or_nothing">("partial");
  const [jobId, setJobId] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId || ["SUCCESS", "FAILURE"].includes(jobStatus)) return;
    const timer = window.setInterval(async () => {
      try {
        const job = (await importsApi.getJob(jobId)).data;
        setJobStatus(job.status);
        if (job.status === "SUCCESS") await onComplete();
        if (job.status === "FAILURE") setError(job.error || "The team import failed.");
      } catch {
        // A later poll can recover from a transient status request failure.
      }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [jobId, jobStatus, onComplete]);

  const previewFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setPreview((await schoolPortalApi.team.previewImport(file)).data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to preview the file.");
    } finally {
      setBusy(false);
    }
  };
  const commit = async () => {
    if (!preview) return;
    setBusy(true);
    setError("");
    try {
      const rows = preview.rows
        .filter((row) => mode === "all_or_nothing" || row.status === "valid")
        .map((row) => row.payload ?? row.raw);
      const job = (
        await schoolPortalApi.team.commitImport(rows, mode, crypto.randomUUID())
      ).data;
      setJobId(job.job_id);
      setJobStatus(job.status);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start the import.");
    } finally {
      setBusy(false);
    }
  };
  const progress =
    jobStatus === "SUCCESS" ? 100 : jobStatus === "STARTED" ? 70 : jobId ? 35 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import school team</DialogTitle>
          <DialogDescription>Download the template, upload completed staff rows, preview, and queue the import.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={schoolPortalApi.team.templateUrl("csv")} download>
              <Download className="mr-2 size-4" /> CSV template
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={schoolPortalApi.team.templateUrl("xlsx")} download>
              <Download className="mr-2 size-4" /> Excel template
            </a>
          </Button>
        </div>
        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
        <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
          <div className="space-y-2">
            <Label htmlFor="team-import-file">Completed template</Label>
            <Input id="team-import-file" type="file" accept=".csv,.xlsx" onChange={(event) => previewFile(event.target.files?.[0])} />
          </div>
          <div className="space-y-2">
            <Label>Commit mode</Label>
            <Select value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="partial">Valid rows</SelectItem>
                <SelectItem value="all_or_nothing">All or nothing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {busy ? <Progress value={45} aria-label="Preview progress" /> : null}
        {preview ? (
          <div className="max-h-72 overflow-auto rounded-lg border">
            <Table>
              <TableHeader><TableRow><TableHead>Row</TableHead><TableHead>Status</TableHead><TableHead>Name</TableHead><TableHead>Errors</TableHead></TableRow></TableHeader>
              <TableBody>
                {preview.rows.map((row) => (
                  <TableRow key={row.row_number}>
                    <TableCell>{row.row_number}</TableCell>
                    <TableCell><Badge variant={row.status === "valid" ? "default" : "destructive"}>{row.status}</Badge></TableCell>
                    <TableCell>{String(row.raw.full_name || row.raw.email || "")}</TableCell>
                    <TableCell className="text-xs text-destructive">{row.errors.join(" ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
        {jobId ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Import job {jobId.slice(0, 8)}</span><span>{jobStatus}</span></div>
            <Progress value={progress} aria-label="Team import progress" />
            {jobStatus === "FAILURE" ? <Button variant="outline" onClick={commit}>Retry failed import</Button> : null}
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button disabled={!preview || busy || Boolean(jobId && jobStatus !== "FAILURE")} onClick={commit}>
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
            Queue import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
