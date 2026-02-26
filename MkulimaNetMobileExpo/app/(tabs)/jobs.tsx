import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, TextInput, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function JobsScreen() {
  const { authState } = useAuth();
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Agricultural Extension Officer',
      company: 'Ministry of Agriculture',
      location: 'Nairobi, Kenya',
      salary: 'KSh 80,000 - 120,000',
      type: 'Full-time',
      posted: '2 days ago',
      description: 'Seeking experienced agricultural extension officers to assist farmers with modern farming techniques.',
      requirements: ['Degree in Agriculture', '3+ years experience', 'Knowledge of local crops'],
      isSaved: false
    },
    {
      id: 2,
      title: 'Farm Manager',
      company: 'Green Valley Farms',
      location: 'Naivasha, Kenya',
      salary: 'KSh 100,000 - 150,000',
      type: 'Full-time',
      posted: '1 day ago',
      description: 'Looking for a farm manager to oversee daily operations of our organic vegetable farm.',
      requirements: ['Agriculture degree', 'Leadership experience', 'Organic farming knowledge'],
      isSaved: true
    },
    {
      id: 3,
      title: 'Agronomist',
      company: 'Kenya Seed Company',
      location: 'Kitale, Kenya',
      salary: 'KSh 70,000 - 100,000',
      type: 'Contract',
      posted: '3 days ago',
      description: 'Hiring agronomists to advise on seed production and soil management.',
      requirements: ['Agronomy specialization', 'Research experience', 'Field work capability'],
      isSaved: false
    }
  ]);
  
  const [categories] = useState(['All', 'Agriculture', 'Farm Management', 'Research', 'Agribusiness']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const matchesCategory = selectedCategory === 'All' || job.description.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSaveJob = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
    ));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderJob = ({ item }: { item: any }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.companyName}>{item.company}</Text>
          <Text style={styles.jobLocation}>{item.location}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleSaveJob(item.id)}>
          <MaterialIcons 
            name={item.isSaved ? "bookmark" : "bookmark-border"} 
            size={24} 
            color={item.isSaved ? "#1B5E20" : "#666666"} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="attach-money" size={16} color="#666666" />
          <Text style={styles.salary}>{item.salary}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="work" size={16} color="#666666" />
          <Text style={styles.jobType}>{item.type}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="access-time" size={16} color="#666666" />
          <Text style={styles.posted}>{item.posted}</Text>
        </View>
      </View>
      
      <Text style={styles.jobDescription}>{item.description}</Text>
      
      <View style={styles.requirementsSection}>
        <Text style={styles.requirementsTitle}>Requirements:</Text>
        <View style={styles.requirementsList}>
          {item.requirements.map((req: string, index: number) => (
            <View key={index} style={styles.requirementItem}>
              <MaterialIcons name="check" size={12} color="#10B981" />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.jobActions}>
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.categoryButton, 
                selectedCategory === item && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text 
                style={[
                  styles.categoryText, 
                  selectedCategory === item && styles.selectedCategoryText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        renderItem={renderJob}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.jobsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="sentiment-dissatisfied" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No jobs found</Text>
            <Text style={styles.emptyStateSubtext}>Try changing your search or category</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#1B5E20',
  },
  categoryText: {
    fontSize: 12,
    color: '#666666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  jobsList: {
    paddingHorizontal: 16,
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
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '600',
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 12,
    color: '#666666',
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salary: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '600',
    marginLeft: 4,
  },
  jobType: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  posted: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 12,
  },
  requirementsSection: {
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  requirementsList: {
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applyButton: {
    flex: 0.48,
    backgroundColor: '#1B5E20',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1B5E20',
  },
  viewButtonText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
});