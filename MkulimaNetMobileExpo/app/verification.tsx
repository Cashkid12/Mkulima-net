import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function VerificationScreen() {
  const [code, setCode] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Professional color palette
  const colors = {
    primaryGreen: '#2E7D32',
    secondaryGreen: '#4CAF50',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F7FA',
    primaryText: '#222222',
    secondaryText: '#757575',
    metadataText: '#BDBDBD',
    borderColor: '#E0E0E0',
    error: '#F44336',
    success: '#4CAF50',
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    if (canResend) {
      setTimer(30);
      setCanResend(false);
      // Reset code
      setCode(['', '', '', '']);
      // API call to resend would go here
    }
  };

  const handleCallMe = () => {
    // Handle phone call verification
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.white }]}>
      {/* Logo Area */}
      <View style={styles.logoContainer}>
        <View style={[styles.logo, { backgroundColor: colors.lightGreen }]}>
          <MaterialIcons name="agriculture" size={60} color={colors.primaryGreen} />
        </View>
        <Text style={[styles.title, { color: colors.primaryText }]}>Verify Your Phone</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Enter the 4-digit code sent to your phone
        </Text>
      </View>

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => inputRefs.current[index] = ref}
            style={[
              styles.otpInput,
              {
                backgroundColor: colors.lightGray,
                borderColor: digit ? colors.primaryGreen : colors.borderColor,
                color: colors.primaryText
              },
              digit && { backgroundColor: colors.lightGreen }
            ]}
            value={digit}
            onChangeText={text => handleCodeChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            fontSize={24}
            fontWeight="700"
          />
        ))}
      </View>

      {/* Timer and Resend */}
      <View style={styles.timerContainer}>
        {!canResend ? (
          <Text style={[styles.timerText, { color: colors.metadataText }]}>
            Resend code in 00:{timer.toString().padStart(2, '0')}
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={[styles.resendText, { color: colors.primaryGreen }]}>
              Resend Code
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Call Me Option */}
      <TouchableOpacity style={styles.callMeContainer} onPress={handleCallMe}>
        <MaterialIcons name="phone" size={20} color={colors.primaryGreen} />
        <Text style={[styles.callMeText, { color: colors.primaryGreen }]}>
          Request phone call instead
        </Text>
      </TouchableOpacity>

      {/* Verify Button */}
      <TouchableOpacity
        style={[
          styles.verifyButton,
          { 
            backgroundColor: isCodeComplete ? colors.primaryGreen : colors.lightGray,
            shadowColor: isCodeComplete ? colors.primaryGreen : 'transparent'
          }
        ]}
        disabled={!isCodeComplete}
      >
        <Text 
          style={[
            styles.verifyButtonText,
            { color: isCodeComplete ? colors.white : colors.metadataText }
          ]}
        >
          Verify Code
        </Text>
      </TouchableOpacity>

      {/* Help Text */}
      <View style={styles.helpContainer}>
        <Text style={[styles.helpText, { color: colors.secondaryText }]}>
          Didn't receive a code? Check your spam folder or{' '}
        </Text>
        <TouchableOpacity>
          <Text style={[styles.helpLink, { color: colors.primaryGreen }]}>
            contact support
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 64,
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '700',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
  },
  callMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  callMeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  verifyButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  helpContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
  },
  helpLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});