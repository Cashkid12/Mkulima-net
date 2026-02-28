import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface JobApplication {
  id: string;
  jobId: {
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
    deadline: string;
  };
  message: string;
  cvUrl?: string;
  status: string;
  appliedAt: string;
}

export default function MyJobsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applied' | 'posted'>('applied');

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      // Get authentication token
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to view your jobs');
        router.push('/auth/login');
        return;
      }

      // Fetch applications made by user
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs/applications/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job applications');
      }

      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      Alert.alert('Error', 'Failed to load your job applications. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const renderApplication = ({ item }: { item: JobApplication }) => (
    <TouchableOpacity 
      style={[styles.applicationCard, { backgroundColor: getStatusColor(item.status) }]}
      onPress={() => router.push(`/job-details?jobId=${item.jobId.id}`)}
    >
      <View style={styles.applicationHeader}>
        <View>
          <Text style={styles.jobTitle}>{item.jobId.title}</Text>
          <Text style={styles.jobCompany}>{item.jobId.companyName}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusTextColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
        </View>
      </View>
      
      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <FontAwesome name="map-marker" size={14} color="#666666" />
          <Text style={styles.detailText}>
            {item.jobId.location.county}
            {item.jobId.location.town && `, ${item.jobId.location.town}`}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <FontAwesome name="briefcase" size={14} color="#666666" />
          <Text style={styles.detailText}>{item.jobId.jobType}</Text>
        </View>
        
        {item.jobId.salary?.amount && (
          <View style={styles.detailRow}>
            <FontAwesome name="money" size={14} color="#666666" />
            <Text style={styles.detailText}>
              {item.jobId.salary.currency} {item.jobId.salary.amount.toLocaleString()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.applicationFooter}>
        <Text style={styles.appliedTime}>
          Applied {new Date(item.appliedAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity 
          style={styles.viewJobButton}
          onPress={() => router.push(`/job-details?jobId=${item.jobId.id}`)}
        >
          <Text style={styles.viewJobText}>View Job</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Jobs</Text>
        </View>
        
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'applied' && styles.activeTab]}
            onPress={() => setActiveTab('applied')}
          >
            <Text style={[styles.tabText, activeTab === 'applied' && styles.activeTabText]}>
              Jobs Applied ({applications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posted' && styles.activeTab]}
            onPress={() => setActiveTab('posted')}
          >
            <Text style={[styles.tabText, activeTab === 'posted' && styles.activeTabText]}>
              Jobs Posted (0)
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <FontAwesome name="spinner" size={48} color="#1B5E20" style={{ marginBottom: 16 }} />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'applied' && styles.activeTab]}
          onPress={() => setActiveTab('applied')}
        >
          <Text style={[styles.tabText, activeTab === 'applied' && styles.activeTabText]}>
            Jobs Applied ({applications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'posted' && styles.activeTab]}
          onPress={() => setActiveTab('posted')}
        >
          <Text style={[styles.tabText, activeTab === 'posted' && styles.activeTabText]}>
            Jobs Posted (0)
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'applied' ? (
          applications.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome name="briefcase" size={48} color="#CCCCCC" />
              <Text style={styles.emptyStateTitle}>No Applications Yet</Text>
              <Text style={styles.emptyStateText}>
                You haven't applied to any jobs yet. Start applying to opportunities that match your skills.
              </Text>
              <TouchableOpacity 
                style={styles.browseJobsButton}
                onPress={() => router.push('/jobs')}
              >
                <Text style={styles.browseJobsText}>Browse Jobs</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={applications}
              renderItem={renderApplication}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="briefcase" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateTitle}>No Jobs Posted</Text>
            <Text style={styles.emptyStateText}>
              You haven't posted any job opportunities yet. Start by posting a job to attract talent.
            </Text>
            <TouchableOpacity 
              style={styles.postJobButton}
              onPress={() => router.push('/post-job')}
            >
              <Text style={styles.postJobText}>Post a Job</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1B5E20',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  jobDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#111111',
    marginLeft: 8,
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
  viewJobButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewJobText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  browseJobsButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  browseJobsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  postJobButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  postJobText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});