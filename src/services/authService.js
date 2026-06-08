import apiClient from './apiClient';
import {
  clearAuthToken,
  clearAuthUser,
  decodeJwtPayloadJson,
  setAuthToken,
  setAuthUser
} from 'components/authentication/authStorage';

const coalesceRoles = (raw) => {
  if (Array.isArray(raw)) return raw.map(String);
  if (raw && typeof raw === 'object') return Object.values(raw).map(String);
  return [];
};

const authService = {
  async login({ email, password, remember }) {
    const result = await apiClient.post('/auth/login', { email, password });
    const token = result?.accessToken;
    if (!token) {
      throw new Error('Invalid login response');
    }
    setAuthToken(token);
    const payload = decodeJwtPayloadJson(token);
    if (!payload) {
      throw new Error('Invalid login response');
    }
    setAuthUser(
      {
        email: payload.email,
        roles: coalesceRoles(payload.roles),
        resourceId: payload.resourceId,
        clientId: payload.clientId || null,
        sub: payload.sub
      },
      !!remember
    );
    return result;
  },

  async logout() {
    // Backend logout endpoint is not required for JWT; clear client state.
    clearAuthToken();
    clearAuthUser();
  },

  // Placeholders for future use; currently not wired to backend
  async refreshToken() {
    clearAuthToken();
    return null;
  },

  async getProfile() {
    return apiClient.get('/me');
  },

  async updatePassword(payload) {
    return apiClient.post('/auth/password', payload);
  }
};

export default authService;
