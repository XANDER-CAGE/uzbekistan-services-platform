import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';

// Orders pages
import OrdersPage from './pages/orders/OrdersPage';
import CreateOrderPage from './pages/orders/CreateOrderPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ApplyOrderPage from './pages/orders/ApplyOrderPage';
import MyOrdersPage from './pages/orders/MyOrdersPage';

import ExecutorsSearchPage from './pages/ExecutorsSearchPage';
import ExecutorProfilePage from './pages/ExecutorProfilePage';
import ExecutorServicesPage from './pages/ExecutorServicesPage';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
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

// Public Route component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// ИСПРАВЛЕННЫЙ Role-based route protection
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log('RoleProtectedRoute Debug:', {
    isAuthenticated,
    loading,
    user,
    userType: user?.userType,
    userRole: user?.role,
    allowedRoles
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    console.log('User object is null, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // ИСПРАВЛЕНИЕ: Проверяем роли правильно - добавляем поддержку администраторов
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(user.userType) || 
                     user.userType === 'both' ||
                     user.userType === 'admin' ||
                     user.role === 'admin' ||
                     user.role === 'super_admin';

    console.log('Role check:', {
      userType: user.userType,
      userRole: user.role,
      allowedRoles,
      hasAccess
    });
    
    if (!hasAccess) {
      console.log('Access denied, redirecting to home');
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        
        {/* Auth routes */}
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

        {/* Categories routes */}
        <Route 
          path="/categories" 
          element={
            <Layout>
              <CategoriesPage />
            </Layout>
          } 
        />
        <Route 
          path="/categories/:categoryId" 
          element={
            <Layout>
              <CategoryDetailPage />
            </Layout>
          } 
        />

        {/* Orders routes */}
        <Route 
          path="/orders" 
          element={
            <Layout>
              <OrdersPage />
            </Layout>
          } 
        />
        <Route 
          path="/orders/:id" 
          element={
            <Layout>
              <OrderDetailPage />
            </Layout>
          } 
        />

        {/* ИСПРАВЛЕННЫЕ Protected order routes */}
        <Route 
          path="/orders/create" 
          element={
            <RoleProtectedRoute allowedRoles={['customer', 'both']}>
              <Layout>
                <CreateOrderPage />
              </Layout>
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id/apply" 
          element={
            <RoleProtectedRoute allowedRoles={['executor', 'both']}>
              <Layout>
                <ApplyOrderPage />
              </Layout>
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="/my-orders" 
          element={
            <ProtectedRoute>
              <Layout>
                <MyOrdersPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Executors routes */}
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

        {/* User profile routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Static pages */}
        <Route 
          path="/how-it-works" 
          element={
            <Layout>
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Как это работает</h1>
                <div className="mt-6 space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4">Для заказчиков</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Создайте аккаунт и опишите вашу задачу</li>
                      <li>Получите отклики от исполнителей</li>
                      <li>Выберите подходящего специалиста</li>
                      <li>Контролируйте выполнение работы</li>
                      <li>Оплачивайте после завершения</li>
                    </ol>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4">Для исполнителей</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Зарегистрируйтесь как исполнитель</li>
                      <li>Найдите подходящие заказы</li>
                      <li>Оставьте заявку с вашим предложением</li>
                      <li>Выполните работу качественно и в срок</li>
                      <li>Получите оплату и отзыв</li>
                    </ol>
                  </div>
                </div>
              </div>
            </Layout>
          } 
        />

        {/* Help pages */}
        <Route 
          path="/help" 
          element={
            <Layout>
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Помощь</h1>
                <p className="text-gray-600 mt-2">Часто задаваемые вопросы и поддержка</p>
              </div>
            </Layout>
          } 
        />

        {/* Messages/Chat routes */}
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Layout>
                <div className="max-w-6xl mx-auto px-4 py-8">
                  <h1 className="text-2xl font-bold">Сообщения</h1>
                  <p className="text-gray-600 mt-2">Чат с заказчиками и исполнителями (в разработке)</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* 404 Page */}
        <Route 
          path="*" 
          element={
            <Layout>
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="mb-8">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Страница не найдена
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Возможно, страница была удалена или вы ввели неверный адрес
                  </p>
                </div>
                
                <div className="space-x-4">
                  <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ← Назад
                  </button>
                  <a 
                    href="/" 
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    На главную
                  </a>
                </div>
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