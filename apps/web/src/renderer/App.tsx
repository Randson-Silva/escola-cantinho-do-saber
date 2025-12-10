import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import LoginPage from './pages/Login';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentsListPage } from './pages/StudentsListPage';
import { StudentsRegisterPage } from './pages/StudentsRegisterPage';
import StudentDetailsPage from './pages/StudentDetailsPage';
import EditStudentPage from './pages/EditStudentPage';
import { ClassesPage } from './pages/ClassesPage';
import { FinancesPage } from './pages/FinancesPage';
import RecoveryPage from './pages/Recovery';
import RecoveryNumberPage from './pages/RecoveryNumber';
import ResetPasswordPage from './pages/ResetPassword';
import { DashboardPage } from './pages/DashboardPage';
import { ToastContainer } from './components/ToastContainer';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { TeachersPage } from './pages/TeachersPage';
import { TeachersRegisterPage } from './pages/TeachersRegisterPage';
import EditTeacherPage from './pages/EditTeacherPage';

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
              path="/dashboard/students/list"
              element={
                <ProtectedRoute>
                  <StudentsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/students/register"
              element={
                <ProtectedRoute>
                  <StudentsRegisterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/students/:id"
              element={
                <ProtectedRoute>
                  <StudentDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/students/:id/edit"
              element={
                <ProtectedRoute>
                  <EditStudentPage />
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
              path="/dashboard/teachers"
              element={
                <ProtectedRoute>
                  <TeachersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teachers/register"
              element={
                <ProtectedRoute>
                  <TeachersRegisterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teachers/:id/edit"
              element={
                <ProtectedRoute>
                  <EditTeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/finances"
              element={
                <ProtectedRoute>
                  <FinancesPage />
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
