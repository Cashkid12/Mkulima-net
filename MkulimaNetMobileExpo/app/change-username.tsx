import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ChangeUsernameScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [newUsername, setNewUsername] = useState('');
  const [confirmingChange, setConfirmingChange] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'invalid' | 'checking' | 'empty'>('empty');

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

    // Simulate API call to check availability
    // In a real app, this would be an actual API call to your backend
    setTimeout(() => {
      // For demo purposes, we'll assume the username is available
      // In a real app, you'd check against your database
      setCheckingAvailability(false);
      setUsernameStatus('available');
    }, 500);
  };

  // Handle username input change
  const handleUsernameChange = (text: string) => {
    // Remove @ symbol if user types it
    const cleanText = text.startsWith('@') ? text.substring(1) : text;
    setNewUsername(cleanText);

    if (cleanText.length === 0) {
      setUsernameStatus('empty');
    } else if (isValidUsername(cleanText)) {
      checkUsernameAvailability(cleanText);
    } else {
      setUsernameStatus('invalid');
    }
  };

  // Handle username update
  const handleUpdateUsername = async () => {
    if (usernameStatus !== 'available') {
      Alert.alert('Invalid Username', 'Please choose an available username.');
      return;
    }

    setConfirmingChange(true);
    
    try {
      // Update the username
      await user?.update({
        username: newUsername,
      });

      Alert.alert(
        'Username Updated',
        `Your username has been changed to @${newUsername}.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update username');
    } finally {
      setConfirmingChange(false);
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
        <Text style={styles.title}>Change Username</Text>
        <Text style={styles.subtitle}>Update your profile handle</Text>
      </View>

      <View style={styles.warningContainer}>
        <Ionicons name="alert-circle-outline" size={24} color="#F57C00" style={styles.warningIcon} />
        <View style={styles.warningTextContainer}>
          <Text style={styles.warningTitle}>Important</Text>
          <Text style={styles.warningText}>Changing username will:</Text>
          <Text style={styles.warningBullet}>• Update your profile URL</Text>
          <Text style={styles.warningBullet}>• Old links to @{user?.username || 'username'} will stop working</Text>
          <Text style={styles.warningBullet}>• Your posts will show new handle</Text>
        </View>
      </View>

      <View style={styles.currentUsernameContainer}>
        <Text style={styles.currentUsernameLabel}>Current Username</Text>
        <View style={styles.currentUsernameDisplay}>
          <Text style={styles.atSymbol}>@</Text>
          <Text style={styles.currentUsername}>{user?.username || 'loading...'}</Text>
        </View>
      </View>

      <View style={styles.newUsernameContainer}>
        <Text style={styles.label}>New Username</Text>
        <View style={[styles.textInputWrapper, { borderColor: getUsernameBorderColor() }]}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={styles.textInput}
            value={newUsername}
            onChangeText={handleUsernameChange}
            placeholder="newusername"
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

      <TouchableOpacity
        style={[
          styles.updateButton,
          { backgroundColor: usernameStatus === 'available' ? '#2E7D32' : '#cccccc' }
        ]}
        onPress={handleUpdateUsername}
        disabled={usernameStatus !== 'available' || confirmingChange}
      >
        {confirmingChange ? (
          <>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.updateButtonText}>Updating...</Text>
          </>
        ) : (
          <Text style={styles.updateButtonText}>Update Username</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
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
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FFECB3',
  },
  warningIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  warningTextContainer: {},
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 14,
    color: '#5D4037',
    marginBottom: 5,
  },
  warningBullet: {
    fontSize: 14,
    color: '#5D4037',
    marginLeft: 20,
  },
  currentUsernameContainer: {
    marginBottom: 25,
  },
  currentUsernameLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 10,
  },
  currentUsernameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
  },
  atSymbol: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginRight: 5,
  },
  currentUsername: {
    fontSize: 18,
    color: '#222222',
    fontWeight: '500',
  },
  newUsernameContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 10,
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
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#222222',
  },
  loadingIndicator: {
    marginLeft: 10,
  },
  statusContainer: {
    marginBottom: 25,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  updateButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#222222',
    fontSize: 18,
    fontWeight: '600',
  },
});