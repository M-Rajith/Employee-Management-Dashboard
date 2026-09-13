import React from 'react'
import { Sparkles } from 'lucide-react'
import { useApp } from '../state/AppContext'

export default function Insights() {
  const { state } = useApp()
  const { insights } = state

  if (!insights || insights.length === 0) return null

  return (
    <section className="section" id="insights" aria-label="People insights">
      <div className="section-head">
        <div>
          <h2>People Insights</h2>
          <p className="caption">Generated from live workforce data</p>
        </div>
      </div>
      <div className="insights-row">
        {insights.map((text, i) => (
          <div className="glass insight-card" key={i}>
            <Sparkles size={16} />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
