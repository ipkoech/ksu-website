import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const dataSource = readFileSync(
  new URL("../../../lib/public-person-data.ts", import.meta.url),
  "utf8",
);
const publicPeopleSource = readFileSync(
  new URL("../../../../../../../services/main/app/api/v1/public_people.py", import.meta.url),
  "utf8",
);
const personSchemaSource = readFileSync(
  new URL("../../../../../../../services/main/app/schemas/person.py", import.meta.url),
  "utf8",
);

test("staff profile page uses redesigned information-flow components", () => {
  assert.match(pageSource, /ProfileHero/);
  assert.match(pageSource, /ProfileActionRail/);
  assert.match(pageSource, /ProfileFactGrid/);
  assert.match(pageSource, /QualificationTimeline/);
  assert.match(pageSource, /label: "Academics"/);
  assert.doesNotMatch(pageSource, /label: "Qualifications"/);
  assert.match(pageSource, /RoleRelationshipGrid/);
  assert.match(pageSource, /ResearcherProfileSection/);
  assert.match(pageSource, /label: "Biography"/);
  assert.match(pageSource, /facts\.length/);
  assert.doesNotMatch(pageSource, /UnavailableFact/);
  assert.doesNotMatch(pageSource, /not published/i);
});

test("public person data supports researcher-only publications and grants", () => {
  assert.match(dataSource, /publications\?: PublicPersonPublication/);
  assert.match(dataSource, /research_grants_won\?: PublicPersonResearchGrant/);
  assert.match(pageSource, /person\.is_researcher/);
  assert.match(pageSource, /person\.publications/);
  assert.match(pageSource, /person\.research_grants_won/);
});

test("public backend exposes safe researcher publication and grant fields", () => {
  assert.match(publicPeopleSource, /"publication_records"/);
  assert.match(publicPeopleSource, /"research_grants_won"/);
  assert.match(publicPeopleSource, /payload\["publications"\]/);
  assert.match(personSchemaSource, /publication_records: list\[dict\[str, Any\]\]/);
  assert.match(personSchemaSource, /research_grants_won: list\[dict\[str, Any\]\]/);
});
