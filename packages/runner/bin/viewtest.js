#!/usr/bin/env node
/**
 * Thin bootstrap: resolves tsx from the runner package's own node_modules,
 * then spawns it to load the TypeScript entry point.
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'

const _require = createRequire(import.meta.url)
const _dirname = dirname(fileURLToPath(import.meta.url))

// Resolve tsx's ESM loader from the runner's own node_modules
const tsxEsm = _require.resolve('tsx/esm')
const src = resolve(_dirname, '..', 'src', 'index.ts')

const { status } = spawnSync(
  process.execPath,
  ['--import', tsxEsm, src, ...process.argv.slice(2)],
  { stdio: 'inherit', env: process.env }
)

process.exit(status ?? 0)
