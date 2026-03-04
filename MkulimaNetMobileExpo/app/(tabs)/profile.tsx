import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  FlatList,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

// Types
interface Badge {
  id: string;
  icon: string;
  label: string;
  verified: boolean;
}

interface Stat {
  value: string;
  label: string;
}

// Mock data
const mockCrops = [
  { id: '1', icon: 'leaf', name: 'Maize', acres: 8, harvest: 'May', note: 'Top Quality', tag: 'star' },
  { id: '2', icon: 'leaf', name: 'Potatoes', acres: 3, harvest: 'Aug', note: '' },
  { id: '3', icon: 'leaf', name: 'Carrots', acres: 0.5, harvest: 'Year Round', note: '', tag: 'sync' },
  { id: '4', icon: 'leaf', name: 'Onions', acres: 1, harvest: 'Seasonal', note: 'Intercropped' },
  { id: '5', icon: 'leaf', name: 'Herbs', acres: 0.2, harvest: 'Year Round', note: 'Organic Certified', tag: 'checkmark-circle' },
  { id: '6', icon: 'leaf', name: 'Tomatoes', acres: 0.3, harvest: 'Year Round', note: 'Greenhouse', tag: 'home' },
];

const mockLivestock = [
  { id: '1', icon: 'paw', name: 'Dairy Cattle', breed: 'Fresian', count: '24 (12 milking, 12 young)', production: '22L/day per cow', health: 'Vaccinated, Dewormed' },
  { id: '2', icon: 'paw', name: 'Sheep', breed: 'Dorper', count: '45', production: 'Meat + Breeding', health: 'Vaccinated' },
  { id: '3', icon: 'paw', name: 'Poultry', breed: 'Kuroiler', count: '200 layers, 50 broilers', production: '180 eggs/day', health: 'Vaccinated' },
];

const mockEducation = [
  { id: '1', icon: 'school', title: 'Bachelor of Science in Agriculture', school: 'University of Nairobi', year: '2015 - 2019', grade: 'Second Class Upper', major: 'Crop Protection', thesis: 'Maize Yield Optimization', cert: true },
  { id: '2', icon: 'school', title: 'Diploma in Livestock Management', school: 'Egerton University', year: '2013 - 2015', grade: 'Credit', major: 'Dairy Science', cert: true },
  { id: '3', icon: 'document-text', title: 'Certificate in Farm Business', school: 'KALRO', year: '2022', grade: '', cert: true },
];

type TabName = 'about' | 'crops' | 'livestock' | 'education' | 'certifications' | 'skills' | 'experience' | 'portfolio' | 'posts' | 'reviews' | 'jobs' | 'marketplace' | 'achievements' | 'connected' | 'analytics';

// Mock data for new tabs
const mockCertifications = [
  { id: '1', title: 'Certified Agricultural Advisor', org: 'Agriculture Authority', year: '2023', license: 'AAK-2023-4567', validUntil: 'Dec 2025', status: 'verified' },
  { id: '2', title: 'Pesticide Handling License', org: 'Pest Control Board', year: '2024', license: 'PCB-24-8901', validUntil: 'Dec 2024', status: 'expiring', renewalDue: '3 months' },
  { id: '3', title: 'Organic Farming Certification', org: 'Pending Verification', year: '2024', license: '', validUntil: '', status: 'pending', submitted: 'April 15, 2024', expected: 'May 30, 2024' },
];

const mockSkills = {
  technical: [
    { name: 'Crop Farming', years: 12, icon: 'leaf' },
    { name: 'Dairy Mgmt', years: 8, icon: 'paw' },
    { name: 'Soil Testing', years: 5, icon: 'flask' },
    { name: 'Irrigation', years: 7, icon: 'water' },
    { name: 'Tractor Operator', years: 4, icon: 'construct' },
    { name: 'Farm Planning', years: 3, icon: 'clipboard' },
    { name: 'Pest Control', years: 6, icon: 'leaf' },
    { name: 'Animal Breeding', years: 4, icon: 'paw' },
  ],
  soft: [
    { name: 'Leadership', years: 9, icon: 'people' },
    { name: 'Training', years: 6, icon: 'megaphone' },
    { name: 'Negotiation', years: 7, icon: 'hand-left' },
    { name: 'Business Plan', years: 5, icon: 'trending-up' },
    { name: 'Community', years: 8, icon: 'globe' },
    { name: 'Problem Solving', years: 6, icon: 'bulb' },
  ],
};

const mockExperience = [
  { id: '1', title: 'Farm Manager', company: 'Green Valley Farms', startDate: 'Jan 2020', endDate: 'Present', duration: '4 yrs 3 mos', location: 'Nakuru, Kenya', highlights: ['Manage 50 dairy cattle', 'Supervise 12 farm workers', 'Increased milk prod by 35%', 'Implemented rotational grazing'], endorsements: 24 },
  { id: '2', title: 'Agricultural Extension Officer', company: 'Ministry of Agriculture', startDate: 'Mar 2018', endDate: 'Dec 2019', duration: '1 yr 9 mos', location: 'Baringo, Kenya', highlights: ['Trained 200+ farmers', 'Coordinated seed distribution', 'Organized farmer field days'], endorsements: 0, reference: true },
];

const mockPortfolio = [
  { id: '1', title: 'Sustainable Irrigation', description: 'Installed drip irrigation for 5-acre vegetable farm. Reduced water usage by 40% while increasing yield by 25%.' },
  { id: '2', title: 'Dairy Modernization', description: 'Upgraded to milking machine and cooling tank. Production +60%.' },
  { id: '3', title: 'Farmer Training Program', description: 'Conducted workshops for 150+ smallholder farmers on best practices.' },
];

const mockReviews = {
  overall: 4.8,
  total: 124,
  breakdown: [89, 25, 7, 2, 1],
  categories: [
    { name: 'Knowledge', rating: 4.9 },
    { name: 'Communication', rating: 4.8 },
    { name: 'Reliability', rating: 4.7 },
    { name: 'Value', rating: 4.9 },
  ],
  recent: [
    { id: '1', name: 'James Kariuki', role: 'Buyer', rating: 5, time: '2 weeks ago', text: 'John provided excellent advice on maize farming. My yield doubled this season!', helpful: 5 },
    { id: '2', name: 'Mary Wanjiku', role: 'Farmer', rating: 4, time: '1 month ago', text: 'Good knowledge but response was a bit slow. Still helpful.', helpful: 2 },
    { id: '3', name: 'Peter Kamau', role: 'Recruiter', rating: 5, time: '2 months ago', text: 'Hired John as farm manager. Excellent worker, highly skilled', helpful: 8 },
  ],
};

