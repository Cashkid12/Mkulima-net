import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

interface DashboardData {
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    followers: number;
    following: number;
    activeProducts: number;
    jobsApplied: number;
    jobsPosted: number;
  };
  recentActivity: any[];
  marketplace: any[];
  jobs: any[];
  messages: any[];
  notifications: any[];
}

export default function DashboardScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        throw new Error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const quickActions = [
    { icon: 'pencil', label: 'Create Post', action: () => router.push('/create-post') },
    { icon: 'shopping-cart', label: 'Add Product', action: () => router.push('/create-marketplace-listing') },
    { icon: 'briefcase', label: 'Post Job', action: () => router.push('/post-job') },
    { icon: 'user', label: 'Edit Profile', action: () => router.push('/profile/edit') },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <FontAwesome name="circle-o-notch" size={48} color="#1B5E20" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your farming activity overview</Text>
      </View>

      {/* Stats Summary */}
      {dashboardData?.stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <StatCard 
              icon="rss" 
              label="Posts" 
              value={dashboardData.stats.totalPosts} 
              color="#1B5E20" 
            />
            <StatCard 
              icon="heart" 
              label="Likes" 
              value={dashboardData.stats.totalLikes} 
              color="#FF4444" 
            />
          </View>
          <View style={styles.statRow}>
            <StatCard 
              icon="comment" 
              label="Comments" 
              value={dashboardData.stats.totalComments} 
              color="#2196F3" 
            />
            <StatCard 
              icon="users" 
              label="Followers" 
              value={dashboardData.stats.followers} 
              color="#4CAF50" 
            />
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.quickActionItem}
              onPress={action.action}
            >
              <FontAwesome name={action.icon as any} size={24} color="#1B5E20" />
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activityContainer}
          >
            {dashboardData.recentActivity.map((activity, index) => (
              <TouchableOpacity key={index} style={styles.activityItem}>
                <Text style={styles.activityText}>{activity.content}</Text>
                <Text style={styles.activityTime}>{activity.timestamp}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Marketplace Summary */}
      {dashboardData?.marketplace && dashboardData.marketplace.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketplace</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.marketplaceContainer}
          >
            {dashboardData.marketplace.map((product, index) => (
              <TouchableOpacity key={index} style={styles.marketplaceItem}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>KSh {product.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Job Activity */}
      {dashboardData?.jobs && dashboardData.jobs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Activity</Text>
          <View style={styles.jobActivityContainer}>
            <View style={styles.jobStat}>
              <Text style={styles.jobStatNumber}>{dashboardData.stats.jobsPosted}</Text>
              <Text style={styles.jobStatLabel}>Posted</Text>
            </View>
            <View style={styles.jobStat}>
              <Text style={styles.jobStatNumber}>{dashboardData.stats.jobsApplied}</Text>
              <Text style={styles.jobStatLabel}>Applied</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const StatCard = ({ icon, label, value, color }: { icon: string, label: string, value: number, color: string }) => (
  <View style={styles.statCard}>
    <FontAwesome name={icon as any} size={24} color={color} style={styles.statIcon} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
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
  statsContainer: {
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#111111',
    marginTop: 8,
    textAlign: 'center',
  },
  activityContainer: {
    paddingRight: 16,
  },
  activityItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 200,
  },
  activityText: {
    fontSize: 14,
    color: '#111111',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999999',
  },
  marketplaceContainer: {
    paddingRight: 16,
  },
  marketplaceItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 150,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  jobActivityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  jobStat: {
    alignItems: 'center',
  },
  jobStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
  },
  jobStatLabel: {
    fontSize: 12,
    color: '#666666',
  },
});