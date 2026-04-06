import { store, setCurrentTest } from './store'
import type { TestCase, TestSuite, IstanbulCoverage, ConsoleEntry, ConsoleLevel } from './types'

// ─── Console interception ─────────────────────────────────────────────────────

const CONSOLE_LEVELS: ConsoleLevel[] = ['log', 'warn', 'error', 'info', 'debug']

function interceptConsole(entries: ConsoleEntry[]): () => void {
  const originals = {} as Record<ConsoleLevel, (...args: unknown[]) => void>
  for (const level of CONSOLE_LEVELS) {
    originals[level] = console[level].bind(console)
    console[level] = (...args: unknown[]) => {
      entries.push({
        level,
        args: args.map(a => {
          if (typeof a === 'string') return a
          try { return JSON.stringify(a) } catch { return String(a) }
        }),
        timestamp: Date.now(),
      })
    }
  }
  return () => {
    for (const level of CONSOLE_LEVELS) console[level] = originals[level]
  }
}

/** Lazily resolved cleanup() from @testing-library/react (browser only) */
let _cleanup: (() => void) | null = null
async function getCleanup() {
  if (_cleanup) return _cleanup
  if (typeof document !== 'undefined') {
    const mod = await import('@testing-library/react')
    _cleanup = mod.cleanup
  }
  return _cleanup
}

async function execTest(test: TestCase, cleanup: (() => void) | null) {
  cleanup?.()
  store.updateTest(test.suiteId, test.id, { status: 'running' })
  setCurrentTest(test)
  const consoleLogs: ConsoleEntry[] = []
  const restoreConsole = interceptConsole(consoleLogs)
  const coverageBefore = getRawCoverage()
  const beforeSnap = coverageBefore ? snapshotCoverage(coverageBefore) : null
  try {
    await test.fn()
    const afterCov = getRawCoverage()
    const testCoverage = (beforeSnap && afterCov) ? diffCoverage(beforeSnap, afterCov) : null
    store.updateTest(test.suiteId, test.id, {
      status: 'pass',
      snapshots: test.snapshots,
      assertions: test.assertions,
      consoleLogs,
      testCoverage,
    })
    return true
  } catch (e) {
    const afterCov = getRawCoverage()
    const testCoverage = (beforeSnap && afterCov) ? diffCoverage(beforeSnap, afterCov) : null
    store.updateTest(test.suiteId, test.id, {
      status: 'fail',
      error: e instanceof Error ? e.message : String(e),
      snapshots: test.snapshots,
      assertions: test.assertions,
      consoleLogs,
      testCoverage,
    })
    return false
  } finally {
    restoreConsole()
    setCurrentTest(null)
  }
}

async function execSuite(suite: TestSuite, cleanup: (() => void) | null) {
  store.updateSuite(suite.id, { status: 'running' })
  let allPass = true
  for (const test of suite.tests) {
    if (test.status === 'skipped') continue
    const passed = await execTest(test, cleanup)
    if (!passed) allPass = false
  }
  store.updateSuite(suite.id, { status: allPass ? 'pass' : 'fail' })
}

function getRawCoverage(): IstanbulCoverage | null {
  const cov = (globalThis as Record<string, unknown>)['__coverage__']
  return (cov && typeof cov === 'object') ? cov as IstanbulCoverage : null
}

function snapshotCoverage(cov: IstanbulCoverage): IstanbulCoverage {
  const snap: IstanbulCoverage = {}
  for (const [path, fileCov] of Object.entries(cov)) {
    snap[path] = {
      ...fileCov,
      s: { ...fileCov.s },
      b: Object.fromEntries(Object.entries(fileCov.b).map(([k, v]) => [k, [...v]])),
      f: { ...fileCov.f },
    }
  }
  return snap
}

function diffCoverage(before: IstanbulCoverage, after: IstanbulCoverage): IstanbulCoverage {
  const delta: IstanbulCoverage = {}
  for (const [path, afterFile] of Object.entries(after)) {
    const beforeFile = before[path]
    if (!beforeFile) {
      delta[path] = afterFile
      continue
    }
    const s: Record<string, number> = {}
    for (const [idx, count] of Object.entries(afterFile.s)) {
      s[idx] = (count as number) - ((beforeFile.s[idx] as number) ?? 0)
    }
    const f: Record<string, number> = {}
    for (const [idx, count] of Object.entries(afterFile.f)) {
      f[idx] = (count as number) - ((beforeFile.f[idx] as number) ?? 0)
    }
    const b: Record<string, number[]> = {}
    for (const [idx, counts] of Object.entries(afterFile.b)) {
      const beforeCounts = beforeFile.b[idx] ?? []
      b[idx] = (counts as number[]).map((c, i) => c - (beforeCounts[i] ?? 0))
    }
    // Only include file if something changed
    const hasChange = Object.values(s).some(v => v > 0)
    if (hasChange) {
      delta[path] = { ...afterFile, s, f, b }
    }
  }
  return delta
}

function collectCoverage() {
  const cov = getRawCoverage()
  if (cov) store.setCoverage(cov)
}

export async function runAll() {
  const cleanup = await getCleanup()
  store.reset()
  store.setRunning(true)
  for (const suite of store.getState().suites) {
    await execSuite(suite, cleanup)
  }
  cleanup?.()
  store.setRunning(false)
  collectCoverage()
}

export async function runSuite(suiteId: string) {
  const cleanup = await getCleanup()
  store.resetSuite(suiteId)
  store.setRunning(true)
  const suite = store.getState().suites.find(s => s.id === suiteId)
  if (suite) await execSuite(suite, cleanup)
  cleanup?.()
  store.setRunning(false)
  collectCoverage()
}

export async function runTest(suiteId: string, testId: string) {
  const cleanup = await getCleanup()
  store.resetTest(suiteId, testId)
  store.setRunning(true)
  const suite = store.getState().suites.find(s => s.id === suiteId)
  const test = suite?.tests.find(t => t.id === testId)
  if (test) await execTest(test, cleanup)
  cleanup?.()
  store.setRunning(false)
  collectCoverage()
}
