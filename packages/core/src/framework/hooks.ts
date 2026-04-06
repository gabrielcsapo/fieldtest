type Hook = () => void | Promise<void>

const afterTestHooks: Hook[] = []

export function registerAfterTestHook(fn: Hook) {
  afterTestHooks.push(fn)
}

export async function runAfterTestHooks() {
  for (const fn of afterTestHooks) {
    try { await fn() } catch { /* don't let hook failures break test runner */ }
  }
}
