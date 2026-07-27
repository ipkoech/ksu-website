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
  const focusMainContent = () => {
    const mainContent = document.getElementById(mainContentId);
    if (!mainContent) return;

    if (!mainContent.hasAttribute("tabindex")) {
      mainContent.setAttribute("tabindex", "-1");
    }
    mainContent.focus();
  };

  return (
    <AccessibilityProvider>
      <a
        className="skip-link"
        href={`#${mainContentId}`}
        onClick={focusMainContent}
      >
        Skip to main content
      </a>
      {children}
      <FloatingActionDock className={dockClassName} />
    </AccessibilityProvider>
  );
}
