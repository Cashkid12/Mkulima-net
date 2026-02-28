import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UsernameScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'invalid' | 'checking' | 'empty'>('empty');
  const [displayName, setDisplayName] = useState('');

  // Generate suggested usernames based on user data
  useEffect(() => {
    if (user) {
      const firstName = user.firstName?.toLowerCase() || '';
      const lastName = user.lastName?.toLowerCase() || '';
      const email = user.primaryEmailAddress?.emailAddress || '';

      const suggestions = [];

      // Priority 1: First name + last name
      if (firstName && lastName) {
        suggestions.push(`${firstName}${lastName}`);
        suggestions.push(`${firstName}.${lastName}`);
        suggestions.push(`${firstName}_${lastName}`);
      }

      // Priority 2: First name + last initial
      if (firstName && lastName) {
        suggestions.push(`${firstName}${lastName.charAt(0)}`);
      }

      // Priority 3: First part of email
      if (email) {
        const emailPrefix = email.split('@')[0];
        suggestions.push(emailPrefix);
        suggestions.push(`${emailPrefix}_farmer`);
        suggestions.push(`${emailPrefix}_agri`);
      }

      // Priority 4: First name only
      if (firstName) {
        suggestions.push(firstName);
      }

      // Priority 5: Fallback
      suggestions.push(`user_${Math.floor(1000 + Math.random() * 9000)}`);

      setSuggestedUsernames(suggestions.slice(0, 5));
      setDisplayName(`${user.firstName || ''} ${user.lastName || ''}`.trim());

      // Set first suggestion as default
      if (suggestions.length > 0) {
        setUsername(suggestions[0]);
      }
    }
  }, [user]);

  // Validate username format
  const isValidUsername = (username: string) => {
    const regex = /^[a-zA-Z0-9._]{3,30}$/;
    return regex.test(username);
  };

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!isValidUsername(username)) {
      setUsernameStatus('invalid');
      return;
    }

    setCheckingAvailability(true);
    setUsernameStatus('checking');

    try {
      // Make API call to check username availability
      const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://mkulima-net.onrender.com').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/profile/check-username/${username}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.available) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('taken');
        }
      } else {
        // If there's an error, assume the username is taken
        setUsernameStatus('taken');
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
      // In case of network error, assume available for now and validate on submission
      setUsernameStatus('available');
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Handle username input change
  const handleUsernameChange = (text: string) => {
    // Remove @ symbol if user types it
    const cleanText = text.startsWith('@') ? text.substring(1) : text;
    setUsername(cleanText);

    if (cleanText.length === 0) {
      setUsernameStatus('empty');
    } else if (isValidUsername(cleanText)) {
      checkUsernameAvailability(cleanText);
    } else {
      setUsernameStatus('invalid');
    }
  };

  // Handle continue button press
  const handleContinue = async () => {
    if (usernameStatus === 'available') {
      try {
        // First, update the user in Clerk (this is the critical part for navigation)
        await user?.update({
          username: username,
          firstName: displayName.split(' ')[0],
          lastName: displayName.split(' ').slice(1).join(' ')
        });
          
        // Then try to sync with backend API (non-critical for navigation)
        try {
          const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://mkulima-net.onrender.com').replace(/\/$/, '');
          const response = await fetch(`${baseUrl}/api/profile/username`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await user?.getIdToken()}`,
            },
            body: JSON.stringify({ username }),
          });
  
          if (!response.ok) {
            console.warn('Warning: Could not sync username with backend');
          }
        } catch (apiError) {
          console.warn('Warning: Could not sync username with backend', apiError);
        }
          
        // Navigate to profile setup regardless of backend sync success
        router.push('/auth/profile-setup');
          
      } catch (clerkError) {
        console.error('Error updating Clerk user:', clerkError);
        Alert.alert('Error', 'Failed to save username. Please try again.');
      }
    } else {
      Alert.alert('Invalid Username', 'Please choose an available username.');
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string) => {
    setUsername(suggestion);
    if (isValidUsername(suggestion)) {
      checkUsernameAvailability(suggestion);
    }
  };

  // Get status message and color
  const getStatusInfo = () => {
    switch (usernameStatus) {
      case 'available':
        return { text: '✓ Available', color: '#4CAF50' };
      case 'taken':
        return { text: '⚠️ Already taken', color: '#F44336' };
      case 'invalid':
        return { text: '⚠️ Only letters, numbers, . _', color: '#F44336' };
      case 'checking':
        return { text: 'Checking...', color: '#F57C00' };
      case 'empty':
        return { text: '', color: '#222222' };
      default:
        return { text: '', color: '#222222' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Username</Text>
        <Text style={styles.subtitle}>This is how others will find you</Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={[styles.textInputWrapper, { borderColor: getUsernameBorderColor() }]}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={styles.textInput}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="yourname"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
          />
          {checkingAvailability && (
            <ActivityIndicator size="small" color="#2E7D32" style={styles.loadingIndicator} />
          )}
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
      </View>

      {suggestedUsernames.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions:</Text>
          <View style={styles.suggestionsList}>
            {suggestedUsernames.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => selectSuggestion(suggestion)}
              >
                <Text style={styles.suggestionText}>@{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.helperText}>
        <Text style={styles.helperTextContent}>You can change this later in Profile Settings</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          { backgroundColor: usernameStatus === 'available' ? '#2E7D32' : '#cccccc' }
        ]}
        onPress={handleContinue}
        disabled={usernameStatus !== 'available'}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color="white" style={styles.arrowIcon} />
      </TouchableOpacity>
    </ScrollView>
  );

  function getUsernameBorderColor() {
    switch (usernameStatus) {
      case 'available': return '#2E7D32';
      case 'taken': return '#F44336';
      case 'invalid': return '#F44336';
      case 'checking': return '#F57C00';
      default: return '#E0E0E0';
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 56,
    backgroundColor: '#F5F5F5',
  },
  atSymbol: {
    fontSize: 18,
    color: '#4CAF50',
    marginRight: 10,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#222222',
  },
  loadingIndicator: {
    marginLeft: 10,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  suggestionsContainer: {
    marginBottom: 25,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 10,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  helperText: {
    marginBottom: 25,
  },
  helperTextContent: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  arrowIcon: {
    marginTop: 2,
  },
});