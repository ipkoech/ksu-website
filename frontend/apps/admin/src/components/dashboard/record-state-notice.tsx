import Link from "next/link";
import { FileWarning } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/shared/page-header";

interface RecordStateNoticeProps {
  title: string;
  description: string;
  backHref: string;
  endpoint: string;
  note: string;
}

export function RecordStateNotice({
  title,
  description,
  backHref,
  endpoint,
  note,
}: RecordStateNoticeProps) {
  return (
    <div>
      <PageHeader title={title} description={description} backHref={backHref} />
      <Card>
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileWarning className="h-5 w-5" />
          </div>
          <CardTitle>Editor state not wired</CardTitle>
          <CardDescription>{endpoint}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">{note}</p>
          <Button asChild variant="outline">
            <Link href={backHref}>Back to list</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
