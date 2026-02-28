import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useClerkAuth } from '../../contexts/ClerkAuthContext';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { userId, user, isLoading, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/welcome');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        {user?.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.placeholderText}>
              {user?.firstName?.charAt(0) || 'U'}
            </Text>
          </View>
        )}
        <Text style={styles.profileName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email}
        </Text>
      </View>

      <View style={styles.profileSections}>
        <TouchableOpacity style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <Text style={styles.sectionValue}>Email: {user?.email}</Text>
          <Text style={styles.sectionValue}>Joined: {clerkUser?.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString() : 'Unknown'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Text style={styles.sectionValue}>Two-Factor Authentication: Off</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.sectionValue}>Language: English</Text>
          <Text style={styles.sectionValue}>Notifications: On</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.profileSection, styles.signOutSection]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#757575',
  },
  profileSections: {
    padding: 20,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutSection: {
    backgroundColor: '#FEEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 10,
  },
  sectionValue: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 5,
  },
  signOutText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
    textAlign: 'center',
  },
});