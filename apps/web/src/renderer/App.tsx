import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import LoginPage from './pages/Login';
import './global.css';
import RecoveryPage from './pages/Recovery';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} /> {/* Rota para a página de login */}
        <Route path="/recuperar-senha" element={<RecoveryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
