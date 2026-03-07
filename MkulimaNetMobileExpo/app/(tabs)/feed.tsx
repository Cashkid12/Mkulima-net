import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, Dimensions, Animated, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { feedApi, postsApi, notificationsApi } from '../../services/api';

// Color System
const COLORS = {
  primaryGreen: '#1B8E3E',
  secondaryGreen: '#34A853',
  lightGreenBg: '#E8F5E9',
  white: '#FFFFFF',
  primaryText: '#222222',
  secondaryText: '#757575',
  lightGrayBg: '#F5F7FA',
  borderGray: '#E6E6E6',
  error: '#F44336',
  highlight: '#2196F3',
};

// Typography
const FONTS = {
  title: { fontSize: 18, fontWeight: '700' },
  username: { fontSize: 16, fontWeight: '600' },
  postText: { fontSize: 16, fontWeight: '400' },
  metadata: { fontSize: 14, color: COLORS.secondaryText },
  label: { fontSize: 12, color: COLORS.secondaryText },
};

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
  icon: string | any;
  color: string;
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

// Mock data - defined at module level for immediate availability
const mockPostsData: Post[] = [
  {
    id: 1,
    author: {
      name: 'John Kariuki',
      avatar: 'https://via.placeholder.com/48x48',
      location: 'Nakuru County',
      role: 'Farmer',
      verified: true
    },
    content: 'Just harvested 50 bags of organic maize! Quality produce available for sale.',
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

export default function FeedScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  // Show mock data immediately while real data loads
  const [posts, setPosts] = useState<Post[]>(mockPostsData);
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const scaleAnim = useState(new Animated.Value(1))[0];

  /** Map backend post fields → our Post interface */
  const mapBackendPost = (p: any): Post => ({
    id: p._id ?? p.id,
    author: {
      name: p.user
        ? `${p.user.firstName ?? ''} ${p.user.lastName ?? ''}`.trim()
        : 'Unknown',
      avatar: p.user?.profilePicture || 'https://via.placeholder.com/48x48',
      location: p.user?.location?.town || p.user?.location || 'Kenya',
      role: p.user?.role || 'Farmer',
      verified: p.user?.verified || false,
    },
    content: p.content || '',
    image: p.media?.[0] || undefined,
    images: p.media?.length > 1 ? p.media : undefined,
    reactions: {
      like: p.likes?.length || 0,
      celebrate: 0,
      love: 0,
      insightful: 0,
      funny: 0,
    },
    totalReactions: p.likes?.length || 0,
    comments: (p.comments || []).slice(0, 2).map((c: any) => ({
      id: c._id ?? c.id,
      author: {
        name: c.user ? `${c.user.firstName ?? ''} ${c.user.lastName ?? ''}`.trim() : c.name || 'User',
        avatar: c.user?.profilePicture || 'https://via.placeholder.com/24x24',
      },
      content: c.content || '',
      likes: 0,
      timestamp: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'recently',
      replies: 0,
    })),
    totalComments: p.comments?.length || 0,
    timestamp: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
    type: p.postType || 'text',
    hashtags: p.tags || [],
  });

  // Professional color palette - MkulimaNet Mobile Spec
  const colors = {
    // Core Brand Colors
    primaryGreen: '#2E7D32',       // Buttons, active states, reactions
    secondaryGreen: '#4CAF50',     // Icons, verified badges
    lightGreen: '#E8F5E9',         // Story rings, highlights
    white: '#FFFFFF',              // Background
    offWhite: '#FAFAFA',           // Very light background
    
    // Text Hierarchy
    darkCharcoal: '#222222',        // Usernames, headings
    primaryText: '#222222',        // Primary text (alias)
    postText: '#333333',           // Post content
    secondaryText: '#333333',       // Secondary text (alias)
    metadataGray: '#757575',       // Timestamps, captions
    metadataText: '#757575',       // Metadata text (alias)
    inactiveGray: '#9E9E9E',       // Inactive icons
    lightText: '#9E9E9E',          // Light text (alias)
    placeholderGray: '#BDBDBD',    // Input placeholders
    placeholderText: '#BDBDBD',    // Placeholder text (alias)
    
    // UI Elements
    borderGray: '#E0E0E0',         // Dividers
    borderColor: '#F0F0F0',        // Border color (alias)
    inputBackground: '#F5F7FA',    // Input backgrounds
    lightGray: '#F5F7FA',          // Light gray (alias)
    shadowColor: '#000000',
    disabled: '#9E9E9E',
    error: '#EF4444',
  };

  // Filter options
  const filterOptions = ['All', 'Following', 'Market', 'Jobs', 'Advice'];

  // Mock reactions data for demonstration
  const reactionTypes: ReactionType[] = [
    { name: 'Like', icon: 'thumbs-up', color: COLORS.primaryGreen },
    { name: 'Love', icon: 'heart', color: '#EF4444' },
    { name: 'Helpful', icon: 'leaf', color: '#F59E0B' },
    { name: 'Celebrate', icon: 'star', color: '#F59E0B' },
    { name: 'Insightful', icon: 'bulb', color: '#3B82F6' },
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

  // Fetch posts from real API, fall back to mock data
  const fetchPosts = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await feedApi.getFeed(token, 'forYou', 20, 0);
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data.map(mapBackendPost));
      }
    } catch (err) {
      console.warn('Feed API failed, keeping mock data:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await getToken();
        const data = await notificationsApi.getNotifications(token);
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadNotifications(data.filter((n: any) => !n.read).length);
        }
      } catch (err) {
        console.warn('Notifications API failed:', err);
      }
    };
    fetchNotifications();
  }, [getToken]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const token = await getToken();
      const data = await feedApi.getFeed(token, 'forYou', 20, 0);
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data.map(mapBackendPost));
      } else {
        setPosts(mockPostsData);
      }
    } catch (error) {
      console.warn('Refresh failed, using mock data:', error);
      setPosts(mockPostsData);
    } finally {
      setRefreshing(false);
    }
  };

  const handleReaction = async (postId: number, reactionType: keyof ReactionCounts) => {
    // Optimistic update
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const newReactions = { ...post.reactions };
          (newReactions[reactionType] as number)++;
          return { ...post, reactions: newReactions, totalReactions: post.totalReactions + 1 };
        }
        return post;
      })
    );
    setReactionPopupVisible(false);
    // Call API in background
    try {
      const token = await getToken();
      await postsApi.reactToPost(String(postId), reactionType, token);
    } catch (err) {
      console.warn('Reaction API failed:', err);
    }
  };

  const handleSavePost = async (postId: number) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
    try {
      const token = await getToken();
      await postsApi.savePost(String(postId), token);
    } catch (err) {
      console.warn('Save post API failed:', err);
    }
  };

  const handleCommentSubmit = async () => {
    if (commentText.trim() && selectedPost) {
      const newComment: Comment = {
        id: Date.now(),
        author: { name: user?.firstName || 'You', avatar: user?.imageUrl || 'https://via.placeholder.com/24x24' },
        content: commentText,
        likes: 0,
        timestamp: 'Just now',
        replies: 0
      };

      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === selectedPost.id) {
            return { ...post, comments: [...post.comments, newComment], totalComments: post.totalComments + 1 };
          }
          return post;
        })
      );

      const text = commentText;
      setCommentText('');
      setShowComments(false);

      try {
        const token = await getToken();
        await postsApi.addComment(String(selectedPost.id), text, token);
      } catch (err) {
        console.warn('Comment API failed:', err);
      }
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
              <MaterialIcons name={reaction.icon as any} size={24} color={reaction.color} />
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
            {notifications.length > 0 ? notifications.map((n: any) => (
              <View key={n._id || n.id} style={styles.notificationItem}>
                <Image source={{ uri: n.sourceUser?.profilePicture || 'https://via.placeholder.com/30x30' }} style={styles.notificationAvatar} />
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationText, { color: colors.primaryText }]}>{n.title || n.message}</Text>
                  <Text style={[styles.notificationTime, { color: colors.metadataText }]}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>
              </View>
            )) : (
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
            )}
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
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {filterOptions.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.filterTab,
            activeFilter === option && styles.filterTabActive
          ]}
          onPress={() => setActiveFilter(option)}
        >
          <Text style={[
            styles.filterText,
            activeFilter === option && styles.filterTextActive
          ]}>
            {option}
          </Text>
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
      <View style={[styles.postCard]}>
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
              <View style={styles.verificationBadge}>
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              </View>
            )}
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <View style={styles.postMeta}>
                <Text style={styles.timestamp}>
                  {post.timestamp} • 
                </Text>
                <Ionicons name="location" size={12} color={COLORS.primaryGreen} />
                <Text style={styles.location}>{post.author.location}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={[styles.postText, { color: COLORS.primaryText }]}>{post.content}</Text>
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {post.hashtags.map((tag, index) => (
                <Text key={index} style={[styles.hashtag, { color: COLORS.primaryGreen }]}>
                  {tag}{index < post.hashtags.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>
          )}
          
          {/* Media */}
          {renderPostMedia(post)}
        </View>

        {/* Post Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.reactionsPreview}>
            <Ionicons name="thumbs-up" size={16} color={COLORS.primaryGreen} />
            <Ionicons name="heart" size={16} color="#EF4444" />
            <Ionicons name="leaf" size={16} color="#F59E0B" />
            <Text style={styles.reactionCount}>{totalReactions} reactions</Text>
          </View>
          <Text style={styles.commentCount}>{post.totalComments} comments</Text>
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
              <Ionicons 
                name={reaction.icon as any} 
                size={22} 
                color={COLORS.secondaryText} 
              />
              <Text style={styles.actionText}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.lightGrayBg }]}>
      {/* Status Bar */}
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Top App Bar - 60px height */}
      <View style={[styles.topAppBar, { 
        backgroundColor: COLORS.white,
        borderBottomColor: COLORS.borderGray,
      }]}>
        <View style={styles.topAppBarLeft}>
          <Ionicons name="leaf" size={28} color={COLORS.primaryGreen} />
          <Text style={styles.appName}>MkulimaNet</Text>
        </View>
        
        {/* Center Search Bar */}
        {renderSearchBar()}
        
        {/* Right Notification Icon */}
        <View style={styles.topAppBarRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.secondaryText} />
            {unreadNotifications > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: COLORS.error }]}>
                <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Feed Filters */}
      {renderFilterTabs()}
      
      {/* Stories Row */}
      {renderStoriesRow()}
      
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
            colors={[COLORS.primaryGreen]}
            tintColor={COLORS.primaryGreen}
            title="Refreshing feed..."
            titleColor={COLORS.secondaryText}
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
  // Top App Bar - 60px height
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  topAppBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginLeft: 8,
  },
  topAppBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: COLORS.lightGrayBg,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primaryText,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '600',
  },
  
  // Feed Filters
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  filterContent: {
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    backgroundColor: COLORS.white,
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryGreen,
    borderColor: COLORS.primaryGreen,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.secondaryText,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  
  // Stories Row - 100px height
  storiesContainer: {
    height: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  storiesContent: {
    paddingRight: 16,
  },
  storyItem: {
    width: 70,
    alignItems: 'center',
    marginRight: 12,
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    marginBottom: 4,
  },
  unviewedStoryRing: {
    backgroundColor: COLORS.primaryGreen,
  },
  viewedStoryRing: {
    backgroundColor: COLORS.borderGray,
  },
  ownStoryRing: {
    backgroundColor: COLORS.primaryGreen,
  },
  storyImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  liveIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
  },
  storyUsername: {
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.primaryText,
  },
  viewedStoryUsername: {
    color: COLORS.secondaryText,
  },
  unviewedStoryUsername: {
    color: COLORS.primaryText,
    fontWeight: '600',
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
    color: '#222222',
  },
  viewedStoryUsername: {
    color: '#9E9E9E',
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
  // Post Card - 18px border radius, white background, subtle shadow
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 80,
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
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.lightGreenBg,
  },
  suggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.lightGreenBg,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: COLORS.primaryText,
  },
  badgeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primaryGreen,
  },
  badgeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Post Header - 48px avatar
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
    borderColor: COLORS.primaryGreen,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryText,
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginRight: 4,
  },
  location: {
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 2,
  },
  
  // Post Content - Mobile Spec: 16px text, line height 1.5, hashtags green
  postContent: {
    marginBottom: 12,
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 12,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  hashtag: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2E7D32',
  },
  
  // Media - Mobile Spec: Single image 200px height
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
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
  
  // Stats Bar - 32px height, reaction icons left, comment count right
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    height: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderGray,
  },
  reactionsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionCount: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginLeft: 4,
  },
  commentCount: {
    fontSize: 14,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },
  
  // Action Buttons - 56px height, 24px icons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    height: 56,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
    color: COLORS.secondaryText,
  },
  
  // Save & Share
  saveShareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGray,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: COLORS.secondaryText,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: COLORS.secondaryText,
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
  // Comment Input - Mobile Spec: 48px height, rounded 24px, light gray background
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  commentInput: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#F5F7FA',
    minHeight: 48,
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