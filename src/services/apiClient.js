import { getAuthToken } from 'components/authentication/authStorage';

const rawApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');
const API_PREFIX = '/api';

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return '';
  const query = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `?${query}`;
};

const buildProxiedUrl = (url, params) => `${API_PREFIX}${url}${buildQuery(params)}`;

/**
 * Docker/nginx: SPA and API often share one host with API behind {@code /api}.
 * If VITE_API_BASE_URL is set to bare origin only (e.g. https://dashboard.example.com),
 * browser would call https://…/sms/… and nginx serves index.html → no real JSON.
 * Same-host bare origins resolve to …/api so requests hit the proxy_pass block.
 */
function effectiveProductionApiBase() {
  if (!API_BASE_URL) return '';
  const trimmed = API_BASE_URL.replace(/\/+$/, '');
  try {
    const href = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    const u = new URL(href);
    const path = u.pathname.replace(/\/+$/, '') || '';
    if (path !== '') {
      return trimmed;
    }
    if (typeof window !== 'undefined' && u.host === window.location.host) {
      return `${trimmed}${API_PREFIX}`;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

const buildDirectUrl = (url, params) =>
  `${effectiveProductionApiBase() || API_BASE_URL}${url}${buildQuery(params)}`;

const inflight = new Map();

const requestKey = (method, url, params) => {
  const m = String(method || 'GET').toUpperCase();
  const p = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
  return `${m}::${url}::${p}`;
};

const request = async ({ method = 'GET', url, data, params, headers }) => {
  const token = getAuthToken();
  const normalizedMethod = String(method || 'GET').toUpperCase();
  const requestHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(normalizedMethod === 'GET'
      ? {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache'
        }
      : {}),
    ...(headers || {})
  };

  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  if (data !== undefined && data !== null && !isFormData && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const requestInit = {
    method: normalizedMethod,
    headers: requestHeaders,
    cache: normalizedMethod === 'GET' ? 'no-store' : 'default',
    body:
      data === undefined || data === null
        ? undefined
        : isFormData
          ? data
          : JSON.stringify(data)
  };

  // Abort/dedupe: for GET, cancel the previous in-flight request of the same key.
  let controller;
  const key = requestKey(normalizedMethod, url, params);
  if (normalizedMethod === 'GET' && typeof AbortController !== 'undefined') {
    const prev = inflight.get(key);
    if (prev) {
      try {
        prev.abort();
      } catch {}
    }
    controller = new AbortController();
    inflight.set(key, controller);
    requestInit.signal = controller.signal;
  }

  let response;
  try {
    const prodBase = !import.meta.env.DEV ? effectiveProductionApiBase() : '';
    const primaryUrl = import.meta.env.DEV
      ? buildProxiedUrl(url, params)
      : prodBase || API_BASE_URL
        ? buildDirectUrl(url, params)
        : buildProxiedUrl(url, params);
    response = await fetch(primaryUrl, requestInit);
  } catch (error) {
    if (controller && normalizedMethod === 'GET') {
      // The only place .abort() is called in this app is the dedupe path above; an AbortError
      // here therefore means a newer GET of the same key superseded this one. Returning a
      // never-settling promise lets callers skip per-site `if (e.name === 'AbortError')`
      // filtering — they would otherwise toast or log "signal is aborted without reason".
      if (error?.name === 'AbortError') {
        const current = inflight.get(key);
        if (current === controller) {
          inflight.delete(key);
        }
        return new Promise(() => {});
      }
    }
    if (effectiveProductionApiBase() || API_BASE_URL) {
      try {
        response = await fetch(buildProxiedUrl(url, params), requestInit);
      } catch (proxyError) {
        throw new Error(
          `Network error: unable to reach API (${API_BASE_URL}) and proxy (/api). Check backend availability, VITE_API_BASE_URL, VITE_API_PROXY_TARGET, and CORS.`
        );
      }
    } else {
      throw new Error(
        `Network error: unable to reach API proxy (/api). Check backend availability, VITE_API_PROXY_TARGET, and CORS.`
      );
    }
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (controller && normalizedMethod === 'GET') {
    const current = inflight.get(key);
    if (current === controller) {
      inflight.delete(key);
    }
  }

  if (!response.ok) {
    // If unauthorized, clear auth and redirect to login
    if (response.status === 401) {
      try {
        const { clearAuthToken, clearAuthUser } = await import('components/authentication/authStorage');
        clearAuthToken();
        clearAuthUser();
      } catch (e) {}
      window.location.href = '/login';
      return;
    }
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.data?.error || payload?.message || 'Request failed';
    throw new Error(message);
  }

  const inner = payload?.data;
  if (inner != null) {
    return inner;
  }
  return payload;
};

export const apiClient = {
  get: (url, params, headers) => request({ method: 'GET', url, params, headers }),
  post: (url, data, params, headers) =>
    request({ method: 'POST', url, data, params: params || undefined, headers }),
  put: (url, data, params, headers) =>
    request({ method: 'PUT', url, data, params: params || undefined, headers }),
  patch: (url, data, params, headers) =>
    request({ method: 'PATCH', url, data, params: params || undefined, headers }),
  del: (url, data, params, headers) =>
    request({ method: 'DELETE', url, data, params: params || undefined, headers })
};

export default apiClient;
