import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
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
import { AttendancePage } from './pages/AttendancePage';
import { DailyAttendancePage } from './pages/DailyAttendancePage';
import { PrivateRoute } from './components/PrivateRoute';

import './global.css';

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

            {/* Rotas protegidas do dashboard - todos os usuários autenticados */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            {/* Usuários - apenas Admin */}
            <Route
              path="/dashboard/users"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <UsersPage />
                </PrivateRoute>
              }
            />

            {/* Alunos - Admin e Recepcionista (professor NÃO pode) */}
            <Route
              path="/dashboard/students"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COMUM']}>
                  <StudentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/students/list"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COMUM']}>
                  <StudentsListPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/students/register"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COMUM']}>
                  <StudentsRegisterPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/students/:id"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COMUM']}>
                  <StudentDetailsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/students/:id/edit"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COMUM']}>
                  <EditStudentPage />
                </PrivateRoute>
              }
            />

            {/* Turmas - Admin e Recepcionista */}
            <Route
              path="/dashboard/classes"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COMUM']}>
                  <ClassesPage />
                </PrivateRoute>
              }
            />

            {/* Professores - Admin e Recepcionista */}
            <Route
              path="/dashboard/teachers"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COMUM']}>
                  <TeachersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/teachers/register"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COMUM']}>
                  <TeachersRegisterPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/teachers/:id/edit"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COMUM']}>
                  <EditTeacherPage />
                </PrivateRoute>
              }
            />

            {/* Frequência - todos podem acessar */}
            <Route
              path="/dashboard/attendance"
              element={
                <PrivateRoute>
                  <AttendancePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/attendance/:classId"
              element={
                <PrivateRoute>
                  <DailyAttendancePage />
                </PrivateRoute>
              }
            />

            {/* Finanças - apenas Admin */}
            <Route
              path="/dashboard/finances"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <FinancesPage />
                </PrivateRoute>
              }
            />

            {/* Configurações - Admin e Recepcionista */}
            <Route
              path="/dashboard/settings"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COMUM']}>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
