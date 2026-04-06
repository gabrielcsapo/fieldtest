import type { StoreState, TestCase } from '../../framework/types'
import { StatusIcon } from './StatusIcon'

interface Props {
  state: StoreState
  search: string
  onSelect: (test: TestCase) => void
}

export function Gallery({ state, search, onSelect }: Props) {
  const q = search.toLowerCase()
  const tests = state.suites.flatMap(suite =>
    suite.tests
      .filter(t =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        suite.name.toLowerCase().includes(q)
      )
      .map(t => ({ test: t, suiteName: suite.name }))
  )

  if (tests.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b4b60' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>◌</div>
          <div style={{ fontSize: 14 }}>No tests match "{search}"</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: 24,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: 16,
      alignContent: 'start',
    }}>
      {tests.map(({ test, suiteName }) => (
        <button
          key={test.id}
          onClick={() => onSelect(test)}
          style={{
            background: '#16161d', border: '1px solid #2a2a36', borderRadius: 12,
            padding: 0, cursor: 'pointer', textAlign: 'left',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a36')}
        >
          {/* Preview area */}
          <div style={{
            background: '#0f0f13', padding: 24, minHeight: 120,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderBottom: '1px solid #2a2a36',
          }}>
            {test.snapshots[0] ? (
              <div style={{ pointerEvents: 'none', transform: 'scale(0.85)', transformOrigin: 'center' }}>
                {test.snapshots[0].element}
              </div>
            ) : (
              <div style={{ color: test.status === 'pass' ? '#22c55e' : test.status === 'fail' ? '#ef4444' : '#4b4b60', fontSize: 28 }}>
                {test.status === 'pass' ? '✓' : test.status === 'fail' ? '✗' : '○'}
              </div>
            )}
          </div>

          {/* Card footer */}
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusIcon status={test.status} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, color: '#4b4b60', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {suiteName}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#c4c4d4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {test.name}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
