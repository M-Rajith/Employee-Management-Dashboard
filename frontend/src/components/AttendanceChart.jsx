import React from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Legend, Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useApp } from '../state/AppContext'
import { ErrorState, Spinner } from './States'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const COLORS = {
  present: '#34d399',
  remote: '#60a5fa',
  late: '#fbbf24',
  absent: '#f87171',
}

export default function AttendanceChart() {
  const { state, setAttendanceRange } = useApp()
  const { attendance, attendanceLoading, attendanceError } = state
  const range = attendance.range || 'week'
  const isDark = state.theme !== 'light'
  const axisColor = isDark ? '#9aa1b8' : '#5d6479'
  const gridColor = isDark ? 'rgba(255,255,255,.05)' : 'rgba(24,28,50,.07)'

  if (attendanceError) {
    return (
      <div className="glass card">
        <div className="section-head"><h2>Attendance Overview</h2></div>
        <ErrorState message={attendanceError} onRetry={() => setAttendanceRange(range)} />
      </div>
    )
  }

  const days = attendance.days || []
  const labels = days.map((d) => (range === 'month'
    ? new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : d.label))
  const dataset = (key, label) => ({
    label,
    data: days.map((d) => d[key]),
    borderColor: COLORS[key],
    backgroundColor: COLORS[key] + '22',
    borderWidth: 2,
    pointRadius: range === 'month' ? 0 : 3,
    pointHoverRadius: 5,
    tension: 0.35,
    fill: key === 'present',
  })

  const data = {
    labels,
    datasets: [dataset('present', 'Present'), dataset('remote', 'Remote'), dataset('late', 'Late'), dataset('absent', 'Absent')],
  }

  const options = {
    responsive: true,
    animation: { duration: 650, easing: 'easeOutQuart' },
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: { color: axisColor, boxWidth: 10, boxHeight: 10, usePointStyle: true, font: { family: 'Inter', size: 11 } },
      },
      tooltip: {
        backgroundColor: 'rgba(16,19,34,.95)',
        borderColor: 'rgba(255,255,255,.15)',
        borderWidth: 1,
        titleFont: { family: 'Inter' },
        bodyFont: { family: 'Inter' },
      },
    },
    scales: {
      x: {
        ticks: { color: axisColor, maxTicksLimit: range === 'month' ? 10 : 7, font: { family: 'Inter', size: 10.5 } },
        grid: { color: gridColor },
      },
      y: {
        beginAtZero: true,
        ticks: { color: axisColor, precision: 0, font: { family: 'Inter', size: 10.5 } },
        grid: { color: gridColor },
      },
    },
  }

  return (
    <section className="section" id="attendance" aria-label="Attendance overview">
      <div className="glass card">
        <div className="section-head">
          <div>
            <h2>Attendance Overview</h2>
            <p className="caption">Present, remote, late and absence trends</p>
          </div>
          <div className="range-toggle" role="tablist" aria-label="Attendance range">
            {['week', 'month'].map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                className={range === r ? 'active' : ''}
                onClick={() => range !== r && setAttendanceRange(r)}
              >
                {r === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
        </div>
        {attendanceLoading ? (
          <div style={{ height: 280, display: 'grid', placeItems: 'center' }}><Spinner large /></div>
        ) : (
          <div className="chart-wrap"><Line data={data} options={options} /></div>
        )}
      </div>
    </section>
  )
}
