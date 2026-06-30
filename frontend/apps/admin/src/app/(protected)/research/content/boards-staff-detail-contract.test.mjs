import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = process.cwd();
const boardDetailPath = "src/app/(protected)/research/content/boards/[id]/page.tsx";
const staffDetailPath = "src/app/(protected)/research/content/staff/[id]/page.tsx";

assert(existsSync(join(base, boardDetailPath)), "Missing research board detail route.");
assert(existsSync(join(base, staffDetailPath)), "Missing research staff detail route.");

const boardSource = readFileSync(join(base, boardDetailPath), "utf8");
const staffSource = readFileSync(join(base, staffDetailPath), "utf8");

assert(boardSource.includes('value: "members"'), "Board detail must expose a members relationship tab.");
assert(boardSource.includes('value: "terms"'), "Board detail must expose a terms relationship tab.");
assert(boardSource.includes("BoardTermTimeline"), "Board detail must visualize member terms.");
assert(boardSource.includes("getBoardMembers"), "Board detail must use the real governance board member endpoint.");
assert(
  boardSource.includes("person_id") && boardSource.includes("start_date") && boardSource.includes("end_date"),
  "Board member relationship queries must request person and term fields.",
);

assert(staffSource.includes('value: "reporting"'), "Staff detail must expose a reporting relationship tab.");
assert(staffSource.includes('value: "term"'), "Staff detail must expose a term/assignment tab.");
assert(staffSource.includes("StaffTermPanel"), "Staff detail must visualize assignment term metadata.");
assert(staffSource.includes("getReportingChain"), "Staff detail must use the real reporting-chain endpoint.");
assert(staffSource.includes("getDirectReports"), "Staff detail must use the real direct-reports endpoint.");
