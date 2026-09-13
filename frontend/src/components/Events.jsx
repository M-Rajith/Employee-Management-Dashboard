import React, { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { dashboardService } from '../services/dashboardService'
import { Spinner } from './States'

function chip(daysUntil) {
  if (daysUntil === 0) return <span className="event-chip soon">Today!</span>
  if (daysUntil === 1) return <span className="event-chip soon">Tomorrow</span>
  return <span className={`event-chip${daysUntil <= 7 ? ' soon' : ' later'}`}>in {daysUntil} days</span>
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    dashboardService.getEvents()
      .then((data) => { if (!cancelled) setEvents(data || []) })
      .catch(() => { if (!cancelled) setEvents([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="glass card">
      <div className="section-head">
        <div>
          <h2>Upcoming Events</h2>
          <p className="caption">Holidays & celebrations</p>
        </div>
        <span className="kpi-icon"><CalendarDays size={17} /></span>
      </div>
      {loading ? (
        <div style={{ padding: '14px 0' }}><Spinner /></div>
      ) : events.length === 0 ? (
        <p className="caption">No upcoming events.</p>
      ) : (
        <div className="event-list">
          {events.map((ev) => {
            const d = new Date(ev.date)
            return (
              <div className="event-row" key={ev.name}>
                <div className="event-date" aria-hidden="true">
                  <span className="dd">{d.getDate()}</span>
                  <span className="mm">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                </div>
                <span className="event-name">{ev.name}</span>
                {chip(Number(ev.daysUntil))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
