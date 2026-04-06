import type { ConsoleEntry } from '../../../framework/types'

const LEVEL_STYLES: Record<ConsoleEntry['level'], { color: string; bg: string; border: string; badge: string }> = {
  log:   { color: '#c4c4d4', bg: 'transparent',             border: 'transparent',          badge: '#4b4b60' },
  info:  { color: '#93c5fd', bg: 'rgba(59,130,246,0.06)',   border: 'rgba(59,130,246,0.15)', badge: '#3b82f6' },
  warn:  { color: '#fcd34d', bg: 'rgba(234,179,8,0.06)',    border: 'rgba(234,179,8,0.15)',  badge: '#ca8a04' },
  error: { color: '#fca5a5', bg: 'rgba(239,68,68,0.07)',    border: 'rgba(239,68,68,0.2)',   badge: '#ef4444' },
  debug: { color: '#6b7280', bg: 'transparent',             border: 'transparent',           badge: '#374151' },
}

const LEVEL_ICON: Record<ConsoleEntry['level'], string> = {
  log:   '›',
  info:  'ℹ',
  warn:  '⚠',
  error: '✗',
  debug: '·',
}

export function ConsoleTab({ consoleLogs }: { consoleLogs: ConsoleEntry[] }) {
  if (consoleLogs.length === 0) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center', color: '#4b4b60', fontSize: 13 }}>
        No console output
      </div>
    )
  }

  const t0 = consoleLogs[0].timestamp

  return (
    <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column' }}>
      {consoleLogs.map((entry, i) => {
        const s = LEVEL_STYLES[entry.level]
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '5px 20px',
            background: s.bg,
            borderLeft: `2px solid ${s.border}`,
            marginLeft: 2,
          }}>
            {/* Level badge */}
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              color: s.badge, letterSpacing: '0.05em',
              flexShrink: 0, width: 36, marginTop: 1,
              fontFamily: 'monospace',
            }}>
              {LEVEL_ICON[entry.level]} {entry.level}
            </span>

            {/* Args */}
            <span style={{
              fontSize: 12, color: s.color,
              fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              flex: 1,
            }}>
              {entry.args.join(' ')}
            </span>

            {/* Timestamp */}
            <span style={{ fontSize: 10, color: '#3a3a4e', fontFamily: 'monospace', flexShrink: 0, marginTop: 2, textAlign: 'right' }}>
              {new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
              <br />
              +{entry.timestamp - t0}ms
            </span>
          </div>
        )
      })}
    </div>
  )
}
