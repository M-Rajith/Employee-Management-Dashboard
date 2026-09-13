import React, { useEffect, useRef, useState } from 'react'
import { Users, UserCheck, CalendarOff, Home, Briefcase, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const ICONS = {
  totalEmployees: Users,
  presentToday: UserCheck,
  onLeave: CalendarOff,
  remoteToday: Home,
  openPositions: Briefcase,
}

/** Animates a number from its previous value to the target with ease-out cubic. */
function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const end = Number(target) || 0
    const start = fromRef.current
    if (start === end) {
      setDisplay(end)
      return
    }
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        fromRef.current = end
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}

export default function KpiCard({ kpi }) {
  const Icon = ICONS[kpi.key] || Users
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus
  const value = useCountUp(kpi.value)
  const isPositions = kpi.key === 'openPositions'
  const goPositions = () => document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div
      className="glass card hoverable kpi"
      tabIndex={isPositions ? 0 : undefined}
      role={isPositions ? 'link' : undefined}
      title={isPositions ? 'Manage open positions' : undefined}
      style={isPositions ? { cursor: 'pointer' } : undefined}
      onClick={isPositions ? goPositions : undefined}
      onKeyDown={isPositions ? (e) => e.key === 'Enter' && goPositions() : undefined}
    >
      <div className="kpi-top">
        <span className="kpi-label">{kpi.label}</span>
        <span className="kpi-icon"><Icon size={17} /></span>
      </div>
      <span className="kpi-value">{value}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {kpi.change !== 0 && kpi.key !== 'openPositions' && (
          <span className={`trend trend-${kpi.trend}`}>
            <TrendIcon size={12} /> {Math.abs(kpi.change)}
          </span>
        )}
        <span className="caption">{kpi.supportingInfo}</span>
      </div>
    </div>
  )
}

export function KpiSkeleton() {
  return <div className="skeleton kpi" />
}
