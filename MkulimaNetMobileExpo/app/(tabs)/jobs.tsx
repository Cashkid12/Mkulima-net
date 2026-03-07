import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { jobsApi } from '../../services/api';

// Color System - Jobs+ Mobile Spec
const colors = {
  white: '#FFFFFF',
  primaryGreen: '#2E7D32',
  secondaryGreen: '#4CAF50',
  lightGreen: '#E8F5E9',
  darkGreen: '#1B5E20',
  darkCharcoal: '#222222',
  mediumGray: '#757575',
  lightGray: '#F5F7FA',
  borderGray: '#E0E0E0',
  orange: '#F57C00',
  blue: '#2196F3',
  red: '#F44336',
};

// Job Types
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  urgent?: boolean;
  featured?: boolean;
  applicants?: number;
  postedAt?: string;
  experience?: string;
  education?: string;
  employerRating?: number;
  employerReviews?: number;
}

// Application Types
type ApplicationStatus = 'pending' | 'in_review' | 'interview' | 'accepted' | 'rejected' | 'withdrawn';

type InterviewMethod = 'in_person' | 'video_call' | 'phone_call' | 'whatsapp';
type InterviewDuration = 30 | 60 | 120;

interface InterviewInvite {
  id: string;
  applicationId: string;
  candidateName: string;
  company: string;
  jobTitle: string;
  date: string;
  time: string;
  duration: InterviewDuration;
  method: InterviewMethod;
  location?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'rescheduled';
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: ApplicationStatus;
  progress?: number;
  interviewDate?: string;
  startDate?: string;
  matchScore?: number;
}

// Mock Applications Data
const mockApplications: Application[] = [
  {
    id: 'app1',
    jobId: '1',
    jobTitle: 'Farm Manager',
    company: 'Green Valley Farms',
    appliedDate: '2 days ago',
    status: 'in_review',
    progress: 70,
  },
  {
    id: 'app2',
    jobId: '2',
    jobTitle: 'Veterinary Officer',
    company: 'KALRO',
    appliedDate: '1 week ago',
    status: 'interview',
    interviewDate: 'May 15, 2024 • 10:00 AM',
    progress: 100,
  },
  {
    id: 'app3',
    jobId: '3',
    jobTitle: 'Harvest Laborer',
    company: "John's Farm",
    appliedDate: '3 days ago',
    status: 'accepted',
    startDate: 'June 1, 2024',
    progress: 100,
  },
  {
    id: 'app4',
    jobId: '7',
    jobTitle: 'Sales Representative',
    company: 'AgriSupply Co.',
    appliedDate: '2 weeks ago',
    status: 'rejected',
    progress: 100,
  },
];

// Mock Interview Invites
const mockInterviewInvites: InterviewInvite[] = [
  {
    id: 'int1',
    applicationId: 'app2',
    candidateName: 'John Mwangi',
    company: 'KALRO',
    jobTitle: 'Veterinary Officer',
    date: 'May 20, 2024',
    time: '10:00 AM',
    duration: 60,
    method: 'video_call',
    location: 'Google Meet',
    message: 'Please bring your portfolio and references. See you then!',
    status: 'pending',
  },
];

