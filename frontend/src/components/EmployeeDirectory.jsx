import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Eye, LayoutGrid, List } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { initials, prettyEnum, DEPARTMENTS, STATUSES, LOCATIONS, TEAMS } from '../utils/format'
import StatusBadge from './StatusBadge'
import EmployeeCard from './EmployeeCard'
import Avatar from './Avatar'
import { EmptyState, ErrorState, NoResults, Spinner } from './States'

const SORTS = [
  { value: 'firstName,asc', label: 'Name A–Z' },
  { value: 'firstName,desc', label: 'Name Z–A' },
  { value: 'joinedDate,desc', label: 'Newest joiners' },
  { value: 'joinedDate,asc', label: 'Longest tenured' },
  { value: 'department,asc', label: 'Department' },
  { value: 'status,asc', label: 'Status' },
]

export default function EmployeeDirectory() {
  const { state, setFilter, setPage, openSnapshot, dispatch } = useApp()
  const { employees, filters, employeesLoading, employeesError } = state
  const hasFilters = filters.search || filters.department || filters.status || filters.location || filters.team
  const [view, setView] = useState('cards')

  return (
    <section className="section" id="directory" aria-label="Employee directory">
      <div className="section-head">
        <div>
          <h2>Employee Directory</h2>
          <p className="caption">{employees.totalElements} employees</p>
        </div>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => { dispatch({ type: 'RESET_FILTERS' }); setPage(0) }}
          disabled={!hasFilters}
        >
          <RotateCcw size={13} /> Reset filters
        </button>
      </div>

      <div className="filter-bar" role="group" aria-label="Employee filters">
        <select className="select" value={filters.department} onChange={(e) => setFilter('department', e.target.value)} aria-label="Filter by department">
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{prettyEnum(d)}</option>)}
        </select>
        <select className="select" value={filters.status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{prettyEnum(s)}</option>)}
        </select>
        <select className="select" value={filters.location} onChange={(e) => setFilter('location', e.target.value)} aria-label="Filter by location">
          <option value="">All locations</option>
          {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="select" value={filters.team} onChange={(e) => setFilter('team', e.target.value)} aria-label="Filter by team">
          <option value="">All teams</option>
          {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="select" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} aria-label="Sort employees">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="status-chips" role="group" aria-label="Quick status filter">
        {[
          { value: '', label: 'All' },
          { value: 'ACTIVE', label: 'Active' },
          { value: 'REMOTE', label: 'Remote' },
          { value: 'ON_LEAVE', label: 'On Leave' },
          { value: 'INACTIVE', label: 'Inactive' },
        ].map((chip) => (
          <button
            key={chip.value}
            type="button"
            className={`chip${filters.status === chip.value ? ' active' : ''}`}
            onClick={() => setFilter('status', chip.value)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {employeesLoading ? (
        <div className="glass card"><Spinner large /></div>
      ) : employeesError ? (
        <div className="glass card"><ErrorState message={employeesError} onRetry={() => setPage(employees.page)} /></div>
      ) : employees.content.length === 0 ? (
        <div className="glass card">{hasFilters ? <NoResults /> : (
          <EmptyState title="No employees yet" message="Add your first employee to get started." />
        )}</div>
      ) : (
        <>
          <div className="view-toggle" role="tablist" aria-label="Directory view">
            <button type="button" role="tab" aria-selected={view === 'cards'}
              className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>
              <LayoutGrid size={13} /> Cards
            </button>
            <button type="button" role="tab" aria-selected={view === 'table'}
              className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>
              <List size={13} /> Table
            </button>
          </div>

          {view === 'cards' ? (
            <div className="emp-grid">
              {employees.content.map((e) => (
                <EmployeeCard key={e.id} employee={e} onView={openSnapshot} />
              ))}
            </div>
          ) : (
          <div className="glass table-wrap">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Name</th><th>Role</th><th>Department</th><th>Team</th><th>Status</th>
                  <th>Location</th><th>Joined</th><th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {employees.content.map((e) => (
                  <tr key={e.id} onClick={() => openSnapshot(e.id)} tabIndex={0}
                      onKeyDown={(ev) => ev.key === 'Enter' && openSnapshot(e.id)}>
                    <td>
                      <div className="emp-cell">
                        <Avatar name={e.fullName} code={e.employeeCode} />
                        <div className="emp-meta">
                          <strong>{e.fullName}</strong>
                          <span className="caption">{e.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{e.role}</td>
                    <td className="muted nowrap">{prettyEnum(e.department)}</td>
                    <td className="muted nowrap">{e.team}</td>
                    <td><StatusBadge status={e.status} /></td>
                    <td className="muted nowrap">{e.location}</td>
                    <td className="muted nowrap">{new Date(e.joinedDate).getFullYear()}</td>
                    <td>
                      <button className="btn btn-sm" onClick={(ev) => { ev.stopPropagation(); openSnapshot(e.id) }}>
                        <Eye size={13} /> Snapshot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          <div className="pagination">
            <span className="page-info">
              Page {employees.page + 1} of {Math.max(employees.totalPages, 1)} · {employees.totalElements} records
            </span>
            <button className="btn btn-sm" disabled={employees.page === 0} onClick={() => setPage(employees.page - 1)}>
              <ChevronLeft size={14} /> Previous
            </button>
            <button className="btn btn-sm" disabled={employees.page + 1 >= employees.totalPages} onClick={() => setPage(employees.page + 1)}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}
    </section>
  )
}
