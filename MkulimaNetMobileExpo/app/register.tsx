import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { onRegister } = useAuth();

  const roles = [
    { value: 'farmer', label: 'Farmer' },
    { value: 'agrovet', label: 'Agrovet' },
    { value: 'buyer', label: 'Buyer' },
    { value: 'agronomist', label: 'Agronomist' },
  ];

  const handleRegister = async () => {
    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword || !location) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      // Simulate API call to backend
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          location,
          role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use auth context to handle registration
        onRegister(data.token, data.user);
      } else {
        Alert.alert('Registration Failed', data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MkulimaNet</Text>
        <Text style={styles.subtitle}>Join our farming community</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.passwordToggle} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <FontAwesome 
              name={showPassword ? "eye" : "eye-slash"} 
              size={20} 
              color="#666666" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.passwordToggle} 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <FontAwesome 
              name={showConfirmPassword ? "eye" : "eye-slash"} 
              size={20} 
              color="#666666" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Location (County)"
            value={location}
            onChangeText={setLocation}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.roleSelector}>
          <Text style={styles.roleLabel}>Select Role</Text>
          <View style={styles.roleOptions}>
            {roles.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.roleOption,
                  role === option.value && styles.selectedRoleOption
                ]}
                onPress={() => setRole(option.value)}
              >
                <Text style={[
                  styles.roleOptionText,
                  role === option.value && styles.selectedRoleOptionText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  roleSelector: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleOption: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginVertical: 4,
    marginRight: '4%',
  },
  selectedRoleOption: {
    backgroundColor: '#1B5E20',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedRoleOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loginText: {
    color: '#1B5E20',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});