const mockJobs = {
  applications: [
    { id: '1', title: 'Farm Manager', company: 'Green Valley Farms', applied: '2 days ago', status: 'In Review', statusColor: '#4CAF50' },
    { id: '2', title: 'Vet Officer', company: 'KALRO', applied: '1 week ago', status: 'Interview May 20', statusColor: '#2196F3' },
  ],
  hired: [
    { id: '3', title: 'Harvest Labor', company: 'John\'s Farm', completed: 'April 2024', status: 'Completed', statusColor: '#4CAF50' },
  ],
  saved: [
    { id: '4', title: 'Agronomist', company: 'Kilimo Biashara', saved: '3 days ago' },
  ],
};

const mockMarketplace = {
  selling: [
    { id: '1', item: 'Maize Seeds (10 bags)', price: 'KES 25,000', time: '3 days ago', buyer: '@johnfarmer', buyerRating: 5 },
    { id: '2', item: 'Dairy Cow', price: 'KES 45,000', time: '1 week ago', buyer: '@maryfarmer', buyerRating: 4 },
  ],
  purchasing: [
    { id: '1', item: 'Fertilizer', price: 'KES 3,200', time: '2 weeks ago', seller: '@agrovet', status: 'Delivered' },
  ],
  activeListings: [
    { id: '1', item: 'Maize Seeds', price: 'KES 2,500/bag', views: 12, interested: 3 },
  ],
};

const mockAchievements = {
  earned: [
    { id: '1', icon: 'ribbon', title: 'Top Seller', desc: '' },
    { id: '2', icon: 'leaf', title: 'Early', desc: 'Adopter' },
    { id: '3', icon: 'hand-left', title: 'Top', desc: 'Mentor' },
    { id: '4', icon: 'trending-up', title: 'Rising', desc: 'Star' },
    { id: '5', icon: 'checkmark-circle', title: 'Verified', desc: 'Pro' },
    { id: '6', icon: 'chatbubbles', title: 'Top', desc: 'Contributor' },
    { id: '7', icon: 'globe', title: 'Community', desc: 'Leader' },
    { id: '8', icon: 'flash', title: 'Rapid', desc: 'Growth' },
  ],
  locked: [
    { id: '1', icon: 'lock-closed', title: 'Expert', desc: 'Verified' },
    { id: '2', icon: 'lock-closed', title: 'Master', desc: 'Farmer' },
    { id: '3', icon: 'lock-closed', title: 'Inno', desc: 'vator' },
  ],
  progress: { current: 45, target: 50, label: 'Top Contributor', remaining: 5 },
};

const mockConnectedAccounts = {
  connected: [
    { id: '1', platform: 'Google', email: 'john.mwangi@gmail.com', icon: 'logo-google', color: '#EA4335' },
    { id: '2', platform: 'Apple', email: 'john@icloud.com', icon: 'logo-apple', color: '#000000' },
    { id: '3', platform: 'WhatsApp', phone: '+254 712 345 678', icon: 'logo-whatsapp', color: '#25D366' },
  ],
  available: [
    { id: '4', platform: 'Facebook', handle: '/john.mwangi.farmer', icon: 'logo-facebook', color: '#1877F2' },
    { id: '5', platform: 'Twitter/X', handle: '@johnfarmer', icon: 'logo-twitter', color: '#1DA1F2' },
    { id: '6', platform: 'Instagram', handle: '@greenvalleyfarm', icon: 'logo-instagram', color: '#E4405F' },
  ],
};

const mockAnalytics = {
  overview: [
    { value: '1,247', label: 'Views', sublabel: 'This Month' },
    { value: '45', label: 'New', sublabel: 'Followers' },
    { value: '892', label: 'Com', sublabel: 'ments' },
    { value: '2,847', label: 'Reactions', sublabel: '' },
  ],
  growth: { percent: 12, newFollowers: 45 },
  topPosts: [
    { title: 'Maize Harvest', views: 1247 },
    { title: 'Irrigation Tips', views: 980 },
    { title: 'New Calves', views: 856 },
    { title: 'Soil Testing', views: 723 },
    { title: 'Fertilizer Guide', views: 654 },
  ],
  audience: { farmers: 45, buyers: 28, experts: 15, recruiters: 12 },
  locations: [
    { name: 'Nakuru', percent: 35 },
    { name: 'Nairobi', percent: 28 },
    { name: 'Eldoret', percent: 15 },
    { name: 'Mombasa', percent: 12 },
    { name: 'Kisumu', percent: 10 },
  ],
  engagement: { avgPerPost: 59, reactionRate: 4.2, commentRate: 1.8, shareRate: 0.9, bestTime: '8:00 AM' },
};

const tabs: { key: TabName; label: string }[] = [
  { key: 'about', label: 'About' },
  { key: 'crops', label: 'Crops' },
  { key: 'livestock', label: 'Livestock' },
  { key: 'education', label: 'Education' },
  { key: 'certifications', label: 'Certs' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'posts', label: 'Posts' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'marketplace', label: 'Market' },
  { key: 'achievements', label: 'Badges' },
  { key: 'connected', label: 'Connected' },
  { key: 'analytics', label: 'Analytics' },
];

// Stats - will be populated from profileData
const mockStats: Stat[] = [
  { value: '0', label: 'Followers' },
  { value: '0', label: 'Following' },
  { value: '0', label: 'Posts' },
  { value: '0', label: 'Rating' },
];

