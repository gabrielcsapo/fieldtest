import React, { useEffect, useState } from 'react';
import axe from 'axe-core';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Impact = 'critical' | 'serious' | 'moderate' | 'minor';

const IMPACT_COLORS: Record<Impact, string> = {
  critical: '#ef4444',
  serious:  '#f97316',
  moderate: '#eab308',
  minor:    '#6b7280',
};

const IMPACT_ORDER: Impact[] = ['critical', 'serious', 'moderate', 'minor'];

// ---------------------------------------------------------------------------
// AxePanel
// ---------------------------------------------------------------------------

export interface AxePanelProps {
  containerRef: React.RefObject<HTMLElement | null>;
  active: boolean;
}

type RunState =
  | { phase: 'idle' }
  | { phase: 'running' }
  | { phase: 'done'; violations: axe.Result[] }
  | { phase: 'error'; message: string };

export function AxePanel({ containerRef, active }: AxePanelProps): React.ReactElement | null {
  const [state, setState] = useState<RunState>({ phase: 'idle' });

  useEffect(() => {
    if (!active) return;

    const el = containerRef.current;
    if (!el) return;

    setState({ phase: 'running' });

    axe
      .run(el)
      .then((results) => {
        setState({ phase: 'done', violations: results.violations });
      })
      .catch((err: unknown) => {
        setState({
          phase: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
      });
  }, [active, containerRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null;

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Section header — matches "Assertions" style */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#4b4b60',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        Accessibility
      </div>

      {/* Loading */}
      {state.phase === 'running' && (
        <div style={{ fontSize: 12, color: '#6b7280', padding: '8px 0' }}>
          Running accessibility check…
        </div>
      )}

      {/* Error */}
      {state.phase === 'error' && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 6,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            fontSize: 12,
            color: '#fca5a5',
            fontFamily: 'monospace',
          }}
        >
          {state.message}
        </div>
      )}

      {/* No violations */}
      {state.phase === 'done' && state.violations.length === 0 && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 6,
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.2)',
            fontSize: 12,
            color: '#22c55e',
            fontWeight: 600,
          }}
        >
          No accessibility violations
        </div>
      )}

      {/* Violations grouped by impact */}
      {state.phase === 'done' && state.violations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {IMPACT_ORDER.map((impact) => {
            const group = state.violations.filter((v) => v.impact === impact);
            if (group.length === 0) return null;

            const color = IMPACT_COLORS[impact];

            return (
              <div key={impact} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.map((violation, vi) => (
                  <div
                    key={vi}
                    style={{
                      borderRadius: 6,
                      background: '#1a1a24',
                      border: `1px solid #2a2a36`,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Violation header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderBottom: '1px solid #2a2a36',
                      }}
                    >
                      {/* Impact badge */}
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          background: `${color}1a`,
                          border: `1px solid ${color}40`,
                          borderRadius: 4,
                          padding: '2px 6px',
                          flexShrink: 0,
                        }}
                      >
                        {impact}
                      </span>
                      <span style={{ fontSize: 12, color: '#c4c4d4' }}>
                        {violation.description}
                      </span>
                    </div>

                    {/* Affected nodes */}
                    <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {violation.nodes.map((node, ni) => {
                        const raw = node.html ?? '';
                        const snippet = raw.length > 80 ? raw.slice(0, 77) + '…' : raw;
                        return (
                          <div
                            key={ni}
                            style={{
                              fontSize: 11,
                              fontFamily: 'monospace',
                              color: '#6b7280',
                              background: '#0f0f13',
                              borderRadius: 4,
                              padding: '4px 8px',
                              whiteSpace: 'pre',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={raw}
                          >
                            {snippet}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AxeToggle — toolbar button (mirrors GridToggle style)
// ---------------------------------------------------------------------------

export interface AxeToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function AxeToggle({ value, onChange }: AxeToggleProps): React.ReactElement {
  const buttonStyle: React.CSSProperties = {
    background: value ? 'rgba(34,197,94,0.15)' : 'transparent',
    border: '1px solid',
    borderColor: value ? 'rgba(34,197,94,0.5)' : '#2a2a36',
    borderRadius: 6,
    padding: '5px 8px',
    cursor: 'pointer',
    color: value ? '#22c55e' : '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
  };

  return (
    <button
      style={buttonStyle}
      onClick={() => onChange(!value)}
      title="Toggle accessibility check"
      aria-pressed={value}
    >
      {/* Simple "A11y" icon — eye-like circle with tick */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" />
        <path d="M5.5 8.5 L7.5 10.5 L10.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      A11y
    </button>
  );
}

export default AxePanel;
