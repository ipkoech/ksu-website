import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ksu/ui/components";

export default function CoCmsReviewQueuePage() {
  return (
    <div>
      <PageHeader
        title="Review Queue"
        description="Review submitted public content before approval, scheduling, or publishing."
        backHref="/cocms"
      />
      <div className="p-4 sm:p-6">
        <Card>
          <CardHeader className="flex flex-row items-start gap-4">
            <div className="rounded-lg border bg-muted p-3 text-muted-foreground">
              <ClipboardCheck className="size-5" />
            </div>
            <div>
              <CardTitle>Workflow queue pending backend activation</CardTitle>
              <CardDescription>
                Submitted records will appear here after the shared workflow queue endpoint is enabled.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the CoCMS content sections for direct content management until the review queue is connected.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
