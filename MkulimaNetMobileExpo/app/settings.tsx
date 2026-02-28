import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const { onLogout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/delete-account`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authState.token}`,
                },
              });
              
              if (response.ok) {
                onLogout();
                Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account');
            }
          }
        }
      ]
    );
  };

  const settingsItems = [
    {
      title: 'Account',
      items: [
        { label: 'Edit Profile', onPress: () => router.push('/profile/edit') },
        { label: 'Change Username', onPress: () => router.push('/change-username') },
        { label: 'Change Password', onPress: () => router.push('/change-password') },
        { label: 'Privacy Settings', onPress: () => router.push('/privacy-settings') },
      ]
    },
    {
      title: 'Notifications',
      items: [
        { 
          label: 'Push Notifications', 
          switch: true, 
          value: pushNotifications, 
          onValueChange: setPushNotifications 
        },
        { 
          label: 'Email Notifications', 
          switch: true, 
          value: emailNotifications, 
          onValueChange: setEmailNotifications 
        },
        { 
          label: 'Notification Sounds', 
          onPress: () => router.push('/notification-sounds') 
        },
      ]
    },
    {
      title: 'Privacy',
      items: [
        { 
          label: 'Private Profile', 
          switch: true, 
          value: privateProfile, 
          onValueChange: setPrivateProfile 
        },
        { label: 'Blocked Users', onPress: () => router.push('/blocked-users') },
        { label: 'Visibility Settings', onPress: () => router.push('/visibility-settings') },
      ]
    },
    {
      title: 'General',
      items: [
        { 
          label: 'Dark Mode', 
          switch: true, 
          value: darkMode, 
          onValueChange: setDarkMode 
        },
        { label: 'Language', onPress: () => router.push('/language-settings') },
        { label: 'Help & Support', onPress: () => router.push('/help-support') },
        { label: 'About MkulimaNet', onPress: () => router.push('/about') },
      ]
    },
    {
      title: 'Danger Zone',
      items: [
        { 
          label: 'Delete Account', 
          onPress: handleDeleteAccount,
          danger: true
        }
      ]
    }
  ];

  const renderSettingItem = (item: any) => {
    if (item.switch !== undefined) {
      return (
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={() => item.onValueChange(!item.value)}
        >
          <Text style={styles.settingLabel}>{item.label}</Text>
          <Switch 
            value={item.value} 
            onValueChange={item.onValueChange}
            trackColor={{ false: '#767577', true: '#1B5E20' }}
            thumbColor={item.value ? '#FFFFFF' : '#f4f3f4'}
          />
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={item.onPress}
        >
          <Text style={[styles.settingLabel, item.danger && styles.dangerText]}>
            {item.label}
          </Text>
          <FontAwesome name="chevron-right" size={16} color="#CCCCCC" />
        </TouchableOpacity>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {settingsItems.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex}>
              {renderSettingItem(item)}
              {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#111111',
  },
  dangerText: {
    color: '#F44336',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});