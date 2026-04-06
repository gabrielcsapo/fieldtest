import { type ReactElement, type ComponentType, createElement } from 'react'
import { currentTest } from './store'

type Wrapper = ComponentType<{ children: React.ReactNode }>

let _wrapper: Wrapper | null = null
export function setWrapper(w: Wrapper) { _wrapper = w }

/** Cached module reference — import once, call render() fresh each time */
let _mod: typeof import('@testing-library/react') | null = null

async function getTL() {
  if (!_mod) _mod = await import('@testing-library/react')
  return _mod
}

/** The container from the most recent render() — used by snapshot() */
let _currentContainer: HTMLElement | null = null

/**
 * render() is the key primitive — it does two things at once:
 *
 * 1. Captures a Snapshot (element + live DOM HTML) onto the current test so
 *    the UI can display it as a timeline frame in the preview panel.
 * 2. Returns @testing-library/react utilities so you can query and assert on it.
 *
 * Works in Node (with happy-dom) and in the browser.
 */
export async function render(element: ReactElement) {
  const wrapped = _wrapper ? createElement(_wrapper, null, element) : element

  const { render: tlRender } = await getTL()

  // Create an isolated container so queries don't bleed into the ViewTest UI
  // (which also lives in document.body when running in the browser).
  const container = document.createElement('div')
  document.body.appendChild(container)
  const result = tlRender(wrapped, { container, baseElement: container })

  if (currentTest) {
    _currentContainer = result.container
    const label = currentTest.snapshots.length === 0
      ? 'initial'
      : `render ${currentTest.snapshots.length + 1}`
    currentTest.snapshots.push({ label, element: wrapped, html: result.container.innerHTML, timestamp: Date.now() })
  }

  return result
}

/**
 * snapshot(label?) — capture the current DOM state as a named timeline frame.
 * Call this after interactions to record intermediate UI states.
 *
 * @example
 * await render(<Counter />)
 * await fireEvent.click(getByText('+'))
 * await snapshot('after +1')
 * await fireEvent.click(getByText('+'))
 * await snapshot('after +2')
 */
export async function snapshot(label?: string) {
  if (!currentTest || !_currentContainer) return
  const frameLabel = label ?? `step ${currentTest.snapshots.length}`
  const lastElement = currentTest.snapshots.at(-1)?.element
  if (!lastElement) return
  currentTest.snapshots.push({
    label: frameLabel,
    element: lastElement,
    html: _currentContainer.innerHTML,
    timestamp: Date.now(),
  })
}

type TLFireEvent = typeof import('@testing-library/react').fireEvent
type AsyncFireEvent = {
  (element: Element | Node | Document | Window, event: Event): Promise<boolean>
} & {
  [K in keyof TLFireEvent]: TLFireEvent[K] extends (el: infer E, init?: infer I) => boolean
    ? (el: E, init?: I) => Promise<boolean>
    : never
}

/**
 * fireEvent and act are re-exported from @testing-library/react so tests
 * don't need a direct dependency on it.
 */
async function _fireEvent(element: Element | Node | Document | Window, event: Event) {
  const { fireEvent: fe } = await getTL()
  return fe(element, event)
}

const eventMethods = [
  'click', 'dblClick', 'change', 'input', 'submit', 'focus', 'blur',
  'keyDown', 'keyUp', 'keyPress', 'mouseDown', 'mouseUp', 'mouseEnter',
  'mouseLeave', 'mouseOver', 'mouseOut', 'scroll', 'contextMenu',
] as const

for (const method of eventMethods) {
  ;(_fireEvent as unknown as Record<string, unknown>)[method] = async (
    element: Element,
    eventProperties?: object
  ) => {
    const { fireEvent: fe } = await getTL()
    return (fe[method] as (el: Element, props?: object) => boolean)(element, eventProperties)
  }
}

export const fireEvent = _fireEvent as AsyncFireEvent

export async function act(fn: () => void | Promise<void>) {
  const { act: tlAct } = await getTL()
  return tlAct(fn)
}
