import { api } from './api'

export const leaveService = {
  getPendingLeaves: () => api.get('/leaves/pending'),
  approveLeave: (id) => api.put(`/leaves/${id}/approve`),
  rejectLeave: (id) => api.put(`/leaves/${id}/reject`),
}
