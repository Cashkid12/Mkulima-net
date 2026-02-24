import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Application {
  id: string;
  applicantId: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    farmName?: string;
    location?: string;
    verified: boolean;
  };
  message: string;
  cvUrl?: string;
  status: string;
  appliedAt: string;
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

export default function JobApplicationsScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobApplications();
  }, [jobId]);

  const fetchJobApplications = async () => {
    if (!jobId) return;

    try {
      setLoading(true);

      // Get authentication token
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to view job applications');
        router.push('/login');
        return;
      }

      // Fetch job details
      const jobResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!jobResponse.ok) {
        throw new Error('Failed to fetch job details');
      }

      const jobData = await jobResponse.json();
      setJob(jobData);

      // Fetch applications for this job
      const applicationsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs/applications/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!applicationsResponse.ok) {
        throw new Error('Failed to fetch applications');
      }

      const applicationsData = await applicationsResponse.json();
      setApplications(applicationsData);
    } catch (err) {
      console.error('Error fetching job applications:', err);
      Alert.alert('Error', 'Failed to load job applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    // In a real implementation, you would make an API call to update the application status
    // For now, we'll just update the local state
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus } 
          : app
      )
    );
    
    Alert.alert('Success', `Application status updated to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#E8F5E9'; // Light green
      case 'rejected':
        return '#FFEBEE'; // Light red
      case 'reviewed':
        return '#E3F2FD'; // Light blue
      case 'pending':
      default:
        return '#FFF3E0'; // Light orange
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#4CAF50'; // Green
      case 'rejected':
        return '#F44336'; // Red
      case 'reviewed':
        return '#2196F3'; // Blue
      case 'pending':
      default:
        return '#FF9800'; // Orange
    }
  };

  const renderApplication = ({ item }: { item: Application }) => (
    <View style={[styles.applicationCard, { backgroundColor: getStatusColor(item.status) }]}>
      <View style={styles.applicationHeader}>
        <View style={styles.applicantInfo}>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user" size={24} color="#666666" />
          </View>
          <View>
            <Text style={styles.applicantName}>
              {item.applicantId.firstName} {item.applicantId.lastName}
            </Text>
            <Text style={styles.applicantUsername}>{item.applicantId.farmName || item.applicantId.username}</Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusTextColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
        </View>
      </View>
      
      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <FontAwesome name="envelope" size={14} color="#666666" />
          <Text style={styles.contactText}>{item.applicantId.email}</Text>
        </View>
        
        {item.applicantId.phone && (
          <View style={styles.contactItem}>
            <FontAwesome name="phone" size={14} color="#666666" />
            <Text style={styles.contactText}>{item.applicantId.phone}</Text>
          </View>
        )}
      </View>
      
      {item.message ? (
        <View style={styles.coverLetterSection}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <Text style={styles.coverLetterText}>{item.message}</Text>
        </View>
      ) : null}
      
      <View style={styles.applicationFooter}>
        <Text style={styles.appliedTime}>
          Applied {new Date(item.appliedAt).toLocaleDateString()}
        </Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.reviewButton}
            onPress={() => updateApplicationStatus(item.id, 'reviewed')}
          >
            <Text style={styles.buttonText}>Review</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => updateApplicationStatus(item.id, 'accepted')}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => updateApplicationStatus(item.id, 'rejected')}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <FontAwesome name="spinner" size={48} color="#1B5E20" style={{ marginBottom: 16 }} />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Applications</Text>
      </View>

      <View style={styles.content}>
        {job && (
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobCompany}>{job.companyName}</Text>
            <Text style={styles.applicationsCount}>
              {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
            </Text>
          </View>
        )}

        {applications.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="inbox" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateTitle}>No Applications Yet</Text>
            <Text style={styles.emptyStateText}>
              No one has applied to this job yet. The job is still active and accepting applications.
            </Text>
          </View>
        ) : (
          <FlatList
            data={applications}
            renderItem={renderApplication}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
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
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  applicationsCount: {
    fontSize: 14,
    color: '#666666',
  },
  applicationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  applicantUsername: {
    fontSize: 14,
    color: '#666666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#111111',
    marginLeft: 8,
  },
  coverLetterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  coverLetterText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  appliedTime: {
    fontSize: 12,
    color: '#999999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rejectButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 4,
    marginHorizontal: 20,
  },
});