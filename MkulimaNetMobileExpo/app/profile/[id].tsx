import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [followStatus, setFollowStatus] = useState(false);

  // Mock user data - in a real app this would come from an API
  useEffect(() => {
    // Simulate fetching user data
    const mockUserData = {
      id: 'user_123456',
      username: 'johndoe',
      displayName: 'John Doe',
      bio: 'Dairy farmer in Nakuru with 8 years experience. Specializing in sustainable agriculture practices.',
      location: 'Nakuru, Kenya',
      profileImage: null,
      coverImage: null,
      followers: 1243,
      following: 89,
      posts: 42,
      farmName: 'Green Valley Farm',
      farmSize: '12 acres',
      primaryActivities: ['Dairy Farming', 'Crop Farming'],
      yearsExperience: '5-10 years',
      certifications: ['Organic Certified', 'GAP'],
      languagesSpoken: ['English', 'Swahili'],
      role: 'farmer',
      isOnline: true,
    };
    
    setUserData(mockUserData);
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refreshing data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleFollow = () => {
    setFollowStatus(!followStatus);
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {userData.coverImage ? (
          <Image source={{ uri: userData.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfoContainer}>
        <View style={styles.profileImageContainer}>
          {userData.profileImage ? (
            <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={40} color="#757575" />
            </View>
          )}
          {userData.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <Text style={styles.displayName}>{userData.displayName}</Text>
        <Text style={styles.username}>@{userData.username}</Text>
        <Text style={styles.location}>{userData.location}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Follow Button */}
        <TouchableOpacity 
          style={[styles.followButton, followStatus && styles.followingButton]} 
          onPress={handleFollow}
        >
          <Text style={[styles.followButtonText, followStatus && styles.followingButtonText]}>
            {followStatus ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{userData.bio}</Text>
      </View>

      {/* Agricultural Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agricultural Profile</Text>
        <View style={styles.agriculturalInfo}>
          <InfoRow label="Farm/Business Name" value={userData.farmName} />
          <InfoRow label="Farm Size" value={userData.farmSize} />
          <InfoRow label="Primary Activities" value={userData.primaryActivities.join(', ')} />
          <InfoRow label="Years of Experience" value={userData.yearsExperience} />
          <InfoRow label="Certifications" value={userData.certifications.join(', ')} />
          <InfoRow label="Languages Spoken" value={userData.languagesSpoken.join(', ')} />
        </View>
      </View>

      {/* Posts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Posts</Text>
        <Text>No posts yet</Text>
      </View>
    </ScrollView>
  );
}

// Component for displaying key-value pairs in agricultural info
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  coverContainer: {
    height: 150,
    backgroundColor: '#E8F5E9',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  profileInfoContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
  },
  followButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 15,
  },
  followingButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  followingButtonText: {
    color: '#222222',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#222222',
    lineHeight: 22,
  },
  agriculturalInfo: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
});