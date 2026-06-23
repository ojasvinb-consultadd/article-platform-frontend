const BASE_URL = 'https://antiquely-salvation-poncho.ngrok-free.dev';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include', // send session cookie
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 204) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  getMe: () => request('/me'),
  logout: () => request('/logout', { method: 'POST' }),

  // Articles
  getArticles: () => request('/articles'),
  getArticle: (id) => request(`/articles/${id}`),
  searchArticles: (q, tags) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (tags && tags.length) tags.forEach((t) => params.append('tags', t));
    return request(`/articles/search?${params}`);
  },
  createArticle: (data) =>
    request('/articles', { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id, data) =>
    request(`/articles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteArticle: (id) => request(`/articles/${id}`, { method: 'DELETE' }),

  // Admin
  getAdminArticles: () => request('/admin/articles'),
  getDeletedArticles: () => request('/admin/articles/deleted'),
  hardDeleteArticle: (id) =>
    request(`/admin/articles/${id}/hard-delete`, { method: 'DELETE' }),
};
