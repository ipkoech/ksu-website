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
  source.includes("<Dialog open={visible} onOpenChange={(nextOpen) => !nextOpen && dismiss()}>") &&
    source.includes("<DialogContent") &&
    !source.includes("<Card className={cn(\"border-primary/25 bg-primary/5 shadow-sm\", className)}>"),
  "first-login tour should render as a dialog instead of an inline dashboard card",
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
