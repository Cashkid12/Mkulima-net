import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  profilePicture?: string;
  farmName?: string;
  location?: string;
  role: string;
  verified: boolean;
  followers: number;
  following: number;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: {
    county: string;
    town?: string;
  };
  jobType: string;
  category: string;
  salary?: {
    amount?: number;
    currency?: string;
    negotiable?: boolean;
  };
  requiredSkills: string[];
  experienceRequired: string;
  description: string;
  deadline: string;
  employerId: string;
  isActive: boolean;
  createdAt: string;
}

export default function EmployerProfileScreen() {
  const router = useRouter();
  const { employerId } = useLocalSearchParams<{ employerId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    fetchEmployerProfile();
  }, [employerId]);

  const fetchEmployerProfile = async () => {
    if (!employerId) return;

    try {
      setLoading(true);

      // Fetch user profile
      const userResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${employerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch employer profile');
      }

      const userData = await userResponse.json();
      setUser(userData);

      // Fetch jobs posted by this employer
      const jobsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs/employer/${employerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
      }

      // Check if user is following this employer
      const followedUsers = await AsyncStorage.getItem('followedUsers');
      if (followedUsers) {
        const followedUserIds = JSON.parse(followedUsers);
        setFollowed(followedUserIds.includes(employerId));
      }
    } catch (err) {
      console.error('Error fetching employer profile:', err);
      Alert.alert('Error', 'Failed to load employer profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;

    const followedUsers = JSON.parse(await AsyncStorage.getItem('followedUsers') || '[]');
    let updatedFollowed;

    if (followed) {
      updatedFollowed = followedUsers.filter((userId: string) => userId !== user.id);
    } else {
      updatedFollowed = [...followedUsers, user.id];
    }

    await AsyncStorage.setItem('followedUsers', JSON.stringify(updatedFollowed));
    setFollowed(!followed);

    Alert.alert(
      'Success', 
      followed ? 'You have unfollowed this employer' : 'You are now following this employer'
    );
  };

  const renderJob = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => router.push(`/job-details?jobId=${item.id}`)}
    >
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobCompany}>{item.companyName}</Text>
      
      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <FontAwesome name="map-marker" size={16} color="#666666" />
          <Text style={styles.jobDetail}>
            {item.location.county}
            {item.location.town && `, ${item.location.town}`}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <FontAwesome name="briefcase" size={16} color="#666666" />
          <Text style={styles.jobDetail}>{item.jobType}</Text>
        </View>
      </View>

      {item.salary?.amount && (
        <View style={styles.salaryRow}>
          <FontAwesome name="money" size={16} color="#666666" />
          <Text style={styles.salaryText}>
            {item.salary.currency} {item.salary.amount.toLocaleString()}{item.salary.negotiable ? ' (Neg)' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <FontAwesome name="spinner" size={48} color="#1B5E20" style={{ marginBottom: 16 }} />
        <Text style={styles.loadingText}>Loading employer profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-circle" size={48} color="#FF5252" />
        <Text style={styles.errorTitle}>Employer Not Found</Text>
        <Text style={styles.errorMessage}>The employer profile you're looking for doesn't exist.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employer Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <FontAwesome name="building" size={60} color="#1B5E20" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user.farmName || user.username}
            </Text>
            <Text style={styles.profileLocation}>
              {user.location || 'Kenya'}
            </Text>
            
            {user.verified && (
              <View style={styles.verifiedBadge}>
                <FontAwesome name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.followButton, followed && styles.followingButton]} 
            onPress={handleFollow}
          >
            <Text style={styles.followButtonText}>
              {followed ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={() => {
              // Navigate to message screen with employer ID
              router.push(`/messages?recipientId=${user.id}`);
            }}
          >
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        {user.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>{user.bio}</Text>
          </View>
        )}

        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <FontAwesome name="envelope" size={16} color="#666666" />
            <Text style={styles.contactText}>{user.email}</Text>
          </View>
          
          {user.phone && (
            <View style={styles.contactItem}>
              <FontAwesome name="phone" size={16} color="#666666" />
              <Text style={styles.contactText}>{user.phone}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{jobs.length}</Text>
            <Text style={styles.statLabel}>Jobs Posted</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Open Positions ({jobs.length})</Text>
          {jobs.length === 0 ? (
            <View style={styles.noJobsContainer}>
              <FontAwesome name="briefcase" size={48} color="#CCCCCC" />
              <Text style={styles.noJobsText}>No active job postings</Text>
              <Text style={styles.noJobsSubtext}>
                This employer doesn't have any active job postings at the moment.
              </Text>
            </View>
          ) : (
            <FlatList
              data={jobs}
              renderItem={renderJob}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5252',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111111',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
  },
  profileLocation: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#1B5E20',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  followingButton: {
    backgroundColor: '#CCCCCC',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  messageButtonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  contactInfo: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#111111',
    marginLeft: 12,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  noJobsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  noJobsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 12,
  },
  noJobsSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 4,
  },
  jobCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jobDetail: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salaryText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
});