import 'react-native-gesture-handler';
import React from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { ClerkAuthProvider } from './contexts/ClerkAuthContext';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  if (!CLERK_PUBLISHABLE_KEY) {
    return null; // or show an error message
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ClerkAuthProvider>
        <Slot />
      </ClerkAuthProvider>
    </ClerkProvider>
  );
}