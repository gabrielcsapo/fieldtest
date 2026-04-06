import { useState, useRef, useEffect, useCallback } from 'react'
import type { TestCase, Snapshot } from '../../framework/types'
import { StatusIcon } from './StatusIcon'
import { GridToggle, gridStyle } from './toolbar/GridToggle'
import { VisionFilter, visionFilterStyle } from './toolbar/VisionFilter'
import type { VisionFilter as VisionFilterType } from './toolbar/VisionFilter'
import { OutlineToggle } from './toolbar/OutlineToggle'
import { MeasureToggle, MeasureOverlay, useMeasure } from './toolbar/MeasureToggle'
import { AxePanel } from './AxePanel'
import { AssertionsTab } from './tabs/AssertionsTab'
import { TraceTab } from './tabs/TraceTab'
import { CodeTab } from './tabs/CodeTab'
import { ConsoleTab } from './tabs/ConsoleTab'
import type { IstanbulCoverage, TestSuite } from '../../framework/types'

type Tab = 'assertions' | 'timeline' | 'accessibility' | 'trace' | 'code' | 'console'

interface Props {
  test: TestCase | null
  coverage: IstanbulCoverage | null
  suites: TestSuite[]
  onSelectTest: (suiteId: string, testId: string) => void
}

function formatElapsed(ms: number): string {
  if (ms === 0) return '0ms'
  if (ms < 1000) return `+${ms}ms`
  return `+${(ms / 1000).toFixed(2)}s`
}

