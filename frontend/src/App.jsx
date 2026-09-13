import React, { useState } from 'react'
import { useApp } from './state/AppContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import KpiCard, { KpiSkeleton } from './components/KpiCard'
import AttendanceChart from './components/AttendanceChart'
import DepartmentDistribution from './components/DepartmentDistribution'
import ActivityFeed from './components/ActivityFeed'
import EmployeeDirectory from './components/EmployeeDirectory'
import LeaveRequests from './components/LeaveRequests'
import Positions from './components/Positions'
import Events from './components/Events'
import Payroll from './components/Payroll'
import Projects from './components/Projects'
import Insights from './components/Insights'
import ProfileDrawer from './components/ProfileDrawer'
import AddEmployeeModal from './components/AddEmployeeModal'
import Toasts from './components/Toasts'
import Reveal from './components/Reveal'

export default function App() {
  const { state } = useApp()
  const [nav, setNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = (id) => {
    setNav(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app">
      <Sidebar active={nav} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main">
        <Topbar onMenu={() => setSidebarOpen(true)} />

        {/* KPI strip */}
        <section className="section" id="dashboard" aria-label="Workforce KPIs">
          <div className="kpi-grid">
            {state.dashboardLoading
              ? Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
              : (state.dashboard?.kpis || []).map((kpi, i) => (
                  <Reveal key={kpi.key} delay={i}><KpiCard kpi={kpi} /></Reveal>
                ))}
          </div>
        </section>

        <Reveal>
          <Insights />
        </Reveal>

        {/* Attendance + distribution */}
        <Reveal>
          <div className="two-col section">
            <AttendanceChart />
            <DepartmentDistribution />
          </div>
        </Reveal>

        {/* Directory */}
        <Reveal>
          <EmployeeDirectory />
        </Reveal>

        {/* Leaves + activity */}
        <Reveal>
          <div className="two-col section">
            <LeaveRequests />
            <ActivityFeed />
          </div>
        </Reveal>

        <Reveal>
          <div className="two-col section">
            <Positions />
            <Events />
          </div>
        </Reveal>

        <Reveal>
          <Projects />
        </Reveal>

        <Reveal>
          <Payroll />
        </Reveal>
      </main>

      <ProfileDrawer />
      <AddEmployeeModal />
      <Toasts />
    </div>
  )
}
