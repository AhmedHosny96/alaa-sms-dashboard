import React from 'react';
import { Navigate, useLocation } from 'react-router';
import paths from 'routes/paths';
import { getAuthUser, getUserRoles, hasRole } from './authStorage';

const RequireRole = ({ roles = [], children }) => {
  const location = useLocation();
  const user = getAuthUser();
  const roleList = getUserRoles();
  if (!user || roleList.length === 0) {
    return <Navigate to={paths.simpleLogin} replace state={{ from: location }} />;
  }
  // If user does not have required role, show 404
  if (roles.length && !roles.some(r => hasRole(r))) {
    return <Navigate to={paths.error404} replace state={{ from: location }} />;
  }
  return children;
};

export default RequireRole;