"use client";

import { useMemo, useState } from "react";
import type { ImportCommitResult, ImportPreview } from "@ksu/api-client";
import { AlertCircle, CheckCircle2, Download, Loader2, Upload } from "lucide-react";
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
  Textarea,
} from "@ksu/ui/components";

export type SchoolImportResource = "departments" | "programmes";

function parseCsv(text: string): Array<Record<string, unknown>> {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const parseLine = (line: string) => {
    const values: string[] = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"' && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = !quoted;
      } else if (character === "," && !quoted) {
        values.push(value.trim());
        value = "";
      } else {
        value += character;
      }
    }
    values.push(value.trim());
    return values;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) =>
    Object.fromEntries(headers.map((header, index) => [header, parseLine(line)[index] ?? ""])),
  );
}

export function exportFailedRows(result: ImportCommitResult | null) {
  if (!result) return;
  const failed = result.rows.filter((row) => row.status === "failed");
  const blob = new Blob([JSON.stringify(failed, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${result.resource}-failed-rows.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function SchoolImportDialog({
  resource,
  open,
  onOpenChange,
  onPreview,
  onCommit,
  onComplete,
}: {
  resource: SchoolImportResource;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPreview: (rows: Array<Record<string, unknown>>) => Promise<ImportPreview>;
  onCommit: (
    rows: Array<Record<string, unknown>>,
    mode: "partial" | "all_or_nothing",
    idempotencyKey: string,
  ) => Promise<ImportCommitResult>;
  onComplete: () => Promise<void>;
}) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportCommitResult | null>(null);
  const [mode, setMode] = useState<"partial" | "all_or_nothing">("partial");
  const [busy, setBusy] = useState<"reading" | "preview" | "commit" | null>(null);
  const [error, setError] = useState("");
  const validRows = useMemo(
    () => preview?.rows.filter((row) => row.status === "valid").map((row) => row.payload ?? row.raw) ?? [],
    [preview],
  );

  const loadFile = async (file?: File) => {
    if (!file) return;
    setBusy("reading");
    setError("");
    try {
      const parsed = file.name.endsWith(".json")
        ? JSON.parse(await file.text())
        : parseCsv(await file.text());
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("The file contains no data rows.");
      setRows(parsed);
      setBusy("preview");
      setPreview(await onPreview(parsed));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to read the import file.");
    } finally {
      setBusy(null);
    }
  };
  const commit = async () => {
    setBusy("commit");
    setError("");
    try {
      const committed = await onCommit(
        mode === "partial" ? validRows : rows,
        mode,
        crypto.randomUUID(),
      );
      setResult(committed);
      await onComplete();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Import failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Import {resource}</DialogTitle>
          <DialogDescription>
            Upload CSV or JSON, correct row errors, then commit the validated records.
          </DialogDescription>
        </DialogHeader>
        {error ? <Alert variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert> : null}
        <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
          <div className="space-y-2">
            <Label htmlFor={`${resource}-import-file`}>Import file</Label>
            <Input
              id={`${resource}-import-file`}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              disabled={Boolean(busy)}
              onChange={(event) => loadFile(event.target.files?.[0])}
            />
          </div>
          <div className="space-y-2">
            <Label>Commit mode</Label>
            <Select value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="partial">Import valid rows</SelectItem>
                <SelectItem value="all_or_nothing">All or nothing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {busy ? (
          <div className="space-y-2">
            <p className="text-sm capitalize">{busy} in progress…</p>
            <Progress value={busy === "reading" ? 25 : busy === "preview" ? 55 : 80} />
          </div>
        ) : null}
        {preview ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>{preview.valid_rows} valid</Badge>
              <Badge variant="destructive">{preview.invalid_rows} invalid</Badge>
              <Badge variant="secondary">{preview.duplicate_rows} duplicates</Badge>
            </div>
            <div className="max-h-80 overflow-auto rounded-lg border">
              <Table>
                <TableHeader><TableRow><TableHead>Row</TableHead><TableHead>Status</TableHead><TableHead>Values / correction</TableHead><TableHead>Messages</TableHead></TableRow></TableHeader>
                <TableBody>
                  {preview.rows.map((row, index) => (
                    <TableRow key={row.row_number}>
                      <TableCell>{row.row_number}</TableCell>
                      <TableCell><Badge variant={row.status === "valid" ? "default" : "destructive"}>{row.status}</Badge></TableCell>
                      <TableCell className="min-w-80">
                        <Textarea
                          aria-label={`Correct row ${row.row_number}`}
                          rows={3}
                          value={JSON.stringify(rows[index] ?? row.raw, null, 2)}
                          onChange={(event) => {
                            try {
                              const corrected = JSON.parse(event.target.value);
                              setRows((current) => current.map((item, rowIndex) => rowIndex === index ? corrected : item));
                            } catch {
                              // Keep the last valid object while the user is typing.
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="max-w-64 text-xs text-destructive">{row.errors.join(" ") || row.warnings.join(" ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button variant="outline" onClick={async () => setPreview(await onPreview(rows))}>
              Revalidate corrections
            </Button>
          </div>
        ) : null}
        {result ? (
          <Alert>
            <CheckCircle2 className="size-4" />
            <AlertDescription>
              Created {result.created_rows}; skipped {result.skipped_rows}; failed {result.failed_rows}.
              {result.failed_rows > 0 ? (
                <Button variant="link" className="ml-2 h-auto p-0" onClick={() => exportFailedRows(result)}>
                  <Download className="mr-1 size-3" /> Export failed rows
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button
            disabled={!preview || validRows.length === 0 || Boolean(busy)}
            onClick={commit}
          >
            {busy === "commit" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
            Commit import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
