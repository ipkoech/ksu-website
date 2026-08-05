"use client";

import * as React from "react";

import { AccessibilityPanel } from "./accessibility-panel";

export const KSU_CONTEXTUAL_ACTION_SLOT_ID =
  "ksu-contextual-action-slot";

export function FloatingActionDock({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`ksu-floating-action-dock ${className ?? ""}`.trim()}
      data-testid="floating-action-dock"
      role="group"
      aria-label="Page tools"
    >
      <AccessibilityPanel />
      <div id={KSU_CONTEXTUAL_ACTION_SLOT_ID} className="contents" />
    </div>
  );
}