// Mock Data - Comprehensive Jobs
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Farm Manager',
    company: 'Green Valley Farms',
    location: 'Nakuru, Kenya',
    salary: 'KES 45,000 - 60,000/month',
    type: 'Full-time',
    description: 'We are looking for an experienced farm manager to oversee our dairy farm operations.',
    requirements: ['5+ years farm management experience', 'Degree in Agriculture', 'Tractor operation skills', 'Staff supervision experience'],
    benefits: ['Health insurance', 'On-farm accommodation', '2 meals per day', 'Training opportunities'],
    urgent: true,
    featured: true,
    applicants: 12,
    postedAt: '2 hours ago',
    experience: '5+ years',
    education: 'Degree in Agriculture',
    employerRating: 4.8,
    employerReviews: 24,
  },
  {
    id: '2',
    title: 'Veterinary Officer',
    company: 'KALRO - Kenya Agricultural Research',
    location: 'Nairobi, Kenya',
    salary: 'KES 50,000/month',
    type: 'Full-time',
    description: 'Join our veterinary team to provide animal health services.',
    requirements: ['Veterinary license', '3+ years experience', 'Large animal expertise'],
    urgent: false,
    featured: false,
    applicants: 8,
    postedAt: '2 days ago',
  },
  {
    id: '3',
    title: 'Harvest Laborer',
    company: "John's Farm",
    location: 'Nakuru, Kenya',
    salary: 'KES 500/day',
    type: 'Seasonal',
    description: 'Help with maize harvest season.',
    requirements: ['Physical fitness', 'Farm experience preferred'],
    urgent: false,
    featured: false,
    applicants: 15,
    postedAt: '5 hours ago',
  },
  {
    id: '4',
    title: 'Agronomist',
    company: 'Kilimo Biashara',
    location: 'Eldoret, Kenya',
    salary: 'KES 55,000 - 80,000/month',
    type: 'Full-time',
    description: 'Provide agronomic advice to smallholder farmers.',
    requirements: ['Degree in Agronomy', '2+ years experience', 'Fertilizer knowledge'],
    urgent: false,
    featured: false,
    applicants: 6,
    postedAt: '1 day ago',
  },
  {
    id: '5',
    title: 'Livestock Manager',
    company: 'Naivasha Dairy Farm',
    location: 'Naivasha, Kenya',
    salary: 'KES 55,000/month',
    type: 'Full-time',
    description: 'Manage dairy herd of 200 cattle.',
    requirements: ['Dairy farming experience', 'Herd management skills'],
    urgent: false,
    featured: false,
    applicants: 4,
    postedAt: '3 days ago',
  },
  {
    id: '6',
    title: 'Equipment Operator',
    company: 'Farm Tech Kenya',
    location: 'Eldoret, Kenya',
    salary: 'KES 45,000/month',
    type: 'Full-time',
    description: 'Operate farm machinery including tractors and harvesters.',
    requirements: ['Tractor license', 'Heavy machinery experience'],
    urgent: false,
    featured: false,
    applicants: 9,
    postedAt: '1 week ago',
  },
  {
    id: '7',
    title: 'Sales Representative',
    company: 'AgroInput Supplies Ltd',
    location: 'Kisumu, Kenya',
    salary: 'KES 40,000 + commission',
    type: 'Full-time',
    description: 'Sell agricultural inputs to farmers.',
    requirements: ['Sales experience', 'Knowledge of agrochemicals'],
    urgent: false,
    featured: false,
    applicants: 11,
    postedAt: '4 days ago',
  },
  {
    id: '8',
    title: 'Processing Plant Supervisor',
    company: 'Highland Foods',
    location: 'Nakuru, Kenya',
    salary: 'KES 60,000/month',
    type: 'Full-time',
    description: 'Oversee food processing operations.',
    requirements: ['Food processing experience', 'Supervision skills', 'HACCP knowledge'],
    urgent: true,
    featured: false,
    applicants: 3,
    postedAt: '6 hours ago',
  },
];

// Category chips
const categories = ['All', 'Farm', 'Vet', 'Management', 'Sales', 'Labor', 'Tech', 'Transport', 'Processing'];

