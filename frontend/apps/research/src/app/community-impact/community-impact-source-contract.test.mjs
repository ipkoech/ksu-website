import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const communitySource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const metricsSource = readFileSync(new URL("../impact-metrics/page.tsx", import.meta.url), "utf8");
const consultanciesSource = readFileSync(new URL("../consultancies/page.tsx", import.meta.url), "utf8");
const consultancyDetailSource = readFileSync(new URL("../consultancies/[slug]/page.tsx", import.meta.url), "utf8");
const mentorshipSource = readFileSync(new URL("../mentorship/page.tsx", import.meta.url), "utf8");
const mentorshipDetailSource = readFileSync(new URL("../mentorship/[slug]/page.tsx", import.meta.url), "utf8");

test("community impact hub is story-led and backend-backed", () => {
  assert.match(communitySource, /CommunityImpactHero/);
  assert.match(communitySource, /FeaturedImpactStory/);
  assert.match(communitySource, /OutcomeStack/);
  assert.match(communitySource, /SustainabilityInitiativesPanel/);
  assert.match(communitySource, /DonationImpactPanel/);
  assert.match(communitySource, /PublicEngagementEvents/);
  assert.match(communitySource, /getStories/);
  assert.match(communitySource, /getSustainability/);
  assert.match(communitySource, /getDonationImpacts/);
  assert.match(communitySource, /getEvents/);
  assert.doesNotMatch(communitySource, /Track published community-facing stories/);
  assert.doesNotMatch(communitySource, /Not published/);
});

test("impact metrics page is a public dashboard using stats and metric records", () => {
  assert.match(metricsSource, /ImpactMetricsHero/);
  assert.match(metricsSource, /ImpactMetricFilters/);
  assert.match(metricsSource, /MetricEvidencePanel/);
  assert.match(metricsSource, /MetricRecordTable/);
  assert.match(metricsSource, /researchServiceApi\.stats/);
  assert.match(metricsSource, /getImpactMetricsFiltered/);
  assert.doesNotMatch(metricsSource, /Impact statistics are temporarily unavailable/);
});

test("consultancy pages use slim rows and a story detail", () => {
  assert.match(consultanciesSource, /ConsultancyPortfolioHero/);
  assert.match(consultanciesSource, /ConsultancyTable/);
  assert.match(consultanciesSource, /EngagementPathways/);
  assert.doesNotMatch(consultanciesSource, /Consultancy scope has not been published yet/);
  assert.match(consultancyDetailSource, /ConsultancyStoryPanel/);
  assert.match(consultancyDetailSource, /Client challenge/);
  assert.match(consultancyDetailSource, /What was delivered/);
  assert.match(consultancyDetailSource, /Public value/);
});

test("mentorship pages use pathway layout and prominent deadline status", () => {
  assert.match(mentorshipSource, /MentorshipPortfolioHero/);
  assert.match(mentorshipSource, /MentorshipTable/);
  assert.match(mentorshipSource, /DeadlineStatusBadge/);
  assert.match(mentorshipSource, /ChooseYourPathway/);
  assert.doesNotMatch(mentorshipSource, /Mentorship details have not been published yet/);
  assert.match(mentorshipDetailSource, /MentorshipStoryPanel/);
  assert.match(mentorshipDetailSource, /ApplicationWindowCard/);
  assert.match(mentorshipDetailSource, /Who can participate/);
  assert.match(mentorshipDetailSource, /What participants gain/);
});
