import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  employerId: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    farmName?: string;
    location?: string;
    verified: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
      Alert.alert('Error', 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    // Check if user is logged in
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'You must be logged in to apply to jobs');
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply to job');
      }

      Alert.alert('Success', 'Successfully applied to the job!');
    } catch (err) {
      console.error('Error applying to job:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to apply to job');
    }
  };

  const renderJob = ({ item }: { item: Job }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobCompany}>{item.companyName}</Text>
        </View>
        <View style={styles.jobTypeBadge}>
          <Text style={styles.jobTypeText}>{item.jobType}</Text>
        </View>
      </View>
      
      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <FontAwesome name="map-marker" size={16} color="#666666" />
          <Text style={styles.jobDetail}>
            {item.location.county}
            {item.location.town && `, ${item.location.town}`}
          </Text>
        </View>
        {item.salary?.amount && (
          <View style={styles.detailRow}>
            <FontAwesome name="money" size={16} color="#666666" />
            <Text style={styles.jobDetail}>
              {item.salary.currency} {item.salary.amount.toLocaleString()}{item.salary.negotiable ? ' (Neg)' : ''}
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <FontAwesome name="briefcase" size={16} color="#666666" />
          <Text style={styles.jobDetail}>{item.experienceRequired || 'Any'} exp</Text>
        </View>
      </View>
      
      <Text style={styles.jobDescription}>{item.description}</Text>
      
      <View style={styles.jobFooter}>
        <Text style={styles.postedTime}>
          Posted {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={() => handleApply(item.id)}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B5E20" />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-circle" size={48} color="#FF5252" />
        <Text style={styles.errorTitle}>Error Loading Jobs</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchJobs}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs</Text>
        <Text style={styles.headerSubtitle}>Find agricultural opportunities</Text>
      </View>
      
      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.jobsList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchJobs}
      />
    </View>
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
  retryButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  jobsList: {
    padding: 16,
    paddingBottom: 20,
  },
  jobCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
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
  },
  jobTypeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  jobTypeText: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '600',
  },
  jobDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobDetail: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: '#111111',
    lineHeight: 18,
    marginBottom: 16,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  postedTime: {
    fontSize: 12,
    color: '#999999',
  },
  applyButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});