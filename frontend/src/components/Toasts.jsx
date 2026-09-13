import React from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { useApp } from '../state/AppContext'

export default function Toasts() {
  const { state, dispatch } = useApp()
  return (
    <div className="toasts" aria-live="polite">
      {state.toasts.map((t) => {
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? XCircle : Info
        return (
          <div key={t.id} className={`glass toast toast-${t.type}`}>
            <Icon size={17} />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              className="icon-btn"
              style={{ width: 24, height: 24, border: 'none', background: 'transparent' }}
              onClick={() => dispatch({ type: 'REMOVE_TOAST', value: t.id })}
              aria-label="Dismiss notification"
            >
              <XCircle size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
