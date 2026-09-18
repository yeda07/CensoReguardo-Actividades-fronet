export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });
  if (response.status !== 401) return response;

  if (!localStorage.getItem('refreshToken')) {
    localStorage.removeItem('token');
    window.location.replace('/login');
    return response;
  }

  try {
    const refreshResponse = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: localStorage.getItem('refreshToken') }),
    });
    if (!refreshResponse.ok) throw new Error('Session expired');

    const data = await refreshResponse.json();
    localStorage.setItem('token', data.access);
    headers.set('Authorization', `Bearer ${data.access}`);
    return fetch(url, { ...options, headers });
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.replace('/login');
    return response;
  }
}

export async function apiJson(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await apiFetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) {
    const message = data.detail || Object.values(data).flat().join(' ') || 'No se pudo completar la operación.';
    throw new Error(message);
  }
  return data;
}
