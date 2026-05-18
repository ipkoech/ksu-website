"use client";

import { InfoButton } from "@/components/ui/info-button";

export function ReportingLineInfo() {
  return (
    <InfoButton title="Reporting Lines">
      <div className="space-y-4">
        <p>
          Reporting lines define the hierarchy of authority within the organization.
          Each assignment can report to another assignment, creating a chain of command.
        </p>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">How Reporting Works:</h4>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Direct Reports:</strong> People who report directly to this position</li>
            <li><strong>Reporting Chain:</strong> The full path from this position to the top</li>
            <li><strong>Supervisor:</strong> The person this position reports to</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Example Chain:</h4>
          <div className="text-sm space-y-1">
            <p>HOD → Dean → DVC → Vice Chancellor → Council</p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Important:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>All positions should report to someone (except VC)</li>
            <li>Board members typically report to the Board Chairperson</li>
            <li>Committee members report to the Committee Chair</li>
          </ul>
        </div>
      </div>
    </InfoButton>
  );
}