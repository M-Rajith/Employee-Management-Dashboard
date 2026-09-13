import { api } from './api'

export const activityService = {
  getActivities: () => api.get('/activities'),
}
