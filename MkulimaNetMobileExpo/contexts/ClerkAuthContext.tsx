import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: any;
  isSignedIn: boolean;
  isLoaded: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, role: string) => Promise<any>;
  signOut: () => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<any>;
  verifyOTP: (code: string) => Promise<any>;
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
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut: clerkSignOut } = useAuth();
  const { signIn: clerkSignIn, setActive } = useSignIn();
  const { signUp: clerkSignUp } = useSignUp();
  const router = useRouter();

  const [role, setRole] = useState<string>('');

  useEffect(() => {
    const loadRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem('userRole');
        if (savedRole) {
          setRole(savedRole);
        }
      } catch (error) {
        console.error('Error loading role:', error);
      }
    };
    loadRole();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const result = await clerkSignIn.create({
        identifier: email,
        password,
      });
      
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/(tabs)/feed');
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, error: error.errors?.[0]?.message || 'Sign in failed' };
    }
  };

  const handleSignUp = async (email: string, password: string, userRole: string) => {
    try {
      const result = await clerkSignUp.create({
        emailAddress: email,
        password,
      });

      // Save role to AsyncStorage
      await AsyncStorage.setItem('userRole', userRole);
      setRole(userRole);

      // Prepare user metadata
      await result.update({
        firstName: userRole,
      });

      // Send verification email
      await result.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      return { success: true, needsVerification: true };
    } catch (error: any) {
      return { success: false, error: error.errors?.[0]?.message || 'Sign up failed' };
    }
  };

  const handleSignOut = async () => {
    try {
      await clerkSignOut();
      await AsyncStorage.removeItem('userRole');
      setRole('');
      router.push('/welcome');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSendOTP = async (phoneNumber: string) => {
    try {
      // This would integrate with Clerk's phone verification
      // For now, simulating the flow
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleVerifyOTP = async (code: string) => {
    try {
      // This would verify the OTP with Clerk
      // For now, simulating successful verification
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: isSignedIn || false,
        isLoaded,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        sendOTP: handleSendOTP,
        verifyOTP: handleVerifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}