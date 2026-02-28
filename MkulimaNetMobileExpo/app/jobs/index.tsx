import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  description: string;
  postedTime: string;
  applicants: number;
  isFeatured: boolean;
  isUrgent: boolean;
  isVerified: boolean;
  tags: string[];
  logoInitial: string;
  rating?: number;
}

export default function JobsScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMatches, setNewMatches] = useState(3);

  // Professional color palette
  const colors = {
    primaryGreen: '#2E7D32',
    secondaryGreen: '#4CAF50',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F7FA',
    primaryText: '#222222',
    secondaryText: '#424242',
    metadataText: '#757575',
    lightText: '#BDBDBD',
    borderColor: '#E0E0E0',
    error: '#F44336',
    orange: '#F57C00',
    blue: '#2196F3',
  };

  const categories = [
    'All', 'Farming', 'Veterinary', 'Sales', 'Management', 
    'Labor', 'Tech', 'Transport'
  ];

  const mockJobs: Job[] = [
    {
      id: 1,
      title: 'Experienced Farm Manager',
      company: 'Green Acres Farm',
      location: 'Nakuru',
      salary: '45,000 KES/month',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Manage daily farm operations, oversee crop production and livestock management. Must have experience with modern farming techniques.',
      postedTime: '2h ago',
      applicants: 12,
      isFeatured: true,
      isUrgent: true,
      isVerified: true,
      tags: ['Full-time', 'Urgent', 'Verified'],
      logoInitial: 'G',
      rating: 4.5
    },
    {
      id: 2,
      title: 'Veterinary Assistant',
      company: 'County Veterinary Services',
      location: 'Kisumu',
      salary: '35,000 KES/month',
      type: 'Full-time',
      experience: '1+ years',
      description: 'Assist senior veterinarians with animal care, vaccinations, and health monitoring. Experience with livestock preferred.',
      postedTime: '5h ago',
      applicants: 8,
      isFeatured: false,
      isUrgent: false,
      isVerified: true,
      tags: ['Full-time', 'Verified'],
      logoInitial: 'C',
      rating: 4.2
    },
    {
      id: 3,
      title: 'Agricultural Sales Representative',
      company: 'Farm Inputs Ltd',
      location: 'Nairobi',
      salary: '25,000 KES/month + commission',
      type: 'Full-time',
      experience: 'Entry level',
      description: 'Promote and sell agricultural products to farmers. Travel required across assigned regions.',
      postedTime: '1d ago',
      applicants: 24,
      isFeatured: false,
      isUrgent: true,
      isVerified: false,
      tags: ['Full-time', 'Urgent'],
      logoInitial: 'F'
    },
    {
      id: 4,
      title: 'Dairy Farm Technician',
      company: 'Happy Cows Dairy',
      location: 'Naivasha',
      salary: '40,000 KES/month',
      type: 'Full-time',
      experience: '2+ years',
      description: 'Operate and maintain dairy equipment, monitor milk production, ensure animal welfare standards.',
      postedTime: '3d ago',
      applicants: 6,
      isFeatured: true,
      isUrgent: false,
      isVerified: true,
      tags: ['Full-time', 'Verified'],
      logoInitial: 'H',
      rating: 4.7
    }
  ];

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: colors.lightGray }]}>
        <MaterialIcons 
          name="search" 
          size={20} 
          color={colors.secondaryGreen} 
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.primaryText }]}
          placeholder="Search jobs, skills, location..."
          placeholderTextColor={colors.lightText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.voiceSearch}>
          <MaterialIcons name="mic" size={20} color={colors.metadataText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryChip,
            { 
              backgroundColor: activeCategory === category ? colors.primaryGreen : colors.white,
              borderColor: activeCategory === category ? colors.primaryGreen : colors.borderColor
            }
          ]}
          onPress={() => setActiveCategory(category)}
        >
          <Text 
            style={[
              styles.categoryText,
              { 
                color: activeCategory === category ? colors.white : colors.metadataText
              }
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={[
        styles.jobCard,
        { 
          backgroundColor: colors.white,
          shadowColor: '#000000'
        },
        item.isFeatured && styles.featuredCard
      ]}
    >
      {/* Featured accent */}
      {item.isFeatured && (
        <View style={[styles.featuredAccent, { backgroundColor: colors.primaryGreen }]} />
      )}
      
      <View style={styles.jobHeader}>
        {/* Company Logo */}
        <View style={[styles.companyLogo, { backgroundColor: colors.lightGreen }]}>
          <Text style={[styles.logoInitial, { color: colors.primaryGreen }]}>
            {item.logoInitial}
          </Text>
          {item.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.primaryGreen }]}>
              <MaterialIcons name="check" size={12} color={colors.white} />
            </View>
          )}
        </View>
        
        {/* Job Info */}
        <View style={styles.jobInfo}>
          <View style={styles.jobTitleRow}>
            <Text style={[styles.jobTitle, { color: colors.primaryText }]}>
              {item.title}
            </Text>
            {item.isUrgent && (
              <View style={[styles.urgentBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </View>
          
          <View style={styles.companyRow}>
            <Text style={[styles.companyName, { color: colors.metadataText }]}>
              {item.company}
            </Text>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={14} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.metadataText }]}>
                  {item.rating}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.locationSalaryRow}>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={14} color={colors.secondaryGreen} />
              <Text style={[styles.locationText, { color: colors.metadataText }]}>
                {item.location}
              </Text>
            </View>
            <Text style={[styles.salaryText, { color: colors.primaryGreen }]}>
              {item.salary}
            </Text>
          </View>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton}>
          <MaterialIcons name="bookmark-border" size={20} color={colors.metadataText} />
        </TouchableOpacity>
      </View>
      
      {/* Tags */}
      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <View 
            key={index} 
            style={[
              styles.tag,
              { 
                backgroundColor: colors.lightGreen,
                borderColor: colors.secondaryGreen
              }
            ]}
          >
            <Text style={[styles.tagText, { color: colors.primaryGreen }]}>{tag}</Text>
          </View>
        ))}
      </View>
      
      {/* Description */}
      <Text 
        style={[styles.description, { color: colors.secondaryText }]} 
        numberOfLines={2}
      >
        {item.description}
      </Text>
      
      {/* Footer */}
      <View style={styles.jobFooter}>
        <Text style={[styles.postedTime, { color: colors.metadataText }]}>
          Posted {item.postedTime}
        </Text>
        <View style={styles.applicantsContainer}>
          <MaterialIcons name="group" size={14} color={colors.metadataText} />
          <Text style={[styles.applicantsText, { color: colors.metadataText }]}>
            {item.applicants} applicants
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>{title}</Text>
      <TouchableOpacity>
        <Text style={[styles.seeAllText, { color: colors.primaryGreen }]}>See all</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Jobs+</Text>
            <Text style={[styles.headerSubtitle, { color: colors.metadataText }]}>
              Find your next opportunity
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcons name="notifications" size={24} color={colors.metadataText} />
            {newMatches > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: colors.primaryGreen }]}>
                <Text style={styles.notificationBadgeText}>{newMatches}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      {renderSearchBar()}
      
      {/* Category Chips */}
      {renderCategoryChips()}
      
      {/* Jobs List */}
      <FlatList
        data={mockJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.jobsList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {renderSectionHeader('Featured Jobs')}
            {renderSectionHeader('Recent Jobs')}
            {renderSectionHeader('Recommended for You')}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  voiceSearch: {
    marginLeft: 12,
  },
  categoryContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoryContent: {
    paddingRight: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jobsList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jobCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  featuredCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  featuredAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  jobHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  logoInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  urgentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  locationSalaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    marginLeft: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postedTime: {
    fontSize: 12,
  },
  applicantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantsText: {
    fontSize: 12,
    marginLeft: 4,
  },
});