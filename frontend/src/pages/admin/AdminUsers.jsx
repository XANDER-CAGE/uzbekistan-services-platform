import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  CogIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    userType: '',
    isVerified: '',
    isBlocked: '',
    page: 1,
    limit: 20
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Загрузка пользователей
  const { 
    data: usersData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminService.getUsers(filters),
    keepPreviousData: true,
  });

  // Мутации для управления пользователями
  const verifyUserMutation = useMutation({
    mutationFn: adminService.verifyUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('Пользователь верифицирован');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка верификации');
    }
  });

  const blockUserMutation = useMutation({
    mutationFn: ({ userId, reason }) => adminService.blockUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('Пользователь заблокирован');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка блокировки');
    }
  });

  const unblockUserMutation = useMutation({
    mutationFn: adminService.unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('Пользователь разблокирован');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка разблокировки');
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleVerifyUser = async (userId) => {
    if (window.confirm('Вы уверены, что хотите верифицировать этого пользователя?')) {
      verifyUserMutation.mutate(userId);
    }
  };

  const handleBlockUser = async (userId) => {
    const reason = window.prompt('Укажите причину блокировки:');
    if (reason !== null) {
      blockUserMutation.mutate({ userId, reason });
    }
  };

  const handleUnblockUser = async (userId) => {
    if (window.confirm('Вы уверены, что хотите разблокировать этого пользователя?')) {
      unblockUserMutation.mutate(userId);
    }
  };

  const getUserTypeLabel = (userType) => {
    const labels = {
      customer: 'Заказчик',
      executor: 'Исполнитель',
      both: 'Оба'
    };
    return labels[userType] || userType;
  };

  const getUserTypeBadge = (userType) => {
    const classes = {
      customer: 'bg-blue-100 text-blue-800',
      executor: 'bg-green-100 text-green-800',
      both: 'bg-purple-100 text-purple-800'
    };
    return classes[userType] || 'bg-gray-100 text-gray-800';
  };

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircleIcon className="w-3 h-3 text-white" />
              </div>
            )}
            
            {user.isBlocked && (
              <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                <XCircleIcon className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserTypeBadge(user.userType)}`}>
                {getUserTypeLabel(user.userType)}
              </span>
            </div>
            
            <div className="space-y-1 mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4 mr-2" />
                {user.phone}
              </div>
              
              {user.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  {user.email}
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
            
            {user.executorProfile && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-gray-600">Исполнитель</span>
                  </div>
                  
                  {user.executorProfile.rating > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 font-medium">{user.executorProfile.rating.toFixed(1)}</span>
                    </div>
                  )}
                  
                  <div className="text-gray-600">
                    Заказов: {user.executorProfile.completedOrders || 0}
                  </div>
                  
                  {user.executorProfile.isIdentityVerified && (
                    <div className="flex items-center text-green-600">
                      <ShieldCheckIcon className="w-4 h-4 mr-1" />
                      <span className="text-sm">Верифицирован</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Просмотреть детали"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          
          {!user.isVerified && (
            <button
              onClick={() => handleVerifyUser(user.id)}
              className="p-2 text-green-400 hover:text-green-600 transition-colors"
              title="Верифицировать"
              disabled={verifyUserMutation.isLoading}
            >
              <CheckCircleIcon className="w-5 h-5" />
            </button>
          )}
          
          {user.isBlocked ? (
            <button
              onClick={() => handleUnblockUser(user.id)}
              className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
              title="Разблокировать"
              disabled={unblockUserMutation.isLoading}
            >
              <CheckCircleIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => handleBlockUser(user.id)}
              className="p-2 text-red-400 hover:text-red-600 transition-colors"
              title="Заблокировать"
              disabled={blockUserMutation.isLoading}
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const UserModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Информация о пользователе
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Основная информация */}
            <div className="flex items-center space-x-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserCircleIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserTypeBadge(user.userType)}`}>
                    {getUserTypeLabel(user.userType)}
                  </span>
                  
                  {user.isVerified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Верифицирован
                    </span>
                  )}
                  
                  {user.isBlocked && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Заблокирован
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Контактная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">{user.phone}</span>
                </div>
              </div>
              
              {user.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата регистрации
                </label>
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Последнее обновление
                </label>
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">
                    {new Date(user.updatedAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Профиль исполнителя */}
            {user.executorProfile && (
              <div className="border-t pt-6">
                <h5 className="text-lg font-medium text-gray-900 mb-4">
                  Профиль исполнителя
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Рейтинг
                    </label>
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 font-medium">
                        {user.executorProfile.rating > 0 ? user.executorProfile.rating.toFixed(1) : 'Нет оценок'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Выполнено заказов
                    </label>
                    <span className="font-medium">{user.executorProfile.completedOrders || 0}</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Верификация личности
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.executorProfile.isIdentityVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.executorProfile.isIdentityVerified ? 'Верифицирован' : 'Не верифицирован'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Действия */}
            <div className="border-t pt-6">
              <div className="flex space-x-3">
                {!user.isVerified && (
                  <Button
                    onClick={() => {
                      handleVerifyUser(user.id);
                      onClose();
                    }}
                    disabled={verifyUserMutation.isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Верифицировать
                  </Button>
                )}
                
                {user.isBlocked ? (
                  <Button
                    onClick={() => {
                      handleUnblockUser(user.id);
                      onClose();
                    }}
                    disabled={unblockUserMutation.isLoading}
                    variant="outline"
                  >
                    Разблокировать
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleBlockUser(user.id);
                      onClose();
                    }}
                    disabled={blockUserMutation.isLoading}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Заблокировать
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Pagination = () => {
    if (!usersData) return null;

    const { page, totalPages } = usersData;
    const pages = [];
    
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Показано {Math.min(filters.limit, usersData.total)} из {usersData.total} пользователей
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          {pages.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                pageNum === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Ошибка загрузки пользователей
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error.response?.data?.message || 'Произошла ошибка при загрузке данных'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Управление пользователями</h1>
        <p className="text-gray-600">Просмотр и управление всеми пользователями платформы</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по имени, телефону..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <select
                value={filters.userType}
                onChange={(e) => handleFilterChange('userType', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Все типы</option>
                <option value="customer">Заказчики</option>
                <option value="executor">Исполнители</option>
                <option value="both">Оба</option>
              </select>
              
              <select
                value={filters.isVerified}
                onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Все статусы</option>
                <option value="true">Верифицированные</option>
                <option value="false">Не верифицированные</option>
              </select>
              
              <select
                value={filters.isBlocked}
                onChange={(e) => handleFilterChange('isBlocked', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Все пользователи</option>
                <option value="false">Активные</option>
                <option value="true">Заблокированные</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FunnelIcon className="w-4 h-4" />
                <span>
                  {usersData ? `Найдено: ${usersData.total} пользователей` : 'Загрузка...'}
                </span>
              </div>
              
              <Button type="submit" disabled={isLoading}>
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                Найти
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : usersData?.users?.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {usersData.users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
          
          <Pagination />
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Пользователи не найдены
            </h3>
            <p className="text-gray-600">
              Попробуйте изменить параметры поиска или очистить фильтры
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminUsers;