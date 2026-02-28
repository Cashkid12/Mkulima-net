import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: email input, 2: check email, 3: reset password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signIn } = useSignIn();
  const router = useRouter();

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      // In a real implementation, you'd use Clerk's reset password flow
      // For now, we'll simulate the flow
      setStep(2);
      Alert.alert('Success', `Reset link sent to ${email}`);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send reset link');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      // In a real implementation, you'd use Clerk's reset password flow
      // For now, we'll simulate the flow
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'OK', onPress: () => router.push('/auth/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to reset password');
    }
  };

  if (step === 2) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.checkIconContainer}>
              <MaterialIcons name="check-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>We've sent a reset link to</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          {/* Resend Option */}
          <TouchableOpacity 
            style={styles.textButton}
            onPress={handleSendResetLink}
          >
            <Text style={styles.resendText}>Didn't receive? <Text style={styles.resendLink}>Resend</Text></Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.secondaryButtonText}>← Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (step === 3) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="lock" size={40} color="#2E7D32" />
            </View>
            <Text style={styles.title}>Create New Password</Text>
          </View>

          {/* Password Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🔒 New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#757575"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🔒 Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#757575"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleResetPassword}
            >
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.textButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.linkText}>← Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Step 1: Email Input
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="lock" size={40} color="#2E7D32" />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to reset</Text>
        </View>

        {/* Email Form */}
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

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleSendResetLink}
          >
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.textButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.linkText}>← Back to Sign In</Text>
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
    marginTop: 80,
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
  checkIconContainer: {
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
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    color: '#222222',
    fontWeight: '600',
    marginTop: 8,
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
  secondaryButton: {
    alignItems: 'center',
    padding: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  textButton: {
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#757575',
  },
  resendLink: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  linkText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
});