import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { DEPARTMENTS, LOCATIONS, prettyEnum } from '../utils/format'

const STATUSES = ['OPEN', 'ON_HOLD', 'FILLED', 'CLOSED']
const EMPTY = {
  title: '', department: '', location: '', status: 'OPEN',
  openings: 1, postedDate: new Date().toISOString().slice(0, 10), notes: '',
}

export default function PositionModal({ editing, onClose }) {
  const { savePosition, toast } = useApp()
  const [form, setForm] = useState(() => editing ? {
    title: editing.title, department: editing.department, location: editing.location,
    status: editing.status, openings: editing.openings,
    postedDate: editing.postedDate, notes: editing.notes || '',
  } : EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    if (errors[k]) setErrors({ ...errors, [k]: undefined })
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Job title is required'
    if (!form.department) errs.department = 'Department is required'
    if (!form.location) errs.location = 'Location is required'
    if (!form.postedDate) errs.postedDate = 'Posted date is required'
    const n = Number(form.openings)
    if (!Number.isInteger(n) || n < 1) errs.openings = 'At least 1 opening'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      await savePosition({ ...form, openings: Number(form.openings) }, editing ? editing.id : null)
      onClose()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal" role="dialog" aria-modal="true"
        aria-label={editing ? 'Edit position' : 'Add position'}>
        <div className="section-head">
          <h2>{editing ? 'Edit Position' : 'Add Position'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={16} /></button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="form-grid">
            <Field label="Job title" required full error={errors.title}>
              <input className="input" value={form.title} onChange={set('title')}
                placeholder="Senior Backend Engineer" />
            </Field>
            <Field label="Department" required error={errors.department}>
              <select className="select" value={form.department} onChange={set('department')}>
                <option value="">Select…</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{prettyEnum(d)}</option>)}
              </select>
            </Field>
            <Field label="Location" required error={errors.location}>
              <select className="select" value={form.location} onChange={set('location')}>
                <option value="">Select…</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Status" required>
              <select className="select" value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{prettyEnum(s)}</option>)}
              </select>
            </Field>
            <Field label="Openings" required error={errors.openings}>
              <input className="input" type="number" min="1" value={form.openings} onChange={set('openings')} />
            </Field>
            <Field label="Posted date" required error={errors.postedDate}>
              <input className="input" type="date" value={form.postedDate} onChange={set('postedDate')} />
            </Field>
            <Field label="Notes" full>
              <input className="input" value={form.notes} onChange={set('notes')}
                placeholder="Optional — team, urgency, requirements…" />
            </Field>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required, error, full, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}${full ? ' full' : ''}`}>
      <label>{label}{required ? <span style={{ color: 'var(--error)' }}> *</span> : null}</label>
      {children}
      {error && <span className="error-text">{error}</span>}
    </div>
  )
}
