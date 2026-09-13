import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../state/AppContext'

const WEIGHTAGES = [
  { value: 'LOW', label: 'Low', hint: '3 people · engineering only' },
  { value: 'MEDIUM', label: 'Medium', hint: '5 people · + product & design' },
  { value: 'HIGH', label: 'High', hint: '7 people · senior-heavy squad' },
]

export default function ProjectModal({ onClose }) {
  const { createProject, toast } = useApp()
  const [name, setName] = useState('')
  const [weightage, setWeightage] = useState('MEDIUM')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Project name is required'); return }
    if (submitting) return
    setSubmitting(true)
    try {
      await createProject({ name: name.trim(), weightage })
      onClose()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal" style={{ width: 'min(480px, 100%)' }} role="dialog" aria-modal="true" aria-label="New project">
        <div className="section-head">
          <h2>New Project</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={16} /></button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className={`field${error ? ' has-error' : ''}`}>
            <label>Project name <span style={{ color: 'var(--error)' }}>*</span></label>
            <input className="input" value={name} onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="e.g. Payment Gateway Revamp" autoFocus />
            {error && <span className="error-text">{error}</span>}
          </div>

          <div className="field">
            <label>Weightage <span style={{ color: 'var(--error)' }}>*</span></label>
            <div className="weight-picker">
              {WEIGHTAGES.map((w) => (
                <button key={w.value} type="button"
                  className={`weight-option${weightage === w.value ? ' active' : ''}`}
                  onClick={() => setWeightage(w.value)}
                  aria-pressed={weightage === w.value}>
                  <strong>{w.label}</strong>
                  <span className="caption">{w.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="caption" style={{ marginBottom: 12 }}>
            The team is assembled automatically from employee experience — Lead plus engineers,
            with Product &amp; Design on Medium/High. You can adjust members afterwards.
          </p>

          <div className="modal-foot">
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Assembling…' : 'Create & Assemble Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
