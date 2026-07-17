import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const provider = await readFile(
  path.join(directory, "school-portal-provider.tsx"),
  "utf8",
);
const layout = await readFile(
  path.join(directory, "../../app/(protected)/schools/layout.tsx"),
  "utf8",
);

assert.match(
  provider,
  /queryKey:\s*schoolPortalQueryKeys\.bootstrap/,
  "Portal entry must deduplicate the bootstrap context request.",
);
assert.match(
  provider,
  /schoolPortalQueryKeys\.root\(context\.school\.id\)/,
  "The resolved school must seed the scoped query cache.",
);
assert.match(
  provider,
  /allowed_navigation\.includes\(item\.key\)/,
  "Navigation must be rendered exclusively from server-authorized keys.",
);
assert.match(
  provider,
  /No school is assigned|Multiple schools are assigned/,
  "Missing and ambiguous server contexts must block portal rendering.",
);
assert.doesNotMatch(
  provider,
  /<select|school selector|selectedSchool/i,
  "The scoped portal must not render a school selector.",
);
assert.match(
  layout,
  /<SchoolPortalProvider>\s*\{children\}\s*<\/SchoolPortalProvider>/,
  "The schools layout must bootstrap the scoped provider once at portal entry.",
);
