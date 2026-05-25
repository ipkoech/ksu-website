"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StaffAssignmentEditor } from "@/components/staff/staff-assignment-editor";
import { Button, Card, CardContent } from "@ksu/ui/components";
import { UserPlus } from "lucide-react";

export default function NewAssignmentPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) router.push("/people/staff");
  }, [open, router]);

  return (
    <div className="space-y-6">
      <PageHeader title="New Staff Assignment" description="Assign a staff profile to a university position" backHref="/people/staff" />
      <Card>
        <CardContent className="flex min-h-64 items-center justify-center">
          <Button type="button" onClick={() => setOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Open assignment editor
          </Button>
        </CardContent>
      </Card>
      <StaffAssignmentEditor open={open} onOpenChange={setOpen} onSuccess={() => router.push("/people/staff")} />
    </div>
  );
}
