import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { IstanbulCoverage } from '@viewtest/core'
import type { SerializableTestSuite } from './serialize.js'

// ─── Dep graph (shared with node.ts) ─────────────────────────────────────────

export interface DepGraph {
  /** file → set of test files that (transitively) depend on it */
  dependents: Map<string, Set<string>>
  /** testFile → Map<depFile, parentFile> (for import path tracing) */
  importedBy: Map<string, Map<string, string>>
}

// ─── Cache entry ──────────────────────────────────────────────────────────────

export interface CacheEntry {
  hash: string
  cachedAt: number
  suites: SerializableTestSuite[]
  coverage: IstanbulCoverage | null
}

// ─── Hash computation ─────────────────────────────────────────────────────────

/** Returns the set of all files (test file + transitive deps) for a given test file. */
export function getDepsForFile(testFile: string, graph: DepGraph): Set<string> {
  const deps = new Set<string>()
  const importedBy = graph.importedBy.get(testFile)
  if (importedBy) {
    for (const dep of importedBy.keys()) deps.add(dep)
  }
  return deps
}

/** Hash a single file's content. Returns empty string if unreadable. */
function hashFileContent(filePath: string): string {
  try {
    return createHash('sha256').update(readFileSync(filePath)).digest('hex')
  } catch {
    return ''
  }
}

/**
 * Compute a stable cache key for a test file.
 * Key = SHA256 of (sorted file paths + their contents) for the test file + all its deps.
 */
export function computeCacheKey(testFile: string, graph: DepGraph): string {
  const deps = getDepsForFile(testFile, graph)
  const allFiles = [testFile, ...deps].sort()

  const hash = createHash('sha256')
  for (const f of allFiles) {
    hash.update(f + '\0')
    hash.update(hashFileContent(f) + '\0')
  }
  return hash.digest('hex').slice(0, 24)
}

// ─── Cache I/O ────────────────────────────────────────────────────────────────

export function getCacheDir(cwd: string): string {
  return join(cwd, '.viewtest', 'cache')
}

export function readCache(cacheDir: string, key: string): CacheEntry | null {
  const file = join(cacheDir, `${key}.json`)
  if (!existsSync(file)) return null
  try {
    const entry = JSON.parse(readFileSync(file, 'utf-8')) as CacheEntry
    return entry.hash === key ? entry : null
  } catch {
    return null
  }
}

export function writeCache(cacheDir: string, key: string, entry: Omit<CacheEntry, 'hash' | 'cachedAt'>): void {
  mkdirSync(cacheDir, { recursive: true })
  const full: CacheEntry = { hash: key, cachedAt: Date.now(), ...entry }
  writeFileSync(join(cacheDir, `${key}.json`), JSON.stringify(full))
}

export function clearCache(cacheDir: string): void {
  if (existsSync(cacheDir)) rmSync(cacheDir, { recursive: true, force: true })
}
