import React from 'react'
import { useApp } from '../state/AppContext'
import { prettyEnum } from '../utils/format'

export default function DepartmentDistribution() {
  const { state } = useApp()
  const dist = state.dashboard?.departmentDistribution || []

  return (
    <div className="glass card">
      <div className="section-head">
        <div>
          <h2>Department Distribution</h2>
          <p className="caption">Workforce composition</p>
        </div>
      </div>
      {dist.length === 0 ? (
        <p className="caption">No employees yet.</p>
      ) : (
        dist.map((d) => (
          <div className="dist-row" key={d.department}>
            <span className="dist-name">{prettyEnum(d.department)}</span>
            <div className="dist-bar">
              <div style={{ width: `${d.percentage}%` }} />
            </div>
            <span className="dist-pct">{d.percentage}%</span>
          </div>
        ))
      )}
    </div>
  )
}
