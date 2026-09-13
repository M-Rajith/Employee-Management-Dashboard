import React from 'react'
import { LayoutDashboard, Users, CalendarClock, BarChart3, Sparkles, Briefcase, Banknote, FolderKanban, X } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'directory', label: 'Employee Directory', icon: Users },
  { id: 'leaves', label: 'Leave Requests', icon: CalendarClock },
  { id: 'attendance', label: 'Attendance', icon: BarChart3 },
  { id: 'insights', label: 'People Insights', icon: Sparkles },
  { id: 'positions', label: 'Open Positions', icon: Briefcase },
  { id: 'payroll', label: 'Payroll', icon: Banknote },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
]

export default function Sidebar({ active, onNavigate, open, onClose }) {
  return (
    <>
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark"><Users size={17} /></span>
          PeopleOS
          <button className="icon-btn hamburger" style={{ marginLeft: 'auto' }} onClick={onClose} aria-label="Close menu">
            <X size={17} />
          </button>
        </div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item${active === id ? ' active' : ''}`}
            onClick={() => { onNavigate(id); onClose() }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
        <div className="sidebar-footer caption">
          PeopleOS v1.0<br />HR Console
        </div>
      </aside>
      {open && <div className="overlay open" onClick={onClose} style={{ zIndex: 65 }} />}
    </>
  )
}
