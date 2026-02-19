import React, { useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';

export default function JobsScreen() {
  const [jobs] = useState([
    {
      id: 1,
      title: 'Agricultural Extension Officer',
      company: 'Ministry of Agriculture',
      location: 'Nairobi, Kenya',
      salary: 'KES 80,000 - 120,000/month',
      type: 'Full-time',
      experience: '3+ years',
      posted: '2 days ago',
      description: 'Responsible for providing agricultural extension services to farmers in assigned areas.',
    },
    {
      id: 2,
      title: 'Dairy Farm Manager',
      company: 'Green Valley Dairy Ltd',
      location: 'Nakuru, Kenya',
      salary: 'KES 100,000 - 150,000/month',
      type: 'Full-time',
      experience: '5+ years',
      posted: '1 week ago',
      description: 'Manage daily operations of a dairy farm with 200+ cows.',
    },
    {
      id: 3,
      title: 'Agricultural Consultant',
      company: 'AgriSolutions Kenya',
      location: 'Remote',
      salary: 'KES 2,000 - 5,000/hour',
      type: 'Contract',
      experience: '2+ years',
      posted: '3 days ago',
      description: 'Provide expert consultation on crop production and pest management.',
    }
  ]);

  const renderJob = ({ item }: { item: any }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobCompany}>{item.company}</Text>
        </View>
        <View style={styles.jobTypeBadge}>
          <Text style={styles.jobTypeText}>{item.type}</Text>
        </View>
      </View>
      
      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <FontAwesome name="map-marker" size={16} color="#666666" />
          <Text style={styles.jobDetail}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <FontAwesome name="money" size={16} color="#666666" />
          <Text style={styles.jobDetail}>{item.salary}</Text>
        </View>
        <View style={styles.detailRow}>
          <FontAwesome name="briefcase" size={16} color="#666666" />
          <Text style={styles.jobDetail}>{item.experience} exp</Text>
        </View>
      </View>
      
      <Text style={styles.jobDescription}>{item.description}</Text>
      
      <View style={styles.jobFooter}>
        <Text style={styles.postedTime}>{item.posted}</Text>
        <View style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs</Text>
        <Text style={styles.headerSubtitle}>Find agricultural opportunities</Text>
      </View>
      
      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.jobsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
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