import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  onLogin: (token: string, user: any) => void;
  onLogout: () => void;
  onRegister: (token: string, user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });
  
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on app start
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');
        
        if (token) {
          setAuthState({
            token,
            user: user ? JSON.parse(user) : null,
            isLoading: false,
          });
        } else {
          setAuthState({
            token: null,
            user: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error loading token:', error);
        setAuthState({
          token: null,
          user: null,
          isLoading: false,
        });
      }
    };

    loadToken();
  }, []);

  const onLogin = async (token: string, user: any) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    setAuthState({
      token,
      user,
      isLoading: false,
    });
    
    router.push('/feed');
  };

  const onRegister = async (token: string, user: any) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    setAuthState({
      token,
      user,
      isLoading: false,
    });
    
    router.push('/feed');
  };

  const onLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    
    setAuthState({
      token: null,
      user: null,
      isLoading: false,
    });
    
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        onLogin,
        onLogout,
        onRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}