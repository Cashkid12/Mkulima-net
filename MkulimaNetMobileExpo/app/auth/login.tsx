import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // Check if user has completed profile setup
        const currentUser = await signIn.createdSession.getUser();
        const hasUsername = !!currentUser.username;
        const hasCompletedProfile = currentUser.publicMetadata.completedProfile;
        
        if (!hasUsername || !hasCompletedProfile) {
          // Redirect to username setup if not completed
          router.replace('/auth/username');
        } else {
          // Otherwise go to feed
          router.replace('/(tabs)/feed');
        }
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isLoaded) return;
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/auth/username',
      });
    } catch (error: any) {
      Alert.alert('Error', 'Google sign in failed');
    }
  };

  const handleAppleLogin = async () => {
    if (!isLoaded) return;
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_apple',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/auth/username',
      });
    } catch (error: any) {
      Alert.alert('Error', 'Apple sign in failed');
    }
  };

  const handlePhoneLogin = () => {
    setShowPhoneLogin(true);
  };

  const handleBackToEmail = () => {
    setShowPhoneLogin(false);
  };

  if (showPhoneLogin) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="agriculture" size={40} color="#2E7D32" />
            </View>
            <Text style={styles.title}>Login with Phone</Text>
          </View>

          {/* Social Buttons */}
          <View style={styles.socialSection}>
            <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleLogin}>
              <View style={styles.socialIconContainer}>
                <Ionicons name="logo-google" size={24} color="white" />
              </View>
              <Text style={styles.socialButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
                                 
            <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={handleAppleLogin}>
              <View style={styles.socialIconContainer}>
                <Ionicons name="logo-apple" size={24} color="white" />
              </View>
              <Text style={styles.appleButtonText}>Sign in with Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Phone Input */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>📞 Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+254 _______"
                placeholderTextColor="#757575"
                keyboardType="phone-pad"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => Alert.alert('Info', 'Phone OTP functionality will be implemented')}
            >
              <Text style={styles.buttonText}>Send OTP Code</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.textButton}
              onPress={handleBackToEmail}
            >
              <Text style={styles.linkText}>← Back to Email Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="agriculture" size={40} color="#2E7D32" />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Social Buttons */}
        <View style={styles.socialSection}>
          <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleLogin}>
            <View style={styles.socialIconContainer}>
              <Ionicons name="logo-google" size={24} color="white" />
            </View>
            <Text style={styles.socialButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={handleAppleLogin}>
            <View style={styles.socialIconContainer}>
              <Ionicons name="logo-apple" size={24} color="white" />
            </View>
            <Text style={styles.appleButtonText}>Sign in with Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email/Password Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📧 Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#757575"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>🔒 Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#757575"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.textButton}
            onPress={handlePhoneLogin}
          >
            <Text style={styles.linkText}>📱 Use Phone OTP Instead</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
  socialSection: {
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 30,
    marginBottom: 12,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  socialIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  socialIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 14,
    color: '#757575',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textButton: {
    alignItems: 'center',
    padding: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#757575',
  },
});