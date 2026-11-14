const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   * @param {{ field?: string, message: string }[]} [details]
   */
  constructor(status, message, details = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/**
 * @param {string} path - Path under /api, e.g. "/recipes"
 * @param {RequestInit} [options]
 */
export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers ?? {})
  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 204) {
    return null
  }

  let body = null
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    body = await response.json()
  }

  if (!response.ok) {
    const details = body?.error?.details ?? []
    let message = body?.error?.message ?? `Request failed (${response.status})`
    // Backend currently maps 501 through the generic >=500 error text.
    if (response.status === 501) {
      message =
        'This API endpoint is not implemented yet. The UI is ready once the backend route is wired.'
    }
    throw new ApiError(response.status, message, details)
  }

  return body
}

export function register(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logout() {
  return apiRequest('/auth/logout', { method: 'POST' })
}

export function getMe() {
  return apiRequest('/auth/me')
}

export function listRecipes() {
  return apiRequest('/recipes')
}

/** @param {number|string} id @param {number|string} [version] */
export function getRecipe(id, version) {
  const query = version != null && version !== '' ? `?version=${encodeURIComponent(version)}` : ''
  return apiRequest(`/recipes/${id}${query}`)
}

export function publishRecipe(payload) {
  return apiRequest('/recipes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** @param {number|string} id */
export function forkRecipe(id) {
  return apiRequest(`/recipes/${id}/forks`, { method: 'POST' })
}

/** @param {number|string} id @param {object} payload */
export function updateRecipe(id, payload) {
  return apiRequest(`/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
