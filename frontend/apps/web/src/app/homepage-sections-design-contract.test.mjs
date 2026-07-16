import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const variantsSource = readFileSync(
  new URL(
    "../components/home/sections/composed-section-variants.tsx",
    import.meta.url,
  ),
  "utf8",
);
const campusLifeScrollerSource = readFileSync(
  new URL(
    "../components/home/campus-life-horizontal-scroller.tsx",
    import.meta.url,
  ),
  "utf8",
);
const rendererSource = readFileSync(
  new URL("../components/home/section-renderer.tsx", import.meta.url),
  "utf8",
);
const programmeFinderSource = readFileSync(
  new URL(
    "../components/home/programme-finder-interactive.tsx",
    import.meta.url,
  ),
  "utf8",
);
const globalsSource = readFileSync(
  new URL("./globals.css", import.meta.url),
  "utf8",
);
const homepageSource = `${variantsSource}\n${campusLifeScrollerSource}\n${rendererSource}\n${programmeFinderSource}\n${globalsSource}`;

test("composed homepage cards consume item-level imagery and metadata", () => {
  assert.match(variantsSource, /function itemImageUrl/);
  assert.match(variantsSource, /function itemContentText/);
  assert.match(variantsSource, /itemImageUrl\(item\)/);
  assert.match(variantsSource, /itemContentText\(item, "category"\)/);
  assert.match(variantsSource, /itemContentText\(item, "date"\)/);
});

test("programme finder separates pathways from the five-step joining journey", () => {
  assert.match(variantsSource, /const journey = .*"journey"/s);
  assert.match(variantsSource, /journey\.slice\(0, 5\)/);
  assert.match(variantsSource, /What will you become\?/);
  assert.match(programmeFinderSource, /\.slice\(0, 5\)/);
  assert.match(programmeFinderSource, /Programme directory/);
  assert.doesNotMatch(programmeFinderSource, /categories\.slice/);
});

test("programme finder receives dynamic academic data and admissions dates", () => {
  assert.match(variantsSource, /programmeFinderData/);
  assert.match(variantsSource, /academicDatesSection/);
  assert.match(variantsSource, /ProgrammeFinderInteractive/);
  assert.match(variantsSource, /schools/);
  assert.match(variantsSource, /programmes/);
  assert.match(variantsSource, /intakes/);
});

test("programme finder uses two desktop sticky scroll chapters", () => {
  assert.match(variantsSource, /programme-scroll-scene/);
  assert.match(variantsSource, /programme-panel/);
  assert.match(variantsSource, /lg:sticky/);
  assert.match(variantsSource, /lg:top-\[var\(--public-header-offset/);
  assert.doesNotMatch(variantsSource, /programme-scroll-scene[^\n]*min-h/);
  assert.match(
    variantsSource,
    /lg:min-h-\[calc\(100svh-var\(--public-header-offset/,
  );
  assert.match(variantsSource, /programme-admissions-takeover/);
  assert.match(globalsSource, /margin-top: -2rem/);
  assert.match(globalsSource, /programme-admissions-rise/);
  assert.match(globalsSource, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(variantsSource, /id="programme-dates"/);
  assert.match(variantsSource, /AdmissionDateLine/);
});

test("leadership, partner, alumni, and facts sections have complete fallbacks", () => {
  assert.match(variantsSource, /settingText\(section, "leaderName"\)/);
  assert.match(variantsSource, /settingText\(section, "leaderImage"\)/);
  assert.match(variantsSource, /Recent activities/);
  assert.match(variantsSource, /partnerDisplayItems\(section\)/);
  assert.match(
    variantsSource,
    /itemImageUrl\(item\) \?\? settingText\(section, "imageUrl"\)/,
  );
  assert.match(variantsSource, /displayItems\(section\)\s*\.slice\(0, 7\)/);
});

test("campus and research sections render image-led cards from the homepage endpoint", () => {
  assert.match(variantsSource, /function ImageArticleCard/);
  assert.match(variantsSource, /Transforming Communities Through Research/);
  assert.match(variantsSource, /Explore campus life/);
});

test("campus life renders as a full-width editorial mosaic", () => {
  assert.match(homepageSource, /campus-life-scroll-scene/);
  assert.match(homepageSource, /campus-life-sticky-frame/);
  assert.match(homepageSource, /campus-life-horizontal-track/);
  assert.match(variantsSource, /campus-life-editorial/);
  assert.match(variantsSource, /student-life-rhythm/);
  assert.match(variantsSource, /student-life-lanes/);
  assert.match(variantsSource, /CampusMosaicFeature/);
  assert.match(variantsSource, /CampusLifeLane/);
  assert.match(variantsSource, /Where you belong/);
  assert.match(variantsSource, /Plan your stay/);
  assert.match(variantsSource, /Health and support/);
  assert.match(variantsSource, /Parents and guardians/);
  assert.match(variantsSource, /Visitors and partners/);
  assert.match(variantsSource, /Alumni and community/);
  assert.match(variantsSource, /lg:min-h-\[320vh\]/);
  assert.match(homepageSource, /lg:sticky/);
  assert.match(homepageSource, /campus-life-horizontal-rail/);
  assert.match(homepageSource, /requestAnimationFrame/);
  assert.match(homepageSource, /translate3d/);
  assert.match(homepageSource, /closest\("\.campus-life-scroll-scene"\)/);
  assert.doesNotMatch(homepageSource, /addEventListener\("wheel"/);
  assert.match(variantsSource, /lg:w-screen/);
  assert.match(variantsSource, /displayItems\(section\)/);
});

test("homepage journey places partners after research", () => {
  assert.match(rendererSource, /hero_admissions: 10/);
  assert.match(rendererSource, /featured_partnership: 30/);
  assert.match(rendererSource, /leadership_activity: 60/);
  assert.match(rendererSource, /research_cards: 70/);
  assert.match(rendererSource, /logo_carousel: 80/);
  assert.match(rendererSource, /media_mosaic: 90/);
  assert.match(rendererSource, /news_grid: 100/);
  assert.match(variantsSource, /homepage-partner-rail/);
  assert.match(variantsSource, /homepage-partner-rail_42s_linear_infinite/);
  assert.match(variantsSource, /prefers-reduced-motion: reduce/);
  assert.match(variantsSource, /group-hover:\[animation-play-state:paused\]/);
  assert.match(variantsSource, /partnerDisplayItems/);
  assert.match(variantsSource, /PartnerLogoRailItem/);
  assert.match(variantsSource, /logoUrl/);
});
