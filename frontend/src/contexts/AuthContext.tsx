import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: any) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from token on initial load
  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await loadUser();
      } else {
        setIsLoading(false);
      }
    };

    loadUserFromToken();
  }, []);

  // Login function
  const login = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(data);
      console.log('Login response:', response);
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const loadUser = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.getMe();
      
      if (response.status === 'success' && response.data) {
        setUser(response.data);
      } else {
        throw new Error(response.error || 'Failed to load user');
      }
    } catch (err: any) {
      // If token is invalid, clear it
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
      }
      setError(err.message || 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
