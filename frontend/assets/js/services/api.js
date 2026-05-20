/* =====================================================
   API.JS — Cấu hình fetch/axios, base URL, token
   Mọi API call đều đi qua module này
===================================================== */

const API_BASE_URL = window.KEP_API_URL || 'http://localhost:5000/api/v1';

/* ── Lấy token từ localStorage ── */
function getToken() {
  try {
    const user = JSON.parse(localStorage.getItem('kep_current_user') || 'null');
    return user?.token || null;
  } catch {
    return null;
  }
}

/* ── Build headers ── */
function buildHeaders(extra = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extra,
  };
}

/* ── Generic request wrapper ── */
async function apiRequest(method, path, body = null, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const config = {
    method,
    headers: buildHeaders(options.headers || {}),
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.message || `HTTP error ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // Network or parse error
    if (!err.status) {
      err.message = 'Không thể kết nối server. Vui lòng thử lại.';
    }
    throw err;
  }
}

/* ── Convenience methods ── */
export const api = {
  get:    (path, opts)       => apiRequest('GET',    path, null, opts),
  post:   (path, body, opts) => apiRequest('POST',   path, body, opts),
  put:    (path, body, opts) => apiRequest('PUT',    path, body, opts),
  patch:  (path, body, opts) => apiRequest('PATCH',  path, body, opts),
  delete: (path, opts)       => apiRequest('DELETE', path, null, opts),
};

export default api;