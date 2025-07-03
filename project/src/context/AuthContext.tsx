/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer } from 'react';
import type { AuthState, User, DataUserDto, UserRole } from '../types';
import { loginApi, registerApi, addRoleApi } from '../APIS/AuthApis';
import { mapRoleToUserRole } from '../utils/roleMapper';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  register: (user: Partial<User>) => Promise<void>;
  addRole: (username: string, password: string, role: string) => Promise<void>;
  registerWithRoleAndLogin: (data: {
    name: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
};


type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const data: DataUserDto = await loginApi(username, password);

      if (!data.isAuthenticated) {
        dispatch({ type: 'LOGIN_FAILURE' });
        throw new Error(data.message || 'Authentication failed');
      }
    
        
      const user: User = {
        id: data.id,
        name: data.name,
        lastName: data.lastName,
        username: data.userName,
        email: data.email,
        password: '',
        isActive: data.isActive ?? true,
        createdAt: data.createdAt ?? '',
        updatedAt: data.updatedAt ?? '',
        rol: data.rols && data.rols.length > 0
          ? mapRoleToUserRole(data.rols[0])
          : (() => { throw new Error('No roles found for user') })(),
          
      };

            

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user)); // ✅ Agrega esto
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: data.token } });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };


  

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // ✅ Limpia también el user
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const register = async (user: Partial<User>) => {
    await registerApi({
      name: user.name ?? '',
      lastName: user.lastName ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      password: user.password ?? '',
    });
  };

  const addRole = async (username: string, password: string, role: string) => {
    await addRoleApi({ username, password, role });
  };

  const registerWithRoleAndLogin = async (data: {
    name: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    await register({
      name: data.name,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      password: data.password,
    });
    await addRole(data.username, data.password, data.role);
    await login(data.username, data.password);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
        register,
        addRole,
        registerWithRoleAndLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}