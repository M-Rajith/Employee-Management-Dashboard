import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { DEPARTMENTS, STATUSES, LOCATIONS, TEAMS, EMAIL_RE, PHONE_RE, prettyEnum } from '../utils/format'
import { employeeService } from '../services/employeeService'

const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '',
  employeeCode: '', department: '', role: '', team: '', status: 'ACTIVE',
  location: '', joinedDate: new Date().toISOString().slice(0, 10), managerId: '',
}

export default function AddEmployeeModal() {
  const { state, dispatch, toast, addEmployee } = useApp()
  const open = state.addModalOpen
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [managers, setManagers] = useState([])

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setErrors({})
      employeeService.getEmployees({ size: 100 })
        .then((data) => setManagers(data.content))
        .catch(() => setManagers([]))
    }
  }, [open])

  if (!open) return null

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Enter a valid email address'
    if (form.phone && !PHONE_RE.test(form.phone)) errs.phone = 'Enter a valid phone number'
    if (!form.employeeCode.trim()) errs.employeeCode = 'Employee code is required'
    if (!form.department) errs.department = 'Department is required'
    if (!form.role.trim()) errs.role = 'Role is required'
    if (!form.team) errs.team = 'Team is required'
    if (!form.location) errs.location = 'Location is required'
    if (!form.joinedDate) errs.joinedDate = 'Joining date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      await addEmployee({
        ...form,
        managerId: form.managerId ? Number(form.managerId) : null,
      })
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const close = () => dispatch({ type: 'SET_ADD_MODAL', value: false })

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="glass modal" role="dialog" aria-modal="true" aria-label="Add employee">
        <div className="section-head">
          <h2>Add Employee</h2>
          <button className="icon-btn" onClick={close} aria-label="Close dialog"><X size={16} /></button>
        </div>

        <form onSubmit={submit} noValidate>
          <h3 style={{ margin: '4px 0 12px' }}>Personal Information</h3>
          <div className="form-grid">
            <Field label="First name" required error={errors.firstName}>
              <input className="input" value={form.firstName} onChange={set('firstName')} placeholder="Arjun" />
            </Field>
            <Field label="Last name" required error={errors.lastName}>
              <input className="input" value={form.lastName} onChange={set('lastName')} placeholder="Kumar" />
            </Field>
            <Field label="Email" required error={errors.email}>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="arjun@peopleos.io" />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98400 00000" />
            </Field>
          </div>

          <h3 style={{ margin: '8px 0 12px' }}>Work Information</h3>
          <div className="form-grid">
            <Field label="Employee code" required error={errors.employeeCode}>
              <input className="input" value={form.employeeCode} onChange={set('employeeCode')} placeholder="EMP-025" />
            </Field>
            <Field label="Role" required error={errors.role}>
              <input className="input" value={form.role} onChange={set('role')} placeholder="Software Engineer" />
            </Field>
            <Field label="Team" required error={errors.team}>
              <select className="select" value={form.team} onChange={set('team')}>
                <option value="">Select…</option>
                {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
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
            <Field label="Joining date" required error={errors.joinedDate}>
              <input className="input" type="date" value={form.joinedDate} onChange={set('joinedDate')} />
            </Field>
            <Field label="Manager" full>
              <select className="select" value={form.managerId} onChange={set('managerId')}>
                <option value="">No manager</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
              </select>
            </Field>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn" onClick={close} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> : null}
              {submitting ? 'Saving…' : 'Add Employee'}
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
