import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputDir = resolve(__dirname, "../src/generated/openapi");

const services = [
  ["main", process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:8000"],
  ["research", process.env.NEXT_PUBLIC_RESEARCH_API_URL || "http://localhost:8001"],
  ["library", process.env.NEXT_PUBLIC_LIBRARY_API_URL || "http://localhost:8002"],
];

await mkdir(outputDir, { recursive: true });

for (const [name, baseUrl] of services) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/openapi.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${name} OpenAPI spec from ${baseUrl}: ${response.status}`);
  }
  const spec = await response.json();
  await writeFile(resolve(outputDir, `${name}.json`), `${JSON.stringify(spec, null, 2)}\n`);
  console.log(`Wrote ${name} OpenAPI spec`);
}
