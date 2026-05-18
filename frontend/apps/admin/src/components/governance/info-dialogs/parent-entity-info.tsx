"use client";

import { InfoButton } from "@/components/ui/info-button";

export function ParentEntityInfo() {
  return (
    <InfoButton title="Parent Entities">
      <div className="space-y-4">
        <p>
          Some boards and committees are attached to specific organizational units.
          This establishes their mandate and scope.
        </p>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Parent Entity Types:</h4>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Division:</strong> For division-level committees (e.g., ARSA, Finance)</li>
            <li><strong>School:</strong> For school academic boards</li>
            <li><strong>Department:</strong> For department boards</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">When Required:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>School Boards always need a parent school</li>
            <li>Department Boards always need a parent department</li>
            <li>University-level bodies (Council, Senate) don&apos;t need a parent</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Example:</h4>
          <p>
            &quot;School of IT Academic Board&quot; has parent entity: School of Information Technology
          </p>
        </div>
      </div>
    </InfoButton>
  );
}