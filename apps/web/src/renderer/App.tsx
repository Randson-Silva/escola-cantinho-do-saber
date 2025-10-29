import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import LoginPage from './pages/Login';
import RecoveryPage from './pages/Recovery';
import RecoveryNumberPage from './pages/RecoveryNumber';
import ResetPasswordPage from './pages/ResetPassword';
import { ToastContainer } from './components/ToastContainer';
import { AuthProvider } from './context/AuthContext';
import './global.css';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-senha" element={<RecoveryPage />} />
          <Route path="/senha-numero" element={<RecoveryNumberPage />} />
          <Route path="/nova-senha" element={<ResetPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
