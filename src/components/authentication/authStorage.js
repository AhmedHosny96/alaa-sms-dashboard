export const AUTH_STORAGE_KEY = 'sms-auth-user';

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
  return local || session;
};

export const clearAuthUser = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};
