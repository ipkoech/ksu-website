import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("./programme-detail-page.tsx", import.meta.url),
  "utf8",
);

test("programme hero resolves uploaded cover artwork with accessible alt text", () => {
  assert.match(source, /import \{ PublicImage \} from "@\/components\/public\/public-image"/);
  assert.match(source, /publicFileUrl\(programme\?\.cover_image_id\)/);
  assert.match(source, /alt=\{`Illustration representing \$\{title\}`\}/);
});

test("programme hero retains a decorative academic fallback", () => {
  assert.match(source, /fallbackContent=\{/);
  assert.match(source, /<BookOpenCheck aria-hidden/);
});

test("programme page presents every template field in a focused hierarchy", () => {
  for (const label of [
    "Programme Overview",
    "About the programme",
    "Entry requirements",
    "Career opportunities",
    "Fees structure",
    "Programme details",
    "Programme code",
    "Department",
    "Accreditation status",
    "Ready to apply?",
  ]) {
    assert.match(source, new RegExp(label.replace(/[?]/g, "\\?"), "i"));
  }

  assert.match(source, /const quickFacts: FactItem\[\] = \[/);
  assert.match(source, /label: "Level"/);
  assert.match(source, /label: "Mode of study"/);
  assert.match(source, /label: "Duration"/);
  assert.match(source, /label: "Intake months"/);
});

test("programme page removes duplicate and non-template legacy sections", () => {
  for (const legacy of [
    "ProgrammeFactsPanel",
    "SectionNav",
    "AdmissionPathway",
    "ProgrammeTutors",
    "ProgrammeIntakes",
    "Learning Focus",
    "Curriculum overview",
    "Accreditation and capacity",
  ]) {
    assert.doesNotMatch(source, new RegExp(legacy));
  }
});
