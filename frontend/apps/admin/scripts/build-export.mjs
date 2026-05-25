import { rmSync } from "node:fs";
import net from "node:net";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const DEV_PORT = 3001;
const DEFAULT_NODE_HEAP = "--max-old-space-size=4096";
const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

if (process.env.ALLOW_ADMIN_BUILD_WITH_PORT_3001 !== "1" && await isPortOpen(DEV_PORT)) {
  console.error(
    [
      `Refusing to build @ksu/admin while port ${DEV_PORT} is in use.`,
      "The static export build rewrites .next and out; running it beside next dev corrupts the dev server cache.",
      "Stop the admin dev server first, then run the build again.",
      "Set ALLOW_ADMIN_BUILD_WITH_PORT_3001=1 only if you are sure port 3001 is not serving this app.",
    ].join("\n")
  );
  process.exit(1);
}

rmSync(".next", { recursive: true, force: true });
rmSync("out", { recursive: true, force: true });

const build = spawn(process.execPath, [DEFAULT_NODE_HEAP, nextCli, "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    NEXT_WEBPACK_PARALLELISM: process.env.NEXT_WEBPACK_PARALLELISM || "1",
  },
});

build.on("exit", (code, signal) => {
  if (signal) {
    console.error(`next build exited with signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
