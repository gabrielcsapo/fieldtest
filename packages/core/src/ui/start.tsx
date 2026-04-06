import { type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { setWrapper } from '../framework/render'
import { setCurrentSourceFile } from '../framework/dsl'
import { store } from '../framework/store'
import { runSuite } from '../framework/runner'

interface StartOptions {
  wrapper?: ComponentType<{ children: React.ReactNode }>
}

/** Load each test file one at a time so describe() calls capture their sourceFile */
async function loadTestFiles(testFiles: Record<string, () => Promise<unknown>>) {
  for (const [path, loader] of Object.entries(testFiles)) {
    setCurrentSourceFile(path)
    try { await loader() } catch (e) { console.error(`[viewtest] Failed to load ${path}:`, e) }
  }
  setCurrentSourceFile(null)
}

/** Re-load a single test file after HMR update and re-run its suites */
export async function reloadFile(path: string, loader: () => Promise<unknown>) {
  store.removeSuitesForFile(path)
  setCurrentSourceFile(path)
  try { await loader() } catch (e) { console.error(`[viewtest] Failed to reload ${path}:`, e) }
  setCurrentSourceFile(null)
  // Re-run only the freshly registered suites for this file
  const fresh = store.getState().suites.filter(s => s.sourceFile === path)
  for (const suite of fresh) runSuite(suite.id)
}

export async function startApp(
  testFiles: Record<string, () => Promise<unknown>>,
  options?: StartOptions,
) {
  if (options?.wrapper) setWrapper(options.wrapper)
  await loadTestFiles(testFiles)
  createRoot(document.getElementById('root')!).render(<App />)
}
