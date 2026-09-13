import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { prettyEnum, formatDate } from '../utils/format'
import { EmptyState, Spinner } from './States'
import PositionModal from './PositionModal'

const STATUS_CHIPS = [
  { value: '', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'FILLED', label: 'Filled' },
  { value: 'CLOSED', label: 'Closed' },
]

function badgeClass(status) {
  switch (status) {
    case 'OPEN': return 'badge-open'
    case 'ON_HOLD': return 'badge-on-hold'
    case 'FILLED': return 'badge-filled'
    case 'CLOSED': return 'badge-closed'
    default: return 'badge-inactive'
  }
}

export default function Positions() {
  const { state, deletePosition, toast } = useApp()
  const { positions, positionsLoading } = state
  const [chip, setChip] = useState('')
  const [modal, setModal] = useState({ open: false, editing: null })
  const [busyId, setBusyId] = useState(null)

  const visible = chip ? positions.filter((p) => p.status === chip) : positions
  const openCount = positions.filter((p) => p.status === 'OPEN').reduce((n, p) => n + p.openings, 0)

  const remove = async (pos) => {
    if (!window.confirm(`Delete the position "${pos.title}"?`)) return
    setBusyId(pos.id)
    try {
      await deletePosition(pos.id)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="section" id="positions" aria-label="Open positions">
      <div className="section-head">
        <div>
          <h2>Open Positions</h2>
          <p className="caption">{openCount} openings across {positions.length} roles</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({ open: true, editing: null })}>
          <Plus size={14} /> Add Position
        </button>
      </div>

      <div className="status-chips" role="group" aria-label="Filter positions by status">
        {STATUS_CHIPS.map((c) => (
          <button key={c.value} type="button"
            className={`chip${chip === c.value ? ' active' : ''}`}
            onClick={() => setChip(c.value)}>
            {c.label}
          </button>
        ))}
      </div>

      {positionsLoading ? (
        <div className="glass card"><Spinner large /></div>
      ) : visible.length === 0 ? (
        <div className="glass card">
          <EmptyState icon={Briefcase}
            title={chip ? `No ${prettyEnum(chip).toLowerCase()} positions` : 'No positions yet'}
            message={chip ? 'Try another status filter.' : 'Add your first open role to start tracking hiring.'} />
        </div>
      ) : (
        visible.map((pos) => (
          <div className="glass card leave-card hoverable" key={pos.id}>
            <span className="kpi-icon" style={{ width: 38, height: 38, flexShrink: 0 }}><Briefcase size={16} /></span>
            <div className="leave-meta">
              <strong>{pos.title}</strong>
              <span className="caption">{prettyEnum(pos.department)} · {pos.location}</span>
              <span className="caption">
                {pos.openings} opening{pos.openings > 1 ? 's' : ''} · posted {formatDate(pos.postedDate)}
                {pos.notes ? ` · ${pos.notes}` : ''}
              </span>
            </div>
            <span className={`badge ${badgeClass(pos.status)}`}>{prettyEnum(pos.status)}</span>
            <div className="leave-actions">
              <button className="btn btn-sm" disabled={busyId === pos.id}
                onClick={() => setModal({ open: true, editing: pos })}>
                <Pencil size={13} /> Edit
              </button>
              <button className="btn btn-sm btn-danger-ghost" disabled={busyId === pos.id}
                onClick={() => remove(pos)}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))
      )}

      {modal.open && (
        <PositionModal editing={modal.editing} onClose={() => setModal({ open: false, editing: null })} />
      )}
    </section>
  )
}
