import React, { useState } from 'react'
import { Check, X, CalendarClock } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { prettyEnum, formatDate } from '../utils/format'
import Avatar from './Avatar'
import { EmptyState, ErrorState, Spinner } from './States'

export default function LeaveRequests() {
  const { state, approveLeave, rejectLeave } = useApp()
  const { pendingLeaves, leavesLoading, leavesError } = state
  const [busyId, setBusyId] = useState(null)

  const act = async (id, fn) => {
    setBusyId(id)
    try { await fn(id) } catch (err) { /* toast handled by context error paths */ }
    finally { setBusyId(null) }
  }

  return (
    <section className="section" id="leaves" aria-label="Pending leave requests">
      <div className="section-head">
        <div>
          <h2>Pending Leave Requests</h2>
          <p className="caption">{pendingLeaves.length} awaiting review</p>
        </div>
      </div>

      {leavesLoading ? (
        <div className="glass card"><Spinner large /></div>
      ) : leavesError ? (
        <div className="glass card"><ErrorState message={leavesError} /></div>
      ) : pendingLeaves.length === 0 ? (
        <div className="glass card">
          <EmptyState icon={CalendarClock} title="No pending leave requests" message="You're all caught up." />
        </div>
      ) : (
        <div>
          {pendingLeaves.map((leave) => (
            <div className="glass card leave-card hoverable" key={leave.id}>
              <Avatar name={leave.employeeName} code={leave.employeeCode} />
              <div className="leave-meta">
                <strong>{leave.employeeName}</strong>
                <span className="caption">{leave.employeeRole} · {prettyEnum(leave.employeeDepartment)}</span>
                <span className="caption">
                  {prettyEnum(leave.leaveType)} leave · {formatDate(leave.startDate)} → {formatDate(leave.endDate)} · {leave.duration}d
                </span>
              </div>
              <div className="leave-actions">
                <button
                  className="btn btn-sm btn-success"
                  disabled={busyId === leave.id}
                  onClick={() => act(leave.id, approveLeave)}
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  className="btn btn-sm btn-danger-ghost"
                  disabled={busyId === leave.id}
                  onClick={() => act(leave.id, rejectLeave)}
                >
                  <X size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
