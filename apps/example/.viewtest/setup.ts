/**
 * ViewTest setup file — loaded by test files in both browser (Vite) and Node.
 * Top-level await is supported.
 *
 * Browser: starts an MSW service worker, registers the Network tab plugin.
 * Node:    starts an MSW server for fetch interception.
 */

import { registerAfterTestHook, currentTest } from '@viewtest/core'
import type { NetworkEntry } from '@viewtest/core'

// ─── Environment detection ────────────────────────────────────────────────────
// The Node runner sets globalThis.window via happy-dom, so we can't rely on
// `typeof window`. Instead we check for Node's `process.versions.node`.

const isBrowser = !(typeof process !== 'undefined' && typeof process.versions?.node === 'string')

// ─── Shared request-capture state ────────────────────────────────────────────

type PendingEntry = { t0: number; method: string; url: string; requestBody?: string }
const pending = new Map<string, PendingEntry>()

async function captureResponse(requestId: string, response: Response, mocked: boolean) {
  const p = pending.get(requestId)
  pending.delete(requestId)
  if (!p || !currentTest) return

  let responseBody: string | undefined
  try {
    const text = await response.clone().text()
    responseBody = text || undefined
  } catch { /* non-readable */ }

  const entry: NetworkEntry = {
    method: p.method,
    url: p.url,
    status: response.status,
    mocked,
    requestBody: p.requestBody,
    responseBody,
    duration: Date.now() - p.t0,
    timestamp: p.t0,
  }
  currentTest.networkEntries.push(entry)
}

// ─── MSW setup ───────────────────────────────────────────────────────────────

// `worker` is typed to the common subset used by tests (.use / .resetHandlers)
// In browser it is SetupWorker; in Node it is SetupServer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _mswInstance!: { use(...h: any[]): void; resetHandlers(): void }

if (isBrowser) {
  const { setupWorker } = await import('msw/browser')
  const w = setupWorker()

  try {
    await w.start({ onUnhandledRequest: 'bypass', quiet: true })
  } catch (e) {
    console.warn('[MSW] Failed to start service worker. Run `npx msw init ./public` to fix.', e)
  }

  // Capture requests via the '*' wildcard (only public event in msw/browser)
  w.events.on('*', async (raw: unknown) => {
    const e = raw as { type: string; requestId?: string; request?: Request; response?: Response }
    const { type, requestId, request, response } = e
    if (!requestId) return

    if (type === 'request:start' && request) {
      // Set pending SYNCHRONOUSLY before any await so it exists when response fires
      pending.set(requestId, { t0: Date.now(), method: request.method, url: request.url })
      try {
        const text = await request.clone().text()
        const p = pending.get(requestId)
        if (p && text) p.requestBody = text
      } catch { }
      return
    }

    if ((type === 'response:mocked' || type === 'response:bypass') && response) {
      await captureResponse(requestId, response, type === 'response:mocked')
    }
  })

  _mswInstance = w

  // Register the Network tab — browser / UI mode only
  const { registerTab } = await import('@viewtest/core')
  const { NetworkTab } = await import('./NetworkTab')
  registerTab({
    id: 'network',
    label: 'Network',
    getCount: (test) => test.networkEntries.length || undefined,
    component: NetworkTab,
  })
} else {
  const { setupServer } = await import('msw/node')
  const server = setupServer()
  server.listen({ onUnhandledRequest: 'bypass' })

  server.events.on('request:start', async ({ request, requestId }) => {
    pending.set(requestId, { t0: Date.now(), method: request.method, url: request.url })
    try {
      const text = await request.clone().text()
      const p = pending.get(requestId)
      if (p && text) p.requestBody = text
    } catch { }
  })

  server.events.on('response:mocked', async ({ requestId, response }) => {
    await captureResponse(requestId, response, true)
  })

  server.events.on('response:bypass', async ({ requestId, response }) => {
    await captureResponse(requestId, response, false)
  })

  _mswInstance = server
}

// Auto-reset per-test handlers so they don't leak between tests
registerAfterTestHook(() => _mswInstance.resetHandlers())

// ─── Export for use in test files ────────────────────────────────────────────
// Tests call: worker.use(http.get(...))
export const worker = _mswInstance
