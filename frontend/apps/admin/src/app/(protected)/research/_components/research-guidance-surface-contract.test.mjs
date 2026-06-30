import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, "research-guidance.tsx");
const source = fs.readFileSync(sourcePath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  source.includes("ResearchGuideTrigger"),
  "research guides should render through a compact reusable info trigger",
);
assert(
  source.includes("<TooltipProvider") &&
    source.includes("<TooltipTrigger asChild>") &&
    source.includes("<TooltipContent"),
  "research guide trigger should expose a hover tooltip",
);
assert(
  source.includes("<Sheet open={open} onOpenChange={setOpen}>") &&
    source.includes("onClick={() => setOpen(true)}") &&
    source.includes("<SheetContent"),
  "research guide trigger should use one tooltip button that opens a controlled side sheet",
);
assert(
  source.includes("aria-label={`Open ${title} guidance`}"),
  "research guide trigger should have an accessible guidance label",
);
