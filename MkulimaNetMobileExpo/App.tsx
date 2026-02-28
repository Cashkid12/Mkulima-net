import 'react-native-gesture-handler';
import React from 'react';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
// import { ClerkAuthProvider } from './contexts/ClerkAuthContext';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return <Slot />;
}