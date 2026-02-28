import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';

// Define TypeScript interfaces
interface Author {
  name: string;
  avatar: string;
  location: string;
  role: string;
  verified: boolean;
}

interface ReactionCounts {
  like: number;
  celebrate: number;
  love: number;
  insightful: number;
  funny: number;
}

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  timestamp: string;
  replies: number;
}

interface Post {
  id: number;
  author: Author;
  content: string;
  image?: string;
  images?: string[];
  video?: string;
  reactions: ReactionCounts;
  totalReactions: number;
  comments: Comment[];
  totalComments: number;
  timestamp: string;
  type: string;
  hashtags: string[];
  isTrending?: boolean;
  isSponsored?: boolean;
  isFollowing?: boolean;
  isRecommended?: boolean;
  jobDetails?: {
    title: string;
    salary?: string;
    applyLink: string;
  };
  marketplaceDetails?: {
    price: number;
    condition: string;
    buyLink: string;
  };
}

interface ReactionType {
  name: string;
  icon: string;
  color: string;
  emoji: string;
}

interface Story {
  id: number;
  userId: number;
  username: string;
  avatar: string;
  isViewed: boolean;
  isLive?: boolean;
  isOwnStory?: boolean;
  timestamp?: string;
}

export default function FeedScreen() {
  const router = useRouter();
  const { user, isLoaded: isLoading } = useUser();
  const { isSignedIn } = useAuth();
  const userId = user?.id;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isSignedIn || !userId) {
    return <Redirect href="/welcome" />;
  }

  useEffect(() => {
    if (!isLoading && (!isSignedIn || !userId)) {
      router.replace('/welcome');
    }
  }, [userId, isSignedIn, isLoading, router]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [reactionPopupVisible, setReactionPopupVisible] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Mock unread count
  const [activeFilter, setActiveFilter] = useState('All');
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());

  // Professional color palette
  const colors = {
    // Core Brand Colors
    primaryGreen: '#2E7D32',       // Primary green for active states
    secondaryGreen: '#4CAF50',    // Secondary green for accents
    lightGreen: '#E8F5E9',        // Light green for backgrounds
    white: '#FFFFFF',             // Primary background
    offWhite: '#FAFAFA',          // Very light background
    lightGray: '#F5F7FA',         // Light gray for depth
    
    // Text Hierarchy
    primaryText: '#222222',       // Dark charcoal
    secondaryText: '#333333',     // Post text
    metadataText: '#757575',       // Timestamp and metadata
    lightText: '#9E9E9E',         // Inactive icons
    placeholderText: '#BDBDBD',   // Very light gray
    
    // UI Elements
    borderColor: '#F0F0F0',        // Light border
    shadowColor: '#000000',       // Shadow
    disabled: '#9E9E9E',          // Disabled state
    error: '#EF4444',             // Error state
  };

  // Filter options
  const filterOptions = ['All', 'Crops', 'Livestock', 'Jobs', 'Advice', 'Marketplace', 'Following'];

  // Mock reactions data for demonstration
  const reactionTypes: ReactionType[] = [
    { name: 'like', icon: 'thumb-up', color: colors.primaryGreen, emoji: '👍' },
    { name: 'celebrate', icon: 'emoji-events', color: '#F59E0B', emoji: '🎉' },
    { name: 'love', icon: 'favorite', color: '#EF4444', emoji: '❤️' },
    { name: 'insightful', icon: 'lightbulb', color: '#3B82F6', emoji: '💡' },
    { name: 'funny', icon: 'sentiment-very-satisfied', color: '#8B5CF6', emoji: '😂' },
  ];

  // Mock stories data
  useEffect(() => {
    const mockStories: Story[] = [
      {
        id: 1,
        userId: 0,
        username: 'Your Story',
        avatar: user?.imageUrl || 'https://via.placeholder.com/60x60',
        isViewed: false,
        isOwnStory: true,
        timestamp: 'Just now'
      },
      {
        id: 2,
        userId: 1,
        username: 'John Kariuki',
        avatar: 'https://via.placeholder.com/60x60',
        isViewed: false,
        timestamp: '2h ago'
      },
      {
        id: 3,
        userId: 2,
        username: 'Mary Wanjiru',
        avatar: 'https://via.placeholder.com/60x60',
        isViewed: true,
        timestamp: '4h ago'
      },
      {
        id: 4,
        userId: 3,
        username: 'Samuel Ochieng',
        avatar: 'https://via.placeholder.com/60x60',
        isViewed: false,
        isLive: true,
        timestamp: 'Live'
      }
    ];
    setStories(mockStories);
  }, [user?.imageUrl]);

  // Mock data for initial load - in real app this would come from backend
  useEffect(() => {
    // Simulate API call to fetch posts
    setTimeout(() => {
      const mockPosts: Post[] = [
        {
          id: 1,
          author: {
            name: 'John Kariuki',
            avatar: 'https://via.placeholder.com/48x48',
            location: 'Nakuru County',
            role: 'Farmer',
            verified: true
          },
          content: 'Just harvested 50 bags of organic maize! Quality produce available for sale. Grown using sustainable farming practices and certified organic. The yield this season has been exceptional with minimal pest damage and excellent weather conditions throughout the growing period.',
          image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
          reactions: {
            like: 42,
            celebrate: 5,
            love: 3,
            insightful: 2,
            funny: 1
          },
          totalReactions: 53,
          comments: [
            {
              id: 1,
              author: { name: 'Mary Wanjiru', avatar: 'https://via.placeholder.com/24x24' },
              content: 'Congratulations on the successful harvest! How was the weather this season?',
              likes: 2,
              timestamp: '1 hour ago',
              replies: 2
            },
            {
              id: 2,
              author: { name: 'Samuel Ochieng', avatar: 'https://via.placeholder.com/24x24' },
              content: 'Would love to place a bulk order for restaurant supply. What pricing do you offer?',
              likes: 1,
              timestamp: '30 minutes ago',
              replies: 0
            }
          ],
          totalComments: 18,
          timestamp: '2 hours ago',
          type: 'harvest',
          hashtags: ['#maize', '#organic', '#harvest', '#sustainable', '#farming'],
          isTrending: true,
          isFollowing: true
        },
        {
          id: 2,
          author: {
            name: 'Agricultural Jobs Kenya',
            avatar: 'https://via.placeholder.com/48x48',
            location: 'Nationwide',
            role: 'Employer',
            verified: true
          },
          content: 'Hiring experienced dairy farm manager for large-scale operation in Kiambu County. Must have minimum 3 years experience in dairy farming operations.',
          reactions: {
            like: 28,
            celebrate: 8,
            love: 12,
            insightful: 3,
            funny: 0
          },
          totalReactions: 51,
          comments: [
            {
              id: 1,
              author: { name: 'James Maina', avatar: 'https://via.placeholder.com/24x24' },
              content: 'This is a great opportunity! What are the key responsibilities?',
              likes: 3,
              timestamp: '45 minutes ago',
              replies: 1
            }
          ],
          totalComments: 12,
          timestamp: '5 hours ago',
          type: 'job',
          hashtags: ['#jobs', '#dairy', '#farming', '#employment'],
          jobDetails: {
            title: 'Dairy Farm Manager',
            salary: 'KSh 80,000 - 120,000',
            applyLink: 'https://example.com/apply'
          }
        },
        {
          id: 3,
          author: {
            name: 'Fresh Produce Market',
            avatar: 'https://via.placeholder.com/48x48',
            location: 'Nairobi',
            role: 'Seller',
            verified: false
          },
          content: 'Fresh organic tomatoes available at wholesale prices. Direct from farm to market, no middlemen. Perfect for restaurants and retail stores.',
          images: [
            'https://images.unsplash.com/photo-1615485291234-01b708f19c1b?w=300',
            'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300',
            'https://images.unsplash.com/photo-1602192404983-d9b0f8c1d00a?w=300'
          ],
          reactions: {
            like: 15,
            celebrate: 2,
            love: 1,
            insightful: 5,
            funny: 0
          },
          totalReactions: 23,
          comments: [],
          totalComments: 8,
          timestamp: '8 hours ago',
          type: 'marketplace',
          hashtags: ['#vegetables', '#supplier', '#organic', '#wholesale'],
          marketplaceDetails: {
            price: 350,
            condition: 'New',
            buyLink: 'https://example.com/buy'
          }
        },
        {
          id: 4,
          author: {
            name: 'Dr. Sarah Kimani',
            avatar: 'https://via.placeholder.com/48x48',
            location: 'Nairobi',
            role: 'Agricultural Expert',
            verified: true
          },
          content: 'Pest management tips for small-scale farmers: Early detection is key to preventing crop losses. Here are 5 essential strategies every farmer should know...',
          reactions: {
            like: 67,
            celebrate: 12,
            love: 8,
            insightful: 25,
            funny: 3
          },
          totalReactions: 115,
          comments: [
            {
              id: 1,
              author: { name: 'David Kimani', avatar: 'https://via.placeholder.com/24x24' },
              content: 'This is very helpful! Thanks for sharing. Could you elaborate on the biological control methods?',
              likes: 5,
              timestamp: '3 hours ago',
              replies: 3
            }
          ],
          totalComments: 24,
          timestamp: '12 hours ago',
          type: 'advice',
          hashtags: ['#farming', '#pest-management', '#expert', '#agriculture', '#tips'],
          isRecommended: true
        }
      ];
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    // In a real app, this would fetch from backend
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleReaction = (postId: number, reactionType: keyof ReactionCounts) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newReactions = { ...post.reactions };
          (newReactions[reactionType] as number)++;
          
          return {
            ...post,
            reactions: newReactions,
            totalReactions: post.totalReactions + 1
          };
        }
        return post;
      })
    );
    setReactionPopupVisible(false);
  };

  const handleSavePost = (postId: number) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCommentSubmit = () => {
    if (commentText.trim() && selectedPost) {
      const newComment: Comment = {
        id: Date.now(),
        author: { name: user?.firstName || 'Current User', avatar: user?.imageUrl || 'https://via.placeholder.com/24x24' },
        content: commentText,
        likes: 0,
        timestamp: 'Just now',
        replies: 0
      };

      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === selectedPost.id) {
            return {
              ...post,
              comments: [...post.comments, newComment],
              totalComments: post.totalComments + 1
            };
          }
          return post;
        })
      );

      setCommentText('');
      setShowComments(false);
    }
  };

  const handleStoryPress = (index: number) => {
    setCurrentStoryIndex(index);
    setShowStoryViewer(true);
  };

  const renderStoryItem = ({ item, index }: { item: Story, index: number }) => {
    const isOwnStory = index === 0;
    const isViewed = item.isViewed;
    
    return (
      <TouchableOpacity 
        style={styles.storyItem}
        onPress={() => handleStoryPress(index)}
        accessibilityLabel={isOwnStory ? "Add your story" : `Story from ${item.username}`}
      >
        {/* Story Ring */}
        <View style={[
          styles.storyRing,
          isViewed ? styles.viewedStoryRing : styles.unviewedStoryRing,
          isOwnStory && styles.ownStoryRing
        ]}>
          {/* Profile Image */}
          <View style={styles.storyImageContainer}>
            <Image 
              source={{ uri: item.avatar }} 
              style={[
                styles.storyImage,
                isViewed && styles.viewedStoryImage
              ]}
            />
            {isOwnStory && (
              <View style={[styles.plusBadge, { backgroundColor: colors.primaryGreen }]}>
                <MaterialIcons name="add" size={12} color={colors.white} />
              </View>
            )}
            {item.isLive && (
              <View style={[styles.liveIndicator, { backgroundColor: '#EF4444' }]} />
            )}
          </View>
        </View>
        
        {/* Username */}
        <Text 
          style={[
            styles.storyUsername,
            isViewed ? styles.viewedStoryUsername : styles.unviewedStoryUsername
          ]}
          numberOfLines={1}
        >
          {item.username}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderStoriesRow = () => (
    <View style={[styles.storiesContainer, { backgroundColor: colors.white }]}>
      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      />
    </View>
  );

  const renderStoryViewer = () => (
    <Modal
      visible={showStoryViewer}
      animationType="fade"
      onRequestClose={() => setShowStoryViewer(false)}
    >
      <TouchableOpacity 
        style={styles.storyViewerOverlay}
        onPress={() => setShowStoryViewer(false)}
      >
        <View style={styles.storyViewerContainer}>
          {/* Top Bar */}
          <View style={styles.storyViewerTopBar}>
            <View style={styles.storyViewerHeader}>
              <Image 
                source={{ uri: stories[currentStoryIndex]?.avatar }} 
                style={styles.storyViewerAvatar}
              />
              <View style={styles.storyViewerInfo}>
                <Text style={[styles.storyViewerName, { color: colors.white }]}>
                  {stories[currentStoryIndex]?.username}
                </Text>
                <Text style={[styles.storyViewerTimestamp, { color: 'rgba(255,255,255,0.7)' }]}>
                  {stories[currentStoryIndex]?.timestamp}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowStoryViewer(false)}>
              <MaterialIcons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          {/* Content Area */}
          <View style={styles.storyContent}>
            <Image 
              source={{ uri: stories[currentStoryIndex]?.avatar }} 
              style={styles.storyContentImage}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderReactionPopup = () => (
    <Modal
      transparent={true}
      visible={reactionPopupVisible}
      animationType="fade"
      onRequestClose={() => setReactionPopupVisible(false)}
    >
      <TouchableOpacity 
        style={styles.reactionOverlay} 
        onPress={() => setReactionPopupVisible(false)}
      >
        <View style={[styles.reactionPopup, { backgroundColor: colors.white }]}>
          {reactionTypes.map((reaction) => (
            <TouchableOpacity
              key={reaction.name}
              style={styles.reactionOption}
              onPress={() => handleReaction(selectedPostId!, reaction.name as keyof ReactionCounts)}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={[styles.reactionLabel, { color: colors.metadataText }]}>{reaction.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderCommentsModal = () => (
    <Modal
      transparent={true}
      visible={showComments}
      animationType="slide"
      onRequestClose={() => setShowComments(false)}
    >
      <TouchableOpacity 
        style={styles.commentOverlay} 
        onPress={() => setShowComments(false)}
      >
        <View style={[styles.commentModal, { backgroundColor: colors.white }]}>
          <View style={[styles.commentHeader, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.commentTitle, { color: colors.primaryText }]}>Comments</Text>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <MaterialIcons name="close" size={24} color={colors.metadataText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.commentList}>
            {selectedPost?.comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image source={{ uri: comment.author.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <Text style={[styles.commentAuthor, { color: colors.primaryText }]}>{comment.author.name}</Text>
                  <Text style={[styles.commentText, { color: colors.secondaryText }]}>{comment.content}</Text>
                  <Text style={[styles.commentTime, { color: colors.metadataText }]}>
                    {comment.timestamp} • {comment.likes} likes
                  </Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity style={styles.commentAction}>
                      <MaterialIcons name="favorite-border" size={14} color={colors.metadataText} />
                      <Text style={[styles.commentLikes, { color: colors.metadataText }]}>{comment.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentAction}>
                      <MaterialIcons name="reply" size={14} color={colors.metadataText} />
                      <Text style={[styles.commentActionText, { color: colors.metadataText }]}>Reply</Text>
                    </TouchableOpacity>
                    {comment.replies > 0 && (
                      <Text style={[styles.commentReplies, { color: colors.primaryGreen }]}>
                        {comment.replies} replies
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={[styles.commentInputContainer, { borderTopColor: colors.borderColor }]}>
            <TextInput
              style={[styles.commentInput, { 
                backgroundColor: colors.offWhite,
                color: colors.primaryText 
              }]}
              placeholder="Write a comment..."
              placeholderTextColor={colors.placeholderText}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]} 
              onPress={handleCommentSubmit}
              disabled={!commentText.trim()}
            >
              <MaterialIcons name="send" size={20} color={commentText.trim() ? colors.primaryGreen : colors.disabled} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderNotificationsModal = () => (
    <Modal
      transparent={true}
      visible={showNotifications}
      animationType="slide"
      onRequestClose={() => setShowNotifications(false)}
    >
      <TouchableOpacity 
        style={styles.notificationOverlay} 
        onPress={() => setShowNotifications(false)}
      >
        <View style={[styles.notificationModal, { backgroundColor: colors.white }]}>
          <View style={[styles.notificationHeader, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.notificationTitle, { color: colors.primaryText }]}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <MaterialIcons name="close" size={24} color={colors.metadataText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.notificationList}>
            <View style={styles.notificationCategory}>
              <Text style={[styles.categoryTitle, { color: colors.metadataText }]}>Likes</Text>
              <View style={styles.notificationItem}>
                <Image source={{ uri: 'https://via.placeholder.com/30x30' }} style={styles.notificationAvatar} />
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationText, { color: colors.primaryText }]}>
                    <Text style={[styles.boldText, { color: colors.primaryText }]}>James Maina</Text> liked your post
                  </Text>
                  <Text style={[styles.notificationTime, { color: colors.metadataText }]}>2 min ago</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: colors.offWhite }]}>
        <MaterialIcons name="search" size={20} color={colors.metadataText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.primaryText }]}
          placeholder="Search posts, farmers, products…"
          placeholderTextColor={colors.placeholderText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setShowSearch(true)}
        />
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.filterTabsContainer}
      contentContainerStyle={styles.filterTabsContent}
    >
      {filterOptions.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.filterTab,
            activeFilter === option && styles.activeFilterTab
          ]}
          onPress={() => setActiveFilter(option)}
        >
          <Text style={[
            styles.filterTabText,
            activeFilter === option && styles.activeFilterTabText
          ]}>
            {option}
          </Text>
          {activeFilter === option && (
            <View style={[styles.activeTabIndicator, { backgroundColor: colors.primaryGreen }]} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPostMedia = (post: Post) => {
    if (post.image) {
      return (
        <Image 
          source={{ uri: post.image }} 
          style={[styles.postImage, { borderRadius: 12 }]} 
        />
      );
    }
    
    if (post.images && post.images.length > 0) {
      if (post.images.length === 1) {
        return (
          <Image 
            source={{ uri: post.images[0] }} 
            style={[styles.postImage, { borderRadius: 12 }]} 
          />
        );
      }
      
      if (post.images.length === 2) {
        return (
          <View style={styles.imageGridContainer}>
            <View style={styles.twoImageGrid}>
              <Image source={{ uri: post.images[0] }} style={styles.halfImageLeft} />
              <Image source={{ uri: post.images[1] }} style={styles.halfImageRight} />
            </View>
          </View>
        );
      }
      
      if (post.images.length === 3) {
        return (
          <View style={styles.imageGridContainer}>
            <View style={styles.threeImageGrid}>
              <Image source={{ uri: post.images[0] }} style={styles.twoThirdImage} />
              <View style={styles.stackRightContainer}>
                <Image source={{ uri: post.images[1] }} style={styles.thirdImage} />
                <Image source={{ uri: post.images[2] }} style={styles.thirdImage} />
              </View>
            </View>
          </View>
        );
      }
      
      // 4+ images
      const visibleImages = post.images.slice(0, 4);
      const extraCount = post.images.length - 4;
      
      return (
        <View style={styles.imageGridContainer}>
          <View style={styles.fourImageGrid}>
            <View style={styles.imageGridRow}>
              <Image source={{ uri: visibleImages[0] }} style={styles.gridImage} />
              <Image source={{ uri: visibleImages[1] }} style={styles.gridImage} />
            </View>
            <View style={styles.imageGridRow}>
              <Image source={{ uri: visibleImages[2] }} style={styles.gridImage} />
              <View style={styles.imageOverlayContainer}>
                <Image source={{ uri: visibleImages[3] }} style={styles.gridImage} />
                {extraCount > 0 && (
                  <View style={styles.extraCountOverlay}>
                    <Text style={styles.extraCountText}>+{extraCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      );
    }
    
    return null;
  };

  const renderJobBadge = (post: Post) => {
    if (post.jobDetails) {
      return (
        <View style={styles.specialBadgeContainer}>
          <View style={[styles.jobBadge, { backgroundColor: colors.lightGreen, borderLeftColor: colors.primaryGreen }]}>
            <MaterialIcons name="work" size={16} color={colors.primaryGreen} />
            <Text style={[styles.badgeText, { color: colors.primaryText }]}>
              Hiring: {post.jobDetails.title}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.badgeButton, { backgroundColor: colors.primaryGreen }]}
            onPress={() => {/* Navigate to apply */}}
          >
            <Text style={styles.badgeButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (post.type === 'advice') {
      return (
        <View style={[styles.suggestionBadge, { backgroundColor: colors.lightGreen }]}>
          <MaterialIcons name="lightbulb" size={16} color={colors.primaryGreen} />
          <Text style={[styles.badgeText, { color: colors.primaryText }]}>Expert Advice</Text>
        </View>
      );
    }
    
    return null;
  };

  const renderPost = ({ item: post }: { item: Post }) => {
    const totalReactions = Object.values(post.reactions).reduce((sum, count) => sum + count, 0);
    const isSaved = savedPosts.has(post.id);
    const hasTopComment = post.comments.length > 0;

    return (
      <View style={[styles.postCard, { 
        backgroundColor: colors.white,
        borderColor: colors.borderColor,
        shadowColor: colors.shadowColor
      }]}>
        {/* Job/Expert Badge */}
        {renderJobBadge(post)}
        
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <Image 
              source={{ uri: post.author.avatar }} 
              style={[styles.avatar, post.author.verified && styles.verifiedAvatar]} 
            />
            {post.author.verified && (
              <View style={[styles.verificationBadge, { backgroundColor: colors.primaryGreen }]}>
                <MaterialIcons name="check" size={12} color={colors.white} />
              </View>
            )}
            <View style={styles.authorDetails}>
              <Text style={[styles.authorName, { color: colors.primaryText }]}>{post.author.name}</Text>
              <View style={styles.postMeta}>
                <Text style={[styles.timestamp, { color: colors.metadataText }]}>
                  {post.timestamp} • 
                </Text>
                <MaterialIcons name="location-on" size={12} color={colors.secondaryGreen} />
                <Text style={[styles.location, { color: colors.metadataText }]}>{post.author.location}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={20} color={colors.lightText} />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={[styles.postText, { color: colors.secondaryText }]}>{post.content}</Text>
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {post.hashtags.map((tag, index) => (
                <Text key={index} style={[styles.hashtag, { color: colors.primaryGreen }]}>
                  {tag}{index < post.hashtags.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>
          )}
          
          {/* Media */}
          {renderPostMedia(post)}
        </View>

        {/* Post Stats Bar */}
        <View style={[styles.statsBar, { borderTopColor: colors.borderColor, borderBottomColor: colors.borderColor }]}>
          <View style={styles.reactionsPreview}>
            <MaterialIcons name="thumb-up" size={16} color={colors.primaryGreen} />
            <MaterialIcons name="favorite" size={16} color="#EF4444" />
            <MaterialIcons name="emoji-events" size={16} color="#F59E0B" />
          </View>
          <Text style={[styles.reactionCount, { color: colors.metadataText }]}>
            {totalReactions} reactions
          </Text>
          <Text style={[styles.commentCount, { color: colors.metadataText }]}>
            {post.totalComments} comments
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {reactionTypes.map((reaction) => (
            <TouchableOpacity 
              key={reaction.name}
              style={styles.actionButton}
              onPress={() => {
                setSelectedPostId(post.id);
                setReactionPopupVisible(true);
              }}
              onLongPress={() => {
                setSelectedPostId(post.id);
                setReactionPopupVisible(true);
              }}
            >
              <MaterialIcons 
                name={reaction.icon} 
                size={22} 
                color={colors.lightText} 
              />
              <Text style={[styles.actionText, { color: colors.metadataText }]}>
                {reaction.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save & Share Row */}
        <View style={styles.saveShareRow}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => handleSavePost(post.id)}
          >
            <MaterialIcons 
              name={isSaved ? "bookmark" : "bookmark-border"} 
              size={16} 
              color={isSaved ? colors.primaryGreen : colors.lightText} 
            />
            <Text style={[styles.saveText, { 
              color: isSaved ? colors.primaryGreen : colors.metadataText 
            }]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton}>
            <MaterialIcons name="share" size={16} color={colors.lightText} />
            <Text style={[styles.shareText, { color: colors.metadataText }]}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Preview */}
        {hasTopComment && (
          <View style={styles.commentsPreview}>
            <View style={styles.commentPreviewItem}>
              <Image 
                source={{ uri: post.comments[0].author.avatar }} 
                style={styles.commentPreviewAvatar} 
              />
              <View style={styles.commentPreviewContent}>
                <Text style={[styles.commentPreviewAuthor, { color: colors.primaryText }]}>
                  {post.comments[0].author.name}
                </Text>
                <Text 
                  style={[styles.commentPreviewText, { color: colors.secondaryText }]} 
                  numberOfLines={1}
                >
                  {post.comments[0].content}
                </Text>
                <View style={styles.commentPreviewMeta}>
                  <Text style={[styles.commentPreviewTime, { color: colors.metadataText }]}>
                    {post.comments[0].timestamp}
                  </Text>
                  {post.comments[0].replies > 0 && (
                    <Text style={[styles.commentPreviewReplies, { color: colors.primaryGreen }]}>
                      {post.comments[0].replies} replies
                    </Text>
                  )}
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.viewAllComments}
              onPress={() => {
                setSelectedPost(post);
                setShowComments(true);
              }}
            >
              <Text style={[styles.viewAllText, { color: colors.primaryGreen }]}>
                View all {post.totalComments} comments
              </Text>
              <MaterialIcons name="chevron-right" size={16} color={colors.primaryGreen} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="agriculture" size={48} color={colors.metadataText} />
      <Text style={[styles.emptyStateText, { color: colors.metadataText }]}>No posts yet</Text>
      <Text style={[styles.emptyStateSubtext, { color: colors.lightText }]}>Connect with farmers in your area</Text>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(3)].map((_, index) => (
        <View key={index} style={[styles.skeletonCard, { backgroundColor: colors.white }]}>
          <View style={styles.skeletonHeader}>
            <View style={[styles.skeletonAvatar, { backgroundColor: colors.borderColor }]} />
            <View style={styles.skeletonUserInfo}>
              <View style={[styles.skeletonLine, { backgroundColor: colors.borderColor }]} />
              <View style={[styles.skeletonSmallLine, { backgroundColor: colors.borderColor }]} />
            </View>
          </View>
          <View style={styles.skeletonContent}>
            <View style={[styles.skeletonLine, { backgroundColor: colors.borderColor }]} />
            <View style={[styles.skeletonLine, { backgroundColor: colors.borderColor }]} />
            <View style={[styles.skeletonLine, { backgroundColor: colors.borderColor }]} />
            <View style={[styles.skeletonImage, { backgroundColor: colors.borderColor }]} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      {/* New Clean Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.white,
        borderBottomColor: colors.borderColor,
        shadowColor: colors.shadowColor
      }]}>
        <View style={styles.leftHeader}>
          <TouchableOpacity>
            <MaterialIcons name="agriculture" size={24} color={colors.primaryGreen} />
          </TouchableOpacity>
        </View>
        
        {/* Center Search Bar */}
        {renderSearchBar()}
        
        {/* Right Notification Icon */}
        <View style={styles.rightHeader}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <MaterialIcons name="notifications" size={24} color={colors.lightText} />
            {unreadNotifications > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Stories Row */}
      {renderStoriesRow()}
      
      {/* Filter Tabs */}
      {renderFilterTabs()}
      
      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primaryGreen]}
            tintColor={colors.primaryGreen}
            title="Checking for new posts"
            titleColor={colors.metadataText}
          />
        }
        ListEmptyComponent={loading ? null : renderEmptyState()}
      />
      
      {loading && renderLoadingSkeleton()}
      
      {/* Story Viewer */}
      {renderStoryViewer()}
      
      {/* Reaction Popup */}
      {renderReactionPopup()}
      
      {/* Comments Modal */}
      {renderCommentsModal()}
      
      {/* Notifications Modal */}
      {renderNotificationsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 64,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderBottomWidth: 1,
  },
  leftHeader: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightHeader: {
    flex: 1,
    alignItems: 'flex-end',
  },
  searchContainer: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 40,
    flex: 1,
    maxWidth: 300,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
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
  
  // Stories Row Styles
  storiesContainer: {
    height: 90,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  storiesContent: {
    paddingRight: 16,
  },
  storyItem: {
    width: 70,
    alignItems: 'center',
    marginRight: 8,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    marginBottom: 6,
  },
  unviewedStoryRing: {
    backgroundColor: '#2E7D32',
  },
  viewedStoryRing: {
    backgroundColor: '#E0E0E0',
  },
  ownStoryRing: {
    backgroundColor: '#2E7D32',
  },
  storyImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  viewedStoryImage: {
    opacity: 0.8,
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  liveIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  storyUsername: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  unviewedStoryUsername: {
    color: '#333333',
  },
  viewedStoryUsername: {
    color: '#999999',
  },
  
  // Story Viewer Styles
  storyViewerOverlay: {
    flex: 1,
    backgroundColor: '#000000',
  },
  storyViewerContainer: {
    flex: 1,
  },
  storyViewerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storyViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyViewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  storyViewerInfo: {
    justifyContent: 'center',
  },
  storyViewerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  storyViewerTimestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  storyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyContentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  // Filter Tabs
  filterTabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterTabsContent: {
    paddingRight: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#FFFFFF',
  },
  filterTabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  activeTabIndicator: {
    height: 2,
    width: '100%',
    borderRadius: 1,
    marginTop: 4,
  },
  
  // Feed Container
  feedContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 80,
  },
  
  // Post Card
  postCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  
  // Special Badges
  specialBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  suggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  badgeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Post Header
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  verifiedAvatar: {
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    fontSize: 12,
    marginLeft: 2,
  },
  
  // Post Content
  postContent: {
    marginBottom: 12,
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  hashtag: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Media
  postImage: {
    width: '100%',
    height: 200,
  },
  imageGridContainer: {
    marginBottom: 12,
  },
  twoImageGrid: {
    flexDirection: 'row',
    height: 150,
  },
  halfImageLeft: {
    flex: 1,
    marginRight: 2,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  halfImageRight: {
    flex: 1,
    marginLeft: 2,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  threeImageGrid: {
    flexDirection: 'row',
    height: 150,
  },
  twoThirdImage: {
    flex: 2,
    marginRight: 2,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  stackRightContainer: {
    flex: 1,
    marginLeft: 2,
  },
  thirdImage: {
    flex: 1,
    marginBottom: 2,
    borderTopRightRadius: 12,
  },
  fourImageGrid: {
    height: 200,
  },
  imageGridRow: {
    flexDirection: 'row',
    flex: 1,
  },
  gridImage: {
    flex: 1,
    margin: 2,
  },
  imageOverlayContainer: {
    position: 'relative',
    flex: 1,
    margin: 2,
  },
  extraCountOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  extraCountText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  reactionsPreview: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reactionCount: {
    fontSize: 13,
    marginRight: 12,
  },
  commentCount: {
    fontSize: 13,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    marginBottom: 8,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Save & Share
  saveShareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
  
  // Comments Preview
  commentsPreview: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  commentPreviewItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentPreviewAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  commentPreviewContent: {
    flex: 1,
  },
  commentPreviewAuthor: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentPreviewText: {
    fontSize: 13,
    marginBottom: 4,
  },
  commentPreviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentPreviewTime: {
    fontSize: 11,
    marginRight: 8,
  },
  commentPreviewReplies: {
    fontSize: 11,
    fontWeight: '500',
  },
  viewAllComments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 4,
  },
  
  // Modals
  reactionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionPopup: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  reactionOption: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  reactionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  reactionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  commentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentList: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    marginBottom: 4,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentLikes: {
    fontSize: 12,
    marginLeft: 4,
  },
  commentActionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  commentReplies: {
    fontSize: 12,
    fontWeight: '500',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  
  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  notificationModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  notificationList: {
    flex: 1,
    padding: 16,
  },
  notificationCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  notificationAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
  },
  boldText: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    marginTop: 2,
  },
  
  // Loading Skeleton
  skeletonContainer: {
    paddingHorizontal: 12,
  },
  skeletonCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  skeletonHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  skeletonUserInfo: {
    flex: 1,
  },
  skeletonLine: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  skeletonSmallLine: {
    height: 12,
    borderRadius: 4,
    width: '40%',
  },
  skeletonContent: {
    marginBottom: 12,
  },
  skeletonImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginTop: 8,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});