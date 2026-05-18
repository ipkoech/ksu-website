"use client";

import { InfoButton } from "@/components/ui/info-button";

export function AcademicRankInfo() {
  return (
    <InfoButton title="Understanding Academic Ranks">
      <div className="space-y-4">
        <p>
          Academic rank reflects a person&apos;s scholarly standing and is{" "}
          <strong>SEPARATE</strong> from any administrative position they may hold.
        </p>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Academic Ranks (highest to lowest):</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Professor</li>
            <li>Associate Professor</li>
            <li>Senior Lecturer</li>
            <li>Lecturer</li>
            <li>Assistant Lecturer</li>
            <li>Tutorial Fellow</li>
            <li>Graduate Assistant</li>
          </ol>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Example:</h4>
          <p>
            Prof. Jane Doe holds the academic rank of &quot;Professor&quot; while
            simultaneously serving as &quot;Dean&quot; of the School of Engineering.
            When her term as Dean ends, she remains a Professor.
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Important:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Academic rank is permanent until promoted</li>
            <li>Administrative positions have terms and can end</li>
            <li>A person keeps their rank regardless of admin role</li>
          </ul>
        </div>
      </div>
    </InfoButton>
  );
}