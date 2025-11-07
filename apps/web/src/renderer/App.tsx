import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import LoginPage from './pages/Login';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { StudentsPage } from './pages/StudentsPage';
import { ClassesPage } from './pages/ClassesPage';
import { ReportsPage } from './pages/ReportsPage';
import RecoveryPage from './pages/Recovery';
import RecoveryNumberPage from './pages/RecoveryNumber';
import ResetPasswordPage from './pages/ResetPassword';
import { DashboardPage } from './pages/DashboardPage';
import { ToastContainer } from './components/ToastContainer';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './global.css';

// Componente para proteger rotas que precisam de autenticação
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('auth_token');

  console.log('[ProtectedRoute] Verificando autenticação:', {
    isAuthenticated,
    hasToken: !!localStorage.getItem('auth_token'),
    token: localStorage.getItem('auth_token')?.substring(0, 20) + '...',
  });

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] ❌ Usuário não autenticado, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] ✅ Usuário autenticado, renderizando conteúdo protegido');
  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recuperar-senha" element={<RecoveryPage />} />
            <Route path="/senha-numero" element={<RecoveryNumberPage />} />
            <Route path="/nova-senha" element={<ResetPasswordPage />} />

            {/* Rotas protegidas do dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/students"
              element={
                <ProtectedRoute>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/classes"
              element={
                <ProtectedRoute>
                  <ClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
