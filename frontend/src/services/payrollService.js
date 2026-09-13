import { api } from './api'

export const payrollService = {
  getPayroll: () => api.get('/payroll'),
  savePayroll: (employeeId, amounts) => api.put(`/employees/${employeeId}/payroll`, amounts),
}
