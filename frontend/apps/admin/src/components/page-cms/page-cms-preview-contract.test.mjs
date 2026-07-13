import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, "../../..");
const composerPath = path.join(adminRoot, "src/app/(dashboard)/page-cms/composer/[pageKey]/client-page.tsx");
const previewPath = path.join(__dirname, "composer-preview.tsx");
const rendererPath = path.join(__dirname, "preview/section-preview-renderer.tsx");
const shellsPath = path.join(__dirname, "preview/section-preview-shells.tsx");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(filePath) {
  assert(fs.existsSync(filePath), `Expected preview file: ${path.relative(adminRoot, filePath)}`);
  return fs.readFileSync(filePath, "utf8");
}

const composer = read(composerPath);
const preview = read(previewPath);
const renderer = read(rendererPath);
const shells = read(shellsPath);

for (const viewport of ["desktop", "tablet", "mobile"]) {
  assert(preview.includes(`${viewport}:`), `Preview must support the ${viewport} viewport`);
}
for (const width of ["w-[1280px]", "w-[768px]", "w-[390px]"]) {
  assert(preview.includes(width), `Preview viewport must have stable width constraint ${width}`);
}
for (const requiredSnippet of [
  "role=\"tablist\"",
  "aria-label=\"Preview viewport\"",
  "Preview loading...",
  "No preview sections are available.",
  "Preview could not be loaded.",
  "Unsaved changes are not in preview",
  "SectionPreviewRenderer",
]) {
  assert(preview.includes(requiredSnippet), `Preview surface is missing: ${requiredSnippet}`);
}

for (const requiredSnippet of [
  "validationIssues",
  "Validation issues for",
  "MissingMediaPlaceholder",
  "safeHref",
  "noopener noreferrer",
]) {
  assert(renderer.includes(requiredSnippet) || shells.includes(requiredSnippet), `Preview renderer is missing: ${requiredSnippet}`);
}

for (const variant of [
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
]) {
  assert(renderer.includes(variant), `Preview renderer must represent ${variant}`);
}

for (const requiredSnippet of [
  "ComposerPreview",
  "refreshPreviewAndValidation",
  "Promise.allSettled",
  "await refreshPreviewAndValidation()",
  "isDirty={isOrderDirty || isFormDirty}",
]) {
  assert(composer.includes(requiredSnippet), `Composer preview integration is missing: ${requiredSnippet}`);
}
assert(!/public[^\n]{0,90}(preview|unpublished)|(preview|unpublished)[^\n]{0,90}public/i.test(composer), "Composer must not use a public unpublished preview endpoint");

console.log("Page CMS preview contract checks passed.");
