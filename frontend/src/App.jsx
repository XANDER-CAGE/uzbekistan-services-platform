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

// Executors pages (заготовки для будущего)
// import ExecutorsPage from './pages/executors/ExecutorsPage';
// import ExecutorDetailPage from './pages/executors/ExecutorDetailPage';

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

// Role-based route protection
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
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

        {/* Protected order routes */}
        <Route 
          path="/orders/create" 
          element={
            <RoleProtectedRoute allowedRoles={['customer', 'both']}>
              <CreateOrderPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id/apply" 
          element={
            <RoleProtectedRoute allowedRoles={['executor', 'both']}>
              <ApplyOrderPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="/my-orders" 
          element={
            <ProtectedRoute>
              <MyOrdersPage />
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
        <Route 
          path="/executors/:id" 
          element={
            <Layout>
              <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Профиль исполнителя</h1>
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
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Help and info pages */}
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

        {/* Admin routes (заготовка) */}
        <Route 
          path="/admin/*" 
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <div className="max-w-6xl mx-auto px-4 py-8">
                  <h1 className="text-2xl font-bold">Админ панель</h1>
                  <p className="text-gray-600 mt-2">Страница в разработке</p>
                </div>
              </Layout>
            </RoleProtectedRoute>
          } 
        />

        {/* Additional pages */}
        <Route 
          path="/become-executor" 
          element={
            <Layout>
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Стать исполнителем</h1>
                <div className="mt-6 bg-white rounded-lg p-6 shadow-sm border">
                  <p className="text-gray-600 mb-4">
                    Присоединяйтесь к нашей платформе как исполнитель и начните зарабатывать, предоставляя свои услуги.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Свободный график</h3>
                        <p className="text-gray-600 text-sm">Работайте когда удобно</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Стабильные заказы</h3>
                        <p className="text-gray-600 text-sm">Постоянный поток клиентов</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Безопасные платежи</h3>
                        <p className="text-gray-600 text-sm">Гарантированная оплата</p>
                      </div>
                    </div>
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

        <Route 
          path="/contacts" 
          element={
            <Layout>
              <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Контакты</h1>
                <div className="mt-6 bg-white rounded-lg p-6 shadow-sm border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Служба поддержки</h3>
                      <p className="text-gray-600">support@uslugiuz.com</p>
                      <p className="text-gray-600">+998 (71) 123-45-67</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Офис</h3>
                      <p className="text-gray-600">г. Ташкент, Юнусабадский район</p>
                      <p className="text-gray-600">ул. Амира Темура, 15</p>
                    </div>
                  </div>
                </div>
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
                <div className="mt-6 prose max-w-none">
                  <p className="text-gray-600">
                    Настоящее пользовательское соглашение регулирует отношения между пользователями платформы УслугиУз...
                  </p>
                </div>
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
                <div className="mt-6 prose max-w-none">
                  <p className="text-gray-600">
                    Настоящая политика конфиденциальности определяет, какая информация собирается на нашем сайте...
                  </p>
                </div>
              </div>
            </Layout>
          } 
        />

        {/* Messages/Chat routes (заготовка) */}
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
        <Route 
          path="/orders/:orderId/messages" 
          element={
            <ProtectedRoute>
              <Layout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                  <h1 className="text-2xl font-bold">Чат по заказу</h1>
                  <p className="text-gray-600 mt-2">Общение с исполнителем/заказчиком (в разработке)</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Notifications route (заготовка) */}
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Layout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                  <h1 className="text-2xl font-bold">Уведомления</h1>
                  <p className="text-gray-600 mt-2">Ваши уведомления (в разработке)</p>
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