import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  companyLogo: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected' | 'withdrawn';
  progress: number;
  appliedDate: string;
  nextStep: string;
  matchScore?: number;
}

export default function MyApplicationsScreen() {
  const [activeTab, setActiveTab] = useState('All');

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

  const tabs = ['All', 'Pending', 'Reviewed', 'Interview', 'Rejected'];
  const statusColors = {
    pending: { text: '#F57C00', background: '#FFF3E0' },
    reviewed: { text: '#2196F3', background: '#E3F2FD' },
    interview: { text: '#4CAF50', background: '#E8F5E9' },
    accepted: { text: '#2E7D32', background: '#E8F5E9' },
    rejected: { text: '#F44336', background: '#FFEBEE' },
    withdrawn: { text: '#9E9E9E', background: '#F5F5F5' }
  };

  const mockApplications: Application[] = [
    {
      id: 1,
      jobTitle: 'Experienced Farm Manager',
      company: 'Green Acres Farm',
      companyLogo: 'G',
      status: 'interview',
      progress: 65,
      appliedDate: '2024-01-15',
      nextStep: 'Interview scheduling',
      matchScore: 85
    },
    {
      id: 2,
      jobTitle: 'Veterinary Assistant',
      company: 'County Veterinary Services',
      companyLogo: 'C',
      status: 'reviewed',
      progress: 40,
      appliedDate: '2024-01-12',
      nextStep: 'Document verification',
      matchScore: 72
    },
    {
      id: 3,
      jobTitle: 'Agricultural Sales Representative',
      company: 'Farm Inputs Ltd',
      companyLogo: 'F',
      status: 'pending',
      progress: 25,
      appliedDate: '2024-01-10',
      nextStep: 'Application review',
      matchScore: 68
    },
    {
      id: 4,
      jobTitle: 'Dairy Farm Technician',
      company: 'Happy Cows Dairy',
      companyLogo: 'H',
      status: 'rejected',
      progress: 90,
      appliedDate: '2024-01-08',
      nextStep: 'Application closed',
      matchScore: 55
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { icon: string; text: string }> = {
      pending: { icon: 'hourglass-empty', text: 'In Review' },
      reviewed: { icon: 'visibility', text: 'Reviewed' },
      interview: { icon: 'videocam', text: 'Interview' },
      accepted: { icon: 'check-circle', text: 'Accepted' },
      rejected: { icon: 'cancel', text: 'Rejected' },
      withdrawn: { icon: 'remove-circle', text: 'Withdrawn' }
    };
    return statusMap[status] || { icon: 'help', text: status };
  };

  const renderTabBar = () => (
    <View style={[styles.tabBar, { backgroundColor: colors.white }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
                { borderBottomColor: activeTab === tab ? colors.primaryGreen : 'transparent' }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text 
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.primaryGreen : colors.metadataText }
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderApplicationCard = ({ item }: { item: Application }) => {
    const statusInfo = getStatusInfo(item.status);
    const statusColor = statusColors[item.status as keyof typeof statusColors];
    
    return (
      <View style={[styles.applicationCard, { backgroundColor: colors.white }]}>
        <View style={styles.cardHeader}>
          <View style={styles.companyInfo}>
            <View style={[styles.companyLogo, { backgroundColor: colors.lightGreen }]}>
              <Text style={[styles.logoInitial, { color: colors.primaryGreen }]}>
                {item.companyLogo}
              </Text>
            </View>
            <View style={styles.jobInfo}>
              <Text style={[styles.jobTitle, { color: colors.primaryText }]} numberOfLines={1}>
                {item.jobTitle}
              </Text>
              <Text style={[styles.companyName, { color: colors.metadataText }]} numberOfLines={1}>
                {item.company}
              </Text>
              <Text style={[styles.appliedDate, { color: colors.metadataText }]}>
                Applied: {new Date(item.appliedDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View 
            style={[
              styles.statusBadge,
              { 
                backgroundColor: statusColor.background,
                borderColor: statusColor.text
              }
            ]}
          >
            <MaterialIcons name={statusInfo.icon as any} size={16} color={statusColor.text} />
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
        
        {item.matchScore && (
          <View style={styles.matchScoreContainer}>
            <Text style={[styles.matchLabel, { color: colors.metadataText }]}>Match Score</Text>
            <View style={styles.matchScore}>
              <View 
                style={[
                  styles.scoreCircle,
                  { 
                    backgroundColor: item.matchScore >= 90 ? colors.primaryGreen :
                                   item.matchScore >= 70 ? colors.secondaryGreen :
                                   item.matchScore >= 50 ? colors.lightGreen : colors.borderColor
                  }
                ]}
              >
                <Text style={[styles.scoreText, { color: colors.white }]}>
                  {item.matchScore}%
                </Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.metadataText }]}>Progress</Text>
            <Text style={[styles.progressText, { color: colors.primaryGreen }]}>
              {item.progress}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.borderColor }]}>
            <View 
              style={[
                styles.progressFill,
                { 
                  backgroundColor: colors.primaryGreen,
                  width: `${item.progress}%`
                }
              ]}
            />
          </View>
        </View>
        
        <View style={styles.nextStepContainer}>
          <Text style={[styles.nextStepLabel, { color: colors.metadataText }]}>Next Step</Text>
          <Text style={[styles.nextStepText, { color: colors.primaryText }]}>
            {item.nextStep}
          </Text>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.actionButton, { borderColor: colors.borderColor }]}>
            <Text style={[styles.actionText, { color: colors.primaryText }]}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { borderColor: colors.borderColor }]}>
            <Text style={[styles.actionText, { color: colors.primaryText }]}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="work" size={48} color={colors.metadataText} />
      <Text style={[styles.emptyTitle, { color: colors.primaryText }]}>No applications yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.metadataText }]}>
        Start applying to jobs to see your applications here
      </Text>
      <TouchableOpacity 
        style={[styles.browseButton, { backgroundColor: colors.primaryGreen }]}
      >
        <Text style={styles.browseButtonText}>Browse Jobs</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.metadataText} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primaryText }]}>My Applications</Text>
          <TouchableOpacity>
            <MaterialIcons name="filter-list" size={24} color={colors.metadataText} />
          </TouchableOpacity>
        </View>
      </View>
      
      {renderTabBar()}
      
      <FlatList
        data={mockApplications}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.applicationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  activeTab: {
    borderBottomColor: '#2E7D32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  applicationsList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  applicationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  logoInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    marginBottom: 4,
  },
  appliedDate: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  matchScoreContainer: {
    marginBottom: 16,
  },
  matchLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  matchScore: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  nextStepContainer: {
    marginBottom: 16,
  },
  nextStepLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  nextStepText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});