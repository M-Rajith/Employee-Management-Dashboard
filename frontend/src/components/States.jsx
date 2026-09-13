import React from 'react'
import { SearchX, Inbox, AlertTriangle } from 'lucide-react'

export function EmptyState({ icon: Icon = Inbox, title, message }) {
  return (
    <div className="state-box" role="status">
      <Icon size={34} strokeWidth={1.5} />
      <div className="title">{title}</div>
      <p className="caption">{message}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box" role="alert">
      <AlertTriangle size={34} strokeWidth={1.5} style={{ color: 'var(--error)' }} />
      <div className="title">Something went wrong</div>
      <p className="caption">{message}</p>
      {onRetry && <button className="btn btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function NoResults() {
  return (
    <EmptyState
      icon={SearchX}
      title="No employees found"
      message="Try changing your search or filters."
    />
  )
}

export function Spinner({ large }) {
  return (
    <div className="state-box">
      <div className={`spinner${large ? ' lg' : ''}`} aria-label="Loading" />
    </div>
  )
}
