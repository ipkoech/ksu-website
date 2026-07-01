import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/app/(protected)/research/projects/[slug]/page.tsx"), "utf8");
const detailSource = readFileSync(join(process.cwd(), "src/app/(protected)/research/_components/research-admin-detail-page.tsx"), "utf8");
const resourceSource = readFileSync(join(process.cwd(), "src/app/(protected)/research/_components/research-resource-page.tsx"), "utf8");
const editableSource = readFileSync(join(process.cwd(), "src/components/dashboard/editable-service-resource-page.tsx"), "utf8");
const projectListSource = readFileSync(join(process.cwd(), "src/app/(protected)/research/projects/page.tsx"), "utf8");

assert(
  !source.includes("projectRelations.impactMetrics.list"),
  "Project detail must not call the direct impact-metrics relationship endpoint; use the filterable list API or aggregate detail payload.",
);

assert(
  !source.includes("projectRelations.impactStories.list"),
  "Project detail must not call the direct impact-stories relationship endpoint; use the filterable list API or aggregate detail payload.",
);

assert(
  !source.includes("auditResourceTypes="),
  "Project detail must not render the audit history section.",
);

for (const resource of ["publications", "outputs", "innovations", "impactMetrics", "stories"]) {
  assert(
    source.includes(`${resource}.list({`) && source.includes("fields:"),
    `${resource} relationship fetches should request only display fields.`,
  );
}

assert(
  source.includes('defaultValue="relationships"'),
  "Project detail tabs should open on the relationship mapping workspace.",
);

assert(
  source.includes("ConfirmDialog"),
  "Project relationship bind and unbind actions must use a confirmation dialog.",
);

assert(
  source.includes("requestRelationshipConfirmation"),
  "Project relationship mutations should be routed through confirmation helpers.",
);

assert(
  source.includes("actionsSlot={renderProjectDetailActions}") && source.includes("function renderProjectDetailActions"),
  "Project detail should render project-specific edit and workflow actions.",
);

assert(
  source.includes("<Sheet open={editOpen}") &&
    source.includes("PROJECT_EDIT_GROUPS") &&
    source.includes("buildProjectEditPayload") &&
    source.includes("cover_image_id") &&
    source.includes("<MediaPicker") &&
    source.includes("<RichTextEditor") &&
    source.includes("openGroups"),
  "Project edit should open a collapsible side sheet with rich text fields and cover image upload.",
);

for (const rawRelationshipLabel of ["Program ID", "Center ID", "Farm ID", "Principal investigator ID", "Grant ID", "gallery_media_ids", "attachment_media_ids", "document_media_ids"]) {
  assert(
    !source.includes(rawRelationshipLabel),
    `Project edit should not expose raw relationship or attachment UUID controls: ${rawRelationshipLabel}.`,
  );
}

assert(
  detailSource.includes("RichTextRenderer") && detailSource.includes("formatRichTextValue(entry.value)"),
  "Research detail sections should render rich text content instead of plain markup.",
);

assert(
  detailSource.includes("defaultOpen={index === 0}") &&
    detailSource.includes("aria-expanded={open}") &&
    detailSource.includes("setOpen((current) => !current)"),
  "Research detail sections should be collapsible to reduce long-page scrolling.",
);

assert(
  source.includes('className="ml-auto"') &&
    source.indexOf("<ResearchDetailGuide") > source.indexOf("<DropdownMenu>"),
  "Project detail guide tooltip should sit at the far right of the action row.",
);

assert(
  resourceSource.includes('tableLayout="compact"') &&
    resourceSource.includes("actionsInMenuOnly") &&
    resourceSource.includes("withDefaultSearchFilter") &&
    resourceSource.includes("defaultResearchSortOptions"),
  "Research resource listings should use compact tables, search, sort, and action menus by default.",
);

assert(
  editableSource.includes("groupEditableFields") &&
    editableSource.includes("aria-expanded={Boolean(openGroups[group.title])}") &&
    editableSource.includes("Filter {title.toLowerCase()}") &&
    editableSource.includes("Sort {title.toLowerCase()}"),
  "Shared editable resource pages should have collapsible editor groups and resource-specific filter/sort labels.",
);

assert(
  !source.includes('publicHrefBase="/projects"'),
  "Project detail must not render the generic public page button.",
);

assert(
  source.includes("showDetailGuide={false}") && source.includes("<ProjectRelationshipGuideContent />"),
  "Project detail should move relationship guidance into the project guide trigger.",
);

assert(
  !source.includes("Retire") && !projectListSource.includes("Retire"),
  "Project actions should use clear workflow labels instead of Retire.",
);

const expectedProjectListFields = [
  "id",
  "title",
  "slug",
  "code",
  "project_type",
  "status",
  "is_active",
  "is_public",
  "is_featured",
].join(",");

assert(
  projectListSource.includes(`fields: PROJECT_LIST_FIELDS`) &&
    projectListSource.includes(`const PROJECT_LIST_FIELDS = "${expectedProjectListFields}"`),
  "Project listing should use the backend fields selector with only slim display fields.",
);

assert(
  !projectListSource.includes("include: \"center:id,name,code;program:id,name,code\"") &&
    !projectListSource.includes("RelationCell") &&
    !projectListSource.includes("adapter.get(id as string)"),
  "Project listing rows should not request relationship includes or issue per-row relationship lookups.",
);
