'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  profilePicture?: string;
  coverPhoto?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  farmingCategory?: string[];
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    year: number;
    certificateUrl?: string;
  }>;
  services?: string[];
  farmSize?: string;
  crops?: string[];
  livestock?: string[];
  yearsOfExperience?: number;
  availabilityStatus?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {username: string, email: string, password: string, role?: string, firstName?: string, lastName?: string, location?: string, farmingCategory?: string[]}) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  useEffect(() => {
    // Set loading to false after initial render
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const getUser = () => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  const login = async (email: string, password: string) => {
    try {
      // This would be replaced with an actual API call
      // const response = await authService.login(email, password);
      // For now, we'll simulate the response
      const response = {
        token: 'fake-jwt-token',
        user: {
          _id: '1',
          username: 'johndoe',
          email,
          role: 'farmer',
          profilePicture: '',
          coverPhoto: '',
        }
      };

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: {username: string, email: string, password: string, role?: string, firstName?: string, lastName?: string, location?: string, farmingCategory?: string[]}) => {
    try {
      // This would be replaced with an actual API call
      // const response = await authService.register(userData);
      // For now, we'll simulate the response
      const response = {
        token: 'fake-jwt-token',
        user: {
          _id: '2',
          username: userData.username,
          email: userData.email,
          role: userData.role || 'farmer',
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicture: '',
          coverPhoto: '',
        }
      };

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
