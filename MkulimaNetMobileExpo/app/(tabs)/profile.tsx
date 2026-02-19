import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

interface Skill {
  id: number;
  name: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  year: string;
}

interface Service {
  id: number;
  name: string;
}

interface FarmDetail {
  size: string;
  crops: string[];
  livestock: string[];
  experience: string;
}

interface Post {
  id: number;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  timeAgo: string;
}

interface Review {
  id: number;
  reviewer: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  timestamp: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  skillsRequired: string[];
}

export default function ProfileScreen() {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'products' | 'reviews'>('posts');
  const [userData, setUserData] = useState<any>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState('Open to Work'); // 'Open to Work', 'Open to Internship', 'Not Available'

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Fetch user profile data
      const userResponse = await fetch(`http://localhost:5000/api/users/${authState.user.id}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserData(userData);
      }

      // Fetch user's posts
      const postsResponse = await fetch(`http://localhost:5000/api/posts?userId=${authState.user.id}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
      }

      // Fetch user's products
      const productsResponse = await fetch(`http://localhost:5000/api/products?userId=${authState.user.id}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }

      // Fetch user's reviews
      const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/${authState.user.id}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      }

      // Fetch recommended jobs based on user's skills
      const jobsResponse = await fetch(`http://localhost:5000/api/jobs/suggestions/${authState.user.id}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setRecommendedJobs(jobsData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const toggleAvailability = () => {
    const statuses = ['Open to Work', 'Open to Internship', 'Not Available'];
    const currentIndex = statuses.indexOf(availabilityStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setAvailabilityStatus(statuses[nextIndex]);
  };

  const renderSkillTag = ({ item }: { item: string }) => (
    <View style={styles.skillTag}>
      <Text style={styles.skillText}>{item}</Text>
    </View>
  );

  const renderRecommendedJob = ({ item }: { item: Job }) => (
    <TouchableOpacity style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobSalary}>{item.salary}</Text>
      </View>
      <Text style={styles.jobCompany}>{item.company} • {item.location}</Text>
      <View style={styles.jobFooter}>
        <Text style={styles.jobPosted}>{item.posted}</Text>
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <Text style={styles.postContent}>{item.content}</Text>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}
      <View style={styles.postActions}>
        <View style={styles.actionButton}>
          <FontAwesome name="heart-o" size={16} color="#666666" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </View>
        <View style={styles.actionButton}>
          <FontAwesome name="comment-o" size={16} color="#666666" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </View>
        <Text style={styles.postTimestamp}>{item.timestamp}</Text>
      </View>
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>KSh {item.price.toLocaleString()}</Text>
        <Text style={styles.productTime}>Posted {item.timeAgo}</Text>
      </View>
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.reviewer.avatar }} style={styles.reviewAvatar} />
        <View>
          <Text style={styles.reviewerName}>{item.reviewer.name}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <FontAwesome
                key={i}
                name={i < item.rating ? "star" : "star-o"}
                size={14}
                color={i < item.rating ? "#FFD700" : "#CCCCCC"}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewTimestamp}>{item.timestamp}</Text>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'products':
        return (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'reviews':
        return (
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Profile Header Section */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: authState.user?.avatar || 'https://via.placeholder.com/100x100' }} style={styles.avatar} />
          <TouchableOpacity style={styles.editPhotoButton}>
            <FontAwesome name="camera" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.profileName}>{authState.user?.name || 'User Name'}</Text>
        <Text style={styles.username}>@{authState.user?.username || 'username'}</Text>
        <Text style={styles.location}>
          <FontAwesome name="map-marker" size={14} color="#666666" /> {authState.user?.location || 'Location'}
        </Text>
        
        <View style={styles.badgeContainer}>
          <View style={styles.experienceBadge}>
            <Text style={styles.experienceText}>Professional Farmer</Text>
          </View>
          {authState.user?.farmName && (
            <Text style={styles.farmName}>{authState.user.farmName}</Text>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{authState.user?.rating || '4.8'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{authState.user?.followersCount || '1.2k'}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{authState.user?.followingCount || '856'}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{authState.user?.postsCount || '156'}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton}>
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <TouchableOpacity>
            <FontAwesome name="plus" size={16} color="#1B5E20" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={authState.user?.skills || []}
          renderItem={renderSkillTag}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.skillsContainer}
        />
      </View>

      {/* Recommended Jobs Section */}
      {recommendedJobs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recommendedJobs.slice(0, 3)} // Show only first 3 jobs
            renderItem={renderRecommendedJob}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jobsContainer}
          />
        </View>
      )}

      {/* Certifications Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <TouchableOpacity>
            <Text style={styles.uploadText}>Upload</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.certificationsContainer}>
          {(authState.user?.certifications || []).map((cert: any, index: number) => (
            <View key={index} style={styles.certificationItem}>
              <View style={styles.certificationInfo}>
                <Text style={styles.certificationName}>{cert.name}</Text>
                <Text style={styles.certificationIssuer}>{cert.issuer} • {cert.year}</Text>
              </View>
              <TouchableOpacity>
                <FontAwesome name="eye" size={16} color="#1B5E20" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Services Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Services</Text>
          <TouchableOpacity>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.servicesContainer}>
          {(authState.user?.services || []).map((service: string, index: number) => (
            <View key={index} style={styles.serviceItem}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Farm Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farm Details</Text>
        <View style={styles.farmDetailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Farm Size:</Text>
            <Text style={styles.detailValue}>{authState.user?.farmSize || '10 acres'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Crops:</Text>
            <Text style={styles.detailValue}>{(authState.user?.crops || []).join(', ') || 'Maize, Beans, Tomatoes'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Livestock:</Text>
            <Text style={styles.detailValue}>{(authState.user?.livestock || []).join(', ') || 'Cattle, Goats, Chicken'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Experience:</Text>
            <Text style={styles.detailValue}>{authState.user?.experience || '5 years'}</Text>
          </View>
        </View>
      </View>

      {/* Availability Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Availability Status</Text>
          <TouchableOpacity onPress={toggleAvailability}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={[
          styles.availabilityBadge,
          availabilityStatus === 'Open to Work' && styles.availableBadge,
          availabilityStatus === 'Open to Internship' && styles.internshipBadge,
          availabilityStatus === 'Not Available' && styles.notAvailableBadge,
        ]}>
          <FontAwesome 
            name={availabilityStatus === 'Open to Work' ? 'check-circle' : 
                  availabilityStatus === 'Open to Internship' ? 'clock-o' : 'times-circle'} 
            size={16} 
            color={availabilityStatus === 'Open to Work' ? '#4CAF50' : 
                   availabilityStatus === 'Open to Internship' ? '#FF9800' : '#F44336'} 
          />
          <Text style={[
            styles.availabilityText,
            availabilityStatus === 'Open to Work' && styles.availableText,
            availabilityStatus === 'Open to Internship' && styles.internshipText,
            availabilityStatus === 'Not Available' && styles.notAvailableText,
          ]}>
            {availabilityStatus}
          </Text>
        </View>
      </View>

      {/* Tab Section */}
      <View style={styles.tabSection}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'posts' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('posts')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'posts' && styles.activeTabButtonText,
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'products' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('products')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'products' && styles.activeTabButtonText,
              ]}
            >
              Products
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'reviews' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'reviews' && styles.activeTabButtonText,
              ]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1B5E20',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  experienceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '600',
  },
  farmName: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111111',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editProfileButton: {
    flex: 1,
    backgroundColor: '#1B5E20',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  messageButtonText: {
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  viewAllText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
  },
  addText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
  },
  editText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
  },
  skillsContainer: {
    paddingVertical: 8,
  },
  jobsContainer: {
    paddingVertical: 8,
  },
  skillTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  skillText: {
    color: '#1B5E20',
    fontSize: 12,
    fontWeight: '600',
  },
  jobCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    width: 250,
    marginRight: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    flex: 1,
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  jobCompany: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobPosted: {
    fontSize: 12,
    color: '#999999',
  },
  applyButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  certificationsContainer: {
    gap: 8,
  },
  certificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  certificationInfo: {},
  certificationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  certificationIssuer: {
    fontSize: 12,
    color: '#666666',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceItem: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  serviceText: {
    fontSize: 12,
    color: '#111111',
  },
  farmDetailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#111111',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    borderRadius: 20,
  },
  availableBadge: {
    backgroundColor: '#E8F5E9',
  },
  internshipBadge: {
    backgroundColor: '#FFF3E0',
  },
  notAvailableBadge: {
    backgroundColor: '#FFEBEE',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  availableText: {
    color: '#4CAF50',
  },
  internshipText: {
    color: '#FF9800',
  },
  notAvailableText: {
    color: '#F44336',
  },
  tabSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#1B5E20',
  },
  tabContent: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postContent: {
    fontSize: 14,
    color: '#111111',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  postTimestamp: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 'auto',
  },
  productCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 4,
  },
  productTime: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#111111',
    lineHeight: 18,
    marginBottom: 8,
  },
  reviewTimestamp: {
    fontSize: 12,
    color: '#999999',
  },
});