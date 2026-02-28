import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SSOCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    // This is just a callback endpoint for OAuth redirects
    // Clerk handles the OAuth flow automatically
    // We redirect to the username setup after a brief moment
    const timer = setTimeout(() => {
      router.replace('/auth/username');
    }, 1000);
  
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2E7D32" />
      <Text style={styles.loadingText}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
});