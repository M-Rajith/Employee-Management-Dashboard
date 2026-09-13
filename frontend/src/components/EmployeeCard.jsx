import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, UserCheck, CalendarOff, Star } from 'lucide-react'
import { prettyEnum } from '../utils/format'
import StatusBadge from './StatusBadge'
import Avatar from './Avatar'

const spring = { type: 'spring', stiffness: 300, damping: 30 }

/** Deterministic per-employee demo metrics (stable across renders & sessions). */
function metricsFor(id) {
  const h = (n) => (id * 2654435761 + n * 40503) % 100
  return [
    { label: 'Attendance', value: 62 + (h(1) % 38), Icon: UserCheck, cls: 'bar-green' },
    { label: 'Leave Balance', value: 20 + (h(2) % 80), Icon: CalendarOff, cls: 'bar-amber' },
    { label: 'Profile Completion', value: 55 + (h(3) % 45), Icon: Star, cls: 'bar-blue' },
  ]
}

export default function EmployeeCard({ employee, onView }) {
  const stats = metricsFor(employee.id || 1)

  return (
    <motion.div
      className="glass card emp-card emp-motion-card"
      initial="collapsed"
      whileHover="expanded"
      onClick={() => onView(employee.id)}
      onKeyDown={(e) => e.key === 'Enter' && onView(employee.id)}
      tabIndex={0}
      aria-label={`${employee.fullName} — open work snapshot`}
    >
      <motion.div layout="position" transition={spring}>
        <div className="top">
          <Avatar name={employee.fullName} code={employee.employeeCode} size={44} />
          <div className="meta">
            <strong>{employee.fullName}</strong>
            <span className="caption">{employee.role} · {employee.team}</span>
            <span className="caption">{employee.email}</span>
          </div>
          <StatusBadge status={employee.status} />
        </div>

        <motion.div
          className="emp-mc-stats"
          variants={{
            collapsed: { height: 0, opacity: 0, marginTop: 0 },
            expanded: { height: 'auto', opacity: 1, marginTop: 12 },
          }}
          transition={{ staggerChildren: 0.08, ...spring }}
        >
          {stats.map(({ label, value, Icon, cls }) => (
            <motion.div
              key={label}
              className="emp-mc-stat"
              variants={{ collapsed: { opacity: 0, y: 10 }, expanded: { opacity: 1, y: 0 } }}
              transition={spring}
            >
              <div className="emp-mc-stat-row">
                <span className="lbl"><Icon size={13} /> {label}</span>
                <span className="val">{value}%</span>
              </div>
              <div className="emp-mc-bar">
                <motion.div
                  className={`emp-mc-bar-fill ${cls}`}
                  variants={{ collapsed: { width: 0 }, expanded: { width: `${value}%` } }}
                  transition={spring}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div className="emp-mc-foot">
        <div className="chips">
          <span className="badge" style={deptStyle}>{prettyEnum(employee.department)}</span>
          <span className="badge loc-chip">{employee.location}</span>
        </div>
        <span className="swap">
          <motion.span className="swap-item swap-a"
            variants={{ collapsed: { opacity: 1, y: 0 }, expanded: { opacity: 0, y: -14 } }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}>
            View Snapshot
          </motion.span>
          <motion.span className="swap-item swap-b"
            variants={{ collapsed: { opacity: 0, y: 14 }, expanded: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}>
            Open Work Snapshot <ArrowUpRight size={14} />
          </motion.span>
        </span>
      </div>
    </motion.div>
  )
}

const deptStyle = { background: 'rgba(139,92,246,.12)', borderColor: 'rgba(139,92,246,.35)', color: '#b79df7' }
