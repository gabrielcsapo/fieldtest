#!/usr/bin/env node
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const run = (cmd) => execSync(cmd, { cwd: root, stdio: "inherit" });
const capture = (cmd) => execSync(cmd, { cwd: root, encoding: "utf8" }).trim();

const BUMP_TYPES = ["major", "minor", "patch"];
const TYPE_MAP = {
  feat: "Features",
  fix: "Bug Fixes",
  bug: "Bug Fixes",
  perf: "Performance",
  refactor: "Refactors",
  docs: "Documentation",
  chore: "Chores",
};
const CATEGORY_ORDER = [
  "Features",
  "Bug Fixes",
  "Performance",
  "Refactors",
  "Documentation",
  "Chores",
  "Other",
];

async function findPackageJsons() {
  const dirs = ["packages", "apps"];
  const files = [];
  for (const dir of dirs) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const entry of await readdir(abs, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pj = join(abs, entry.name, "package.json");
      if (existsSync(pj)) files.push(pj);
    }
  }
  return files;
}

function bumpVersion(version, type) {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Cannot parse version: ${version}`);
  }
  const [maj, min, pat] = parts;
  if (type === "major") return `${maj + 1}.0.0`;
  if (type === "minor") return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

function parseCommits(range) {
  const cmd = range
    ? `git log ${range} --no-merges --pretty=format:%H%x09%s`
    : `git log --no-merges --pretty=format:%H%x09%s`;
  const raw = capture(cmd);
  if (!raw) return [];
  return raw.split("\n").map((line) => {
    const [hash, ...rest] = line.split("\t");
    return { hash: hash.slice(0, 7), subject: rest.join("\t") };
  });
}

function categorize(commits) {
  const groups = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, []]));
  const re = /^(\w+)(?:\([^)]+\))?!?:\s*(.+)$/;
  for (const c of commits) {
    const m = c.subject.match(re);
    if (m && TYPE_MAP[m[1]]) {
      groups[TYPE_MAP[m[1]]].push({ ...c, message: m[2] });
    } else {
      groups.Other.push({ ...c, message: c.subject });
    }
  }
  return groups;
}

function renderEntry(version, date, groups) {
  const lines = [`## ${version} - ${date}`, ""];
  let hasContent = false;
  for (const cat of CATEGORY_ORDER) {
    const items = groups[cat];
    if (!items.length) continue;
    hasContent = true;
    lines.push(`### ${cat}`, "");
    for (const item of items) {
      lines.push(`- ${item.message} (${item.hash})`);
    }
    lines.push("");
  }
  if (!hasContent) lines.push("_No notable changes._", "");
  return lines.join("\n");
}

async function updateChangelog(entry) {
  const path = join(root, "CHANGELOG.md");
  let existing = "";
  if (existsSync(path)) {
    existing = await readFile(path, "utf8");
    existing = existing.replace(/^#\s*Changelog\s*\n+/i, "");
  }
  await writeFile(path, `# Changelog\n\n${entry}\n${existing}`);
}

async function main() {
  const rl = createInterface({ input, output });
  const ask = (q) => rl.question(q);

  try {
    if (capture("git status --porcelain")) {
      throw new Error("Working tree is not clean. Commit or stash first.");
    }

    const pkgFiles = await findPackageJsons();
    const pkgs = await Promise.all(
      pkgFiles.map(async (file) => ({
        file,
        data: JSON.parse(await readFile(file, "utf8")),
      })),
    );
    if (pkgs.length === 0) throw new Error("No package.json files found under packages/ or apps/.");

    const current = pkgs[0].data.version;
    const mismatched = pkgs.filter((p) => p.data.version !== current);
    if (mismatched.length) {
      console.error("Package versions are out of sync:");
      for (const p of pkgs) console.error(`  ${p.data.name}: ${p.data.version}`);
      throw new Error("Fix version drift before releasing.");
    }
    console.log(`Current version: ${current}`);

    let bumpType;
    const argBump = process.argv[2]?.toLowerCase();
    if (argBump) {
      if (!BUMP_TYPES.includes(argBump)) {
        throw new Error(`Invalid release type "${argBump}". Use one of: major, minor, patch.`);
      }
      bumpType = argBump;
      console.log(`Release type:    ${bumpType} (from argv)`);
    }
    while (!bumpType) {
      const ans = (await ask("Release type (major/minor/patch): ")).trim().toLowerCase();
      if (BUMP_TYPES.includes(ans)) bumpType = ans;
      else console.log("Please enter one of: major, minor, patch.");
    }
    const newVersion = bumpVersion(current, bumpType);
    console.log(`New version:     ${newVersion}`);

    let range = "";
    try {
      const lastTag = capture("git describe --tags --abbrev=0");
      range = `${lastTag}..HEAD`;
      console.log(`\nCommits since ${lastTag}:`);
    } catch {
      console.log("\nNo prior tag found; using full commit history.");
    }
    const commits = parseCommits(range);
    if (!commits.length) console.log("(none)");

    const groups = categorize(commits);
    const today = new Date().toISOString().slice(0, 10);
    const entry = renderEntry(newVersion, today, groups);

    console.log("\n--- Changelog preview ---");
    console.log(entry);
    console.log("--- End preview ---\n");

    const confirm = (await ask(`Proceed with release ${newVersion}? (y/N): `)).trim().toLowerCase();
    if (confirm !== "y" && confirm !== "yes") {
      console.log("Aborted. No changes made.");
      return;
    }

    for (const p of pkgs) {
      p.data.version = newVersion;
      await writeFile(p.file, JSON.stringify(p.data, null, 2) + "\n");
    }
    console.log(`Bumped ${pkgs.length} package.json files to ${newVersion}.`);

    await updateChangelog(entry);
    console.log("Updated CHANGELOG.md.");

    // Format the generated CHANGELOG so the repo's oxfmt pre-commit hook doesn't reject it.
    try {
      run("pnpm oxfmt CHANGELOG.md");
    } catch {
      // oxfmt unavailable — continue; commit may still fail pre-commit, but we tried.
    }

    run("git add -A");
    run(`git commit -m "chore(release): ${newVersion}"`);
    run(`git tag ${newVersion}`);
    console.log(`Committed and tagged ${newVersion}.`);

    const publishAns = (await ask("Publish public packages to npm now? (y/N): "))
      .trim()
      .toLowerCase();
    if (publishAns === "y" || publishAns === "yes") {
      console.log("Building packages...");
      run('pnpm -r --filter "./packages/*" build');
      run("pnpm -r publish --access public");
      console.log("Publish complete.");
    } else {
      console.log(
        'Skipped publish. Run `pnpm -r --filter "./packages/*" build && pnpm -r publish --access public` when ready.',
      );
    }

    console.log(`\nRelease ${newVersion} done. Push with:  git push && git push --tags`);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(`\nRelease failed: ${err.message}`);
  process.exit(1);
});