export default function JobsScreen() {
  const { getToken } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [showMyApplications, setShowMyApplications] = useState(false);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [applicationFilter, setApplicationFilter] = useState('All');
  const [interviewInvites, setInterviewInvites] = useState<InterviewInvite[]>(mockInterviewInvites);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: 'May 20, 2024',
    time: '10:00',
    ampm: 'AM',
    duration: 60 as InterviewDuration,
    method: 'video_call' as InterviewMethod,
    location: '',
    message: '',
  });
  const router = useRouter();

  /** Map backend job → our Job interface */
  const mapBackendJob = (j: any): Job => ({
    id: j._id ?? j.id,
    title: j.title || '',
    company: j.companyName || j.employerId?.farmName || 'Company',
    location: j.location?.town
      ? `${j.location.town}, ${j.location.county || 'Kenya'}`
      : typeof j.location === 'string' ? j.location : 'Kenya',
    salary: j.salary
      ? `KES ${j.salary.min?.toLocaleString() || ''}${j.salary.max ? ' - ' + j.salary.max.toLocaleString() : ''}/${j.salary.period || 'month'}`
      : 'Negotiable',
    type: j.jobType || 'Full-time',
    description: j.description || '',
    requirements: j.requiredSkills || [],
    urgent: j.isUrgent || false,
    featured: j.isFeatured || false,
    applicants: j.applicantsCount || 0,
    postedAt: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : '',
    experience: j.experienceRequired || '',
  });

  // Fetch jobs with real API fallback
  const fetchJobs = useCallback(async () => {
    try {
      const token = await getToken();
      
      // Timeout after 5 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const data = await jobsApi.getJobs(token, { limit: 20, signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (data?.jobs && data.jobs.length > 0) {
        setJobs(data.jobs.map(mapBackendJob));
      }
    } catch (error) {
      console.warn('Jobs API failed, keeping mock data:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Fetch my applications
  const fetchApplications = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await jobsApi.getMyApplications(token);
      if (Array.isArray(data) && data.length > 0) {
        setApplications(data.map((a: any) => ({
          id: a._id ?? a.id,
          jobId: a.jobId?._id ?? a.jobId,
          jobTitle: a.jobId?.title || 'Unknown Job',
          company: a.jobId?.companyName || 'Company',
          appliedDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '',
          status: a.status || 'pending',
          progress: a.status === 'accepted' || a.status === 'rejected' ? 100
            : a.status === 'interview' ? 100
            : a.status === 'in_review' ? 70
            : 30,
        })));
      }
    } catch (err) {
      console.warn('Applications API failed:', err);
    }
  }, [getToken]);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [fetchJobs, fetchApplications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    await fetchApplications();
    setRefreshing(false);
  };

  // Filter jobs by category and search
  const filteredJobs = jobs.filter(job => {
    const matchesCategory = selectedCategory === 'All' || 
      job.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      job.company.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredJobs = filteredJobs.filter(job => job.featured);
  const recentJobs = filteredJobs.filter(job => !job.featured).slice(0, 5);

  // Toggle save job
  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  // Handle job press
  const handleJobPress = (job: Job) => {
    setSelectedJob(job);
    setShowDetail(true);
  };

  // Render category chips
  const renderCategoryChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryChip,
            selectedCategory === category && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === category && styles.categoryChipTextActive
          ]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render featured job card
  const renderFeaturedJob = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => handleJobPress(item)}
    >
      <View style={styles.featuredBadge}>
        <MaterialIcons name="star" size={14} color={colors.orange} />
        <Text style={styles.featuredText}>FEATURED</Text>
        {item.urgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>Urgent</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.featuredTitle}>{item.title}</Text>
      <Text style={styles.featuredCompany}>{item.company}</Text>
      
      <View style={styles.jobMetaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="location-on" size={14} color={colors.mediumGray} />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="attach-money" size={14} color={colors.primaryGreen} />
          <Text style={[styles.metaText, { color: colors.primaryGreen, fontWeight: '600' }]}>
            {item.salary}
          </Text>
        </View>
      </View>
      
      <View style={styles.jobMetaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="schedule" size={14} color={colors.mediumGray} />
          <Text style={styles.metaText}>{item.type}</Text>
        </View>
        <Text style={styles.postedText}>Posted {item.postedAt}</Text>
      </View>

      {item.experience && (
        <View style={styles.requirementRow}>
          <MaterialIcons name="work-outline" size={14} color={colors.mediumGray} />
          <Text style={styles.requirementText}>{item.experience} experience</Text>
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => toggleSaveJob(item.id)}
        >
          <MaterialIcons 
            name={savedJobs.has(item.id) ? 'bookmark' : 'bookmark-border'} 
            size={20} 
            color={savedJobs.has(item.id) ? colors.primaryGreen : colors.mediumGray} 
          />
          <Text style={[
            styles.saveText,
            savedJobs.has(item.id) && { color: colors.primaryGreen }
          ]}>
            {savedJobs.has(item.id) ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={() => handleJobPress(item)}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render standard job card
  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => handleJobPress(item)}
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.jobCardInfo}>
          <Text style={styles.jobCardTitle}>{item.title}</Text>
          <Text style={styles.jobCardCompany}>{item.company}</Text>
        </View>
        {item.urgent && (
          <View style={styles.urgentSmallBadge}>
            <Text style={styles.urgentSmallText}>Urgent</Text>
          </View>
        )}
      </View>
      
      <View style={styles.jobCardMeta}>
        <View style={styles.metaItem}>
          <MaterialIcons name="location-on" size={14} color={colors.mediumGray} />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
      </View>
      
      <View style={styles.jobCardMeta}>
        <View style={styles.metaItem}>
          <MaterialIcons name="attach-money" size={14} color={colors.primaryGreen} />
          <Text style={[styles.metaText, { color: colors.primaryGreen, fontWeight: '600' }]}>
            {item.salary}
          </Text>
        </View>
        <Text style={styles.postedText}>{item.postedAt}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.saveButtonSmall}
          onPress={() => toggleSaveJob(item.id)}
        >
          <MaterialIcons 
            name={savedJobs.has(item.id) ? 'bookmark' : 'bookmark-border'} 
            size={18} 
            color={savedJobs.has(item.id) ? colors.primaryGreen : colors.mediumGray} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => handleJobPress(item)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Get status badge styles
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return { bg: '#FFF3E0', color: colors.orange, text: 'PENDING' };
      case 'in_review':
        return { bg: colors.lightGreen, color: colors.primaryGreen, text: 'IN REVIEW' };
      case 'interview':
        return { bg: '#E3F2FD', color: colors.blue, text: 'INTERVIEW SCHEDULED' };
      case 'accepted':
        return { bg: colors.lightGreen, color: colors.darkGreen, text: 'ACCEPTED' };
      case 'rejected':
        return { bg: '#FFEBEE', color: colors.red, text: 'REJECTED' };
      case 'withdrawn':
        return { bg: '#F5F5F5', color: '#9E9E9E', text: 'WITHDRAWN' };
      default:
        return { bg: colors.lightGray, color: colors.mediumGray, text: status };
    }
  };

  // Get status icon
  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'in_review': return 'rate-review';
      case 'interview': return 'chat';
      case 'accepted': return 'check-circle';
      case 'rejected': return 'cancel';
      case 'withdrawn': return 'undo';
      default: return 'help';
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    if (applicationFilter === 'All') return true;
    if (applicationFilter === 'Active') return ['pending', 'in_review', 'interview'].includes(app.status);
    if (applicationFilter === 'Interview') return app.status === 'interview';
    if (applicationFilter === 'Archive') return ['accepted', 'rejected', 'withdrawn'].includes(app.status);
    return true;
  });

  // Render My Applications view
  const renderMyApplications = () => (
    <View style={styles.myApplicationsContainer}>
      {/* Status Tabs */}
      <View style={styles.applicationTabs}>
        {['All', 'Active', 'Interview', 'Archive'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.applicationTab,
              applicationFilter === tab && styles.applicationTabActive
            ]}
            onPress={() => setApplicationFilter(tab)}
          >
            <Text style={[
              styles.applicationTabText,
              applicationFilter === tab && styles.applicationTabTextActive
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Applications List */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.applicationsList}
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          return (
            <View style={styles.applicationCard}>
              <View style={styles.applicationHeader}>
                <View style={styles.applicationInfo}>
                  <Text style={styles.applicationTitle}>{item.jobTitle}</Text>
                  <Text style={styles.applicationCompany}>{item.company}</Text>
                  <Text style={styles.applicationDate}>Applied: {item.appliedDate}</Text>
                </View>
              </View>

              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <MaterialIcons name={getStatusIcon(item.status) as any} size={16} color={badge.color} />
                <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.text}</Text>
              </View>

              {/* Interview Date */}
              {item.interviewDate && (
                <View style={styles.interviewInfo}>
                  <MaterialIcons name="event" size={16} color={colors.blue} />
                  <Text style={styles.interviewDate}>{item.interviewDate}</Text>
                  <TouchableOpacity>
                    <Text style={styles.addToCalendar}>Add to Calendar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Start Date for Accepted */}
              {item.startDate && (
                <View style={styles.startDateInfo}>
                  <MaterialIcons name="work" size={16} color={colors.darkGreen} />
                  <Text style={styles.startDateText}>Start date: {item.startDate}</Text>
                </View>
              )}

              {/* Progress Bar */}
              {item.progress !== undefined && item.progress < 100 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{item.progress}% complete</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.applicationActions}>
                <TouchableOpacity style={styles.viewApplicationButton}>
                  <Text style={styles.viewApplicationText}>View</Text>
                </TouchableOpacity>
                
                {item.status === 'in_review' && (
                  <>
                    <TouchableOpacity
                      style={styles.scheduleInterviewButton}
                      onPress={() => {
                        setSelectedApplication(item);
                        setShowScheduleModal(true);
                      }}
                    >
                      <MaterialIcons name="event-available" size={16} color={colors.white} />
                      <Text style={styles.scheduleInterviewText}>Schedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageEmployerButton}>
                      <MaterialIcons name="chat-bubble-outline" size={16} color={colors.primaryGreen} />
                      <Text style={styles.messageEmployerText}>Message</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {item.status === 'interview' && (
                  <TouchableOpacity
                    style={styles.prepareButton}
                    onPress={() => {
                      setShowInviteModal(true);
                    }}
                  >
                    <Text style={styles.prepareButtonText}>View Invite</Text>
                  </TouchableOpacity>
                )}
                
                {item.status === 'accepted' && (
                  <>
                    <TouchableOpacity style={styles.confirmButton}>
                      <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageEmployerButton}>
                      <MaterialIcons name="chat-bubble-outline" size={16} color={colors.primaryGreen} />
                      <Text style={styles.messageEmployerText}>Message</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {item.status === 'rejected' && (
                  <TouchableOpacity style={styles.applyAgainButton}>
                    <Text style={styles.applyAgainButtonText}>Apply Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyApplications}>
            <MaterialIcons name="assignment" size={64} color={colors.borderGray} />
            <Text style={styles.emptyApplicationsTitle}>No applications yet</Text>
            <Text style={styles.emptyApplicationsSubtitle}>Start applying to jobs to track them here</Text>
          </View>
        }
      />
    </View>
  );

  // Render schedule interview modal (Employer View)
  const renderScheduleInterviewModal = () => (
    <Modal
      visible={showScheduleModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowScheduleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.scheduleModalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.scheduleModalHeader}>
              Schedule Interview with {selectedApplication?.jobTitle} Candidate
            </Text>

            {/* Date */}
            <View style={styles.scheduleFormGroup}>
              <Text style={styles.scheduleLabel}>Date</Text>
              <TextInput
                style={styles.scheduleInput}
                value={scheduleForm.date}
                onChangeText={(text) => setScheduleForm({ ...scheduleForm, date: text })}
                placeholder="May 20, 2024"
                placeholderTextColor={colors.mediumGray}
              />
            </View>

            {/* Time */}
            <View style={styles.scheduleFormGroup}>
              <Text style={styles.scheduleLabel}>Time</Text>
              <View style={styles.scheduleTimeInputs}>
                <TextInput
                  style={[styles.scheduleTimeInput, { flex: 1 }]}
                  value={scheduleForm.time}
                  onChangeText={(text) => setScheduleForm({ ...scheduleForm, time: text })}
                  placeholder="10:00"
                  placeholderTextColor={colors.mediumGray}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[
                    styles.durationOption,
                    scheduleForm.ampm === 'AM' && styles.durationOptionSelected,
                  ]}
                  onPress={() => setScheduleForm({ ...scheduleForm, ampm: 'AM' })}
                >
                  <Text
                    style={[
                      styles.durationOptionText,
                      scheduleForm.ampm === 'AM' && styles.durationOptionTextSelected,
                    ]}
                  >
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.durationOption,
                    scheduleForm.ampm === 'PM' && styles.durationOptionSelected,
                  ]}
                  onPress={() => setScheduleForm({ ...scheduleForm, ampm: 'PM' })}
                >
                  <Text
                    style={[
                      styles.durationOptionText,
                      scheduleForm.ampm === 'PM' && styles.durationOptionTextSelected,
                    ]}
                  >
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Duration */}
            <View style={styles.scheduleFormGroup}>
              <Text style={styles.scheduleLabel}>Duration</Text>
              <View style={styles.durationOptions}>
                {[30, 60, 120].map((dur) => (
                  <TouchableOpacity
                    key={dur}
                    style={[
                      styles.durationOption,
                      scheduleForm.duration === dur && styles.durationOptionSelected,
                    ]}
                    onPress={() => setScheduleForm({ ...scheduleForm, duration: dur as InterviewDuration })}
                  >
                    <Text
                      style={[
                        styles.durationOptionText,
                        scheduleForm.duration === dur && styles.durationOptionTextSelected,
                      ]}
                    >
                      {dur === 30 ? '30 min' : dur === 60 ? '1 hour' : '2 hours'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Interview Method */}
            <View style={styles.scheduleFormGroup}>
              <Text style={styles.scheduleLabel}>Interview Method</Text>
              <View style={styles.methodOptions}>
                {[
                  { key: 'in_person', label: 'In-person', icon: 'location-on' },
                  { key: 'video_call', label: 'Video Call', icon: 'videocam' },
                  { key: 'phone_call', label: 'Phone Call', icon: 'phone' },
                  { key: 'whatsapp', label: 'WhatsApp Video', icon: 'chat' },
                ].map((method) => (
                  <TouchableOpacity
                    key={method.key}
                    style={[
                      styles.methodOption,
                      scheduleForm.method === method.key && styles.methodOptionSelected,
                    ]}
                    onPress={() => setScheduleForm({ ...scheduleForm, method: method.key as InterviewMethod })}
                  >
                    <MaterialIcons
                      name={method.icon as any}
                      size={20}
                      color={scheduleForm.method === method.key ? colors.primaryGreen : colors.mediumGray}
                    />
                    <Text
                      style={[
                        styles.methodOptionText,
                        scheduleForm.method === method.key && { color: colors.primaryGreen },
                      ]}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location (if in-person) */}
            {scheduleForm.method === 'in_person' && (
              <View style={styles.scheduleFormGroup}>
                <Text style={styles.scheduleLabel}>Location</Text>
                <TextInput
                  style={styles.scheduleInput}
                  value={scheduleForm.location}
                  onChangeText={(text) => setScheduleForm({ ...scheduleForm, location: text })}
                  placeholder="Enter location address"
                  placeholderTextColor={colors.mediumGray}
                />
              </View>
            )}

            {/* Message to Candidate */}
            <View style={styles.scheduleFormGroup}>
              <Text style={styles.scheduleLabel}>Message to Candidate</Text>
              <TextInput
                style={styles.scheduleMessageInput}
                value={scheduleForm.message}
                onChangeText={(text) => setScheduleForm({ ...scheduleForm, message: text })}
                placeholder="Please bring your portfolio and references..."
                placeholderTextColor={colors.mediumGray}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Send Invitation Button */}
            <TouchableOpacity
              style={styles.sendInviteButton}
              onPress={() => {
                setShowScheduleModal(false);
                alert('Interview invitation sent successfully!');
              }}
            >
              <Text style={styles.sendInviteButtonText}>Send Invitation</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Render interview invitation modal (Candidate View)
  const renderInviteModal = () => {
    const invite = interviewInvites[0];
    return (
      <Modal
        visible={showInviteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inviteModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inviteModalHeader}>Interview Invitation</Text>

              {/* Company Card */}
              <View style={styles.inviteCompanyCard}>
                <Text style={styles.inviteCompanyName}>{invite.company}</Text>
                <Text style={styles.inviteCompanySubtext}>has invited you for an interview</Text>
              </View>

              {/* Position */}
              <Text style={[styles.scheduleLabel, { marginBottom: 16 }]}>Position: {invite.jobTitle}</Text>

              {/* Interview Details */}
              <View style={styles.inviteDetails}>
                <View style={styles.inviteDetailRow}>
                  <MaterialIcons name="calendar-today" size={20} color={colors.primaryGreen} />
                  <Text style={styles.inviteDetailLabel}>Date:</Text>
                  <Text style={styles.inviteDetailValue}>{invite.date}</Text>
                </View>
                <View style={styles.inviteDetailRow}>
                  <MaterialIcons name="access-time" size={20} color={colors.primaryGreen} />
                  <Text style={styles.inviteDetailLabel}>Time:</Text>
                  <Text style={styles.inviteDetailValue}>{invite.time} EAT</Text>
                </View>
                <View style={styles.inviteDetailRow}>
                  <MaterialIcons name="timer" size={20} color={colors.primaryGreen} />
                  <Text style={styles.inviteDetailLabel}>Duration:</Text>
                  <Text style={styles.inviteDetailValue}>
                    {invite.duration === 60 ? '1 hour' : invite.duration === 30 ? '30 minutes' : '2 hours'}
                  </Text>
                </View>
                <View style={styles.inviteDetailRow}>
                  <MaterialIcons name="videocam" size={20} color={colors.primaryGreen} />
                  <Text style={styles.inviteDetailLabel}>Method:</Text>
                  <Text style={styles.inviteDetailValue}>
                    {invite.method === 'video_call' ? 'Video Call (Google Meet)' :
                     invite.method === 'in_person' ? 'In-person' :
                     invite.method === 'phone_call' ? 'Phone Call' : 'WhatsApp Video'}
                  </Text>
                </View>
              </View>

              {/* Message from Employer */}
              {invite.message && (
                <View style={styles.inviteMessageSection}>
                  <Text style={styles.inviteMessageLabel}>Message from employer:</Text>
                  <Text style={styles.inviteMessage}>"{invite.message}"</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.inviteActions}>
                <TouchableOpacity
                  style={styles.inviteAcceptButton}
                  onPress={() => {
                    setShowInviteModal(false);
                    alert('Interview accepted! Added to calendar.');
                  }}
                >
                  <MaterialIcons name="check" size={16} color={colors.white} />
                  <Text style={styles.inviteActionText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.inviteRescheduleButton}
                  onPress={() => setShowInviteModal(false)}
                >
                  <MaterialIcons name="schedule" size={16} color={colors.white} />
                  <Text style={styles.inviteActionText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.inviteDeclineButton}
                  onPress={() => setShowInviteModal(false)}
                >
                  <MaterialIcons name="close" size={16} color={colors.white} />
                  <Text style={styles.inviteActionText}>Decline</Text>
                </TouchableOpacity>
              </View>

              {/* Add to Calendar Button */}
              <TouchableOpacity
                style={styles.addToCalendarButton}
                onPress={() => alert('Added to calendar!')}
              >
                <MaterialIcons name="event" size={20} color={colors.white} />
                <Text style={styles.addToCalendarText}>Add to Calendar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render job detail modal
  const renderJobDetail = () => (
    <Modal
      visible={showDetail}
      animationType="slide"
      onRequestClose={() => setShowDetail(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowDetail(false)}>
            <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Job Details</Text>
          <View style={styles.modalHeaderActions}>
            <TouchableOpacity onPress={() => toggleSaveJob(selectedJob?.id || '')}>
              <MaterialIcons 
                name={savedJobs.has(selectedJob?.id || '') ? 'bookmark' : 'bookmark-border'} 
                size={24} 
                color={colors.primaryGreen} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 16 }}>
              <MaterialIcons name="share" size={24} color={colors.mediumGray} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {selectedJob && (
            <>
              {/* Job Title Section */}
              <View style={styles.detailTitleSection}>
                <Text style={styles.detailTitle}>{selectedJob.title}</Text>
                <Text style={styles.detailCompany}>{selectedJob.company}</Text>
                <View style={styles.ratingRow}>
                  <MaterialIcons name="star" size={16} color={colors.orange} />
                  <Text style={styles.ratingText}>{selectedJob.employerRating} ({selectedJob.employerReviews} reviews)</Text>
                  <MaterialIcons name="verified" size={16} color={colors.primaryGreen} />
                  <Text style={[styles.ratingText, { color: colors.primaryGreen }]}>Verified</Text>
                </View>
              </View>

              {/* Job Overview Cards */}
              <View style={styles.overviewCards}>
                <View style={styles.overviewCard}>
                  <MaterialIcons name="location-on" size={24} color={colors.primaryGreen} />
                  <Text style={styles.overviewValue}>{selectedJob.location.split(',')[0]}</Text>
                  <Text style={styles.overviewLabel}>Location</Text>
                </View>
                <View style={styles.overviewCard}>
                  <MaterialIcons name="attach-money" size={24} color={colors.primaryGreen} />
                  <Text style={styles.overviewValue}>{selectedJob.salary.split('/')[0]}</Text>
                  <Text style={styles.overviewLabel}>Salary</Text>
                </View>
                <View style={styles.overviewCard}>
                  <MaterialIcons name="schedule" size={24} color={colors.primaryGreen} />
                  <Text style={styles.overviewValue}>{selectedJob.type}</Text>
                  <Text style={styles.overviewLabel}>Type</Text>
                </View>
                <View style={styles.overviewCard}>
                  <MaterialIcons name="people" size={24} color={colors.primaryGreen} />
                  <Text style={styles.overviewValue}>{selectedJob.applicants}</Text>
                  <Text style={styles.overviewLabel}>Applicants</Text>
                </View>
              </View>

              {/* About Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ABOUT THE JOB</Text>
                <Text style={styles.sectionText}>{selectedJob.description}</Text>
              </View>

              {/* Requirements Section */}
              {selectedJob.requirements && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>REQUIREMENTS</Text>
                  {selectedJob.requirements.map((req, index) => (
                    <View key={index} style={styles.listItem}>
                      <MaterialIcons name="check-circle" size={18} color={colors.primaryGreen} />
                      <Text style={styles.listItemText}>{req}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Benefits Section */}
              {selectedJob.benefits && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>BENEFITS</Text>
                  {selectedJob.benefits.map((benefit, index) => (
                    <View key={index} style={styles.listItem}>
                      <MaterialIcons name="check" size={18} color={colors.darkGreen} />
                      <Text style={styles.listItemText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* About Employer */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ABOUT THE EMPLOYER</Text>
                <View style={styles.employerCard}>
                  <Text style={styles.employerName}>{selectedJob.company}</Text>
                  <Text style={styles.employerInfo}>Established 2010 • 200 employees</Text>
                  <View style={styles.employerRating}>
                    <MaterialIcons name="star" size={16} color={colors.orange} />
                    <Text style={styles.employerRatingText}>{selectedJob.employerRating} ({selectedJob.employerReviews} jobs posted)</Text>
                  </View>
                  <TouchableOpacity style={styles.visitProfileButton}>
                    <Text style={styles.visitProfileText}>Visit Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ height: 100 }} />
            </>
          )}
        </ScrollView>

        {/* Sticky Apply Bar */}
        <View style={styles.stickyApplyBar}>
          <View style={styles.salaryHighlight}>
            <MaterialIcons name="attach-money" size={20} color={colors.primaryGreen} />
            <Text style={styles.salaryText}>{selectedJob?.salary}</Text>
          </View>
          <TouchableOpacity
            style={styles.applyNowButton}
            onPress={async () => {
              if (!selectedJob) return;
              try {
                const token = await getToken();
                await jobsApi.applyToJob(selectedJob.id, { message: '' }, token);
                setShowDetail(false);
              } catch (err) {
                console.warn('Apply API failed:', err);
              }
            }}
          >
            <Text style={styles.applyNowText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{showMyApplications ? 'My Applications' : 'Jobs+'}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.myAppsButton}
              onPress={() => setShowMyApplications(!showMyApplications)}
            >
              <MaterialIcons 
                name={showMyApplications ? 'work' : 'assignment-ind'} 
                size={24} 
                color={showMyApplications ? colors.white : colors.primaryGreen} 
              />
              <Text style={[
                styles.myAppsButtonText,
                showMyApplications && styles.myAppsButtonTextActive
              ]}>
                {showMyApplications ? 'Jobs' : 'My Apps'}
              </Text>
            </TouchableOpacity>
            {!showMyApplications && (
              <TouchableOpacity style={styles.notificationButton}>
                <MaterialIcons name="notifications-none" size={24} color={colors.darkCharcoal} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      {showMyApplications ? (
        renderMyApplications()
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color={colors.primaryGreen} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search jobs, skills, location..."
                placeholderTextColor={colors.mediumGray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity>
                <MaterialIcons name="mic" size={20} color={colors.mediumGray} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Chips */}
          {renderCategoryChips()}

          {/* Jobs List */}
          <FlatList
            data={filteredJobs}
            renderItem={({ item }) => item.featured ? renderFeaturedJob({ item }) : renderJobCard({ item })}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={[colors.primaryGreen]} 
              />
            }
            ListHeaderComponent={
              featuredJobs.length > 0 ? (
                <View style={styles.sectionWrapper}>
                  <Text style={styles.sectionHeaderTitle}>FEATURED JOBS</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="work-off" size={64} color={colors.borderGray} />
                <Text style={styles.emptyTitle}>No jobs found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
              </View>
            }
          />

          {/* Post Job FAB */}
          <TouchableOpacity style={styles.fab}>
            <MaterialIcons name="add" size={28} color={colors.white} />
          </TouchableOpacity>
        </>
      )}

      {/* Job Detail Modal */}
      {renderJobDetail()}

      {/* Schedule Interview Modal (Employer View) */}
      {renderScheduleInterviewModal()}

      {/* Interview Invitation Modal (Candidate View) */}
      {renderInviteModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  // Header
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.darkCharcoal,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  myAppsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  myAppsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primaryGreen,
  },
  myAppsButtonTextActive: {
    color: colors.white,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryGreen,
  },

  // Search
  searchContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
    color: colors.darkCharcoal,
  },

  // Categories
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mediumGray,
  },
  categoryChipTextActive: {
    color: colors.white,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionWrapper: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 12,
  },

  // Featured Card
  featuredCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.darkCharcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryGreen,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.orange,
    marginLeft: 4,
  },
  urgentBadge: {
    backgroundColor: colors.red,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkCharcoal,
    marginBottom: 4,
  },
  featuredCompany: {
    fontSize: 14,
    color: colors.primaryGreen,
    marginBottom: 12,
  },
  jobMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: colors.mediumGray,
    marginLeft: 4,
  },
  postedText: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 13,
    color: colors.mediumGray,
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveButtonSmall: {
    padding: 8,
  },
  saveText: {
    fontSize: 14,
    color: colors.mediumGray,
    marginLeft: 4,
  },
  applyButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    borderWidth: 1,
    borderColor: colors.primaryGreen,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewButtonText: {
    color: colors.primaryGreen,
    fontSize: 14,
    fontWeight: '500',
  },

  // Standard Job Card
  jobCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.darkCharcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobCardInfo: {
    flex: 1,
  },
  jobCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 2,
  },
  jobCardCompany: {
    fontSize: 14,
    color: colors.primaryGreen,
  },
  urgentSmallBadge: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgentSmallText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.darkGreen,
  },
  jobCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.mediumGray,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 8,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.darkCharcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailTitleSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.darkCharcoal,
    marginBottom: 4,
  },
  detailCompany: {
    fontSize: 16,
    color: colors.primaryGreen,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.mediumGray,
    marginRight: 12,
  },

  // Overview Cards
  overviewCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  overviewCard: {
    width: '48%',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },

  // Sections
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: colors.mediumGray,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 15,
    color: colors.darkCharcoal,
    marginLeft: 8,
    flex: 1,
  },

  // Employer Card
  employerCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  employerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 4,
  },
  employerInfo: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 8,
  },
  employerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  employerRatingText: {
    fontSize: 14,
    color: colors.mediumGray,
    marginLeft: 4,
  },
  visitProfileButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primaryGreen,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  visitProfileText: {
    color: colors.primaryGreen,
    fontWeight: '500',
  },

  // Sticky Apply Bar
  stickyApplyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    shadowColor: colors.darkCharcoal,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  salaryHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryGreen,
    marginLeft: 4,
  },
  applyNowButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  applyNowText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // My Applications
  myApplicationsContainer: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  applicationTabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  applicationTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  applicationTabActive: {
    backgroundColor: colors.primaryGreen,
  },
  applicationTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mediumGray,
  },
  applicationTabTextActive: {
    color: colors.white,
  },
  applicationsList: {
    padding: 16,
  },
  applicationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.darkCharcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  applicationInfo: {
    flex: 1,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 2,
  },
  applicationCompany: {
    fontSize: 14,
    color: colors.primaryGreen,
    marginBottom: 2,
  },
  applicationDate: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  interviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  interviewDate: {
    fontSize: 14,
    color: colors.blue,
    flex: 1,
  },
  addToCalendar: {
    fontSize: 12,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  startDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  startDateText: {
    fontSize: 14,
    color: colors.darkGreen,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.borderGray,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primaryGreen,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  viewApplicationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewApplicationText: {
    fontSize: 14,
    color: colors.mediumGray,
    fontWeight: '500',
  },
  messageEmployerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.primaryGreen,
    borderRadius: 16,
    gap: 4,
  },
  messageEmployerText: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  scheduleInterviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryGreen,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  scheduleInterviewText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  prepareButton: {
    backgroundColor: colors.blue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  prepareButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: colors.darkGreen,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  confirmButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  applyAgainButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  applyAgainButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  emptyApplications: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyApplicationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginTop: 16,
  },
  emptyApplicationsSubtitle: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 8,
  },
  // Interview Scheduling Styles
  scheduleModalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  scheduleModalHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkCharcoal,
    marginBottom: 20,
    textAlign: 'center',
  },
  scheduleFormGroup: {
    marginBottom: 20,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 8,
  },
  scheduleInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.darkCharcoal,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  scheduleInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleTimeInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleTimeInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.darkCharcoal,
    borderWidth: 1,
    borderColor: colors.borderGray,
    textAlign: 'center',
    minWidth: 70,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  durationOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderGray,
    alignItems: 'center',
  },
  durationOptionSelected: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.lightGreen,
  },
  durationOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mediumGray,
  },
  durationOptionTextSelected: {
    color: colors.primaryGreen,
  },
  methodOptions: {
    gap: 12,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderGray,
    gap: 12,
  },
  methodOptionSelected: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.lightGreen,
  },
  methodOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkCharcoal,
  },
  scheduleMessageInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: colors.darkCharcoal,
    borderWidth: 1,
    borderColor: colors.borderGray,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendInviteButton: {
    backgroundColor: colors.primaryGreen,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  sendInviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  // Candidate Invite Modal
  inviteModalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  inviteModalHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.darkCharcoal,
    marginBottom: 16,
    textAlign: 'center',
  },
  inviteCompanyCard: {
    backgroundColor: colors.lightGreen,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  inviteCompanyName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginBottom: 4,
  },
  inviteCompanySubtext: {
    fontSize: 14,
    color: colors.darkGreen,
  },
  inviteDetails: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inviteDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  inviteDetailLabel: {
    fontSize: 14,
    color: colors.mediumGray,
    width: 80,
  },
  inviteDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    flex: 1,
  },
  inviteMessageSection: {
    marginBottom: 20,
  },
  inviteMessageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 8,
  },
  inviteMessage: {
    fontSize: 14,
    color: colors.mediumGray,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inviteAcceptButton: {
    flex: 1,
    backgroundColor: colors.primaryGreen,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  inviteRescheduleButton: {
    flex: 1,
    backgroundColor: colors.orange,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  inviteDeclineButton: {
    flex: 1,
    backgroundColor: colors.red,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  inviteActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 4,
  },
  addToCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  addToCalendarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