function Timeline({ snapshots, active, onSelect }: {
  snapshots: Snapshot[]
  active: number
  onSelect: (i: number) => void
}) {
  const t0 = snapshots[0].timestamp
  return (
    <div style={{ padding: '20px 24px 24px' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 40, left: 40, right: 40, height: 2, background: '#2a2a36', zIndex: 0 }} />
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {snapshots.map((snap, i) => {
            const isActive = i === active
            return (
              <button key={i} onClick={() => onSelect(i)} style={{
                flex: '0 0 auto', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, padding: '0 12px',
                background: 'none', border: 'none', cursor: 'pointer', position: 'relative', zIndex: 1,
              }}>
                <span style={{ fontSize: 10, color: isActive ? '#a5b4fc' : '#3a3a4e', fontFamily: 'monospace', marginBottom: 2, transition: 'color 0.15s' }}>
                  {formatElapsed(snap.timestamp - t0)}
                </span>
                <div style={{
                  width: 80, height: 56, borderRadius: 8, overflow: 'hidden',
                  border: `2px solid ${isActive ? '#6366f1' : '#2a2a36'}`,
                  background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.15s',
                  boxShadow: isActive ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                }}>
                  <div style={{ transform: 'scale(0.35)', transformOrigin: 'center', pointerEvents: 'none', width: '200%', height: '200%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    dangerouslySetInnerHTML={{ __html: snap.html }} />
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? '#6366f1' : '#2a2a36', border: `2px solid ${isActive ? '#818cf8' : '#3a3a4e'}`, transition: 'background 0.15s, border-color 0.15s' }} />
                <span style={{ fontSize: 11, color: isActive ? '#c4c4d4' : '#4b4b60', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                  {snap.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TabBar({ tabs, active, onChange }: {
  tabs: { id: Tab; label: string; count?: number }[]
  active: Tab
  onChange: (t: Tab) => void
}) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #2a2a36', background: '#16161d', flexShrink: 0 }}>
      {tabs.map(tab => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '10px 16px', background: 'none', border: 'none',
              borderBottom: `2px solid ${isActive ? '#6366f1' : 'transparent'}`,
              color: isActive ? '#a5b4fc' : '#4b4b60',
              fontSize: 12, fontWeight: isActive ? 600 : 400,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'color 0.15s, border-color 0.15s',
              marginBottom: -1,
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: isActive ? 'rgba(99,102,241,0.2)' : '#1e1e2e',
                color: isActive ? '#818cf8' : '#4b4b60',
                borderRadius: 10, padding: '1px 6px',
                transition: 'background 0.15s, color 0.15s',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Preview({ test, coverage, suites, onSelectTest }: Props) {
  const [grid, setGrid] = useState(false)
  const [outline, setOutline] = useState(false)
  const [measure, setMeasure] = useState(false)
  const [vision, setVision] = useState<VisionFilterType>('none')
  const [activeFrame, setActiveFrame] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('assertions')
  const [canvasPaneHeight, setCanvasPaneHeight] = useState(320)
  const canvasRef = useRef<HTMLDivElement>(null)
  const measureInfo = useMeasure(canvasRef, measure)
  const dragging = useRef(false)
  const dragStartY = useRef(0)
  const dragStartH = useRef(0)

  const onDragStart = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragStartY.current = e.clientY
    dragStartH.current = canvasPaneHeight
    e.preventDefault()
  }, [canvasPaneHeight])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return
      const delta = e.clientY - dragStartY.current
      setCanvasPaneHeight(Math.max(80, Math.min(dragStartH.current + delta, window.innerHeight - 160)))
    }
    function onUp() { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  // M key to toggle measure
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'm' || e.key === 'M') setMeasure(v => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const prevTestId = useRef<string | null>(null)
  if (test?.id !== prevTestId.current) {
    prevTestId.current = test?.id ?? null
    if (activeFrame !== 0) setActiveFrame(0)
  }

  if (!test) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b4b60' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>◌</div>
          <div style={{ fontSize: 14 }}>Select a test to preview</div>
        </div>
      </div>
    )
  }

  const snapshots = test.snapshots
  const hasSnapshots = snapshots.length > 0
  const hasTimeline = snapshots.length > 1
  const safeFrame = Math.min(activeFrame, Math.max(0, snapshots.length - 1))
  const activeSnap = snapshots[safeFrame] ?? null

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'assertions', label: 'Assertions', count: test.assertions.length },
    ...(snapshots.length > 1 ? [{ id: 'timeline' as Tab, label: 'Timeline', count: snapshots.length }] : []),
    { id: 'accessibility', label: 'Accessibility' },
    { id: 'trace', label: 'Trace' },
    { id: 'code', label: 'Code' },
    ...(test.consoleLogs.length > 0 ? [{ id: 'console' as Tab, label: 'Console', count: test.consoleLogs.length }] : [{ id: 'console' as Tab, label: 'Console' }]),
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '10px 20px', borderBottom: '1px solid #2a2a36',
        display: 'flex', alignItems: 'center', gap: 10, background: '#16161d',
        flexShrink: 0,
      }}>
        <StatusIcon status={test.status} />
        <span style={{ fontSize: 12, color: '#6b7280' }}>{test.suiteName}</span>
        <span style={{ color: '#3a3a4e' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#c4c4d4' }}>{test.name}</span>
      </div>

      {/* Top pane — canvas */}
      <div style={{ height: canvasPaneHeight, flexShrink: 0, overflow: 'auto', background: '#0f0f13' }}>

        {/* Canvas with floating toolbar */}
        {hasSnapshots && (
          <div style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 40, borderBottom: '1px solid #2a2a36',
            ...gridStyle(grid),
            flexShrink: 0,
          }}>
            <div
              ref={canvasRef}
              data-viewtest-canvas
              style={{
                background: '#1a1a24', borderRadius: 12,
                padding: 40, border: '1px solid #2a2a36',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 200,
                cursor: measure ? 'crosshair' : 'default',
                ...visionFilterStyle(vision),
              }}
              {...(hasTimeline
                ? { dangerouslySetInnerHTML: { __html: activeSnap.html } }
                : { children: activeSnap.element }
              )}
            />

            {/* Floating toolbar */}
            <div style={{
              position: 'fixed', top: 56, right: 16, zIndex: 50,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(22,22,29,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid #2a2a36',
              borderRadius: 10,
              padding: '6px 10px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}>
              <MeasureToggle value={measure} onChange={setMeasure} />
              <OutlineToggle value={outline} onChange={setOutline} />
              <GridToggle value={grid} onChange={setGrid} />
              <div style={{ width: 1, height: 16, background: '#2a2a36' }} />
              <VisionFilter value={vision} onChange={setVision} />
            </div>

            <MeasureOverlay info={measureInfo} />
          </div>
        )}

        {/* Status placeholder for tests with no snapshots or assertions */}
        {!hasSnapshots && test.assertions.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b4b60' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10, color: test.status === 'pass' ? '#22c55e' : '#4b4b60' }}>
                {test.status === 'pass' ? '✓' : test.status === 'pending' ? '○' : '◌'}
              </div>
              <div style={{ fontSize: 13 }}>
                {test.status === 'pass' ? 'Passed — no visual output' : 'Run tests to see results'}
              </div>
            </div>
          </div>
        )}

        {/* Error bubble */}
        {test.error && test.assertions.every(a => a.status === 'pass') && (
          <div style={{ margin: '16px 20px', padding: 16, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>Error</div>
            <pre style={{ fontSize: 12, color: '#fca5a5', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {test.error}
            </pre>
          </div>
        )}
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={onDragStart}
        style={{
          height: 6, flexShrink: 0, cursor: 'row-resize',
          background: '#16161d', borderTop: '1px solid #2a2a36', borderBottom: '1px solid #2a2a36',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        <div style={{ width: 32, height: 2, borderRadius: 2, background: '#3a3a4e' }} />
      </div>

      {/* Bottom pane — tabs */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0f0f13' }}>
        {/* Tab bar */}
        <div style={{ borderBottom: '1px solid #2a2a36', flexShrink: 0 }}>
          <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'assertions' && (
            <AssertionsTab assertions={test.assertions} />
          )}
          {activeTab === 'timeline' && (
            <Timeline snapshots={snapshots} active={safeFrame} onSelect={setActiveFrame} />
          )}
          {activeTab === 'accessibility' && (
            <AxePanel containerRef={canvasRef} active={true} />
          )}
          {activeTab === 'trace' && (
            <TraceTab containerRef={canvasRef} />
          )}
          {activeTab === 'code' && (
            <CodeTab
              suiteName={test.suiteName}
              coverage={coverage}
              testCoverage={test.testCoverage}
              suites={suites}
              onSelectTest={onSelectTest}
            />
          )}
          {activeTab === 'console' && (
            <ConsoleTab consoleLogs={test.consoleLogs} />
          )}
        </div>
      </div>
    </div>
  )
}
