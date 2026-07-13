import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const registry = fs.readFileSync(path.join(root, "lib/portals/registry.ts"), "utf8");
const selectService = fs.readFileSync(
  path.join(root, "app/(protected)/select-service/page.tsx"),
  "utf8",
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const key of [
  "admin",
  "corporate-communication",
  "research",
  "schools",
  "departments",
  "library",
]) {
  assert(
    registry.includes(`${key}: {`) || registry.includes(`"${key}": {`),
    `Expected portal config ${key}`,
  );
}

for (const legacy of [
  "cocms:",
  '"student-clubs":',
  '"institutional-administration":',
  "governance:",
  "publications:",
]) {
  assert(!registry.includes(legacy), `Expected no primary legacy portal config ${legacy}`);
}

for (const href of [
  "/super-admin",
  "/admin",
  "/corporate-communication",
  "/research",
  "/schools",
  "/departments",
  "/library",
]) {
  assert(
    selectService.includes(`baseHref: "${href}"`) || selectService.includes(`href: "${href}"`),
    `Expected select-service to list ${href}`,
  );
}
