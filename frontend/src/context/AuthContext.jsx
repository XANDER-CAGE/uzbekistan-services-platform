import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      console.log('LOGIN_SUCCESS payload:', action.payload);
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: action.payload.user,
        token: action.payload.access_token 
      };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        token: null 
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true, // Изначально true, пока не проверим localStorage
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      
      console.log('Token from localStorage:', token ? 'exists' : 'null');
      console.log('User from localStorage:', userStr ? 'exists' : 'null');
      
      if (token && userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          console.log('Parsed user from localStorage:', parsedUser);
          
          // Проверяем токен на валидность
          try {
            const currentUser = await authService.getCurrentUser();
            console.log('Current user from API:', currentUser);
            
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user: currentUser, access_token: token }
            });
          } catch (error) {
            console.log('Token validation failed:', error);
            // Токен невалиден, очищаем localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } catch (error) {
          console.log('Error parsing user from localStorage:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        console.log('No token or user in localStorage');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    // Если передан готовый объект с user и access_token (для обновления)
    if (credentials.user && credentials.access_token) {
      console.log('Login with ready credentials:', credentials);
      
      localStorage.setItem('access_token', credentials.access_token);
      localStorage.setItem('user', JSON.stringify(credentials.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: credentials
      });
      
      return credentials;
    }
  
    // Обычный логин
    console.log('Starting login with credentials:', { login: credentials.login });
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });
      
      return response;
    } catch (error) {
      console.log('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка входа';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      throw error;
    }
  };
  
  const register = async (userData) => {
    console.log('Starting registration with data:', userData);
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.register(userData);
      console.log('Registration response:', response);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });
      
      return response;
    } catch (error) {
      console.log('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка регистрации';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      throw error;
    }
  };

  const logout = async () => {
    console.log('Starting logout...');
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      console.log('Logout completed');
    }
  };

  const updateUser = (userData) => {
    console.log('Updating user data:', userData);
    
    localStorage.setItem('user', JSON.stringify(userData));
    dispatch({ type: 'SET_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser
  };

  console.log('AuthContext state:', {
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    userType: state.user?.userType,
    userId: state.user?.id
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};