const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText || 'Request failed'}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Fallback to HTTP error
      }
      throw new Error(errorMessage);
    }

    const contentType = res.headers.get('content-type') || '';
    // If the server returns HTML (e.g. Vite SPA fallback index.html), the backend is not connected
    if (!contentType.includes('application/json')) {
      throw new Error('Backend not available (received non-JSON response)');
    }

    const data = await res.json();
    return data?.data ?? data;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

const client = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, payload) => request(path, { method: 'POST', body: JSON.stringify(payload) }),
  put: (path, payload) => request(path, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export default client;
