import { api } from './api'

export const positionService = {
  getPositions: (status) => api.get(`/positions${status ? `?status=${status}` : ''}`),
  getPosition: (id) => api.get(`/positions/${id}`),
  createPosition: (payload) => api.post('/positions', payload),
  updatePosition: (id, payload) => api.put(`/positions/${id}`, payload),
  deletePosition: (id) => api.del(`/positions/${id}`),
}
