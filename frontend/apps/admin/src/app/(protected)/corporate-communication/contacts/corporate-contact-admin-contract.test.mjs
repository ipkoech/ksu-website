import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.resolve(__dirname, "../../../..");
const frontendRoot = path.resolve(srcRoot, "../../..");
const registry = fs.readFileSync(
  path.join(srcRoot, "lib/portals/registry.ts"),
  "utf8",
);
const apiTypes = fs.readFileSync(
  path.join(frontendRoot, "packages/api-client/src/main/types.ts"),
  "utf8",
);
const api = fs.readFileSync(
  path.join(frontendRoot, "packages/api-client/src/main/api.ts"),
  "utf8",
);
const relationshipAdapters = fs.readFileSync(
  path.join(srcRoot, "components/relationships/relationship-adapters.ts"),
  "utf8",
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const corporateStart = registry.indexOf(
  "const corporateResources: Record<string, PortalResourceConfig<any, any>> = {",
);
const contactsStart = registry.indexOf("  contacts: {", corporateStart);
const contactsEnd = registry.indexOf("  testimonials: {", contactsStart);
const contacts = registry.slice(contactsStart, contactsEnd);

assert(corporateStart >= 0 && contactsStart >= 0 && contactsEnd >= 0, "Expected the corporate contacts resource");
assert(contacts.includes("viewInEditor: true"), "Expected contacts to opt into the shared create/view/edit dialog");
assert(contacts.includes('fields: contactFields("contact-directory")'), "Expected the full organizational owner picker");
assert(!contacts.includes("is_main: true, ...filters"), "Expected contacts to list every owner, not only main-site records");
assert(!contacts.includes("portalScope:"), "Expected backend authorization to govern contact ownership without portal scope stamping");
assert(
  contacts.includes("search: _search") &&
    contacts.includes('q: typeof filters?.search === "string" ? filters.search : undefined'),
  "Expected admin search to map to the backend q parameter",
);

for (const filter of ["search", "scope_type", "contact_type", "status", "is_public", "is_main"]) {
  assert(contacts.includes(`name: "${filter}"`), `Expected the ${filter} contact filter`);
}

for (const ownerType of ["university", "division", "directorate", "wing", "school", "department"]) {
  assert(
    registry.includes(`value: "${ownerType}"`) &&
      registry.includes(`entity_type: "${ownerType}"`),
    `Expected the ${ownerType} owner picker option`,
  );
}

assert(
  registry.includes('{ name: "contact_type", label: "Contact Type" }'),
  "Expected contact type creation to accept existing and custom values",
);
for (const ownerType of ["division", "directorate", "wing", "school", "department"]) {
  const configStart = registry.indexOf(`value: "${ownerType}"`, registry.indexOf("const contactOwnerConfigs"));
  const configEnd = registry.indexOf("  },", configStart);
  assert(
    registry.slice(configStart, configEnd).includes('adapter: "contactOwner"'),
    `Expected ${ownerType} to use the authorized contact owner adapter`,
  );
}

assert(
  api.includes("listOwners:") && api.includes('"/api/v1/contacts/owners"'),
  "Expected the API client to expose the authorized contact owners endpoint",
);
assert(
  relationshipAdapters.includes("export const contactOwnerRelationshipAdapter") &&
    relationshipAdapters.includes("contactsApi.listOwners") &&
    relationshipAdapters.includes("contactOwner: contactOwnerRelationshipAdapter"),
  "Expected an exported contact owner relationship adapter",
);

assert(contacts.includes("normalizeContactPayload(values)"), "Expected scope and phone payload normalization");
assert(contacts.includes("validateContactOwnerValues"), "Expected organizational owner validation");
for (const metadata of ["scope_type", "contact_type", "email", "building", "status"]) {
  assert(contacts.includes(`"${metadata}"`), `Expected useful ${metadata} record metadata`);
}

const listParamsStart = apiTypes.indexOf("export interface ContactDirectoryListParams");
const listParamsEnd = apiTypes.indexOf("}\n", listParamsStart);
const listParams = apiTypes.slice(listParamsStart, listParamsEnd);
for (const parameter of ["q?: string", "contact_type?: string", "scope_type?: string", "scope_id?: string", "status?: string", "is_main?: boolean", "is_public?: boolean"]) {
  assert(listParams.includes(parameter), `Expected ContactDirectoryListParams to accept ${parameter}`);
}
