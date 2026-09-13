import { api } from './api'

export const projectService = {
  getProjects: () => api.get('/projects'),
  createProject: (payload) => api.post('/projects', payload),
  addMember: (projectId, employeeId) => api.post(`/projects/${projectId}/members`, { employeeId }),
  removeMember: (projectId, employeeId) => api.del(`/projects/${projectId}/members/${employeeId}`),
  deleteProject: (id) => api.del(`/projects/${id}`),
}
