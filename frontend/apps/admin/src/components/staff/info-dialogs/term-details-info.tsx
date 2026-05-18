"use client";

import { InfoButton } from "@/components/ui/info-button";

export function TermDetailsInfo() {
  return (
    <InfoButton title="Assignment Term Details">
      <div className="space-y-4">
        <p>
          Term details help track how long a person will hold a position.
          These are especially important for leadership roles.
        </p>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Term Fields:</h4>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Start Date:</strong> When the assignment begins</li>
            <li><strong>End Date:</strong> When the assignment ends (optional for permanent roles)</li>
            <li><strong>Term Years:</strong> Standard term length (e.g., 4 years for VC, 3 years for Dean)</li>
            <li><strong>Renewable:</strong> Whether the term can be renewed</li>
            <li><strong>Show Term Dates:</strong> Whether to display dates publicly</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Best Practices:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Set appropriate term lengths based on university policy</li>
            <li>Enable &quot;Show Term Dates&quot; for public-facing leadership positions</li>
            <li>Use &quot;End Date&quot; for temporary or acting appointments</li>
            <li>Mark &quot;Renewable&quot; for positions that can have term extensions</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Acting Appointments:</h4>
          <p>
            Acting appointments typically have shorter terms (3-6 months) 
            and are used when a position is temporarily vacant or 
            the substantive holder is on extended leave.
          </p>
        </div>
      </div>
    </InfoButton>
  );
}