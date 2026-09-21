const { lstatSync, realpathSync, symlinkSync } = require("node:fs");
const path = require("node:path");

/** Link Next's public directory to the shared frontend/public asset source.
 * @param {string} appDirectory
 */
function ensureSharedPublic(appDirectory) {
  const sharedDirectory = path.resolve(appDirectory, "../../public");
  const publicDirectory = path.join(appDirectory, "public");
  const sharedRealPath = realpathSync(sharedDirectory);
  const existing = lstatSync(publicDirectory, { throwIfNoEntry: false });
  if (existing) {
    if (existing.isSymbolicLink() && realpathSync(publicDirectory) === sharedRealPath) return;
    throw new Error(`Public must link to ${sharedDirectory}; preserve local assets before replacing ${publicDirectory}.`);
  }
  symlinkSync(process.platform === "win32" ? sharedDirectory : "../../public", publicDirectory,
    process.platform === "win32" ? "junction" : "dir");
}
module.exports = { ensureSharedPublic };