const mockBadges: Badge[] = [
  { id: '1', icon: 'checkmark-circle', label: 'ID Verified', verified: true },
  { id: '2', icon: 'phone-portrait', label: 'Phone Verified', verified: true },
  { id: '3', icon: 'mail', label: 'Email Verified', verified: true },
  { id: '4', icon: 'star', label: 'Top Contributor', verified: true },
];

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { getToken, signOut: clerkSignOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabName>('about');
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch profile data from backend
  const fetchProfileData = async () => {
    try {
      const token = await getToken();
      const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        // Use mock data if API fails
        console.log('Profile API failed, using mock data');
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfileData();
    }
  }, [isLoaded, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData().then(() => setRefreshing(false));
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await clerkSignOut();
              router.replace('/welcome');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (!isLoaded || loadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading profile...</Text>
      </View>
    );
  }

  // Use real profile data when available, fallback to Clerk data
  const displayName = profileData?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const displayUsername = profileData?.username || user?.username || user?.firstName?.toLowerCase() || 'user';
  const displayBio = profileData?.bio || profileData?.about || '';
  const displayLocation = profileData?.location || user?.publicMetadata?.location as string || 'Kenya';
  const displayPhone = profileData?.phone || user?.phoneNumbers?.[0]?.phoneNumber || '';
  const displayEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  const isVerified = profileData?.isVerified || user?.publicMetadata?.verified || false;
  
  // Stats from profile data or defaults
  const followers = profileData?.followersCount || profileData?.stats?.followers || 1247;
  const following = profileData?.followingCount || profileData?.stats?.following || 342;
  const posts = profileData?.postsCount || profileData?.stats?.posts || 89;
  const rating = profileData?.rating || 4.8;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.tabContent}>
            {/* Bio / About Me */}
            <View style={styles.cardSection}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>About Me</Text>
                <TouchableOpacity onPress={() => Alert.alert('Edit', 'Edit Bio')}>
                  <Ionicons name="pencil" size={18} color="#2E7D32" />
                </TouchableOpacity>
              </View>
              <Text style={styles.bioText}>
                4th generation farmer from Nakuru with 8+ years experience in dairy and crop farming. Passionate about sustainable agriculture and helping smallholder farmers increase yield.
              </Text>

              <View style={styles.bulletSection}>
                <Text style={styles.bulletTitle}>Specialties:</Text>
                <Text style={styles.bulletItem}>Organic Farming</Text>
                <Text style={styles.bulletItem}>Soil Conservation</Text>
                <Text style={styles.bulletItem}>Dairy Management</Text>
                <Text style={styles.bulletItem}>Pest Control</Text>
              </View>

              <View style={styles.bulletSection}>
                <Text style={styles.bulletTitle}>Currently looking for:</Text>
                <Text style={styles.bulletItem}>Farm management opportunities</Text>
              </View>

              <View style={styles.bulletSection}>
                <Text style={styles.bulletTitle}>Languages:</Text>
                <Text style={styles.bulletItem}>English, Swahili, Kikuyu</Text>
              </View>
            </View>

            {/* Personal Information */}
            <View style={styles.cardSection}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Personal Information</Text>
                <TouchableOpacity onPress={() => Alert.alert('Edit', 'Edit Info')}>
                  <Ionicons name="pencil" size={18} color="#2E7D32" />
                </TouchableOpacity>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="mail-outline" size={16} color="#757575" />
                  <Text style={styles.infoText}>john@example.com</Text>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={16} color="#757575" />
                  <Text style={styles.infoText}>+254 712 345 678</Text>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={16} color="#757575" />
                  <Text style={styles.infoText}>Nakuru, Kenya</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={16} color="#757575" />
                  <Text style={styles.infoText}>Born: May 15, 1985 (39 yrs)</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="card-outline" size={16} color="#757575" />
                  <Text style={styles.infoText}>ID: Verified</Text>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="heart-outline" size={16} color="#757575" />
                  <Text style={styles.infoText}>Marital: Married</Text>
                </View>
              </View>
            </View>

            {/* Farm Details */}
            <View style={styles.cardSection}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Farm Information</Text>
                <TouchableOpacity onPress={() => Alert.alert('Edit', 'Edit Farm')}>
                  <Ionicons name="pencil" size={18} color="#2E7D32" />
                </TouchableOpacity>
              </View>
              <View style={styles.farmGrid}>
                <View style={styles.farmRow}>
                  <Text style={styles.farmLabel}>Farm Name</Text>
                  <Text style={styles.farmValue}>Green Valley Farm</Text>
                </View>
                <View style={styles.farmRow}>
                  <Text style={styles.farmLabel}>Established</Text>
                  <Text style={styles.farmValue}>2010</Text>
                </View>
                <View style={styles.farmRow}>
                  <Text style={styles.farmLabel}>Farm Size</Text>
                  <Text style={styles.farmValue}>12 acres</Text>
                </View>
                <View style={styles.farmRow}>
                  <Text style={styles.farmLabel}>Ownership</Text>
                  <Text style={styles.farmValue}>Family-owned</Text>
                </View>
                <View style={styles.farmRow}>
                  <Text style={styles.farmLabel}>Water Source</Text>
                  <Text style={styles.farmValue}>Borehole + Rainwater</Text>
                </View>
                <View style={styles.farmRow}>
                  <Text style={styles.farmLabel}>Soil Type</Text>
                  <Text style={styles.farmValue}>Volcanic loam</Text>
                </View>
                <View style={styles.farmRow}>
                  <Text style={styles.farmLabel}>Altitude</Text>
                  <Text style={styles.farmValue}>2,100m above sea level</Text>
                </View>
                <View style={styles.farmRow}>
                  <Text style={styles.farmLabel}>Climate Zone</Text>
                  <Text style={styles.farmValue}>Highlands - Cool/Wet</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'crops':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Crops Produced</Text>
              <TouchableOpacity onPress={() => Alert.alert('Add', 'Add Crop')}>
                <Ionicons name="add-circle" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
            <View style={styles.cropsGrid}>
              {mockCrops.map((crop) => (
                <View key={crop.id} style={styles.cropCard}>
                  <Ionicons name={crop.icon as any} size={28} color="#4CAF50" />
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <Text style={styles.cropAcres}>{crop.acres} acres</Text>
                  <Text style={styles.cropHarvest}>Harvest: {crop.harvest}</Text>
                  {crop.note && <Text style={styles.cropNote}>{crop.note}</Text>}
                  {crop.tag && <Ionicons name={crop.tag as any} size={14} color="#4CAF50" />}
                </View>
              ))}
            </View>
          </View>
        );

      case 'livestock':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Livestock Raised</Text>
              <TouchableOpacity onPress={() => Alert.alert('Add', 'Add Livestock')}>
                <Ionicons name="add-circle" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
            {mockLivestock.map((animal) => (
              <View key={animal.id} style={styles.livestockCard}>
                <View style={styles.livestockHeader}>
                  <Ionicons name={animal.icon as any} size={32} color="#4CAF50" />
                  <View style={styles.livestockInfo}>
                    <Text style={styles.livestockName}>{animal.name}</Text>
                    <Text style={styles.livestockBreed}>{animal.breed}</Text>
                  </View>
                </View>
                <View style={styles.livestockDetail}>
                  <Text style={styles.livestockLabel}>Count:</Text>
                  <Text style={styles.livestockValue}>{animal.count}</Text>
                </View>
                <View style={styles.livestockDetail}>
                  <Text style={styles.livestockLabel}>Production:</Text>
                  <Text style={styles.livestockValue}>{animal.production}</Text>
                </View>
                <View style={styles.livestockDetail}>
                  <Text style={styles.livestockLabel}>Health:</Text>
                  <Text style={styles.livestockHealth}>{animal.health}</Text>
                </View>
                <TouchableOpacity style={styles.viewRecordsBtn}>
                  <Text style={styles.viewRecordsText}>View Records</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'education':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Education History</Text>
              <TouchableOpacity onPress={() => Alert.alert('Add', 'Add Education')}>
                <Ionicons name="add-circle" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
            {mockEducation.map((edu) => (
              <View key={edu.id} style={styles.educationCard}>
                <View style={styles.educationHeader}>
                  <Ionicons name={edu.icon as any} size={32} color="#4CAF50" />
                  <View style={styles.educationInfo}>
                    <Text style={styles.educationTitle}>{edu.title}</Text>
                    <Text style={styles.educationSchool}>{edu.school}</Text>
                    <Text style={styles.educationYear}>{edu.year}</Text>
                    {edu.grade && (
                      <Text style={styles.educationGrade}>Grade: {edu.grade}</Text>
                    )}
                    {edu.major && (
                      <Text style={styles.educationMajor}>Major: {edu.major}</Text>
                    )}
                    {edu.thesis && (
                      <Text style={styles.educationThesis}>Thesis: {edu.thesis}</Text>
                    )}
                  </View>
                  {edu.cert && (
                    <View style={styles.certBadgeRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.certLabel}>Certificate</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        );

      case 'certifications':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <TouchableOpacity onPress={() => Alert.alert('Add', 'Add Certification')}>
                <Ionicons name="add-circle" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
            {mockCertifications.map((cert) => (
              <View key={cert.id} style={styles.certCard}>
                <View style={styles.certHeader}>
                  <Ionicons
                    name={cert.status === 'verified' ? 'checkmark-circle' : cert.status === 'expiring' ? 'warning' : 'time'}
                    size={20}
                    color={cert.status === 'verified' ? '#4CAF50' : cert.status === 'expiring' ? '#F57C00' : '#FFC107'}
                  />
                  <Text style={styles.certTitle}>{cert.title}</Text>
                </View>
                <Text style={styles.certOrg}>{cert.org} - {cert.year}</Text>
                {cert.license && (
                  <Text style={styles.certLicense}>License #: {cert.license}</Text>
                )}
                {cert.validUntil && (
                  <Text style={styles.certValid}>Valid until: {cert.validUntil}</Text>
                )}
                {cert.status === 'expiring' && (
                  <Text style={styles.certWarning}>Renewal due in {cert.renewalDue}</Text>
                )}
                {cert.status === 'pending' && (
                  <View>
                    <Text style={styles.certPending}>Submitted: {cert.submitted}</Text>
                    <Text style={styles.certPending}>Expected: {cert.expected}</Text>
                  </View>
                )}
                <View style={styles.certActions}>
                  {cert.license && (
                    <TouchableOpacity style={styles.certActionBtn}>
                      <Text style={styles.certActionText}>View License</Text>
                    </TouchableOpacity>
                  )}
                  {cert.status === 'expiring' ? (
                    <TouchableOpacity style={[styles.certActionBtn, styles.certRenewBtn]}>
                      <Text style={styles.certRenewText}>Renew</Text>
                    </TouchableOpacity>
                  ) : cert.status === 'pending' ? (
                    <TouchableOpacity style={styles.certActionBtn}>
                      <Text style={styles.certActionText}>View Submission</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.certActionBtn}>
                      <Text style={styles.certActionText}>Download</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        );

      case 'skills':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Skills & Expertise</Text>
              <TouchableOpacity onPress={() => Alert.alert('Add', 'Add Skill')}>
                <Ionicons name="add-circle" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>

            <Text style={styles.skillCategoryTitle}>TECHNICAL SKILLS</Text>
            <View style={styles.skillsGrid}>
              {mockSkills.technical.map((skill, idx) => (
                <View key={idx} style={styles.skillCard}>
                  <Ionicons name={skill.icon as any} size={24} color="#4CAF50" />
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillYears}>+{skill.years}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.skillCategoryTitle, { marginTop: 20 }]}>SOFT SKILLS</Text>
            <View style={styles.skillsGrid}>
              {mockSkills.soft.map((skill, idx) => (
                <View key={idx} style={styles.skillCard}>
                  <Ionicons name={skill.icon as any} size={24} color="#2196F3" />
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillYears}>+{skill.years}</Text>
                </View>
              ))}
            </View>

            <View style={styles.endorsementsBox}>
              <Text style={styles.endorsementsText}>ENDORSEMENTS</Text>
              <Text style={styles.endorsementsCount}>Received 48 endorsements from peers</Text>
            </View>
          </View>
        );

      case 'experience':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              <TouchableOpacity onPress={() => Alert.alert('Add', 'Add Experience')}>
                <Ionicons name="add-circle" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
            {mockExperience.map((exp) => (
              <View key={exp.id} style={styles.expCard}>
                <Text style={styles.expTitle}>{exp.title}</Text>
                <Text style={styles.expCompany}>{exp.company}</Text>
                <Text style={styles.expDuration}>{exp.startDate} - {exp.endDate} · {exp.duration}</Text>
                <View style={styles.expLocationRow}>
                  <Ionicons name="location-outline" size={14} color="#757575" />
                  <Text style={styles.expLocation}>{exp.location}</Text>
                </View>

                {exp.highlights.length > 0 && (
                  <View style={styles.expHighlights}>
                    {exp.highlights.map((h, i) => (
                      <Text key={i} style={styles.expHighlight}>• {h}</Text>
                    ))}
                  </View>
                )}

                <View style={styles.expFooter}>
                  {exp.endorsements > 0 ? (
                    <Text style={styles.expEndorsements}>👍 {exp.endorsements} endorsements</Text>
                  ) : exp.reference ? (
                    <Text style={styles.expReference}>Reference Available</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        );

      case 'portfolio':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
              <TouchableOpacity onPress={() => Alert.alert('Add', 'Add Portfolio')}>
                <Ionicons name="add-circle" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
            {mockPortfolio.map((item) => (
              <View key={item.id} style={styles.portfolioCard}>
                <View style={styles.portfolioImage}>
                  <Ionicons name="image" size={32} color="#9E9E9E" />
                </View>
                <Text style={styles.portfolioTitle}>{item.title}</Text>
                <Text style={styles.portfolioDesc}>{item.description}</Text>
                <View style={styles.portfolioActions}>
                  <TouchableOpacity style={styles.portfolioAction}>
                    <Ionicons name="thumbs-up-outline" size={16} color="#757575" />
                    <Text style={styles.portfolioActionText}>45</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.portfolioAction}>
                    <Ionicons name="chatbubble-outline" size={16} color="#757575" />
                    <Text style={styles.portfolioActionText}>12</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.portfolioAction}>
                    <Ionicons name="link-outline" size={16} color="#757575" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'posts':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Posts</Text>
            </View>
            <Text style={styles.emptyStateText}>No posts yet</Text>
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.tabContent}>
            {/* Summary Card */}
            <View style={styles.reviewsSummaryCard}>
              <View style={styles.reviewsSummaryHeader}>
                <Text style={styles.reviewsSummaryTitle}>Reviews & Ratings</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.overallRating}>Overall Rating: {mockReviews.overall} ({mockReviews.total} reviews)</Text>

              {/* Rating Bars */}
              {[5, 4, 3, 2, 1].map((star, idx) => {
                const count = mockReviews.breakdown[5 - star];
                const percent = (count / mockReviews.total) * 100;
                return (
                  <View key={star} style={styles.ratingBarRow}>
                    <Text style={styles.ratingStar}>{star} </Text>
                    <View style={styles.ratingBarBg}>
                      <View style={[styles.ratingBarFill, { width: `${percent}%` }]} />
                    </View>
                    <Text style={styles.ratingCount}>{count}</Text>
                  </View>
                );
              })}

              {/* Category Breakdown */}
              <Text style={styles.categoryTitle}>CATEGORY BREAKDOWN</Text>
              {mockReviews.categories.map((cat, idx) => (
                <View key={idx} style={styles.categoryRow}>
                  <Text style={styles.categoryName}>{cat.name}:</Text>
                  <View style={styles.categoryRating}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name="star"
                        size={12}
                        color={s <= cat.rating ? '#4CAF50' : '#E0E0E0'}
                        fill={s <= cat.rating ? '#4CAF50' : 'transparent'}
                      />
                    ))}
                  </View>
                  <Text style={styles.categoryRatingText}> {cat.rating}</Text>
                </View>
              ))}
            </View>

            {/* Recent Reviews */}
            <Text style={styles.recentReviewsTitle}>Recent Reviews</Text>
            {mockReviews.recent.map((review) => (
              <View key={review.id} style={styles.reviewCardNew}>
                <View style={styles.reviewHeaderNew}>
                  <View style={styles.reviewAvatarNew}>
                    <Text style={styles.reviewAvatarTextNew}>{review.name.split(' ').map(n => n[0]).join('')}</Text>
                  </View>
                  <View style={styles.reviewInfoNew}>
                    <Text style={styles.reviewNameNew}>{review.name} - {review.role}</Text>
                    <View style={styles.reviewStarsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name="star"
                          size={12}
                          color={s <= review.rating ? '#4CAF50' : '#E0E0E0'}
                          fill={s <= review.rating ? '#4CAF50' : 'transparent'}
                        />
                      ))}
                      <Text style={styles.reviewTime}> - {review.time}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewTextNew}>"{review.text}"</Text>
                <View style={styles.reviewFooterNew}>
                  <Text style={styles.reviewHelpful}>👍 {review.helpful} helpful</Text>
                  <TouchableOpacity>
                    <Text style={styles.replyText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'jobs':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Job Activity</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* Application Status */}
            <Text style={styles.jobSectionTitle}>APPLICATION STATUS</Text>
            {mockJobs.applications.map((app) => (
              <View key={app.id} style={styles.jobCard}>
                <View style={styles.jobCardHeader}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.jobTitle}>Applied: {app.title}</Text>
                </View>
                <Text style={styles.jobCompany}>{app.company}</Text>
                <Text style={styles.jobApplied}>Applied: {app.applied}</Text>
                <View style={styles.jobStatusRow}>
                  <Text style={[styles.jobStatus, { color: app.statusColor }]}>{app.status}</Text>
                </View>
                <View style={styles.jobActions}>
                  <TouchableOpacity style={styles.jobActionBtn}>
                    <Text style={styles.jobActionText}>Track Application</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Hired */}
            <Text style={styles.jobSectionTitle}>HIRED</Text>
            {mockJobs.hired.map((job) => (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobCardHeader}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.jobTitle}>Hired: {job.title}</Text>
                </View>
                <Text style={styles.jobCompany}>{job.company}</Text>
                <Text style={styles.jobApplied}>Completed: {job.completed}</Text>
                <View style={styles.jobStatusRow}>
                  <Text style={[styles.jobStatus, { color: job.statusColor }]}>{job.status}</Text>
                </View>
                <TouchableOpacity style={styles.jobActionBtn}>
                  <Text style={styles.jobActionText}>Leave Review</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Saved Jobs */}
            <Text style={styles.jobSectionTitle}>SAVED JOBS</Text>
            {mockJobs.saved.map((job) => (
              <View key={job.id} style={styles.jobCardSaved}>
                <View style={styles.jobCardHeader}>
                  <Ionicons name="bookmark" size={18} color="#2E7D32" />
                  <Text style={styles.jobTitle}>{job.title}</Text>
                </View>
                <Text style={styles.jobCompany}>{job.company}</Text>
                <Text style={styles.jobApplied}>Saved {job.saved}</Text>
                <TouchableOpacity style={styles.applyNowBtn}>
                  <Text style={styles.applyNowText}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'marketplace':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Marketplace Activity</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* Selling Activity */}
            <Text style={styles.jobSectionTitle}>SELLING ACTIVITY</Text>
            {mockMarketplace.selling.map((item) => (
              <View key={item.id} style={styles.marketplaceCard}>
                <View style={styles.jobCardHeader}>
                  <View style={[styles.marketStatusDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.jobTitle}>Sold: {item.item}</Text>
                </View>
                <Text style={styles.marketPrice}>{item.price} - {item.time}</Text>
                <View style={styles.marketBuyerRow}>
                  <Text style={styles.marketBuyer}>Buyer: {item.buyer}</Text>
                  <View style={styles.marketRating}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name="star"
                        size={12}
                        color={s <= item.buyerRating ? '#4CAF50' : '#E0E0E0'}
                        fill={s <= item.buyerRating ? '#4CAF50' : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
                <TouchableOpacity style={styles.jobActionBtn}>
                  <Text style={styles.jobActionText}>Message Buyer</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Purchasing Activity */}
            <Text style={styles.jobSectionTitle}>PURCHASING ACTIVITY</Text>
            {mockMarketplace.purchasing.map((item) => (
              <View key={item.id} style={styles.marketplaceCard}>
                <View style={styles.jobCardHeader}>
                  <Ionicons name="cube-outline" size={18} color="#2196F3" />
                  <Text style={styles.jobTitle}>Purchased: {item.item}</Text>
                </View>
                <Text style={styles.marketPrice}>{item.price} - {item.time}</Text>
                <Text style={styles.marketBuyer}>Seller: {item.seller}</Text>
                <View style={styles.jobStatusRow}>
                  <Text style={[styles.jobStatus, { color: '#4CAF50' }]}>Status: {item.status}</Text>
                </View>
                <TouchableOpacity style={styles.jobActionBtn}>
                  <Text style={styles.jobActionText}>Leave Review</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Active Listings */}
            <Text style={styles.jobSectionTitle}>ACTIVE LISTINGS</Text>
            {mockMarketplace.activeListings.map((item) => (
              <View key={item.id} style={styles.marketplaceCard}>
                <View style={styles.jobCardHeader}>
                  <Ionicons name="megaphone-outline" size={18} color="#2E7D32" />
                  <Text style={styles.jobTitle}>{item.item} - {item.price}</Text>
                </View>
                <Text style={styles.marketStats}>{item.views} views - {item.interested} interested</Text>
                <TouchableOpacity style={styles.jobActionBtn}>
                  <Text style={styles.jobActionText}>Manage Listing</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'achievements':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.jobSectionTitle}>EARNED BADGES</Text>
            <View style={styles.badgesGrid}>
              {mockAchievements.earned.map((badge) => (
                <View key={badge.id} style={styles.badgeCard}>
                  <Ionicons name={badge.icon as any} size={28} color="#4CAF50" />
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  {badge.desc && <Text style={styles.badgeDesc}>{badge.desc}</Text>}
                </View>
              ))}
            </View>

            <Text style={styles.jobSectionTitle}>LOCKED BADGES</Text>
            <View style={styles.badgesGrid}>
              {mockAchievements.locked.map((badge) => (
                <View key={badge.id} style={[styles.badgeCard, styles.badgeLocked]}>
                  <Ionicons name={badge.icon as any} size={28} color="#9E9E9E" />
                  <Text style={styles.badgeTitleLocked}>{badge.title}</Text>
                  {badge.desc && <Text style={styles.badgeDescLocked}>{badge.desc}</Text>}
                </View>
              ))}
            </View>

            <Text style={styles.jobSectionTitle}>ACHIEVEMENT PROGRESS</Text>
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>{mockAchievements.progress.label}: {mockAchievements.progress.current}/{mockAchievements.progress.target} posts</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(mockAchievements.progress.current / mockAchievements.progress.target) * 100}%` }]} />
              </View>
              <Text style={styles.progressRemaining}>{mockAchievements.progress.remaining} more posts to unlock</Text>
            </View>
          </View>
        );

      case 'connected':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Connected Accounts</Text>
              <TouchableOpacity onPress={() => Alert.alert('Edit', 'Edit Connections')}>
                <Ionicons name="pencil" size={18} color="#2E7D32" />
              </TouchableOpacity>
            </View>

            {mockConnectedAccounts.connected.map((account) => (
              <View key={account.id} style={styles.connectedCard}>
                <View style={[styles.connectedIconNew, { backgroundColor: account.color + '20' }]}>
                  <Ionicons name={account.icon as any} size={22} color={account.color} />
                </View>
                <View style={styles.connectedInfo}>
                  <Text style={styles.connectedPlatform}>{account.platform}</Text>
                  <Text style={styles.connectedDetail}>{account.email || account.phone}</Text>
                </View>
                <View style={styles.connectedStatus}>
                  <Text style={styles.connectedStatusText}>Connected</Text>
                  <TouchableOpacity>
                    <Text style={styles.disconnectText}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <Text style={styles.jobSectionTitle}>AVAILABLE TO CONNECT</Text>
            {mockConnectedAccounts.available.map((account) => (
              <View key={account.id} style={[styles.connectedCard, styles.connectedCardAvailable]}>
                <View style={[styles.connectedIconNew, { backgroundColor: account.color + '20' }]}>
                  <Ionicons name={account.icon as any} size={22} color={account.color} />
                </View>
                <View style={styles.connectedInfo}>
                  <Text style={styles.connectedPlatform}>{account.platform}</Text>
                  <Text style={styles.connectedDetail}>{account.handle}</Text>
                </View>
                <TouchableOpacity style={styles.connectBtn}>
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'analytics':
        return (
          <View style={styles.tabContent}>
            {/* Overview Cards */}
            <Text style={styles.jobSectionTitle}>OVERVIEW CARDS</Text>
            <View style={styles.overviewGrid}>
              {mockAnalytics.overview.map((item, idx) => (
                <View key={idx} style={styles.overviewCard}>
                  <Text style={styles.overviewValue}>{item.value}</Text>
                  <Text style={styles.overviewLabel}>{item.label}</Text>
                  {item.sublabel && <Text style={styles.overviewSublabel}>{item.sublabel}</Text>}
                </View>
              ))}
            </View>

            {/* Profile Growth */}
            <Text style={styles.jobSectionTitle}>PROFILE GROWTH</Text>
            <View style={styles.growthCard}>
              <Text style={styles.growthTitle}>Followers Over Time</Text>
              <View style={styles.chartPlaceholder}>
                <Ionicons name="trending-up" size={48} color="#4CAF50" />
              </View>
              <Text style={styles.growthStats}>+{mockAnalytics.growth.percent}% this month - +{mockAnalytics.growth.newFollowers} new followers</Text>
            </View>

            {/* Top Posts */}
            <Text style={styles.jobSectionTitle}>CONTENT PERFORMANCE</Text>
            <View style={styles.topPostsCard}>
              <Text style={styles.growthTitle}>Your Top Posts</Text>
              {mockAnalytics.topPosts.map((post, idx) => (
                <View key={idx} style={styles.topPostRow}>
                  <Text style={styles.topPostRank}>{idx + 1}.</Text>
                  <Text style={styles.topPostTitle}>{post.title}</Text>
                  <Text style={styles.topPostViews}>{post.views.toLocaleString()} views</Text>
                </View>
              ))}
            </View>

            {/* Audience Insights */}
            <Text style={styles.jobSectionTitle}>AUDIENCE INSIGHTS</Text>
            <View style={styles.audienceCard}>
              <Text style={styles.growthTitle}>Who views your profile:</Text>
              <View style={styles.audienceRow}>
                <Text style={styles.audienceLabel}>Farmers:</Text>
                <Text style={styles.audienceValue}>{mockAnalytics.audience.farmers}%</Text>
              </View>
              <View style={styles.audienceRow}>
                <Text style={styles.audienceLabel}>Buyers:</Text>
                <Text style={styles.audienceValue}>{mockAnalytics.audience.buyers}%</Text>
              </View>
              <View style={styles.audienceRow}>
                <Text style={styles.audienceLabel}>Experts:</Text>
                <Text style={styles.audienceValue}>{mockAnalytics.audience.experts}%</Text>
              </View>
              <View style={styles.audienceRow}>
                <Text style={styles.audienceLabel}>Recruiters:</Text>
                <Text style={styles.audienceValue}>{mockAnalytics.audience.recruiters}%</Text>
              </View>

              <Text style={[styles.growthTitle, { marginTop: 16 }]}>Top Locations:</Text>
              {mockAnalytics.locations.map((loc, idx) => (
                <View key={idx} style={styles.audienceRow}>
                  <Text style={styles.audienceLabel}>{idx + 1}. {loc.name}</Text>
                  <Text style={styles.audienceValue}>{loc.percent}%</Text>
                </View>
              ))}
            </View>

            {/* Engagement Metrics */}
            <Text style={styles.jobSectionTitle}>ENGAGEMENT METRICS</Text>
            <View style={styles.engagementCard}>
              <View style={styles.engagementRow}>
                <Text style={styles.engagementLabel}>Average engagement per post:</Text>
                <Text style={styles.engagementValue}>{mockAnalytics.engagement.avgPerPost}</Text>
              </View>
              <View style={styles.engagementRow}>
                <Text style={styles.engagementLabel}>Reaction rate:</Text>
                <Text style={styles.engagementValue}>{mockAnalytics.engagement.reactionRate}%</Text>
              </View>
              <View style={styles.engagementRow}>
                <Text style={styles.engagementLabel}>Comment rate:</Text>
                <Text style={styles.engagementValue}>{mockAnalytics.engagement.commentRate}%</Text>
              </View>
              <View style={styles.engagementRow}>
                <Text style={styles.engagementLabel}>Share rate:</Text>
                <Text style={styles.engagementValue}>{mockAnalytics.engagement.shareRate}%</Text>
              </View>
              <View style={styles.engagementRow}>
                <Text style={styles.engagementLabel}>Best time to post:</Text>
                <Text style={styles.engagementValue}>{mockAnalytics.engagement.bestTime}</Text>
              </View>
            </View>

            {/* Export Button */}
            <TouchableOpacity style={styles.exportBtn}>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Export Full Report</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#222222" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => Alert.alert('More', 'Options coming soon')}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#222222" />
            </TouchableOpacity>
          </View>

          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <View
              style={[
                styles.profilePhotoContainer,
                isVerified && styles.profilePhotoVerified,
              ]}
            >
              {user?.imageUrl ? (
                <Image source={{ uri: user?.imageUrl }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.profilePhotoPlaceholder}>
                  <Text style={styles.profilePhotoPlaceholderText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.editPhotoButton} onPress={() => Alert.alert('Change Photo', 'Photo upload coming soon')}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfoSection}>
            <Text style={styles.userName}>{displayName || 'Your Name'}</Text>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>
                @{displayUsername}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#4CAF50" fill="#4CAF50" />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#2E7D32" />
              <Text style={styles.locationText}>{displayLocation}, Kenya</Text>
            </View>
          </View>

          {/* Badges */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgesContainer}
            contentContainerStyle={styles.badgesContent}
          >
            {mockBadges.map((badge) => (
              <View key={badge.id} style={styles.badge}>
                <Ionicons
                  name={badge.icon as any}
                  size={14}
                  color="#1B5E20"
                />
                <Text style={styles.badgeText}>{badge.label}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Portfolio', 'Coming soon')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="document-text-outline" size={18} color="#2E7D32" />
              </View>
              <Text style={styles.actionText}>Portfolio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Messages', 'Coming soon')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="chatbubble-outline" size={18} color="#2E7D32" />
              </View>
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => Alert.alert('Follow', 'Coming soon')}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  styles.actionIconPrimary,
                ]}
              >
                <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionText, styles.actionTextPrimary]}>
                Follow
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Share', 'Coming soon')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="link-outline" size={18} color="#2E7D32" />
              </View>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Analytics', 'Coming soon')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="stats-chart-outline" size={18} color="#2E7D32" />
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statValue}>{followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statValue}>{following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statValue}>{posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statValue}>{rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    activeTab === tab.key && styles.tabActive,
                  ]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.key && styles.tabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tab Content */}
          {renderTabContent()}

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoSection: {
    alignItems: 'center',
    position: 'relative',
  },
  profilePhotoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  profilePhotoVerified: {
    borderColor: '#2E7D32',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  profilePhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhotoPlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: width / 2 - 75,
    backgroundColor: '#2E7D32',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userInfoSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 4,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#757575',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#757575',
  },
  badgesContainer: {
    marginTop: 16,
    maxHeight: 40,
  },
  badgesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  actionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconPrimary: {
    backgroundColor: '#1B5E20',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
  },
  actionTextPrimary: {
    color: '#FFFFFF',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabsContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2E7D32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  tabTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
  },
  infoValue: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '500',
  },
  certRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  certText: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '500',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    paddingVertical: 40,
  },
  reviewCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  achievementCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginTop: 10,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
  },
  connectedAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  connectedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  connectedName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#222222',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },

  // About Tab Styles
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
  },
  bioText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    marginBottom: 16,
  },
  bulletSection: {
    marginTop: 12,
  },
  bulletTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 6,
  },
  bulletItem: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 8,
    marginBottom: 4,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#222222',
  },
  farmGrid: {
    gap: 8,
  },
  farmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  farmLabel: {
    fontSize: 14,
    color: '#757575',
  },
  farmValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
  },

  // Crops Tab Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cropCard: {
    width: (width - 52) / 3,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  cropIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  cropName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
    textAlign: 'center',
  },
  cropAcres: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  cropHarvest: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
  },
  cropNote: {
    fontSize: 9,
    color: '#4CAF50',
    marginTop: 2,
  },
  cropTag: {
    fontSize: 12,
    marginTop: 2,
  },

  // Livestock Tab Styles
  livestockCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  livestockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  livestockIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  livestockInfo: {
    flex: 1,
  },
  livestockName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },
  livestockBreed: {
    fontSize: 13,
    color: '#757575',
  },
  livestockDetail: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  livestockLabel: {
    fontSize: 13,
    color: '#757575',
    width: 80,
  },
  livestockValue: {
    fontSize: 13,
    color: '#222222',
    fontWeight: '500',
  },
  livestockHealth: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  viewRecordsBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  viewRecordsText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },

  // Education Tab Styles
  educationCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  educationHeader: {
    flexDirection: 'row',
  },
  educationIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  educationInfo: {
    flex: 1,
  },
  educationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 2,
  },
  educationSchool: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 2,
  },
  educationYear: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  educationGrade: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 4,
  },
  educationMajor: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  educationThesis: {
    fontSize: 11,
    color: '#9E9E9E',
    fontStyle: 'italic',
    marginTop: 2,
  },
  certBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  certLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },

  // Certifications Tab Styles
  certCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  certHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  certTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
    flex: 1,
  },
  certOrg: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 4,
  },
  certLicense: {
    fontSize: 12,
    color: '#222222',
    marginBottom: 2,
  },
  certValid: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 4,
  },
  certWarning: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
    marginBottom: 8,
  },
  certPending: {
    fontSize: 12,
    color: '#FFC107',
    marginBottom: 2,
  },
  certActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  certActionBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  certActionText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  certRenewBtn: {
    backgroundColor: '#F57C00',
    borderColor: '#F57C00',
  },
  certRenewText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Skills Tab Styles
  skillCategoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#757575',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillCard: {
    width: (width - 52) / 3,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  skillIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  skillName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#222222',
    textAlign: 'center',
  },
  skillYears: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 2,
  },
  endorsementsBox: {
    marginTop: 24,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  endorsementsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  endorsementsCount: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },

  // Experience Tab Styles
  expCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  expTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 2,
  },
  expCompany: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    marginBottom: 4,
  },
  expDuration: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  expLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  expLocation: {
    fontSize: 12,
    color: '#757575',
  },
  expHighlights: {
    marginTop: 8,
  },
  expHighlight: {
    fontSize: 13,
    color: '#222222',
    marginBottom: 4,
    lineHeight: 18,
  },
  expFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  expEndorsements: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  expReference: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },

  // Portfolio Tab Styles
  portfolioCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  portfolioImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 4,
  },
  portfolioDesc: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
    marginBottom: 12,
  },
  portfolioActions: {
    flexDirection: 'row',
    gap: 16,
  },
  portfolioAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  portfolioActionText: {
    fontSize: 13,
    color: '#757575',
  },

  // Reviews Tab Styles
  reviewsSummaryCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewsSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  overallRating: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '600',
    marginBottom: 12,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingStar: {
    fontSize: 12,
    color: '#757575',
    width: 20,
  },
  ratingBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 8,
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#757575',
    width: 30,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#757575',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    color: '#757575',
    width: 100,
  },
  categoryRating: {
    flexDirection: 'row',
  },
  categoryRatingText: {
    fontSize: 13,
    color: '#222222',
    fontWeight: '500',
  },
  recentReviewsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 12,
  },
  reviewCardNew: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  reviewHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatarNew: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewAvatarTextNew: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  reviewInfoNew: {
    flex: 1,
  },
  reviewNameNew: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewTime: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  reviewTextNew: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
    marginBottom: 10,
  },
  reviewFooterNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewHelpful: {
    fontSize: 12,
    color: '#757575',
  },
  replyText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },

  // Jobs Tab Styles
  jobSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#757575',
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  jobCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  jobCompany: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
    marginBottom: 2,
  },
  jobApplied: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  jobStatusRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  jobStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  jobActions: {
    flexDirection: 'row',
    gap: 10,
  },
  jobActionBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  jobActionText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  jobCardSaved: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  applyNowBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  applyNowText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Marketplace Tab Styles
  marketplaceCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  marketStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  marketPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginTop: 4,
    marginBottom: 4,
  },
  marketBuyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  marketBuyer: {
    fontSize: 13,
    color: '#757575',
    marginRight: 8,
  },
  marketRating: {
    flexDirection: 'row',
  },
  marketStats: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 10,
  },

  // Achievements Tab Styles
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  badgeCard: {
    width: (width - 54) / 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  badgeLocked: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1B5E20',
    textAlign: 'center',
  },
  badgeTitleLocked: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9E9E9E',
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 8,
    color: '#1B5E20',
    textAlign: 'center',
  },
  badgeDescLocked: {
    fontSize: 8,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 10,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressRemaining: {
    fontSize: 12,
    color: '#757575',
  },

  // Connected Tab Styles
  connectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  connectedCardAvailable: {
    opacity: 0.8,
  },
  connectedIconNew: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  connectedInfo: {
    flex: 1,
  },
  connectedPlatform: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },
  connectedDetail: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  connectedStatus: {
    alignItems: 'flex-end',
  },
  connectedStatusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  disconnectText: {
    fontSize: 11,
    color: '#F44336',
    marginTop: 4,
  },
  connectBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  connectBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Analytics Tab Styles
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  overviewCard: {
    width: (width - 40) / 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
  },
  overviewLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1B5E20',
    textAlign: 'center',
  },
  overviewSublabel: {
    fontSize: 7,
    color: '#1B5E20',
    textAlign: 'center',
  },
  growthCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  growthTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 12,
  },
  chartPlaceholder: {
    height: 100,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  growthStats: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  topPostsCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  topPostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  topPostRank: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    width: 24,
  },
  topPostTitle: {
    flex: 1,
    fontSize: 14,
    color: '#222222',
  },
  topPostViews: {
    fontSize: 12,
    color: '#757575',
  },
  audienceCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  audienceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  audienceLabel: {
    fontSize: 13,
    color: '#555555',
  },
  audienceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
  },
  engagementCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  engagementLabel: {
    fontSize: 13,
    color: '#555555',
  },
  engagementValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  exportBtn: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  exportBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
