import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, "auth-routing.ts");
const source = fs.readFileSync(sourcePath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const expected of [
  'href: "/super-admin"',
  'href: "/admin"',
  'href: "/corporate-communication"',
  'href: "/research"',
  'href: "/schools"',
  'href: "/departments"',
  'href: "/library"',
]) {
  assert(source.includes(expected), `Expected canonical route ${expected}`);
}

for (const forbiddenDefault of [
  'main: "/select-service"',
  'return { href: "/select-service", service: null };',
]) {
  assert(!source.includes(forbiddenDefault), `Login routing should not default to ${forbiddenDefault}`);
}

assert(
  source.includes("portalPriority"),
  "Expected explicit portalPriority ordering for multi-portal users",
);
