"use client";

import { useMemo, useState, type ReactNode } from "react";

export type PublicPersonTab = {
  id: string;
  label: string;
  content: ReactNode;
};

export function PublicPersonTabs({ tabs }: { tabs: PublicPersonTab[] }) {
  const firstTabId = tabs[0]?.id ?? "";
  const [activeId, setActiveId] = useState(firstTabId);
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeId) ?? tabs[0],
    [activeId, tabs],
  );

  if (!activeTab) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div
        role="tablist"
        aria-label="Staff profile sections"
        className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`person-panel-${tab.id}`}
              id={`person-tab-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={[
                "inline-flex min-h-12 shrink-0 items-center border-b-2 px-3 text-sm font-bold transition",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:border-primary/40 hover:text-primary",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`person-panel-${activeTab.id}`}
        aria-labelledby={`person-tab-${activeTab.id}`}
        className="p-5"
      >
        {activeTab.content}
      </div>
    </section>
  );
}
