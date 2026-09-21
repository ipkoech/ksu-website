import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  PublicChairSummary,
  PublicEventsList,
  PublicImpactMetrics,
  PublicOpportunities,
  PublicTeamPreview,
  PublicUpdatesPreview,
} from "./public-content";

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => cleanup());

it("renders server-provided events through the client display marker", () => {
  const { container } = render(
    <PublicEventsList
      events={[
        {
          id: "event-1",
          slug: "research-symposium",
          title: "Research symposium",
          summary: "Evidence exchange for language education.",
          starts_at: null,
          ends_at: null,
          location: "Kisii",
        },
      ]}
    />,
  );

  expect(container.querySelector('[data-server-data-display="heri-events"]')).not.toBeNull();
  expect(container.textContent).toContain("Research symposium");
});

it("renders home and impact DTOs through focused client display markers", () => {
  const { container } = render(
    <>
      <PublicChairSummary about="Chair summary" />
      <PublicTeamPreview
        members={[{ id: "member-1", slug: "ada", name: "Ada", role: "Researcher", photo_url: null }]}
      />
      <PublicUpdatesPreview
        items={[{ id: "update-1", title: "Update", summary: "Update summary", kind: "News", href: "/news-insights/update" }]}
      />
      <PublicImpactMetrics
        metrics={[{ id: "metric-1", label: "Schools", value: "12", unit: "+", description: "Schools reached" }]}
      />
      <PublicOpportunities
        items={[{ id: "opportunity-1", title: "Opportunity", summary: "Apply now", kind: "Opportunity" }]}
      />
    </>,
  );

  expect(container.querySelector('[data-server-data-display="heri-chair-summary"]')).not.toBeNull();
  expect(container.querySelector('[data-server-data-display="heri-team-preview"]')).not.toBeNull();
  expect(container.querySelector('[data-server-data-display="heri-updates-preview"]')).not.toBeNull();
  expect(container.querySelector('[data-server-data-display="heri-impact-metrics"]')).not.toBeNull();
  expect(container.querySelector('[data-server-data-display="heri-opportunities"]')).not.toBeNull();
  expect(container.textContent).toContain("Chair summary");
  expect(container.textContent).toContain("Opportunity");
});
