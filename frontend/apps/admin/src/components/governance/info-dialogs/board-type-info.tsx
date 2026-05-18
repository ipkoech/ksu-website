"use client";

import { InfoButton } from "@/components/ui/info-button";

export function BoardTypeInfo() {
  return (
    <InfoButton title="Board Types Explained">
      <div className="space-y-4">
        <p>Select the type of governance body:</p>

        <div className="space-y-3">
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">University Council</h4>
            <p className="text-sm text-muted-foreground">Supreme governing body of the university</p>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Senate</h4>
            <p className="text-sm text-muted-foreground">Academic governance body</p>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Management Board</h4>
            <p className="text-sm text-muted-foreground">Executive management committee</p>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">School Board</h4>
            <p className="text-sm text-muted-foreground">School-level governance (requires parent school)</p>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Department Board</h4>
            <p className="text-sm text-muted-foreground">Department-level governance (requires parent department)</p>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Committee</h4>
            <p className="text-sm text-muted-foreground">Standing or ad-hoc committee</p>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Taskforce</h4>
            <p className="text-sm text-muted-foreground">Temporary taskforce for specific purposes</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Note:</h4>
          <p>
            School and Department boards require a parent entity. 
            Other board types are university-level and don&apos;t need a parent.
          </p>
        </div>
      </div>
    </InfoButton>
  );
}