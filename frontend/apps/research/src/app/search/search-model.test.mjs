import assert from "node:assert/strict";
import { test } from "node:test";

import {
  RESEARCH_SEARCH_GROUPS,
  buildSearchResult,
  getSelectedSearchGroups,
  pickTopMatch,
} from "./search-model.ts";

test("research search groups exclude university-wide scopes", () => {
  const keys = RESEARCH_SEARCH_GROUPS.map((group) => group.key);

  assert.equal(keys.includes("people"), false);
  assert.equal(keys.includes("schools"), false);
  assert.equal(keys.includes("departments"), false);
  assert.equal(keys.includes("projects"), true);
  assert.equal(keys.includes("events"), true);
});

test("selected groups ignore unsupported keys", () => {
  const selected = getSelectedSearchGroups(["projects", "schools", "events"]);

  assert.deepEqual(
    selected.map((group) => group.key),
    ["projects", "events"],
  );
});

test("buildSearchResult maps records to research routes", () => {
  const grantGroup = RESEARCH_SEARCH_GROUPS.find((group) => group.key === "grants");
  assert.ok(grantGroup);

  const result = buildSearchResult(
    {
      id: "grant-1",
      slug: "water-quality-fund",
      title: "Water Quality Fund",
      summary: "Grant support for water quality research.",
      status: "open",
      year: 2026,
    },
    grantGroup,
  );

  assert.equal(result.href, "/funding/water-quality-fund");
  assert.equal(result.title, "Water Quality Fund");
  assert.deepEqual(result.chips, ["Open", "2026"]);
});

test("pickTopMatch prefers featured records", () => {
  const group = RESEARCH_SEARCH_GROUPS[0];
  const results = [
    buildSearchResult({ id: "a", title: "Ordinary result" }, group),
    buildSearchResult({ id: "b", title: "Featured result", is_featured: true }, group),
  ];

  assert.equal(pickTopMatch(results)?.id, "b");
});
