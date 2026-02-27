import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function SignupScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    location: '',
    interests: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
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
    warning: '#FF9800',
  };

  const roles = [
    { id: 'farmer', title: 'Farmer', description: 'Grow crops & raise livestock', icon: 'agriculture' },
    { id: 'buyer', title: 'Buyer', description: 'Purchase farm products', icon: 'shopping-cart' },
    { id: 'expert', title: 'Expert', description: 'Provide agricultural advice', icon: 'lightbulb' },
    { id: 'recruiter', title: 'Recruiter', description: 'Hire farm professionals', icon: 'work' },
  ];

  const interests = [
    'Crops', 'Livestock', 'Poultry', 'Dairy', 'Vegetables', 
    'Fruits', 'Grains', 'Tools', 'Seeds', 'Fertilizers'
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
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

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Password strength calculation
    if (field === 'password') {
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return colors.borderColor;
    if (passwordStrength <= 1) return colors.error;
    if (passwordStrength <= 2) return colors.warning;
    return colors.success;
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Medium';
    return 'Strong';
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <Text style={[styles.stepText, { color: colors.primaryText }]}>
        {step === 1 && 'Personal Info'}
        {step === 2 && 'Your Role'}
        {step === 3 && 'Location & Interests'}
      </Text>
      <Text style={[styles.stepCount, { color: colors.metadataText }]}>
        Step {step} of 3
      </Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              backgroundColor: colors.primaryGreen,
              width: `${(step / 3) * 100}%` 
            }
          ]} 
        />
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.primaryText }]}>Full Name</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.lightGray }]}>
          <MaterialIcons name="person" size={20} color={colors.secondaryGreen} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={formData.fullName}
            onChangeText={(value) => updateFormData('fullName', value)}
            placeholder="Enter your full name"
            placeholderTextColor={colors.metadataText}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.primaryText }]}>Email Address</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.lightGray }]}>
          <MaterialIcons name="email" size={20} color={colors.secondaryGreen} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Enter your email"
            placeholderTextColor={colors.metadataText}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.primaryText }]}>Phone Number</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.lightGray }]}>
          <MaterialIcons name="phone" size={20} color={colors.secondaryGreen} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="+254 700 000 000"
            placeholderTextColor={colors.metadataText}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.primaryText }]}>Password</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.lightGray }]}>
          <MaterialIcons name="lock" size={20} color={colors.secondaryGreen} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            placeholder="Create a password"
            placeholderTextColor={colors.metadataText}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons 
              name={showPassword ? "visibility" : "visibility-off"} 
              size={20} 
              color={showPassword ? colors.primaryGreen : colors.metadataText} 
            />
          </TouchableOpacity>
        </View>
        {formData.password.length > 0 && (
          <View style={styles.passwordStrengthContainer}>
            <View style={styles.strengthBar}>
              <View 
                style={[
                  styles.strengthFill, 
                  { 
                    backgroundColor: getStrengthColor(),
                    width: `${(passwordStrength / 4) * 100}%` 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
              {getStrengthText()}
            </Text>
          </View>
        )}
        <Text style={[styles.passwordRequirements, { color: colors.metadataText }]}>
          8+ characters, 1 number, 1 special character
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.roleTitle, { color: colors.primaryText }]}>What's your role?</Text>
      <Text style={[styles.roleSubtitle, { color: colors.secondaryText }]}>
        Select the option that best describes you
      </Text>
      
      <View style={styles.rolesGrid}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              { 
                backgroundColor: colors.white,
                borderColor: formData.role === role.id ? colors.primaryGreen : colors.borderColor
              },
              formData.role === role.id && { backgroundColor: colors.lightGreen }
            ]}
            onPress={() => updateFormData('role', role.id)}
          >
            <MaterialIcons 
              name={role.icon as any} 
              size={32} 
              color={colors.secondaryGreen} 
            />
            <Text style={[styles.roleTitle, { color: colors.primaryText }]}>{role.title}</Text>
            <Text style={[styles.roleDescription, { color: colors.secondaryText }]}>
              {role.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.primaryText }]}>Your Location</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.lightGray }]}>
          <MaterialIcons name="location-on" size={20} color={colors.secondaryGreen} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={formData.location}
            onChangeText={(value) => updateFormData('location', value)}
            placeholder="Enter your location"
            placeholderTextColor={colors.metadataText}
          />
        </View>
        <TouchableOpacity>
          <Text style={[styles.locationLink, { color: colors.primaryGreen }]}>
            Use current location
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.primaryText }]}>
          What are you interested in?
        </Text>
        <View style={styles.interestsContainer}>
          {interests.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestChip,
                { 
                  backgroundColor: formData.interests.includes(interest) 
                    ? colors.lightGreen 
                    : colors.white,
                  borderColor: formData.interests.includes(interest)
                    ? colors.primaryGreen
                    : colors.borderColor
                }
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text 
                style={[
                  styles.interestText,
                  { 
                    color: formData.interests.includes(interest)
                      ? colors.primaryGreen
                      : colors.metadataText
                  }
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.termsContainer}>
        <View style={styles.termsRow}>
          <TouchableOpacity 
            style={[styles.checkbox, agreeToTerms && { backgroundColor: colors.primaryGreen }]}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            {agreeToTerms && <MaterialIcons name="check" size={16} color={colors.white} />}
          </TouchableOpacity>
          <Text style={[styles.termsText, { color: colors.metadataText }]}>
            I agree to the{' '}
            <Text style={[styles.termsLink, { color: colors.primaryGreen }]}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={[styles.termsLink, { color: colors.primaryGreen }]}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );

  const renderNavigation = () => (
    <View style={styles.navigationContainer}>
      {step > 1 && (
        <TouchableOpacity 
          style={[styles.navButton, styles.backButton]}
          onPress={handleBack}
        >
          <MaterialIcons name="arrow-back" size={20} color={colors.primaryGreen} />
          <Text style={[styles.navButtonText, { color: colors.primaryGreen }]}>Back</Text>
        </TouchableOpacity>
      )}
      
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primaryGreen }]}
          onPress={step < 3 ? handleNext : () => {}}
          onPressIn={handleButtonPress}
          disabled={step === 3 && !agreeToTerms}
        >
          <Text style={styles.nextButtonText}>
            {step < 3 ? 'Continue' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
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
            <TouchableOpacity onPress={() => {}}>
              <MaterialIcons name="arrow-back" size={24} color={colors.metadataText} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.loginLink, { color: colors.primaryGreen }]}>Login instead?</Text>
            </TouchableOpacity>
          </View>

          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: colors.lightGreen }]}>
              <MaterialIcons name="agriculture" size={40} color={colors.primaryGreen} />
            </View>
            <Text style={[styles.title, { color: colors.primaryText }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Join the agricultural network
            </Text>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Form Content */}
          <View style={styles.formContainer}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </View>

          {/* Navigation */}
          {renderNavigation()}
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
  loginLink: {
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepCount: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  formContainer: {
    flex: 1,
  },
  stepContainer: {
    marginBottom: 24,
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
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 60,
  },
  passwordRequirements: {
    fontSize: 12,
    marginTop: 4,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  roleDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  locationLink: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
  },
  termsContainer: {
    marginTop: 24,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  termsText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  termsLink: {
    fontWeight: '700',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});