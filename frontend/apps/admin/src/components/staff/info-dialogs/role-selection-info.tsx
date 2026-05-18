"use client";

import { InfoButton } from "@/components/ui/info-button";

export function RoleSelectionInfo() {
  return (
    <InfoButton title="Understanding Roles & Conflicts">
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Unique Positions (one holder at a time):</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Vice Chancellor (University)</li>
            <li>Deputy Vice Chancellor (per Division)</li>
            <li>Registrar (per Wing)</li>
            <li>Dean (per School)</li>
            <li>HOD / COD (per Department)</li>
            <li>Director (per Center/Directorate)</li>
            <li>Chairperson (per Board/Committee)</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Multiple Holders Allowed:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Lecturers (unlimited per department)</li>
            <li>Board/Committee Members</li>
            <li>Coordinators</li>
            <li>Administrative Staff</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Acting/Interim Appointments:</h4>
          <p>
            When a unique position is temporarily vacant or the holder is
            on leave, you can assign someone in an &quot;Acting&quot; capacity.
            Acting appointments don&apos;t conflict with substantive holders.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">How Conflicts Work:</h4>
          <p>
            The system will warn you if assigning a unique position
            that&apos;s already filled, and offer options to resolve:
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Assign as Acting (both hold position)</li>
            <li>Replace current holder</li>
            <li>Cancel assignment</li>
          </ol>
        </div>
      </div>
    </InfoButton>
  );
}