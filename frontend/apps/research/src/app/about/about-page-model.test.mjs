import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildAboutMetricTiles,
  buildSupportAreaCards,
  getLeadResearchPerson,
} from "./about-page-model.ts";

const people = [
  { id: "a", full_name: "Ordinary Researcher", is_featured: false },
  {
    id: "b",
    full_name: "Research Director",
    institutional_role: "Director, Research and Innovation",
  },
  { id: "c", full_name: "Featured Researcher", is_featured: true },
];

test("lead research person prefers published research roles before featured profiles", () => {
  assert.equal(getLeadResearchPerson(people)?.id, "b");
  assert.equal(getLeadResearchPerson([{ id: "c", full_name: "Featured", is_featured: true }])?.id, "c");
});

test("about metric tiles use backend collection counts and published stats", () => {
  const metrics = buildAboutMetricTiles({
    staffCount: 3,
    centers: { data: [{ id: "center-1" }], total: 1 },
    programs: { data: [{ id: "program-1" }, { id: "program-2" }], total: 2 },
    services: { data: [{ id: "service-1" }], total: 1 },
    partners: { data: [], total: 0 },
    stats: {
      scope: "research",
      title: "Research stats",
      stats: [
        {
          key: "projects",
          label: "Published projects",
          value: 12,
          description: "Published projects currently visible on the research portal.",
        },
      ],
    },
  });

  assert.deepEqual(
    metrics.map((metric) => [metric.label, metric.value]),
    [
      ["Research staff", 3],
      ["Centers and programs", 3],
      ["Support services", 1],
      ["Published projects", 12],
    ],
  );
});

test("support area cards are populated from matching backend records", () => {
  const cards = buildSupportAreaCards({
    services: {
      data: [
        {
          id: "svc-1",
          name: "Grant development support",
          slug: "grant-development-support",
          category: "grants",
          summary: "Help with proposals and budgets.",
        },
      ],
      total: 1,
    },
    centers: { data: [{ id: "center-1", name: "Community Extension Hub", center_type: "hub" }], total: 1 },
    programs: { data: [{ id: "program-1", name: "Student Innovation Programme" }], total: 1 },
    partners: { data: [{ id: "partner-1", name: "Foundation Funder", partner_type: "funder" }], total: 1 },
    guidelines: { data: [], total: 0 },
  });

  assert.equal(cards[0].title, "Research Support");
  assert.equal(cards[0].recordTitle, "Grant development support");
  assert.equal(cards[0].recordHref, "/services/grant-development-support");
  assert.equal(cards[1].title, "Extension");
  assert.equal(cards[1].recordTitle, "Community Extension Hub");
  assert.equal(cards[2].title, "Innovation");
  assert.equal(cards[2].recordTitle, "Student Innovation Programme");
  assert.equal(cards[3].title, "Resource Mobilization");
  assert.equal(cards[3].recordTitle, "Foundation Funder");
});
