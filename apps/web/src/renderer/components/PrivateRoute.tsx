import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type AllowedRole = 'ADMIN' | 'COMUM' | 'PROFESSOR';

type PrivateRouteProps = {
  children: React.ReactNode;
  allowedRoles?: AllowedRole[];
};

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se allowedRoles foi especificado, verifica se o usuário tem permissão
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Redireciona para o dashboard se não tiver permissão
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
