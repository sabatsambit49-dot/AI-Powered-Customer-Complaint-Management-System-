// Centralized API configuration supporting VITE_API_BASE_URL with fallback for local dev
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export function getAuthHeaders(token) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchWithAuth(url, options = {}, token = null, onUnauthorized = null) {
  const reqHeaders = {
    ...getAuthHeaders(token),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers: reqHeaders
  });

  if (response.status === 401 && onUnauthorized) {
    onUnauthorized();
  }

  return response;
}
