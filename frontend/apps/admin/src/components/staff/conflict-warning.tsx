"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle } from "@ksu/ui";

interface ConflictWarningProps {
  currentHolder: {
    name: string;
    since: string;
    isActing: boolean;
  };
  position: string;
}

export function ConflictWarning({ currentHolder, position }: ConflictWarningProps) {
  return (
    <Alert variant="warning" className="border-yellow-500">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Position Already Filled</AlertTitle>
      <p className="text-sm mt-2">
        <strong>{position}</strong> is currently held by <strong>{currentHolder.name}</strong>
        {currentHolder.isActing && " (Acting)"} since {currentHolder.since}.
      </p>
      <p className="text-sm mt-2 text-muted-foreground">
        Consider assigning as Acting/Interim or ending the current holder&apos;s assignment first.
      </p>
    </Alert>
  );
}