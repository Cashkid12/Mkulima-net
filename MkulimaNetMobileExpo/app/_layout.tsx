import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
          <Stack.Screen name="marketplace" options={{ title: 'Marketplace' }} />
          <Stack.Screen name="product-detail" options={{ title: 'Product Detail' }} />
          <Stack.Screen name="create-marketplace-listing" options={{ title: 'Create Listing' }} />
          <Stack.Screen name="security" options={{ title: 'Security' }} />
          <Stack.Screen name="verification" options={{ title: 'Verification' }} />
          <Stack.Screen name="bulk-buyer" options={{ title: 'Bulk Buyer' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="create-post" options={{ title: 'Create Post' }} />
          <Stack.Screen name="post-job" options={{ title: 'Post Job' }} />
          <Stack.Screen name="job-details" options={{ title: 'Job Details' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="login" options={{ title: 'Login' }} />
          <Stack.Screen name="register" options={{ title: 'Register' }} />
          <Stack.Screen name="welcome" options={{ title: 'Welcome' }} />
          <Stack.Screen name="complete-profile" options={{ title: 'Complete Profile' }} />
          <Stack.Screen name="employer-profile" options={{ title: 'Employer Profile' }} />
          <Stack.Screen name="my-jobs" options={{ title: 'My Jobs' }} />
          <Stack.Screen name="job-application" options={{ title: 'Job Application' }} />
          <Stack.Screen name="job-applications" options={{ title: 'Job Applications' }} />
          <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
  );
}