import { readFile } from "node:fs/promises";
import path from "node:path";

const frontendRoot = path.basename(process.cwd()) === "frontend"
  ? process.cwd()
  : path.join(process.cwd(), "frontend");

function fail(message) {
  throw new Error(`Public revalidation coverage check failed: ${message}`);
}

async function source(relativePath) {
  const file = path.join(frontendRoot, relativePath);
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    fail(`${relativePath} could not be read (${error instanceof Error ? error.message : String(error)})`);
  }
}

function requireText(contents, pattern, label) {
  if (!pattern.test(contents)) fail(`missing ${label}`);
}

const sharedRoute = await source("packages/api-client/src/revalidation-route.ts");
requireText(sharedRoute, /canRevalidatePublicContent/, "shared permission policy");
requireText(sharedRoute, /auth:\s*["']session["']/, "request-scoped session auth");
requireText(sharedRoute, /Cache-Control["']:\s*["']no-store/, "no-store response policy");
requireText(sharedRoute, /revalidateTag\(PUBLIC_CONTENT_CACHE_TAG\)/, "shared cache-tag invalidation");
requireText(sharedRoute, /revalidatePath\(["']\/["'],\s*["']layout["']\)/, "shared layout invalidation");

for (const app of ["web", "library", "heri-africa"]) {
  const route = await source(`apps/${app}/src/app/api/revalidate/route.ts`);
  requireText(
    route,
    /export\s*\{[\s\S]*OPTIONS,[\s\S]*POST,[\s\S]*\}\s*from\s*["']@ksu\/api-client\/revalidation-route["']/,
    `${app} shared revalidation route export`,
  );
}

const researchRoute = await source("apps/research/src/app/api/revalidate/route.ts");
requireText(researchRoute, /export\s+async\s+function\s+POST/, "Research revalidation POST handler");
requireText(researchRoute, /revalidatePath\(/, "Research path invalidation");
requireText(researchRoute, /revalidateTag\(/, "Research tag invalidation");
requireText(researchRoute, /Cache-Control["']:\s*["']no-store/, "Research no-store response policy");
for (const resource of [
  "blogs",
  "announcements",
  "sliders",
  "staff",
  "activities",
  "sustainability-activities",
  "profile",
  "content",
  "impact-metrics",
  "facilities",
  "startups",
  "incubation",
  "competitions",
  "incubation-records",
  "competition-entries",
  "technology-transfer-cases",
  "technology-transfer",
  "donations",
  "donation-settings",
  "donation-stories",
  "research-stories",
  "expertise-tags",
  "themes",
  "journals",
  "focus-areas",
  "farm-focus-areas",
  "farm-impact-stories",
  "farm-projects",
  "farm-partnerships",
  "grant-reviews",
  "grant-reports",
  "grant-applications",
  "funders",
  "scholarship-applications",
  "mentorship-applications",
  "mentorship-matches",
  "stories",
]) {
  requireText(
    researchRoute,
    new RegExp(`["']?${resource}["']?\\s*:`),
    `Research ${resource} revalidation alias`,
  );
}

const adminHelper = await source("apps/admin/src/lib/api/public-revalidation.ts");
for (const service of ["main", "research", "library", "heri"]) {
  requireText(adminHelper, new RegExp(`\\b${service}:`), `Admin ${service} frontend mapping`);
}
requireText(adminHelper, /`\$\{frontend\}\/api\/revalidate`/, "Admin revalidation endpoint");
requireText(adminHelper, /credentials:\s*["']include["']/, "Admin credential forwarding");
requireText(adminHelper, /clearTimeout\(timeout\)/, "Admin timeout cleanup");

const genericEditor = await source(
  "apps/admin/src/components/dashboard/editable-service-resource-page.tsx",
);
requireText(genericEditor, /const revalidateResource = \(\) =>/, "generic editor revalidation callback");
requireText(genericEditor, /revalidatePublicContent\(/, "generic editor public revalidation call");
requireText(genericEditor, /revalidateService=\{revalidatePublicService\}/, "generic editor workflow revalidation prop");

const portalResourcePage = await source(
  "apps/admin/src/components/portals/portal-resource-page.tsx",
);
requireText(
  portalResourcePage,
  /revalidatePublicService=\{[\s\S]*portal\?\.service/,
  "generic portal public-service revalidation wiring",
);

for (const relativePath of [
  "apps/admin/src/app/(protected)/library/branches/page.tsx",
  "apps/admin/src/app/(protected)/library/electronic/page.tsx",
  "apps/admin/src/app/(protected)/library/engagement/page.tsx",
]) {
  requireText(
    await source(relativePath),
    /revalidatePublicService=["']library["']/,
    `${relativePath} Library cache revalidation prop`,
  );
}

for (const [relativePath, label] of [
  ["apps/admin/src/components/dashboard/editable-service-resource-page.tsx", "generic editor freshness hook"],
  ["apps/admin/src/components/workflow/workflow-actions.tsx", "workflow freshness hook"],
  ["apps/admin/src/components/workflow/next-action-button.tsx", "next-action freshness hook"],
  ["apps/admin/src/components/workflow/review-queue.tsx", "bulk workflow freshness hook"],
  ["apps/admin/src/lib/api/heri.ts", "HERI mutation freshness hook"],
  ["apps/admin/src/app/(protected)/heri/_components/heri-crud-workspace.tsx", "HERI generic delete/workflow freshness hook"],
  ["apps/admin/src/app/(protected)/heri/_components/heri-detail-page.tsx", "HERI detail workflow/restore freshness hook"],
  ["apps/admin/src/app/(protected)/heri/_components/events-opportunities-workspace.tsx", "HERI event/opportunity delete freshness hook"],
  ["apps/admin/src/app/(protected)/heri/_components/hero-slides-workspace.tsx", "HERI hero delete freshness hook"],
  ["apps/admin/src/app/(protected)/heri/_components/heri-settings-navigation-editor.tsx", "HERI navigation delete freshness hook"],
  ["apps/admin/src/app/(protected)/heri/_components/news-stories-workspace.tsx", "HERI news delete/workflow freshness hook"],
  ["apps/admin/src/app/(protected)/heri/_components/page-sections-workspace.tsx", "HERI page-section delete freshness hook"],
  ["apps/admin/src/app/(protected)/heri/_components/team-workspace.tsx", "HERI team delete freshness hook"],
  ["apps/admin/src/app/(protected)/heri/_components/heri-media-picker.tsx", "HERI media picker upload freshness hook"],
  ["apps/admin/src/app/(protected)/heri/_components/heri-media-upload.tsx", "HERI media upload/metadata freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/news/page.tsx", "Main news delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/news/[slug]/client-page.tsx", "Main news editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/blogs/page.tsx", "Main blog delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/blogs/[id]/client-page.tsx", "Main blog editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/announcements/page.tsx", "Main announcement delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/announcements/[id]/client-page.tsx", "Main announcement editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/events/page.tsx", "Main event delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/events/[slug]/client-page.tsx", "Main event editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/support/faqs/page.tsx", "Main FAQ delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/support/faqs/[id]/client-page.tsx", "Main FAQ editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/sliders/page.tsx", "Main slider group delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/slider-groups/[id]/client-page.tsx", "Main slider group editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/content/sliders/[id]/client-page.tsx", "Main slider editor freshness hook"],
  ["apps/admin/src/components/about-content/institutional-page-workspace.tsx", "Main institutional page freshness hook"],
  ["apps/admin/src/app/(dashboard)/page-cms/spotlights/page.tsx", "Main partnership spotlight freshness hook"],
  ["apps/admin/src/app/(dashboard)/page-cms/sections/page.tsx", "Main page section list freshness hook"],
  ["apps/admin/src/app/(dashboard)/page-cms/sections/[id]/client-page.tsx", "Main page section editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/page-cms/composer/[pageKey]/client-page.tsx", "Main page composer freshness hook"],
  ["apps/admin/src/components/about-content/numbers-facts-workspace.tsx", "Main numbers and facts freshness hook"],
  ["apps/admin/src/components/vice-chancellor/vc-studio.tsx", "Main Vice-Chancellor freshness hook"],
  ["apps/admin/src/components/vice-chancellor/vc-portrait-library.tsx", "Main Vice-Chancellor portrait freshness hook"],
  ["apps/admin/src/app/(dashboard)/academic/departments/page.tsx", "Main academic department delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/academic/departments/[id]/client-page.tsx", "Main academic department editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/academic/programmes/page.tsx", "Main academic programme delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/academic/programmes/[id]/client-page.tsx", "Main academic programme editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/academic/schools/page.tsx", "Main academic school delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/academic/schools/[id]/client-page.tsx", "Main academic school editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/admissions/info/page.tsx", "Main admission info delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/admissions/info/[id]/client-page.tsx", "Main admission info editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/admissions/intakes/page.tsx", "Main intake delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/admissions/intakes/[id]/client-page.tsx", "Main intake editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/organization/divisions/page.tsx", "Main division delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/organization/divisions/[id]/client-page.tsx", "Main division editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/organization/directorates/[id]/client-page.tsx", "Main directorate editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/organization/governance/page.tsx", "Main governance delete freshness hook"],
  ["apps/admin/src/app/(dashboard)/organization/governance/[id]/client-page.tsx", "Main governance editor freshness hook"],
  ["apps/admin/src/app/(dashboard)/people/persons/page.tsx", "Main people list freshness hook"],
  ["apps/admin/src/app/(dashboard)/people/persons/[id]/client-page.tsx", "Main people editor freshness hook"],
  ["apps/admin/src/components/about-content/about-ksu-workspace.tsx", "Main About KSU freshness hook"],
  ["apps/admin/src/components/about-content/about-workflow-actions.tsx", "Main About workflow freshness hook"],
  ["apps/admin/src/app/(protected)/governance/university-council/_components/council-member-editor.tsx", "Main council member freshness hook"],
  ["apps/admin/src/app/(protected)/governance/university-council/_components/council-order-manager.tsx", "Main council order freshness hook"],
  ["apps/admin/src/app/(protected)/governance/university-council/_components/council-page-content-editor.tsx", "Main council page freshness hook"],
  ["apps/admin/src/components/governance/add-board-member-dialog.tsx", "Main board member freshness hook"],
  ["apps/admin/src/components/student-life/life-around-studies-workspace.tsx", "Main student-life freshness hook"],
  ["apps/admin/src/components/corporate/club-review-workspace.tsx", "Main club visibility freshness hook"],
  ["apps/admin/src/components/staff/edit-assignment-dialog.tsx", "Main staff assignment freshness hook"],
  ["apps/admin/src/components/staff/staff-assignment-editor.tsx", "Main staff editor freshness hook"],
  ["apps/admin/src/components/schools/academics/school-departments-page.tsx", "Main school department freshness hook"],
  ["apps/admin/src/components/schools/academics/school-programmes-page.tsx", "Main school programme freshness hook"],
  ["apps/admin/src/components/schools/content/content-editor-sheet.tsx", "Main school content freshness hook"],
  ["apps/admin/src/components/schools/profile/school-profile-dialogs.tsx", "Main school profile dialog freshness hook"],
  ["apps/admin/src/components/schools/profile/school-profile-workspace.tsx", "Main school profile freshness hook"],
  ["apps/admin/src/components/schools/publications/school-publications-page.tsx", "Main school publication freshness hook"],
  ["apps/admin/src/components/schools/team/team-member-sheet.tsx", "Main school team freshness hook"],
  ["apps/admin/src/components/schools/team/team-import-dialog.tsx", "Main school team import freshness hook"],
  ["apps/admin/src/components/schools/media/media-batch-uploader.tsx", "Main school media batch freshness hook"],
  ["apps/admin/src/components/corporate/media-batch-uploader.tsx", "Main corporate media batch freshness hook"],
  ["apps/admin/src/app/(dashboard)/imports/[resource]/client-page.tsx", "Main import freshness hook"],
  ["apps/admin/src/app/(dashboard)/admissions/intakes/[id]/homepage-admission-form.tsx", "Main homepage admissions freshness hook"],
  ["apps/admin/src/app/(dashboard)/media/page.tsx", "Main media freshness hook"],
  ["apps/admin/src/components/corporate/settings-workspace.tsx", "Main corporate settings freshness hook"],
  ["apps/admin/src/components/stories/story-contributor-client.tsx", "Main story contributor freshness hook"],
  ["apps/admin/src/app/(protected)/research/_components/research-core-detail-actions.tsx", "Research core detail freshness hook"],
  ["apps/admin/src/app/(protected)/research/_components/research-detail-relationships.tsx", "Research relationship freshness hook"],
  ["apps/admin/src/app/(protected)/research/projects/[slug]/page.tsx", "Research project detail freshness hook"],
  ["apps/admin/src/app/(protected)/research/grants/[slug]/page.tsx", "Research grant detail freshness hook"],
  ["apps/admin/src/app/(protected)/research/settings/profile/page.tsx", "Research profile freshness hook"],
  ["apps/admin/src/app/(protected)/research/content/_components/content-record-detail-page.tsx", "Research content attachment freshness hook"],
  ["apps/admin/src/app/(protected)/research/content/gallery/[id]/page.tsx", "Research gallery attachment freshness hook"],
  ["apps/admin/src/app/(protected)/research/content/gallery/page.tsx", "Research gallery asset freshness hook"],
  ["apps/admin/src/app/(protected)/library/catalog/page.tsx", "Library catalog freshness hook"],
  ["apps/admin/src/app/(protected)/library/staff/page.tsx", "Library staff freshness hook"],
]) {
  requireText(await source(relativePath), /revalidatePublicContent/, label);
}

const libraryAssistantContext = await source(
  "apps/admin/src/app/(protected)/library/assistant/context-management-client.tsx",
);
requireText(
  libraryAssistantContext,
  /revalidatePublicContent\("library",\s*"assistant"\)/,
  "Library assistant context freshness hook",
);
const assistantRevalidationCalls =
  libraryAssistantContext.match(/revalidatePublicContent\("library",\s*"assistant"\)/g) ?? [];
if (assistantRevalidationCalls.length < 3) {
  fail("Library assistant save, publish and archive paths must all revalidate public content");
}

const researchConsultanciesPage = await source(
  "apps/admin/src/app/(protected)/research/inquiries/page.tsx",
);
requireText(
  researchConsultanciesPage,
  /resourceKey=["']consultancies["'][\s\S]*revalidatePublicService=["']research["']/,
  "Research consultancy public-service revalidation wiring",
);

const researchEditor = await source(
  "apps/admin/src/app/(protected)/research/_components/research-content-resource-page.tsx",
);
requireText(researchEditor, /revalidationResource/, "Research content resource key derivation");
requireText(researchEditor, /revalidateResearchCache=\{Boolean\(revalidationResource\)\}/, "Research content cache invalidation hook");

const researchResourcePage = await source(
  "apps/admin/src/app/(protected)/research/_components/research-resource-page.tsx",
);
requireText(
  researchResourcePage,
  /inferResearchRevalidationResource\(queryKey\)/,
  "Research generic resource revalidation key inference",
);
const researchInference = await source(
  "apps/admin/src/app/(protected)/research/_components/research-revalidation.ts",
);
for (const resource of [
  "profile",
  "content",
  "incubation",
  "competitions",
  "technology-transfer",
  "stories",
  "donation-stories",
  "research-stories",
]) {
  requireText(
    researchInference,
    new RegExp(`["']?${resource}["']?\\s*:`),
    `Admin Research ${resource} inference alias`,
  );
}

console.log("Public revalidation coverage passed: shared route, four public handlers, Admin service mappings and mutation hooks.");
