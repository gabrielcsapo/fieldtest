import { createServer } from 'vite'
import type { Plugin } from 'vite'
import { viewtest } from '@viewtest/core/plugin'
import istanbul from 'vite-plugin-istanbul'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])
const IGNORE_PATTERNS = ['.test.', '.spec.', '/node_modules/', '/__', '.d.ts']

async function collectSourceFiles(dir: string, root: string): Promise<string[]> {
  const results: string[] = []
  let entries: Awaited<ReturnType<typeof readdir>>
  try { entries = await readdir(dir, { withFileTypes: true }) } catch { return results }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      results.push(...await collectSourceFiles(fullPath, root))
    } else if (entry.isFile()) {
      const ext = entry.name.slice(entry.name.lastIndexOf('.'))
      if (!SOURCE_EXTENSIONS.has(ext)) continue
      if (IGNORE_PATTERNS.some(p => fullPath.includes(p))) continue
      results.push(fullPath)
    }
  }
  return results
}

/** Serves raw source files and project file listings — configureServer runs before Vite's HTML fallback */
function viewtestDevPlugin(): Plugin {
  let root = process.cwd()
  return {
    name: 'viewtest-dev',
    configResolved(config) { root = config.root },
    configureServer(server) {
      // Raw source endpoint — returns file content without Istanbul instrumentation
      server.middlewares.use('/__viewtest_source__', async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost')
          const filePath = url.searchParams.get('path')
          if (!filePath || !filePath.startsWith('/')) { res.writeHead(400); res.end('Bad Request'); return }
          const content = await readFile(filePath, 'utf8')
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(content)
        } catch { res.writeHead(404); res.end('Not Found') }
      })

      // File listing endpoint — returns all source files under src/
      server.middlewares.use('/__viewtest_files__', async (_req, res) => {
        try {
          const srcDir = resolve(root, 'src')
          await stat(srcDir) // throws if doesn't exist
          const files = await collectSourceFiles(srcDir, root)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(files))
        } catch { res.setHeader('Content-Type', 'application/json'); res.end('[]') }
      })
    },
  }
}

export async function startUi() {
  const include =
    process.argv.find((a, i) => i > 1 && !a.startsWith('--')) ??
    'src/**/*.test.{ts,tsx}'

  const server = await createServer({
    plugins: [
      viewtestDevPlugin(),
      viewtest({ include }),
      istanbul({
        include: 'src/**/*',
        exclude: ['node_modules', '**/*.test.*', '**/*.spec.*'],
        extension: ['.ts', '.tsx', '.js', '.jsx'],
        forceBuildInstrument: false,
        requireEnv: false,
      }),
    ],
    server: { port: 3333, open: true },
  })

  await server.listen()
  server.printUrls()

  process.stdin.resume()
  process.on('SIGINT', () => server.close().then(() => process.exit(0)))
}
