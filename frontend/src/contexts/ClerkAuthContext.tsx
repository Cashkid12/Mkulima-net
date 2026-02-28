'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  userId: string | null;
  user: any;
  isLoading: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useClerkAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useClerkAuth must be used within an AuthProvider');
  }
  return context;
}

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded, getToken, signOut } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded]);

  const value = {
    userId,
    user,
    isLoading,
    getToken,
    signOut: async () => {
      await signOut();
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}