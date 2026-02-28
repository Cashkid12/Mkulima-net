import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/clerk-expo';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

console.log('CLERK_PUBLISHABLE_KEY in _layout:', CLERK_PUBLISHABLE_KEY);

export default function RootLayout() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="welcome" options={{ title: 'Welcome' }} />
        </Stack>
      </SafeAreaProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
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
          <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
          <Stack.Screen name="auth/signup" options={{ title: 'Sign Up' }} />
          <Stack.Screen name="auth/verify-email" options={{ title: 'Verify Email' }} />
          <Stack.Screen name="auth/forgot-password" options={{ title: 'Forgot Password' }} />
          <Stack.Screen name="auth/username" options={{ title: 'Choose Username' }} />
          <Stack.Screen name="auth/profile-setup" options={{ title: 'Profile Setup' }} />
          <Stack.Screen name="auth/agricultural-profile" options={{ title: 'Agricultural Profile' }} />
          <Stack.Screen name="change-username" options={{ title: 'Change Username' }} />
          <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
          <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
          <Stack.Screen name="privacy-settings" options={{ title: 'Privacy Settings' }} />
          <Stack.Screen name="notification-sounds" options={{ title: 'Notification Sounds' }} />
          <Stack.Screen name="blocked-users" options={{ title: 'Blocked Users' }} />
          <Stack.Screen name="visibility-settings" options={{ title: 'Visibility Settings' }} />
          <Stack.Screen name="language-settings" options={{ title: 'Language' }} />
          <Stack.Screen name="help-support" options={{ title: 'Help & Support' }} />
          <Stack.Screen name="about" options={{ title: 'About MkulimaNet' }} />
          <Stack.Screen name="sso-callback" options={{ title: 'Loading...', presentation: 'modal', headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ClerkProvider>
  );
}