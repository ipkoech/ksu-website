import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "research-dashboard-client.tsx"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  source.includes("from \"chart.js\"") && source.includes("from \"react-chartjs-2\""),
  "research dashboard should render analytics with Chart.js and react-chartjs-2",
);
assert(
  source.includes("ChartJS.register("),
  "research dashboard should register the required Chart.js controllers, scales, and plugins",
);
assert(
  source.includes("<Bar") && source.includes("<Line") && source.includes("<Doughnut"),
  "research dashboard should support detailed bar, line, and doughnut chart renderers",
);
assert(
  source.includes("buildChartOptions") && source.includes("onClick"),
  "research dashboard charts should expose detailed tooltips and clickable data points",
);
assert(
  !source.includes("function HorizontalBarChart") && !source.includes("function StackedChart"),
  "research dashboard should replace div-based chart renderers with Chart.js charts",
);
