import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function JobDetailsScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const data = await response.json();
      setJob(data);

      // Check if user has applied to this job
      const appliedJobs = await AsyncStorage.getItem('appliedJobs');
      if (appliedJobs) {
        const appliedJobIds = JSON.parse(appliedJobs);
        setApplied(appliedJobIds.includes(jobId));
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      Alert.alert('Error', 'Failed to load job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!jobId) {
      Alert.alert('Error', 'Invalid job ID');
      return;
    }

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

      // Mark as applied in AsyncStorage
      const appliedJobs = JSON.parse(await AsyncStorage.getItem('appliedJobs') || '[]');
      await AsyncStorage.setItem('appliedJobs', JSON.stringify([...appliedJobs, jobId]));

      setApplied(true);
      Alert.alert('Success', 'Successfully applied to the job!');
    } catch (err) {
      console.error('Error applying to job:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to apply to job');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <FontAwesome name="spinner" size={48} color="#1B5E20" style={{ marginBottom: 16 }} />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-circle" size={48} color="#FF5252" />
        <Text style={styles.errorTitle}>Job Not Found</Text>
        <Text style={styles.errorMessage}>The job you're looking for doesn't exist.</Text>
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
        <Text style={styles.headerTitle}>Job Details</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobCompany}>{job.companyName}</Text>
          
          {job.employerId.verified && (
            <View style={styles.verifiedBadge}>
              <FontAwesome name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.jobInfo}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <FontAwesome name="map-marker" size={20} color="#666666" />
              <Text style={styles.infoText}>
                {job.location.county}
                {job.location.town && `, ${job.location.town}`}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <FontAwesome name="briefcase" size={20} color="#666666" />
              <Text style={styles.infoText}>{job.jobType}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <FontAwesome name="tag" size={20} color="#666666" />
              <Text style={styles.infoText}>{job.category}</Text>
            </View>
            {job.salary?.amount && (
              <View style={styles.infoItem}>
                <FontAwesome name="money" size={20} color="#666666" />
                <Text style={styles.infoText}>
                  {job.salary.currency} {job.salary.amount.toLocaleString()}{job.salary.negotiable ? ' (Neg)' : ''}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Skills</Text>
          <View style={styles.skillsContainer}>
            {job.requiredSkills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience Required</Text>
          <Text style={styles.descriptionText}>{job.experienceRequired || 'Any level'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Deadline</Text>
          <Text style={styles.descriptionText}>{new Date(job.deadline).toLocaleDateString()}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.applyButton, applied && styles.appliedButton]} 
          onPress={handleApply}
          disabled={applied}
        >
          <Text style={styles.applyButtonText}>
            {applied ? 'Already Applied' : 'Apply for This Job'}
          </Text>
        </TouchableOpacity>
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
  jobHeader: {
    marginBottom: 20,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 8,
  },
  jobCompany: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  jobInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#111111',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#1B5E20',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  appliedButton: {
    backgroundColor: '#CCCCCC',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});