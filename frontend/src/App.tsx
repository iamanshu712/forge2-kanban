import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardsPage from './pages/BoardsPage';
import BoardDetailPage from './pages/BoardDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/boards" replace />} />
            <Route path="boards" element={<BoardsPage />} />
            <Route path="boards/:boardId" element={<BoardDetailPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/boards" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
