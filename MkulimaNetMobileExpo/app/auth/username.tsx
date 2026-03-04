import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [saving, setSaving] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Check username availability (called after debounce)
  const checkUsernameAvailability = useCallback(async (uname: string) => {
    if (!isValidUsername(uname)) {
      setUsernameStatus('invalid');
      return;
    }

    setCheckingAvailability(true);
    setUsernameStatus('checking');

    try {
      const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://mkulima-net.onrender.com').replace(/\/$/, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout
      const response = await fetch(`${baseUrl}/api/profile/check-username/${uname}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } else {
        // treat non-200 as available — will validate on server at submit
        setUsernameStatus('available');
      }
    } catch (error) {
      // network error / timeout — optimistically allow, validate on submit
      setUsernameStatus('available');
    } finally {
      setCheckingAvailability(false);
    }
  }, []);

  // Handle username input change — debounce 500ms
  const handleUsernameChange = (text: string) => {
    const cleanText = text.startsWith('@') ? text.substring(1) : text;
    setUsername(cleanText);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (cleanText.length === 0) {
      setUsernameStatus('empty');
      return;
    }
    if (!isValidUsername(cleanText)) {
      setUsernameStatus('invalid');
      return;
    }
    // Set checking immediately so button isn't grey while user types
    setUsernameStatus('checking');
    debounceTimer.current = setTimeout(() => {
      checkUsernameAvailability(cleanText);
    }, 500);
  };

  // Handle continue button press
  const handleContinue = async () => {
    if (!username || usernameStatus === 'invalid' || usernameStatus === 'taken') {
      Alert.alert('Invalid Username', 'Please choose a valid, available username.');
      return;
    }
    setSaving(true);
    try {
      await user?.update({
        username: username,
        firstName: displayName.split(' ')[0],
        lastName: displayName.split(' ').slice(1).join(' ')
      });

      // Non-blocking backend sync — fire and forget
      const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://mkulima-net.onrender.com').replace(/\/$/, '');
      fetch(`${baseUrl}/api/profile/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({ username }),
      }).catch(e => console.warn('Backend username sync failed', e));

      // Navigate immediately — don't wait for backend
      router.push('/auth/profile-setup');
    } catch (clerkError) {
      console.error('Error updating Clerk user:', clerkError);
      Alert.alert('Error', 'Failed to save username. Please try again.');
    } finally {
      setSaving(false);
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
          { backgroundColor: (usernameStatus === 'invalid' || usernameStatus === 'taken' || usernameStatus === 'empty') ? '#cccccc' : '#2E7D32' }
        ]}
        onPress={handleContinue}
        disabled={saving || usernameStatus === 'invalid' || usernameStatus === 'taken' || usernameStatus === 'empty'}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={styles.arrowIcon} />
          </>
        )}
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