import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import { parseAstAsync, transformWithOxc } from 'vite'

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

const SETUP_CANDIDATES = [
  '.viewtest/setup.ts',
  '.viewtest/setup.tsx',
  '.viewtest/setup.js',
  '.viewtest/setup.jsx',
]

// ─── Mock transform helpers ───────────────────────────────────────────────────

const TEST_FILE_RE = /\.(test|spec)\.[jt]sx?$/

/** Inject __vtImport into an existing `import { ... } from '@viewtest/core'` line */
function injectVtImport(importText: string): string {
  if (importText.includes('__vtImport')) return importText
  // Named import block: import { a, b } from '...'
  const braceMatch = importText.match(/\{([^}]*)\}/)
  if (braceMatch) {
    const trimmed = braceMatch[1].trim()
    const updated = trimmed ? `${trimmed}, __vtImport` : '__vtImport'
    return importText.replace(braceMatch[0], `{ ${updated} }`)
  }
  // Fallback: append a separate import
  return importText + "\nimport { __vtImport } from '@viewtest/core'"
}

interface ImportSpecifier {
  type: 'default' | 'named' | 'namespace'
  imported: string
  local: string
}

/** Build the `const { ... } = await __vtImport(...)` replacement for a non-core import */
function buildDynamicImport(specifiers: ImportSpecifier[], source: string): string {
  const q = JSON.stringify(source)
  const fn = `() => import(${q})`

  if (specifiers.length === 0) {
    // Side-effect import
    return `await __vtImport(${q}, ${fn})`
  }

  const ns = specifiers.find(s => s.type === 'namespace')
  if (ns) {
    return `const ${ns.local} = await __vtImport(${q}, ${fn})`
  }

  const parts: string[] = []
  for (const s of specifiers) {
    if (s.type === 'default') {
      parts.push(`default: ${s.local}`)
    } else {
      parts.push(s.imported === s.local ? s.imported : `${s.imported}: ${s.local}`)
    }
  }
  return `const { ${parts.join(', ')} } = await __vtImport(${q}, ${fn})`
}

/** Transform a test file: convert non-core static imports to __vtImport calls */
async function transformTestFile(code: string, id: string): Promise<{ code: string } | null> {
  // Quick bail-out: only transform files that actually call mock()
  if (!code.includes('mock(')) return null

  // parseAstAsync only handles JavaScript — strip TypeScript types with OXC first
  let jsCode: string
  try {
    const lang = id.endsWith('.tsx') ? 'tsx' : id.endsWith('.jsx') ? 'jsx' : id.endsWith('.js') ? 'js' : 'ts'
    const result = await transformWithOxc(code, id, { lang })
    jsCode = result.code
  } catch {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ast: any
  try {
    ast = await parseAstAsync(jsCode)
  } catch {
    return null // parse failed — leave as-is
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allImports: any[] = ast.body.filter((n: any) => n.type === 'ImportDeclaration')
  if (allImports.length === 0) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coreImports: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otherImports: any[] = []

  for (const node of allImports) {
    // After esbuild strips types, there are no `import type` declarations left
    if (node.source.value === '@viewtest/core') coreImports.push(node)
    else otherImports.push(node)
  }

  if (otherImports.length === 0) return null // nothing to transform

  // Find top-level mock() calls that need to be hoisted before dynamic imports.
  // Only hoist direct `mock(...)` ExpressionStatements at the module's top level
  // (not mock() calls inside describe/it blocks).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topLevelMockCalls: any[] = ast.body.filter((n: any) =>
    n.type === 'ExpressionStatement' &&
    n.expression.type === 'CallExpression' &&
    n.expression.callee.type === 'Identifier' &&
    n.expression.callee.name === 'mock'
  )
  const mockCallRanges = new Set(topLevelMockCalls.map((n: any) => n.start))

  // Build the new file:
  //   1. Core imports (with __vtImport injected)
  //   2. Hoisted mock() calls
  //   3. Dynamic __vtImport() lines (replacing the static non-core imports)
  //   4. Rest of the file body, with mock() calls removed (already hoisted)

  const headerLines: string[] = []

  // Core imports with __vtImport injected
  for (const node of coreImports) {
    headerLines.push(injectVtImport(jsCode.slice(node.start, node.end)))
  }

  // Hoisted mock() calls
  for (const node of topLevelMockCalls) {
    headerLines.push(jsCode.slice(node.start, node.end))
  }

  // Dynamic import replacements (preserve original declaration order)
  for (const node of otherImports) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const specifiers: ImportSpecifier[] = (node.specifiers ?? []).map((s: any) => {
      if (s.type === 'ImportDefaultSpecifier') return { type: 'default' as const, imported: 'default', local: s.local.name }
      if (s.type === 'ImportNamespaceSpecifier') return { type: 'namespace' as const, imported: '*', local: s.local.name }
      return { type: 'named' as const, imported: s.imported.name, local: s.local.name }
    })
    headerLines.push(buildDynamicImport(specifiers, node.source.value))
  }

  // Build the rest: everything after imports, skipping the hoisted mock() calls
  const lastImportEnd = Math.max(...allImports.map((n: any) => n.end))
  let restStart = lastImportEnd
  if (jsCode[restStart] === '\n') restStart++

  // Walk the remaining body nodes and skip the already-hoisted mock() calls
  const bodyAfterImports = ast.body.filter((n: any) => n.start >= restStart)
  const restParts: string[] = []
  let cursor = restStart
  for (const node of bodyAfterImports) {
    if (mockCallRanges.has(node.start)) {
      // Emit code before this node, then skip the node itself
      restParts.push(jsCode.slice(cursor, node.start))
      cursor = node.end
      if (jsCode[cursor] === '\n') cursor++ // consume trailing newline
    }
  }
  restParts.push(jsCode.slice(cursor))

  const newCode =
    headerLines.join('\n') +
    '\n' +
    restParts.join('')

  return { code: newCode }
}

export function viewtest(options: ViewtestOptions = {}): Plugin {
  const { include = 'src/**/*.test.{ts,tsx}' } = options
  let config: ResolvedConfig

  return {
    name: 'viewtest',

    configResolved(resolved) {
      config = resolved
    },

    async transform(code, id) {
      if (!TEST_FILE_RE.test(id)) return null
      return transformTestFile(code, id)
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

      // setup.ts runs before startApp — supports top-level await for async init
      // (e.g. starting an MSW worker, registering tab plugins)
      const setupFile = SETUP_CANDIDATES.find(f => existsSync(join(root, f)))
      const setupImport = setupFile ? `import '/${setupFile}'` : null

      return [
        `import { startApp, reloadFile } from '@viewtest/core'`,
        setupImport,
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
