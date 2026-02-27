import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scaleValue = new Animated.Value(1);

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

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigation would happen here
    }, 2000);
  };

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1.0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    secureTextEntry = false,
    icon,
    keyboardType = 'default',
    placeholder,
    error
  }: any) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.primaryText }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.lightGray }]}>
        {icon && (
          <MaterialIcons 
            name={icon} 
            size={20} 
            color={colors.secondaryGreen} 
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[styles.input, { color: colors.primaryText }]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.metadataText}
          autoCapitalize="none"
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons 
              name={showPassword ? "visibility" : "visibility-off"} 
              size={20} 
              color={showPassword ? colors.primaryGreen : colors.metadataText} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.white }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity>
              <MaterialIcons name="arrow-back" size={24} color={colors.metadataText} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.helpText, { color: colors.primaryGreen }]}>Help</Text>
            </TouchableOpacity>
          </View>

          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: colors.lightGreen }]}>
              <MaterialIcons name="agriculture" size={40} color={colors.primaryGreen} />
            </View>
            <Text style={[styles.welcomeTitle, { color: colors.primaryText }]}>Welcome Back</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.secondaryText }]}>
              Login to continue growing
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <InputField
              label="Email or Phone Number"
              value={email}
              onChangeText={setEmail}
              icon="email"
              keyboardType="email-address"
              placeholder="Enter your email or phone"
            />
            
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock"
              placeholder="Enter your password"
            />

            {/* Remember Me & Forgot Password */}
            <View style={styles.rememberForgotRow}>
              <View style={styles.rememberContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, rememberMe && { backgroundColor: colors.primaryGreen }]}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && <MaterialIcons name="check" size={16} color={colors.white} />}
                </TouchableOpacity>
                <Text style={[styles.rememberText, { color: colors.primaryText }]}>Remember me</Text>
              </View>
              <TouchableOpacity>
                <Text style={[styles.forgotText, { color: colors.primaryGreen }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: colors.primaryGreen }]}
                onPress={handleLogin}
                onPressIn={handleButtonPress}
                disabled={isLoading}
              >
                {isLoading ? (
                  <MaterialIcons name="hourglass-empty" size={24} color={colors.white} />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* OR Divider */}
            <View style={styles.orContainer}>
              <View style={[styles.orLine, { backgroundColor: colors.borderColor }]} />
              <Text style={[styles.orText, { color: colors.metadataText, backgroundColor: colors.white }]}>
                OR
              </Text>
              <View style={[styles.orLine, { backgroundColor: colors.borderColor }]} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={[styles.socialButton, { borderColor: colors.borderColor }]}>
                <MaterialIcons name="language" size={24} color={colors.metadataText} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { borderColor: colors.borderColor }]}>
                <MaterialIcons name="facebook" size={24} color={colors.metadataText} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { borderColor: colors.borderColor }]}>
                <MaterialIcons name="apple" size={24} color={colors.metadataText} />
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: colors.secondaryText }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity>
                <Text style={[styles.signupLink, { color: colors.primaryGreen }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});