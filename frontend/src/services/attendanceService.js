import { api } from './api'

export const attendanceService = {
  getAttendance: (range) => api.get(`/attendance?range=${range}`),
}
