import { useState } from 'react'
import { Button } from './Button'
import { Card } from './Card'

export interface Task {
  id: string
  title: string
  description: string
  done: boolean
}

interface TaskBoardProps {
  initialTasks?: Task[]
}

export function TaskBoard({ initialTasks = [] }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const pending = tasks.filter(t => !t.done)
  const done = tasks.filter(t => t.done)

  function complete(id: string) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: true } : t))
  }

  function remove(id: string) {
    setTasks(ts => ts.filter(t => t.id !== id))
  }

  function clearDone() {
    setTasks(ts => ts.filter(t => !t.done))
  }

  return (
    <div
      data-testid="task-board"
      style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400, padding: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#e2e2e8', fontWeight: 700, fontSize: 18 }}>Tasks</span>
        <span
          data-testid="pending-count"
          style={{
            background: '#6366f1', color: '#fff', borderRadius: 12,
            padding: '2px 10px', fontSize: 13, fontWeight: 700,
          }}
        >
          {pending.length}
        </span>
      </div>

      <div data-testid="pending-tasks" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pending.map(task => (
          <Card
            key={task.id}
            title={task.title}
            description={task.description}
            actionLabel="Complete"
            onAction={() => complete(task.id)}
          />
        ))}
        {pending.length === 0 && (
          <p data-testid="empty-pending" style={{ color: '#6b7280', fontSize: 13 }}>
            All caught up!
          </p>
        )}
      </div>

      {done.length > 0 && (
        <div data-testid="done-section" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontSize: 13 }}>Completed ({done.length})</span>
            <Button label="Clear" variant="secondary" onClick={clearDone} />
          </div>
          {done.map(task => (
            <Card
              key={task.id}
              title={task.title}
              description={task.description}
              actionLabel="Remove"
              onAction={() => remove(task.id)}
              variant="danger"
            />
          ))}
        </div>
      )}
    </div>
  )
}
