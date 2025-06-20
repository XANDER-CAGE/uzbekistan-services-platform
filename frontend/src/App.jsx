import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
// Добавьте к другим импортам:
import ProfilePage from './pages/ProfilePage';
// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        
        {/* Auth routes (redirect if authenticated) */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />

        {/* Protected routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-orders" 
          element={
            <ProtectedRoute>
              <Layout>
                <div className="max-w-6xl mx-auto px-4 py-8">
                  <h1 className="text-2xl font-bold">Мои заказы</h1>
                  <p className="text-gray-600 mt-2">Страница в разработке</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/orders/create" 
          element={
            <ProtectedRoute>
              <Layout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                  <h1 className="text-2xl font-bold">Создать заказ</h1>
                  <p className="text-gray-600 mt-2">Страница в разработке</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Public pages */}
        <Route 
          path="/orders" 
          element={
            <Layout>
              <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Поиск заказов</h1>
                <p className="text-gray-600 mt-2">Страница в разработке</p>
              </div>
            </Layout>
          } 
        />

        <Route 
          path="/executors" 
          element={
            <Layout>
              <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Исполнители</h1>
                <p className="text-gray-600 mt-2">Страница в разработке</p>
              </div>
            </Layout>
          } 
        />

        <Route 
          path="/how-it-works" 
          element={
            <Layout>
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Как это работает</h1>
                <p className="text-gray-600 mt-2">Страница в разработке</p>
              </div>
            </Layout>
          } 
        />

        {/* Static pages */}
        <Route 
          path="/terms" 
          element={
            <Layout>
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Пользовательское соглашение</h1>
                <p className="text-gray-600 mt-2">Страница в разработке</p>
              </div>
            </Layout>
          } 
        />

        <Route 
          path="/privacy" 
          element={
            <Layout>
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Политика конфиденциальности</h1>
                <p className="text-gray-600 mt-2">Страница в разработке</p>
              </div>
            </Layout>
          } 
        />

        {/* 404 Page */}
        <Route 
          path="*" 
          element={
            <Layout>
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Страница не найдена</p>
                <a 
                  href="/" 
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Вернуться на главную
                </a>
              </div>
            </Layout>
          } 
        />
      </Routes>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#ECFDF5',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FEF2F2',
            },
          },
        }}
      />
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;