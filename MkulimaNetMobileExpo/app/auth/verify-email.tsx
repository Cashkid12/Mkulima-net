import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function VerifyEmailScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const { signUp, setActive } = useSignUp();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-advance to next input if character is entered
    if (text && index < 5) {
      // Focus logic would go here in a real implementation
    }
  };

  const handleVerify = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (!signUp) {
      Alert.alert('Error', 'Sign up session not available');
      return;
    }

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: codeString,
      });

      if (result.status === 'complete') {
        if (setActive) {
          await setActive({ session: result.createdSessionId });
        }
        router.replace('/(tabs)/feed');
      } else {
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    if (!signUp) {
      Alert.alert('Error', 'Sign up session not available');
      return;
    }

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      setTimer(300);
      setCanResend(false);
      Alert.alert('Success', 'Verification code resent to your email');
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.message || 'Failed to resend code');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="email" size={40} color="#2E7D32" />
          </View>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>We've sent a 6-digit code to your email</Text>
        </View>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : styles.codeInputEmpty
              ]}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
            />
          ))}
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <MaterialIcons name="timer" size={16} color="#757575" />
          <Text style={styles.timerText}>Code expires in {formatTime(timer)}</Text>
        </View>

        {/* Resend Option */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Didn't receive? <Text style={styles.resendLink}>Resend</Text></Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendText}>Didn't receive? <Text style={styles.resendTimer}>Resend in {formatTime(timer)}</Text></Text>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleVerify}
        >
          <Text style={styles.buttonText}>Verify & Login</Text>
        </TouchableOpacity>

        {/* Back Option */}
        <TouchableOpacity 
          style={styles.textButton}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.linkText}>← Use different email</Text>
        </TouchableOpacity>
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 2,
  },
  codeInputEmpty: {
    backgroundColor: '#F5F7FA',
    borderColor: '#E0E0E0',
    color: '#222222',
  },
  codeInputFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2E7D32',
    color: '#222222',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: '#757575',
  },
  resendLink: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  resendTimer: {
    color: '#757575',
    fontWeight: '500',
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
});