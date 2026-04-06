import { useState, useEffect } from 'react'
import { store, runAll, runSuite, runTest } from '../framework'
import type { StoreState, TestCase } from '../framework/types'
import { TestTree } from './components/TestTree'
import { Preview } from './components/Preview'
import { Gallery } from './components/Gallery'
import { CoverageExplorer } from './components/CoverageExplorer'

export type AppView = 'detail' | 'gallery' | 'coverage'

export function App() {
  const [state, setState] = useState<StoreState>(store.getState())
  const [selected, setSelected] = useState<TestCase | null>(null)
  const [view, setView] = useState<AppView>('detail')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const unsub = store.subscribe(s => {
      setState(s)
      setSelected(prev => prev
        ? s.suites.flatMap(su => su.tests).find(t => t.id === prev.id) ?? prev
        : prev
      )
    })
    return unsub
  }, [])

  function handleSelect(test: TestCase) {
    setSelected(test)
    setView('detail')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ width: 280, minWidth: 220, borderRight: '1px solid #2a2a36', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TestTree
          state={state}
          selected={selected}
          search={search}
          view={view}
          onSelect={handleSelect}
          onSearchChange={setSearch}
          onViewChange={setView}
          onRunAll={runAll}
          onRunSuite={runSuite}
          onRunTest={runTest}
        />
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {view === 'gallery'
          ? <Gallery state={state} search={search} onSelect={handleSelect} />
          : view === 'coverage'
          ? <CoverageExplorer
              coverage={state.coverage}
              suites={state.suites}
              onSelectTest={(suiteId, testId) => {
                const test = state.suites.flatMap(s => s.tests).find(t => t.suiteId === suiteId && t.id === testId)
                if (test) { setSelected(test); setView('detail') }
              }}
            />
          : <Preview
              test={selected}
              coverage={state.coverage}
              suites={state.suites}
              onSelectTest={(suiteId, testId) => {
                const test = state.suites.flatMap(s => s.tests).find(t => t.suiteId === suiteId && t.id === testId)
                if (test) setSelected(test)
              }}
            />
        }
      </div>
    </div>
  )
}
