import { api } from './api'

function buildQuery({ search, department, status, location, team, page, size, sort }) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (department) params.set('department', department)
  if (status) params.set('status', status)
  if (location) params.set('location', location)
  if (team) params.set('team', team)
  params.set('page', String(page ?? 0))
  params.set('size', String(size ?? 20))
  params.set('sort', sort || 'firstName,asc')
  return `?${params.toString()}`
}

export const employeeService = {
  getEmployees: (query) => api.get(`/employees${buildQuery(query)}`),
  getEmployee: (id) => api.get(`/employees/${id}`),
  getSnapshot: (id) => api.get(`/employees/${id}/snapshot`),
  getAttendance: (id, range = 'month') => api.get(`/employees/${id}/attendance?range=${range}`),
  createEmployee: (payload) => api.post('/employees', payload),
  updateEmployee: (id, payload) => api.put(`/employees/${id}`, payload),
  deleteEmployee: (id) => api.del(`/employees/${id}`),
}
