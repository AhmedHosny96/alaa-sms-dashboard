import React from 'react';
import { Navigate, useLocation } from 'react-router';
import paths from 'routes/paths';
import { clearAuthToken, clearAuthUser, getAuthUser, isTokenExpired } from './authStorage';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const isAuthed = Boolean(getAuthUser());

  if (isTokenExpired()) {
    clearAuthToken();
    clearAuthUser();
    return <Navigate to={paths.simpleLogin} replace state={{ from: location }} />;
  }

  if (!isAuthed) {
    return <Navigate to={paths.simpleLogin} replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
