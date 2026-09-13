const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    })
  } catch {
    throw new Error('Cannot reach the server. Is the PeopleOS API running?')
  }

  let body = null
  try { body = await response.json() } catch { /* empty body */ }

  if (body && body.success === false) {
    throw new Error(body.message || 'Request failed')
  }
  if (!response.ok) {
    throw new Error((body && body.message) || `Request failed (${response.status})`)
  }
  return body ? body.data : null
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  del: (path) => request(path, { method: 'DELETE' }),
}
