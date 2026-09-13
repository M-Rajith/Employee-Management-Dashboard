import { api } from './api'

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
  getInsights: () => api.get('/insights'),
  getEvents: () => api.get('/events'),
}
