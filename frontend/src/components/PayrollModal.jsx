import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { formatINR } from '../utils/format'
import Avatar from './Avatar'

export default function PayrollModal({ row, onClose }) {
  const { savePayroll, toast } = useApp()
  const [form, setForm] = useState({
    basic: row.basic, hra: row.hra, allowances: row.allowances, deductions: row.deductions,
  })
  const [submitting, setSubmitting] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const net = [form.basic, form.hra, form.allowances].reduce((s, v) => s + (Number(v) || 0), 0) - (Number(form.deductions) || 0)

  const submit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await savePayroll(row.employeeId, {
        basic: Number(form.basic) || 0,
        hra: Number(form.hra) || 0,
        allowances: Number(form.allowances) || 0,
        deductions: Number(form.deductions) || 0,
      })
      onClose()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal" role="dialog" aria-modal="true" aria-label="Edit payroll">
        <div className="section-head">
          <div className="payroll-emp">
            <Avatar name={row.employeeName} code={row.employeeCode} size={40} />
            <div className="meta">
              <h2>Edit Payroll</h2>
              <span className="caption">{row.employeeName} · {row.role}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={16} /></button>
        </div>

        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="Basic salary">
              <input className="input" type="number" min="0" value={form.basic} onChange={set('basic')} />
            </Field>
            <Field label="HRA (house rent)">
              <input className="input" type="number" min="0" value={form.hra} onChange={set('hra')} />
            </Field>
            <Field label="Allowances">
              <input className="input" type="number" min="0" value={form.allowances} onChange={set('allowances')} />
            </Field>
            <Field label="Deductions">
              <input className="input" type="number" min="0" value={form.deductions} onChange={set('deductions')} />
            </Field>
          </div>

          <div className="snap-stat" style={{ margin: '4px 0 16px' }}>
            <div className="v">{formatINR(net)} <span className="caption">/ month</span></div>
            <div className="k">Net salary (live preview)</div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}
