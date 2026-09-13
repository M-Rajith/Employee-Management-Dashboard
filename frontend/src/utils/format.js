export function initials(name = '') {
  return name.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export function prettyEnum(value = '') {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  return `${date}, ${time}`
}

export function timeAgo(value) {
  if (!value) return ''
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(value)
}

export function statusBadgeClass(status = '') {
  switch (status) {
    case 'ACTIVE': return 'badge-active'
    case 'REMOTE': return 'badge-remote'
    case 'ON_LEAVE': return 'badge-on-leave'
    case 'INACTIVE': return 'badge-inactive'
    default: return 'badge-inactive'
  }
}

export function attendanceClass(pct) {
  if (pct >= 90) return 'good'
  if (pct >= 75) return 'mid'
  return 'bad'
}

export const DEPARTMENTS = ['ENGINEERING', 'PRODUCT', 'DESIGN', 'SALES', 'HR', 'MARKETING', 'OPERATIONS']
export const STATUSES = ['ACTIVE', 'REMOTE', 'ON_LEAVE', 'INACTIVE']
export const LOCATIONS = ['Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Kochi', 'Remote']
export const TEAMS = ['Platform', 'Core Services', 'Mobile', 'Product & Growth', 'Design Studio', 'Revenue', 'Go-To-Market', 'People Ops', 'BizOps']
export function formatINR(n) {
  if (n === null || n === undefined) return '—'
  return '\u20B9' + Number(n).toLocaleString('en-IN')
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_RE = /^[0-9+\-\s]{7,20}$/
