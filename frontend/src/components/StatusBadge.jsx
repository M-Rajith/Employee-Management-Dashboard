import React from 'react'
import { prettyEnum, statusBadgeClass } from '../utils/format'

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusBadgeClass(status)}`}>
      <span className="dot" />
      {prettyEnum(status)}
    </span>
  )
}
