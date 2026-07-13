import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../../lib/utility-page-data.ts", import.meta.url),
  "utf8",
);

test("contact page loader consumes the aggregate contact directory", () => {
  assert.equal(source.match(/contactDirectoryApi\.get\(/g)?.length, 1);

  const loaderStart = source.indexOf(
    "export async function getContactPageConfig",
  );
  const loaderEnd = source.indexOf("\nexport async function", loaderStart + 1);
  const loader = source.slice(
    loaderStart,
    loaderEnd === -1 ? undefined : loaderEnd,
  );

  assert.notEqual(loaderStart, -1);
  assert.match(
    loader,
    /const contacts = directory\?\.main_contacts\.length\s*\?\s*directory\.main_contacts\s*:\s*\(directory\?\.contacts\.items \?\? \[\]\);/,
  );
  assert.match(loader, /const campuses = directory\?\.campuses \?\? \[\];/);
  assert.match(loader, /const faqs = directory\?\.faqs \?\? \[\];/);
  assert.match(
    loader,
    /const email = institution\?\.email \?\? officialLinks\.email;/,
  );
  assert.match(
    loader,
    /const phone = institution\?\.phone \?\? officialLinks\.phone;/,
  );
  assert.match(
    loader,
    /const postalAddress =\s*institution\?\.postal_address \?\? officialLinks\.address;/,
  );
  assert.doesNotMatch(source, /contactsApi\.list\(\{\s*is_main:\s*true/);
});
