const BASE =
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') +
  '/api/production';

export async function api(path, method = 'GET', data) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(data === undefined
      ? {}
      : {
          body: JSON.stringify(data),
        }),
  });

  if (!res.ok) {
    let error = await res.json().catch(() => ({}));

    throw new Error(
      error.error || error.message || `HTTP ${res.status}`
    );
  }

  return res.status === 204 ? null : res.json();
}

export const list = (resource) => api('/' + resource);

export const create = (resource, data) =>
  api('/' + resource, 'POST', data);

export const update = (resource, id, data) =>
  api('/' + resource + '/' + encodeURIComponent(id), 'PUT', data);

export const remove = (resource, id) =>
  api('/' + resource + '/' + encodeURIComponent(id), 'DELETE');

export const formatCurrency = (value) =>
  '₹' + Number(value || 0).toLocaleString('en-IN');