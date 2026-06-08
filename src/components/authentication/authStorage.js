export const AUTH_STORAGE_KEY = 'sms-auth-user';
export const AUTH_USERS_KEY = 'sms-auth-users';
export const AUTH_TOKEN_KEY = 'sms-auth-token';
/** Cached SMS dashboard JSON from last successful GET /sms/dashboard */
export const DASHBOARD_SNAP_STORAGE_KEY = 'alaSms.dashboard.snap.v1';

/** JWT uses Base64URL; atob() expects standard Base64. */
export const decodeJwtPayloadJson = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(pad);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const normalizeRoles = (raw) => {
  if (Array.isArray(raw)) return raw.map(String);
  if (raw && typeof raw === 'object') return Object.values(raw).map(String);
  return [];
};

const buildAuthUserFromToken = () => {
  const payload = getTokenPayload();
  if (!payload) return null;
  return {
    email: payload.email,
    roles: normalizeRoles(payload.roles),
    resourceId: payload.resourceId,
    clientId: payload.clientId || null,
    sub: payload.sub
  };
};

export const setAuthUser = (user, remember) => {
  const payload = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(AUTH_STORAGE_KEY, payload);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

export const getAuthUser = () => {
  const local = localStorage.getItem(AUTH_STORAGE_KEY);
  const session = sessionStorage.getItem(AUTH_STORAGE_KEY);
  const raw = local || session;
  if (!raw) {
    const fallbackUser = buildAuthUserFromToken();
    if (!fallbackUser) return null;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackUser));
    } catch (error) {
      // ignore storage errors
    }
    return fallbackUser;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getUserRoles = () => {
  const user = getAuthUser();
  return normalizeRoles(user?.roles);
};

export const getUserResourceId = () => {
  const user = getAuthUser();
  return user?.resourceId || null;
};

export const getUserClientId = () => {
  const user = getAuthUser();
  return user?.clientId || null;
};

export const hasRole = (role) => {
  const roles = getUserRoles();
  return roles.includes(role);
};
export const clearDashboardSnapshot = () => {
  try {
    localStorage.removeItem(DASHBOARD_SNAP_STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const clearAuthUser = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  clearDashboardSnapshot();
};

export const setAuthToken = (token) => {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  localStorage.setItem(AUTH_TOKEN_KEY, String(token));
};

export const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || '';
  } catch (error) {
    return '';
  }
};

export const getTokenPayload = () => {
  const token = getAuthToken();
  if (!token) return null;
  return decodeJwtPayloadJson(token);
};

export const getTokenExpiryMs = () => {
  const payload = getTokenPayload();
  const exp = payload?.exp;
  if (!exp) return 0;
  return Number(exp) * 1000;
};

export const isTokenExpired = () => {
  const expiryMs = getTokenExpiryMs();
  if (!expiryMs) return false;
  return Date.now() >= expiryMs;
};

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  clearDashboardSnapshot();
};

export const getAuthUsers = () => {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
};

export const saveAuthUsers = (users) => {
  try {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(Array.isArray(users) ? users : []));
  } catch (error) {
    // ignore storage errors
  }
};

export const addAuthUser = (user) => {
  const users = getAuthUsers();
  const next = [user, ...users.filter((u) => u?.username !== user?.username)];
  saveAuthUsers(next);
};

export const findAuthUserByCredentials = (login, password) => {
  const users = getAuthUsers();
  const normalized = String(login ?? '').toLowerCase();
  return users.find(
    (u) =>
      String(u?.username ?? '').toLowerCase() === normalized &&
      String(u?.password ?? '') === String(password ?? '')
  );
};
