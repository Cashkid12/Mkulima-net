import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { authState } = useAuth();

  // Show loading indicator while checking authentication state
  if (authState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* If not authenticated, show auth screens */}
        {!authState.token ? (
          <>
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="complete-profile" options={{ headerShown: true, title: 'Complete Profile' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="complete-profile" options={{ headerShown: true, title: 'Complete Profile' }} />
            <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
            <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
            <Stack.Screen name="dashboard" options={{ headerShown: true, title: 'Dashboard' }} />
            <Stack.Screen name="create-post" options={{ headerShown: true, title: 'Create Post' }} />
            <Stack.Screen name="create-marketplace-listing" options={{ headerShown: true, title: 'Create Listing' }} />
            <Stack.Screen name="post-job" options={{ headerShown: true, title: 'Post Job' }} />
            <Stack.Screen name="job-details" options={{ headerShown: true, title: 'Job Details' }} />
            <Stack.Screen name="employer-profile" options={{ headerShown: true, title: 'Employer Profile' }} />
            <Stack.Screen name="job-application" options={{ headerShown: true, title: 'Apply for Job' }} />
            <Stack.Screen name="my-jobs" options={{ headerShown: true, title: 'My Jobs' }} />
            <Stack.Screen name="job-applications" options={{ headerShown: true, title: 'Job Applications' }} />
          </>
        )}
      </Stack>
    </ThemeProvider>
  );
}
