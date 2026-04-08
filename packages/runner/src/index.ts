#!/usr/bin/env node
/**
 * FieldTest runner entry point.
 *
 *   fieldtest            — run all tests in Node
 *   fieldtest --watch    — watch mode
 *   fieldtest --ui       — start browser UI (Vite dev server)
 */

if (process.argv.includes("--ui")) {
  const { startUi } = await import("./ui.js");
  await startUi();
} else if (process.argv.includes("--build")) {
  const { buildUi } = await import("./ui.js");
  await buildUi();
} else {
  const { runNode } = await import("./node.js");
  await runNode();
}
