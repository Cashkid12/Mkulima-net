import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function Index() {
  const { isSignedIn } = useAuth();
  
  // If user is signed in, go to feed
  // Otherwise, show welcome/onboarding screen
  if (isSignedIn) {
    return <Redirect href="/(tabs)/feed" />;
  }
  
  return <Redirect href="/welcome" />;
}