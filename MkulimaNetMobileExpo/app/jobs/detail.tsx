import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface JobDetail {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  postedTime: string;
  applicants: number;
  isFeatured: boolean;
  isUrgent: boolean;
  isVerified: boolean;
  tags: string[];
  logoInitial: string;
  rating?: number;
  companyImage?: string;
  website?: string;
}

export default function JobDetailScreen() {
  const [isSaved, setIsSaved] = useState(false);

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

  const job: JobDetail = {
    id: 1,
    title: 'Experienced Farm Manager',
    company: 'Green Acres Farm',
    location: 'Nakuru, Kenya',
    salary: '45,000 KES/month',
    type: 'Full-time',
    experience: '3+ years',
    description: 'We are seeking an experienced Farm Manager to oversee our 50-acre mixed farming operation. The ideal candidate will have strong leadership skills and experience in both crop production and livestock management.',
    requirements: [
      'Bachelor\'s degree in Agriculture or related field',
      'Minimum 3 years of farm management experience',
      'Knowledge of modern farming techniques and sustainable practices',
      'Strong leadership and team management skills',
      'Valid driver\'s license',
      'Fluency in English and Swahili'
    ],
    responsibilities: [
      'Oversee daily farm operations and staff management',
      'Plan and implement crop production schedules',
      'Manage livestock health and breeding programs',
      'Maintain equipment and facilities',
      'Monitor budgets and financial performance',
      'Ensure compliance with safety and environmental regulations'
    ],
    benefits: [
      'Competitive salary package',
      'Accommodation provided',
      'Health insurance',
      'Transport allowance',
      'Professional development opportunities',
      'Performance bonuses'
    ],
    postedTime: '2 days ago',
    applicants: 12,
    isFeatured: true,
    isUrgent: true,
    isVerified: true,
    tags: ['Full-time', 'Urgent', 'Verified'],
    logoInitial: 'G',
    rating: 4.5,
    companyImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800',
    website: 'www.greenacresfarm.co.ke'
  };

  const stats = [
    { icon: 'work', label: 'Type', value: job.type },
    { icon: 'location-on', label: 'Location', value: job.location.split(',')[0] },
    { icon: 'payments', label: 'Salary', value: job.salary.split(' ')[0] },
    { icon: 'group', label: 'Applicants', value: job.applicants.toString() }
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color={colors.metadataText} />
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color={colors.metadataText} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => setIsSaved(!isSaved)}
        >
          <MaterialIcons 
            name={isSaved ? "bookmark" : "bookmark-border"} 
            size={24} 
            color={isSaved ? colors.primaryGreen : colors.metadataText} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCompanyBanner = () => (
    <View style={[styles.companyBanner, { backgroundColor: colors.primaryGreen }]}>
      <View style={styles.companyInfo}>
        <View style={[styles.companyLogo, { backgroundColor: colors.white }]}>
          <Text style={[styles.logoInitial, { color: colors.primaryGreen }]}>
            {job.logoInitial}
          </Text>
        </View>
        <View>
          <Text style={[styles.companyName, { color: colors.white }]}>{job.company}</Text>
          {job.website && (
            <TouchableOpacity>
              <Text style={[styles.companyWebsite, { color: colors.lightGreen }]}>
                {job.website}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.statsContent}>
          {stats.map((stat, index) => (
            <View 
              key={index}
              style={[styles.statCard, { backgroundColor: colors.lightGray }]}
            >
              <MaterialIcons name={stat.icon as any} size={20} color={colors.primaryGreen} />
              <Text style={[styles.statLabel, { color: colors.metadataText }]}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: colors.primaryText }]}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderSection = (title: string, content: string | string[], type: 'text' | 'list' = 'text') => (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { borderLeftColor: colors.primaryGreen }]}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>{title}</Text>
      </View>
      
      {type === 'text' ? (
        <Text style={[styles.sectionText, { color: colors.secondaryText }]}>{content as string}</Text>
      ) : (
        <View style={styles.listContainer}>
          {(content as string[]).map((item, index) => (
            <View key={index} style={styles.listItem}>
              <MaterialIcons name="check-circle" size={16} color={colors.primaryGreen} />
              <Text style={[styles.listItemText, { color: colors.secondaryText }]}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderBenefits = () => (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { borderLeftColor: colors.primaryGreen }]}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Benefits</Text>
      </View>
      <View style={styles.benefitsGrid}>
        {job.benefits.map((benefit, index) => (
          <View 
            key={index} 
            style={[styles.benefitCard, { backgroundColor: colors.lightGreen }]}
          >
            <MaterialIcons name="check" size={16} color={colors.primaryGreen} />
            <Text style={[styles.benefitText, { color: colors.primaryText }]}>{benefit}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSimilarJobs = () => (
    <View style={styles.section}>
      <View style={styles.similarJobsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Similar Jobs</Text>
        <TouchableOpacity>
          <Text style={[styles.seeAllText, { color: colors.primaryGreen }]}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.similarJobsContainer}>
        {[1, 2].map((item) => (
          <View 
            key={item}
            style={[styles.similarJobCard, { backgroundColor: colors.white }]}
          >
            <View style={styles.similarJobHeader}>
              <View style={[styles.similarJobLogo, { backgroundColor: colors.lightGreen }]}>
                <Text style={[styles.similarLogoInitial, { color: colors.primaryGreen }]}>C</Text>
              </View>
              <View style={styles.similarJobInfo}>
                <Text style={[styles.similarJobTitle, { color: colors.primaryText }]}>
                  Crop Specialist
                </Text>
                <Text style={[styles.similarCompany, { color: colors.metadataText }]}>
                  County Agricultural Office
                </Text>
              </View>
              <Text style={[styles.similarSalary, { color: colors.primaryGreen }]}>
                35k KES/mo
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderApplyButton = () => (
    <View style={[styles.applyContainer, { backgroundColor: colors.white }]}>
      <TouchableOpacity 
        style={[styles.applyButton, { backgroundColor: colors.primaryGreen }]}
      >
        <Text style={styles.applyButtonText}>Apply Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderCompanyBanner()}
        {renderStats()}
        
        <View style={styles.jobDetails}>
          <Text style={[styles.jobTitle, { color: colors.primaryText }]}>{job.title}</Text>
          <Text style={[styles.jobLocation, { color: colors.metadataText }]}>
            {job.location}
          </Text>
          
          <View style={styles.tagsContainer}>
            {job.tags.map((tag, index) => (
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
        </View>
        
        {renderSection('Job Description', job.description)}
        {renderSection('Requirements', job.requirements, 'list')}
        {renderSection('Responsibilities', job.responsibilities, 'list')}
        {renderBenefits()}
        {renderSimilarJobs()}
      </ScrollView>
      
      {renderApplyButton()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    padding: 8,
    marginRight: 16,
  },
  saveButton: {
    padding: 8,
  },
  companyBanner: {
    height: 180,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'flex-end',
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  logoInitial: {
    fontSize: 24,
    fontWeight: '700',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  companyWebsite: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  statsContent: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  jobDetails: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  jobLocation: {
    fontSize: 14,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionHeader: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listItemText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 140,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  similarJobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  similarJobsContainer: {
    gap: 12,
  },
  similarJobCard: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  similarJobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  similarJobLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  similarLogoInitial: {
    fontSize: 18,
    fontWeight: '700',
  },
  similarJobInfo: {
    flex: 1,
  },
  similarJobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  similarCompany: {
    fontSize: 14,
  },
  similarSalary: {
    fontSize: 16,
    fontWeight: '700',
  },
  applyContainer: {
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  applyButton: {
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});