"use client";

import * as React from "react";

import { AccessibilityProvider } from "./accessibility-provider";
import { FloatingActionDock } from "./floating-action-dock";

export type AccessibilityShellProps = {
  children: React.ReactNode;
  mainContentId: string;
  dockClassName?: string;
};

export function AccessibilityShell({
  children,
  mainContentId,
  dockClassName,
}: AccessibilityShellProps) {
  return (
    <AccessibilityProvider>
      <a className="skip-link" href={`#${mainContentId}`}>
        Skip to main content
      </a>
      {children}
      <FloatingActionDock className={dockClassName} />
    </AccessibilityProvider>
  );
}
