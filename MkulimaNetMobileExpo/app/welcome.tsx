import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Welcome to MkulimaNet</Text>
        <Text style={styles.subtitle}>
          Connecting farmers. Growing together.
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌾</Text>
            <Text style={styles.featureText}>Social Feed</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛒</Text>
            <Text style={styles.featureText}>Marketplace</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💼</Text>
            <Text style={styles.featureText}>Jobs & Internships</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.ctaButton} 
          onPress={() => router.push('/register')}
        >
          <Text style={styles.ctaButtonText}>Create Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#111111',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    paddingVertical: 12,
  },
  loginButtonText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});