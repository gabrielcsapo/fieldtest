import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

interface ViewtestOptions {
  /**
   * Glob pattern for test files, relative to Vite's root.
   * @default 'src/**\/*.test.{ts,tsx}'
   */
  include?: string
}

const VIRTUAL_ID = 'virtual:viewtest-entry'
const RESOLVED_ID = '\0' + VIRTUAL_ID

const PREVIEW_CANDIDATES = [
  '.viewtest/preview.tsx',
  '.viewtest/preview.ts',
  '.viewtest/preview.jsx',
  '.viewtest/preview.js',
]

export function viewtest(options: ViewtestOptions = {}): Plugin {
  const { include = 'src/**/*.test.{ts,tsx}' } = options
  let config: ResolvedConfig

  return {
    name: 'viewtest',

    configResolved(resolved) {
      config = resolved
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    load(id) {
      if (id !== RESOLVED_ID) return

      const root = config?.root ?? process.cwd()
      const pattern = include.startsWith('/') ? include : `/${include}`

      const previewFile = PREVIEW_CANDIDATES.find(f => existsSync(join(root, f)))
      const previewImport = previewFile
        ? `import _wrapper from '/${previewFile}'`
        : null

      return [
        `import { startApp, reloadFile } from '@viewtest/core'`,
        previewImport,
        // Lazy glob — modules are loaded one at a time so sourceFile can be tracked
        `const tests = import.meta.glob(${JSON.stringify(pattern)})`,
        `await startApp(tests${previewImport ? ', { wrapper: _wrapper }' : ''})`,
        // HMR: when a test file (or its dependency) changes, re-run only that file's suites
        `if (import.meta.hot) {`,
        `  import.meta.hot.accept()`,
        `  import.meta.hot.on('vite:afterUpdate', async (payload) => {`,
        `    const testPaths = new Set(Object.keys(tests))`,
        `    for (const update of payload.updates) {`,
        `      const match = [...testPaths].find(p => update.path.endsWith(p) || p.endsWith(update.path))`,
        `      if (match) await reloadFile(match, tests[match])`,
        `    }`,
        `  })`,
        `}`,
      ].filter(Boolean).join('\n')
    },

    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'module', src: `/@id/${VIRTUAL_ID}` },
          injectTo: 'body',
        },
      ]
    },
  }
}
