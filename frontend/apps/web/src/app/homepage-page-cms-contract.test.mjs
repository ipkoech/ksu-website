import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const fetcherSource = readFileSync(
  new URL("../lib/homepage-sections.ts", import.meta.url),
  "utf8",
);
const rendererSource = readFileSync(
  new URL("../components/home/section-renderer.tsx", import.meta.url),
  "utf8",
);

const layoutVariants = [
  "hero_admissions",
  "pulse_strip",
  "featured_partnership",
  "programme_finder",
  "date_timeline",
  "pillar_grid",
  "media_mosaic",
  "leadership_activity",
  "research_cards",
  "news_grid",
  "events_list",
  "logo_carousel",
  "alumni_story",
  "facts_strip",
];

test("homepage section fetcher calls the public composition endpoint", () => {
  assert.match(fetcherSource, /mainApi\.get<HomepageCompositionApiResponse>\(\s*"\/api\/v1\/homepage"/);
});

test("homepage section fetcher unwraps the backend success envelope and tolerates raw composition responses", () => {
  assert.match(fetcherSource, /export type HomepageCompositionEnvelope = \{/);
  assert.match(fetcherSource, /data\?: HomepageCompositionResponse \| null/);
  assert.match(fetcherSource, /export function unwrapHomepageCompositionResponse/);
  assert.match(fetcherSource, /isHomepageCompositionResponse\(response\)[\s\S]*return response;/);
  assert.match(fetcherSource, /response\.data && isHomepageCompositionResponse\(response\.data\)[\s\S]*return response\.data;/);
  assert.match(fetcherSource, /const composition = unwrapHomepageCompositionResponse\(response\);/);
});

test("homepage section fetcher exposes fallback state when composition is missing or empty", () => {
  assert.match(fetcherSource, /if \(!composition\) \{/);
  assert.match(fetcherSource, /data: null,[\s\S]*sections: \[\],[\s\S]*hasRenderableSections: false/);
  assert.match(fetcherSource, /const sections = normalizeSections\(composition\.sections\);/);
  assert.match(fetcherSource, /hasRenderableSections: sections\.length > 0/);
  assert.match(fetcherSource, /catch \(error\)[\s\S]*data: null,[\s\S]*sections: \[\],[\s\S]*hasRenderableSections: false/);
});

test("all approved layout variants are listed and supported by the renderer", () => {
  for (const variant of layoutVariants) {
    assert.match(fetcherSource, new RegExp(`"${variant}"`));
    assert.match(rendererSource, new RegExp(`${variant}:\\s*[A-Z]`));
  }
});

test("unknown layout variants warn and render nothing", () => {
  assert.match(rendererSource, /!isKnownHomepageLayoutVariant\(section\.layout_variant\)/);
  assert.match(rendererSource, /console\.warn\(/);
  assert.match(rendererSource, /return null;/);
});

test("media roles include image video and logo buckets", () => {
  for (const role of [
    "heroImage",
    "mobileImage",
    "logos",
    "gallery",
    "video",
    "background",
    "poster",
  ]) {
    assert.match(fetcherSource, new RegExp(`"${role}"`));
  }

  assert.match(fetcherSource, /export function heroImage/);
  assert.match(fetcherSource, /export function mobileImage/);
  assert.match(fetcherSource, /export function logos/);
  assert.match(fetcherSource, /export function video/);
});
