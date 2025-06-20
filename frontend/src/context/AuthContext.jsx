import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
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
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: parsedUser, access_token: token }
        });
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (credentials) => {
    // Если передан готовый объект с user и access_token (для обновления)
    if (credentials.user && credentials.access_token) {
      localStorage.setItem('access_token', credentials.access_token);
      localStorage.setItem('user', JSON.stringify(credentials.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: credentials
      });
      
      return credentials;
    }
  
    // Обычный логин
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ошибка входа';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      throw error;
    }
  };
  
  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.register(userData);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ошибка регистрации';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout
  };

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