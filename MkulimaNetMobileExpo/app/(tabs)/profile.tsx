import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { authState } = useAuth();
  const [userData, setUserData] = useState({
    name: 'John Farmer',
    email: 'john@mkulimanet.co.ke',
    location: 'Nakuru County',
    role: 'Farmer',
    avatar: 'https://via.placeholder.com/80x80',
    followers: 1242,
    following: 856,
    posts: 156,
    isVerified: true,
  });

  const features = [
    { id: 'wallet', title: 'Wallet', icon: 'account-balance-wallet', color: '#1B5E20' },
    { id: 'security', title: 'Security Center', icon: 'lock', color: '#3B82F6' },
    { id: 'verification', title: 'Verification', icon: 'verified', color: '#10B981' },
    { id: 'bulk-buyer', title: 'Bulk Buyer', icon: 'shopping-cart', color: '#F59E0B' },
    { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', color: '#8B5CF6' },
    { id: 'settings', title: 'Settings', icon: 'settings', color: '#6B7280' },
  ];

  const stats = [
    { label: 'Posts', value: userData.posts },
    { label: 'Followers', value: userData.followers },
    { label: 'Following', value: userData.following },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            {userData.isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileRole}>{userData.role}</Text>
          <Text style={styles.profileLocation}>{userData.location}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Profile Actions */}
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={20} color="#1B5E20" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialIcons name="settings" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity key={feature.id} style={styles.featureButton}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <MaterialIcons name={feature.icon} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1B5E20',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '600',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: '#666666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureButton: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
