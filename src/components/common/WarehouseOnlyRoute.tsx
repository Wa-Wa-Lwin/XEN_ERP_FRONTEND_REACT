import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { isWarehouseOnlyUser } from '@config/userRoles';

interface WarehouseOnlyRouteProps {
  children: React.ReactNode;
}

const WarehouseOnlyRoute: React.FC<WarehouseOnlyRouteProps> = ({ children }) => {
  const { msLoginUser } = useAuth();
  const location = useLocation();

  // Check if the current user is a warehouse-only user
  const isWarehouseOnly = isWarehouseOnlyUser(msLoginUser?.email);

  // If warehouse-only user tries to access non-warehouse routes, redirect to warehouse
  if (isWarehouseOnly && !location.pathname.includes('/warehouse')) {
    return <Navigate to="/warehouse" replace />;
  }

  return <>{children}</>;
};

export default WarehouseOnlyRoute;
