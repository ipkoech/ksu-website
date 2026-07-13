import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const rendererSource = readFileSync(
  new URL("../components/home/section-renderer.tsx", import.meta.url),
  "utf8",
);
const variantsSource = readFileSync(
  new URL(
    "../components/home/sections/composed-section-variants.tsx",
    import.meta.url,
  ),
  "utf8",
);
const countdownUrl = new URL(
  "../components/home/admissions-countdown.tsx",
  import.meta.url,
);
const countdownSource = existsSync(countdownUrl)
  ? readFileSync(countdownUrl, "utf8")
  : "";

test("the homepage passes its resolved hero through the section renderer", () => {
  assert.match(pageSource, /hero=\{composedHomepage\.data\?\.hero\}/);
  assert.match(pageSource, /<HeroAdmissionsSection/);
  assert.doesNotMatch(pageSource, /<LandingHero/);
  assert.match(rendererSource, /hero\?: HomepageResolvedHero \| null/);
  assert.match(rendererSource, /<Renderer[\s\S]*hero=\{hero\}/);
});

test("the hero uses the supplied campus image and resolved admissions state", () => {
  assert.match(
    variantsSource,
    /\/images\/homepage\/kisii-administration-campus\.jpg/,
  );
  assert.match(variantsSource, /hero\?\.admissions\.visible/);
  assert.match(variantsSource, /applications_open/);
  assert.match(variantsSource, /admission_letters_available/);
  assert.match(variantsSource, /<AdmissionsCountdown/);
  assert.match(variantsSource, /bg-secondary/);
  assert.match(variantsSource, /bg-primary/);
  assert.doesNotMatch(
    variantsSource,
    /https:\/\/application\.kisiiuniversity\.ac\.ke/,
  );
});

test("the admissions countdown is screen-reader safe and refreshes expired data", () => {
  assert.match(countdownSource, /aria-hidden/);
  assert.match(countdownSource, /className="sr-only"/);
  assert.match(countdownSource, /router\.refresh\(\)/);
  assert.match(countdownSource, /window\.setInterval/);
});
