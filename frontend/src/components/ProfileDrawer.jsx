import React, { useEffect, useState } from 'react'
import { X, Mail, Phone, MapPin, CalendarDays, User, Users, Briefcase, Wallet, Activity } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { employeeService } from '../services/employeeService'
import { prettyEnum, formatDate, formatDateTime, formatINR } from '../utils/format'
import Avatar from './Avatar'
import StatusBadge from './StatusBadge'
import { Spinner } from './States'

export default function ProfileDrawer() {
  const { state, closeSnapshot } = useApp()
  const { drawerOpen, snapshot, snapshotLoading } = state

  return (
    <>
      <div className={`overlay${drawerOpen ? ' open' : ''}`} onClick={closeSnapshot} />
      <aside className={`drawer${drawerOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Work Snapshot">
        <div className="drawer-head">
          {snapshot ? <Avatar name={snapshot.fullName} code={snapshot.employeeCode} size={64} /> : <div className="avatar-circle lg">·</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            {snapshot && (
              <>
                <h2>{snapshot.fullName}</h2>
                <p className="caption">{snapshot.role} · {prettyEnum(snapshot.department)}</p>
                <div style={{ marginTop: 6 }}><StatusBadge status={snapshot.status} /></div>
              </>
            )}
          </div>
          <button className="icon-btn" onClick={closeSnapshot} aria-label="Close snapshot">
            <X size={17} />
          </button>
        </div>

        <div className="drawer-body">
          {snapshotLoading || !snapshot ? (
            <Spinner large />
          ) : (
            <>
              <h3>Work Snapshot</h3>
              <p className="caption">{snapshot.currentWorkStatus}</p>
              <div className="snap-att">
                <AttendanceRing pct={snapshot.attendancePercentage} />
                <div style={{ minWidth: 0 }}>
                  <h3>Attendance</h3>
                  <p className="caption">{snapshot.attendancePercentage}% over the last 30 days</p>
                  <p className="caption" style={{ marginTop: 6 }}>
                    {snapshot.attendancePercentage >= 90 ? 'Excellent consistency'
                      : snapshot.attendancePercentage >= 75 ? 'Healthy attendance'
                      : 'Attendance needs attention'}
                  </p>
                </div>
              </div>
              <div className="snap-grid">
                <div className="snap-stat">
                  <div className="v">{snapshot.leaveUsedDays}d <span className="caption">/ {snapshot.leaveUsedDays + snapshot.leaveRemainingDays}d</span></div>
                  <div className="k">Leave used this year</div>
                </div>
                <div className="snap-stat">
                  <div className="v">{snapshot.leaveRemainingDays}d</div>
                  <div className="k">Leave remaining</div>
                </div>
                <div className="snap-stat" style={{ gridColumn: '1 / -1' }}>
                  <div className="v">{snapshot.leaveRemainingDays > 6 ? 'Healthy' : 'Low'}</div>
                  <div className="k">Leave balance</div>
                </div>
              </div>

              <AttendanceHistory employeeId={snapshot.id} />

              <h3 style={{ marginTop: 20 }}>Basic Information</h3>
              <div className="info-list">
                <InfoRow icon={Mail} k="Email" v={snapshot.email} />
                <InfoRow icon={Phone} k="Phone" v={snapshot.phone || '—'} />
                <InfoRow icon={MapPin} k="Location" v={snapshot.location} />
                <InfoRow icon={Briefcase} k="Employee code" v={snapshot.employeeCode} />
                <InfoRow icon={Users} k="Team" v={snapshot.team} />
                <InfoRow icon={Wallet} k="Net salary (monthly)" v={snapshot.netSalary != null ? formatINR(snapshot.netSalary) : '—'} />
                <InfoRow icon={CalendarDays} k="Joined" v={formatDate(snapshot.joinedDate)} />
                <InfoRow icon={User} k="Manager" v={snapshot.managerName} />
              </div>

              <h3 style={{ marginTop: 20, marginBottom: 6 }}>
                <Activity size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                Recent Activity
              </h3>
              {snapshot.recentActivities.length === 0 ? (
                <p className="caption">No recent activity for this employee.</p>
              ) : (
                snapshot.recentActivities.map((a) => (
                  <div className="activity-item" key={a.id}>
                    <div className="activity-icon"><Activity size={14} /></div>
                    <div>
                      <div className="act-msg">{a.message}</div>
                      <span className="caption">{formatDateTime(a.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}

function InfoRow({ icon: Icon, k, v }) {
  return (
    <div className="row">
      <span className="k"><Icon size={13} style={{ verticalAlign: -2, marginRight: 7 }} />{k}</span>
      <span style={{ textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
    </div>
  )
}

/** Circular progress ring for the 30-day attendance percentage. */
function AttendanceRing({ pct }) {
  const r = 26
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct || 0))
  const color = clamped >= 90 ? 'var(--success)' : clamped >= 75 ? 'var(--warning)' : 'var(--error)'
  return (
    <div className="att-ring" role="img" aria-label={`Attendance ${clamped}%`}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="7" style={{ stroke: 'var(--ring-track)' }} />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (clamped / 100) * c}
          transform="rotate(-90 36 36)" style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <span className="att-ring-label">{clamped}%</span>
    </div>
  )
}

/** Date-wise attendance for the snapshot's employee: present / remote / late / absent per day. */
function AttendanceHistory({ employeeId }) {
  const [range, setRange] = useState('month')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    employeeService.getAttendance(employeeId, range)
      .then((data) => { if (!cancelled) setRecords(data || []) })
      .catch(() => { if (!cancelled) setRecords([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [employeeId, range])

  return (
    <div className="att-history">
      <div className="section-head" style={{ marginBottom: 4 }}>
        <h3>Attendance History</h3>
        <div className="range-toggle" role="tablist" aria-label="Attendance history range">
          {['week', 'month'].map((r) => (
            <button key={r} role="tab" aria-selected={range === r}
              className={range === r ? 'active' : ''}
              onClick={() => range !== r && setRange(r)}>
              {r === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div style={{ padding: '10px 0' }}><Spinner /></div>
      ) : records.length === 0 ? (
        <p className="caption">No attendance records for this period.</p>
      ) : (
        <div className="att-history-list">
          {[...records].reverse().map((rec) => (
            <div className="att-history-row" key={rec.date}>
              <span className="d">{rec.label}</span>
              <span className={`badge ${statusBadgeClass(rec.status)}`}>{prettyEnum(rec.status)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function statusBadgeClass(status) {
  switch (status) {
    case 'PRESENT': return 'badge-active'
    case 'REMOTE': return 'badge-remote'
    case 'LATE': return 'badge-on-leave'
    case 'ABSENT': return 'badge-absent'
    default: return 'badge-inactive'
  }
}
