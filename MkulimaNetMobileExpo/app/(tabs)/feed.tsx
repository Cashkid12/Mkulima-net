import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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
}

interface Post {
  id: number;
  author: Author;
  content: string;
  image?: string;
  reactions: ReactionCounts;
  totalReactions: number;
  comments: Comment[];
  totalComments: number;
  timestamp: string;
  type: string;
  hashtags: string[];
}

interface ReactionType {
  name: string;
  icon: string;
  color: string;
  emoji: string;
}

export default function FeedScreen() {
  const { authState } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
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

  // Mock reactions data for demonstration
  const reactionTypes: ReactionType[] = [
    { name: 'like', icon: 'thumb-up', color: '#1B5E20', emoji: '👍' },
    { name: 'celebrate', icon: 'emoji-events', color: '#F59E0B', emoji: '🎉' },
    { name: 'love', icon: 'favorite', color: '#EF4444', emoji: '❤️' },
    { name: 'insightful', icon: 'lightbulb', color: '#3B82F6', emoji: '💡' },
    { name: 'funny', icon: 'sentiment-very-satisfied', color: '#8B5CF6', emoji: '😂' },
  ];

  // Mock data for initial load - in real app this would come from backend
  useEffect(() => {
    // Simulate API call to fetch posts
    setTimeout(() => {
      const mockPosts: Post[] = [
        {
          id: 1,
          author: {
            name: 'John Kariuki',
            avatar: 'https://via.placeholder.com/40x40',
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
              author: { name: 'Mary Wanjiru', avatar: 'https://via.placeholder.com/30x30' },
              content: 'Congratulations on the harvest!',
              likes: 2,
              timestamp: '1 hour ago'
            },
            {
              id: 2,
              author: { name: 'Samuel Ochieng', avatar: 'https://via.placeholder.com/30x30' },
              content: 'Would love to buy some of this maize for my business',
              likes: 1,
              timestamp: '30 minutes ago'
            }
          ],
          totalComments: 2,
          timestamp: '2 hours ago',
          type: 'harvest',
          hashtags: ['#maize', '#organic', '#harvest']
        },
        {
          id: 2,
          author: {
            name: 'Mary Wanjiru',
            avatar: 'https://via.placeholder.com/40x40',
            location: 'Kiambu County',
            role: 'Expert',
            verified: true
          },
          content: 'New dairy cows arrived today! Looking forward to increased milk production. The quality of these Holstein Friesian is exceptional.',
          image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
          reactions: {
            like: 28,
            celebrate: 8,
            love: 12,
            insightful: 3,
            funny: 0
          },
          totalReactions: 41,
          comments: [
            {
              id: 1,
              author: { name: 'James Maina', avatar: 'https://via.placeholder.com/30x30' },
              content: 'These are beautiful animals! Where did you get them?',
              likes: 3,
              timestamp: '45 minutes ago'
            }
          ],
          totalComments: 1,
          timestamp: '5 hours ago',
          type: 'livestock',
          hashtags: ['#cows', '#dairy', '#livestock']
        },
        {
          id: 3,
          author: {
            name: 'Samuel Ochieng',
            avatar: 'https://via.placeholder.com/40x40',
            location: 'Siaya County',
            role: 'Buyer',
            verified: false
          },
          content: 'Looking for suppliers of fresh vegetables for our restaurant chain. We need consistent supply of tomatoes, onions, and leafy greens.',
          reactions: {
            like: 15,
            celebrate: 2,
            love: 1,
            insightful: 5,
            funny: 0
          },
          totalReactions: 23,
          comments: [],
          totalComments: 0,
          timestamp: '8 hours ago',
          type: 'marketplace',
          hashtags: ['#vegetables', '#supplier', '#restaurant']
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

  const handleCommentSubmit = () => {
    if (commentText.trim() && selectedPost) {
      const newComment: Comment = {
        id: Date.now(),
        author: { name: authState.user?.name || 'Current User', avatar: authState.user?.avatar || 'https://via.placeholder.com/30x30' },
        content: commentText,
        likes: 0,
        timestamp: 'Just now'
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
        <View style={styles.reactionPopup}>
          {reactionTypes.map((reaction) => (
            <TouchableOpacity
              key={reaction.name}
              style={styles.reactionOption}
              onPress={() => handleReaction(selectedPostId!, reaction.name as keyof ReactionCounts)}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
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
        <View style={styles.commentModal}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentTitle}>Comments</Text>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <MaterialIcons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.commentList}>
            {selectedPost?.comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image source={{ uri: comment.author.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>{comment.author.name}</Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <Text style={styles.commentTime}>{comment.timestamp}</Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity style={styles.commentAction}>
                      <MaterialIcons name="favorite-border" size={14} color="#666666" />
                      <Text style={styles.commentLikes}>{comment.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentAction}>
                      <MaterialIcons name="reply" size={14} color="#666666" />
                      <Text style={styles.commentActionText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]} 
              onPress={handleCommentSubmit}
              disabled={!commentText.trim()}
            >
              <MaterialIcons name="send" size={20} color={commentText.trim() ? '#1B5E20' : '#CCCCCC'} />
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
        <View style={styles.notificationModal}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <MaterialIcons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.notificationList}>
            <View style={styles.notificationCategory}>
              <Text style={styles.categoryTitle}>Likes</Text>
              <View style={styles.notificationItem}>
                <Image source={{ uri: 'https://via.placeholder.com/30x30' }} style={styles.notificationAvatar} />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}><Text style={styles.boldText}>James Maina</Text> liked your post</Text>
                  <Text style={styles.notificationTime}>2 min ago</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.notificationCategory}>
              <Text style={styles.categoryTitle}>Comments</Text>
              <View style={styles.notificationItem}>
                <Image source={{ uri: 'https://via.placeholder.com/30x30' }} style={styles.notificationAvatar} />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}><Text style={styles.boldText}>Mary Wanjiru</Text> commented on your post</Text>
                  <Text style={styles.notificationTime}>15 min ago</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.notificationCategory}>
              <Text style={styles.categoryTitle}>Job Alerts</Text>
              <View style={styles.notificationItem}>
                <MaterialIcons name="work" size={24} color="#1B5E20" style={styles.notificationIcon} />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>New job posting in your area</Text>
                  <Text style={styles.notificationTime}>1 hour ago</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.notificationCategory}>
              <Text style={styles.categoryTitle}>Marketplace</Text>
              <View style={styles.notificationItem}>
                <MaterialIcons name="store" size={24} color="#1B5E20" style={styles.notificationIcon} />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>Someone is interested in your listing</Text>
                  <Text style={styles.notificationTime}>3 hours ago</Text>
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
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts, farmers, products…"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setShowSearch(true)}
        />
      </View>
    </View>
  );

  const renderExpandedSearch = () => (
    <Modal
      transparent={true}
      visible={showSearch}
      animationType="slide"
      onRequestClose={() => setShowSearch(false)}
    >
      <TouchableOpacity 
        style={styles.searchOverlay} 
        onPress={() => setShowSearch(false)}
      >
        <View style={styles.expandedSearchContainer}>
          <View style={styles.expandedSearchBar}>
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <MaterialIcons name="arrow-back" size={24} color="#666666" />
            </TouchableOpacity>
            <TextInput
              style={styles.expandedSearchInput}
              placeholder="Search posts, farmers, products…"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
          
          <ScrollView style={styles.searchResultsContainer}>
            <Text style={styles.searchSectionTitle}>Recent Searches</Text>
            <View style={styles.searchResultItem}>
              <MaterialIcons name="history" size={20} color="#9CA3AF" />
              <Text style={styles.searchResultText}>organic maize</Text>
            </View>
            <View style={styles.searchResultItem}>
              <MaterialIcons name="history" size={20} color="#9CA3AF" />
              <Text style={styles.searchResultText}>dairy farming</Text>
            </View>
            <View style={styles.searchResultItem}>
              <MaterialIcons name="history" size={20} color="#9CA3AF" />
              <Text style={styles.searchResultText}>agricultural jobs</Text>
            </View>
            
            <Text style={styles.searchSectionTitle}>Suggestions</Text>
            <View style={styles.searchResultItem}>
              <MaterialIcons name="person" size={20} color="#1B5E20" />
              <Text style={styles.searchResultText}>John Kariuki</Text>
            </View>
            <View style={styles.searchResultItem}>
              <MaterialIcons name="local-offer" size={20} color="#1B5E20" />
              <Text style={styles.searchResultText}>#organic</Text>
            </View>
            <View style={styles.searchResultItem}>
              <MaterialIcons name="shopping-cart" size={20} color="#1B5E20" />
              <Text style={styles.searchResultText}>Fresh Vegetables</Text>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderPost = ({ item: post }: { item: Post }) => {
    const totalReactions = Object.values(post.reactions).reduce((sum, count) => sum + count, 0);
    const topReaction = Object.entries(post.reactions).sort(([,a], [,b]) => b - a)[0];
    const topReactionType = topReaction ? topReaction[0] : 'like';
    const topReactionCount = topReaction ? topReaction[1] : 0;

    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
            <View style={styles.authorDetails}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{post.author.name}</Text>
                {post.author.verified && (
                  <MaterialIcons name="verified" size={16} color="#1B5E20" />
                )}
              </View>
              <Text style={styles.roleText}>{post.author.role}</Text>
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={14} color="#666666" />
                <Text style={styles.locationText}>{post.author.location}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={styles.postText}>{post.content}</Text>
          {post.image && (
            <Image source={{ uri: post.image }} style={styles.postImage} />
          )}
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {post.hashtags.map((tag, index) => (
                <TouchableOpacity key={index} style={styles.hashtag}>
                  <Text style={styles.hashtagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Post Reactions Summary */}
        <View style={styles.reactionsSummary}>
          <View style={styles.reactionAvatars}>
            {/* Placeholder for reaction avatars - in real app this would show reactors */}
            <View style={styles.reactionAvatarPlaceholder} />
            <View style={styles.reactionAvatarPlaceholder} />
            <View style={styles.reactionAvatarPlaceholder} />
          </View>
          <Text style={styles.reactionCount}>{totalReactions} reactions</Text>
        </View>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSelectedPostId(post.id);
              setReactionPopupVisible(true);
            }}
          >
            <MaterialIcons name="thumb-up" size={20} color="#666666" />
            <Text style={styles.actionText}>
              {topReactionCount > 0 ? `${topReactionCount} ${topReactionType}` : 'Like'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSelectedPost(post);
              setShowComments(true);
            }}
          >
            <MaterialIcons name="chat-bubble-outline" size={20} color="#666666" />
            <Text style={styles.actionText}>{post.totalComments} Comments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="share" size={20} color="#666666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="sentiment-dissatisfied" size={48} color="#CCCCCC" />
      <Text style={styles.emptyStateText}>No posts yet</Text>
      <Text style={styles.emptyStateSubtext}>Be the first to share something!</Text>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(3)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonUserInfo}>
              <View style={styles.skeletonLine} />
              <View style={styles.skeletonSmallLine} />
            </View>
          </View>
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonImage} />
          </View>
          <View style={styles.skeletonActions}>
            <View style={styles.skeletonAction} />
            <View style={styles.skeletonAction} />
            <View style={styles.skeletonAction} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* New Clean Header */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          {/* Small minimal logo icon (optional) */}
          <TouchableOpacity>
            <MaterialIcons name="agriculture" size={24} color="#1B5E20" />
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
            <MaterialIcons name="notifications" size={24} color="#666666" />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Expanded Search Modal */}
      {renderExpandedSearch()}
      
      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={loading ? null : renderEmptyState()}
      />
      
      {loading && renderLoadingSkeleton()}
      
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#F5F5F5',
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
    color: '#111111',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
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
  expandedSearchContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  expandedSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expandedSearchInput: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#111111',
  },
  searchResultsContainer: {
    flex: 1,
    padding: 16,
  },
  searchSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  searchResultText: {
    fontSize: 16,
    color: '#111111',
    marginLeft: 12,
  },
  searchOverlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  notificationModal: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F0F0F0',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
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
    color: '#666666',
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
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#111111',
  },
  boldText: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  feedContainer: {
    padding: 16,
    paddingTop: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  roleText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  postContent: {
    marginBottom: 12,
  },
  postText: {
    fontSize: 14,
    color: '#111111',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  hashtag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  hashtagText: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '500',
  },
  reactionsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  reactionAvatars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reactionAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -5,
  },
  reactionCount: {
    fontSize: 12,
    color: '#666666',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  
  // Reaction Popup Styles
  reactionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionPopup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionOption: {
    padding: 12,
    marginHorizontal: 4,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  
  // Comments Modal Styles
  commentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentModal: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F0F0F0',
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
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
    color: '#111111',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#111111',
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  commentActions: {
    flexDirection: 'row',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentLikes: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  
  // Loading Skeleton Styles
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  skeletonUserInfo: {
    flex: 1,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  skeletonSmallLine: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '40%',
  },
  skeletonContent: {
    marginBottom: 12,
  },
  skeletonImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 8,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  skeletonAction: {
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    width: '25%',
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
    color: '#666666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
});