'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  User,
  Check,
  MapPin,
  Calendar,
  RefreshCw,
  AlertCircle,
  Star,
  Users,
  FileText,
  Video,
  Image,
  Plus,
  X
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  farmName?: string;
  location?: string;
  profilePicture?: string;
  verified: boolean;
}

interface BackendUser {
  _id: string;
  firstName: string;
  lastName: string;
  farmName?: string;
  location?: string;
  profilePicture?: string;
  verified?: boolean;
  isFollowing?: boolean;
}

interface BackendComment {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  createdAt: string;
}

interface BackendReaction {
  type: 'celebrate' | 'support' | 'love' | 'insightful' | 'funny';
  user: string;
}

interface BackendPost {
  _id: string;
  user: BackendUser;
  content: string;
  media?: string[];
  createdAt: string;
  reactions: BackendReaction[];
  comments: BackendComment[];
  sharesCount?: number;
  saved?: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

interface Reaction {
  type: 'celebrate' | 'support' | 'love' | 'insightful' | 'funny';
  count: number;
  userReacted: boolean;
}

interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  image?: string;
  timestamp: string;
  reactionCounts: Reaction[];
  comments: Comment[];
  shares: number;
  saved: boolean;
  isFollowingAuthor: boolean;
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [activeFilter, setActiveFilter] = useState<'all' | 'crops' | 'livestock' | 'jobs' | 'marketplace'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showReactionPicker, setShowReactionPicker] = useState<{postId: string, visible: boolean}>({postId: '', visible: false});
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const router = useRouter();
  
  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily bypass authentication for debugging
      // Get token from localStorage (but don't fail if not present)
      const token = localStorage.getItem('token');
      
      // Determine feed type based on active tab
      const feedType = activeTab === 'following' ? 'following' : 'forYou';
      
      // For now, use mock data instead of API calls to bypass auth issues
      const mockPosts = [
        {
          id: '1',
          userId: 'user1',
          user: {
            id: 'user1',
            firstName: 'John',
            lastName: 'Kamau',
            username: 'john_kamau',
            profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            verified: false
          },
          content: 'Great maize harvest this season! Yields are 30% higher than last year. The new hybrid seeds are really paying off. #FarmingSuccess #MaizeHarvest',
          image: 'https://images.unsplash.com/photo-1597250322672-7f34a45b2c5e?w=600&h=400&fit=crop',
          likes: 24,
          comments: [], // Changed from number to array
          saves: 12,
          isLiked: false,
          isSaved: false,
          timestamp: '2 hours ago',
          location: 'Nairobi, Kenya',
          reactionCounts: [],
          shares: 0,
          saved: false,
          isFollowingAuthor: false
        },
        {
          id: '2',
          userId: 'user2',
          user: {
            id: 'user2',
            firstName: 'Mary',
            lastName: 'Wanjiku',
            username: 'mary_wanjiku',
            profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            verified: false
          },
          content: 'My dairy cows are producing record milk. Daily production is up to 45 liters per cow. Looking for buyers interested in fresh milk and dairy products. #DairyFarming #MilkProduction',
          image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop',
          likes: 18,
          comments: [], // Changed from number to array
          saves: 9,
          isLiked: true,
          isSaved: false,
          timestamp: '4 hours ago',
          location: 'Kiambu, Kenya',
          reactionCounts: [],
          shares: 0,
          saved: false,
          isFollowingAuthor: false
        },
        {
          id: '3',
          userId: 'user3',
          user: {
            id: 'user3',
            firstName: 'David',
            lastName: 'Ochieng',
            username: 'david_ochieng',
            profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
            verified: false
          },
          content: 'Coffee farming tips for small-scale farmers: Proper pruning, soil management, and pest control are key to high-quality beans. Quality over quantity always wins in the coffee market. #CoffeeFarming #AgricultureTips',
          likes: 31,
          comments: [], // Changed from number to array
          saves: 15,
          isLiked: false,
          isSaved: true,
          timestamp: '1 day ago',
          location: 'Nyeri, Kenya',
          reactionCounts: [],
          shares: 0,
          saved: false,
          isFollowingAuthor: false
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPosts(mockPosts);
      setHasMore(mockPosts.length >= 20);
      
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  const handleReaction = async (postId: string, reactionType: Reaction['type']) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Optimistic update
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const updatedReactions = [...post.reactionCounts];
            const existingReactionIndex = updatedReactions.findIndex(r => r.userReacted);
            
            if (existingReactionIndex !== -1) {
              // Replace existing reaction
              updatedReactions[existingReactionIndex] = {
                ...updatedReactions[existingReactionIndex],
                userReacted: false
              };
              
              // Add new reaction or update existing one
              const newReactionIndex = updatedReactions.findIndex(r => r.type === reactionType);
              if (newReactionIndex !== -1) {
                updatedReactions[newReactionIndex] = {
                  ...updatedReactions[newReactionIndex],
                  count: updatedReactions[newReactionIndex].count + 1,
                  userReacted: true
                };
              } else {
                updatedReactions.push({
                  type: reactionType,
                  count: 1,
                  userReacted: true
                });
              }
            } else {
              // Add new reaction
              const newReactionIndex = updatedReactions.findIndex(r => r.type === reactionType);
              if (newReactionIndex !== -1) {
                updatedReactions[newReactionIndex] = {
                  ...updatedReactions[newReactionIndex],
                  count: updatedReactions[newReactionIndex].count + 1,
                  userReacted: true
                };
              } else {
                updatedReactions.push({
                  type: reactionType,
                  count: 1,
                  userReacted: true
                });
              }
            }
            
            return {
              ...post,
              reactionCounts: updatedReactions
            };
          }
          return post;
        })
      );

      // Backend call
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feed/${postId}/react`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type: reactionType })
        });

        if (!response.ok) {
          throw new Error('Failed to react to post');
        }
      } catch (err) {
        // In case of error, revert optimistic update
        console.warn('Reaction API call failed, reverting optimistic update:', err);
        fetchPosts(); // Reload to get correct state
      }

    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const handleDefaultReaction = (postId: string) => {
    handleReaction(postId, 'celebrate');
  };

  const handleReactionMouseDown = (postId: string) => {
    // Start timeout for long press
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker({postId, visible: true});
    }, 500); // 500ms for long press
  };

  const handleReactionMouseUp = (postId: string) => {
    // Clear timeout and handle default tap if not long pressed
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current);
      reactionTimeoutRef.current = null;
      
      // If picker is not visible, it was a quick tap
      if (!showReactionPicker.visible || showReactionPicker.postId !== postId) {
        handleDefaultReaction(postId);
      }
    }
  };

  const handleReactionTouchStart = (postId: string) => {
    // Start timeout for long press
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker({postId, visible: true});
    }, 500); // 500ms for long press
  };

  const handleReactionTouchEnd = (postId: string) => {
    // Clear timeout and handle default tap if not long pressed
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current);
      reactionTimeoutRef.current = null;
      
      // If picker is not visible, it was a quick tap
      if (!showReactionPicker.visible || showReactionPicker.postId !== postId) {
        handleDefaultReaction(postId);
      }
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Optimistic update
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              saved: !post.saved
            };
          }
          return post;
        })
      );

      // Backend call
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/save`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to save post');
        }
      } catch (err) {
        // In case of error, revert optimistic update
        console.warn('Save API call failed, reverting optimistic update:', err);
        fetchPosts(); // Reload to get correct state
      }

    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Optimistic update
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.userId === userId) {
            return {
              ...post,
              isFollowingAuthor: !post.isFollowingAuthor
            };
          }
          return post;
        })
      );

      // Backend call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to follow user');
      }
    } catch (err) {
      console.error('Follow error:', err);
      // Revert optimistic update on error
      fetchPosts();
    }
  };

  const handleCommentClick = (postId: string) => {
    router.push(`/dashboard/posts/${postId}`);
  };

  const handleProfileClick = (userId: string) => {
    router.push(`/dashboard/profile/${userId}`);
  };

  const handleRefresh = () => {
    setPage(1);
    setPosts([]);
    fetchPosts();
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || creatingPost) return;

    try {
      setCreatingPost(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPostContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.message || 'Failed to create post');
      }

      // Reset form and close modal
      setNewPostContent('');
      setShowCreatePostModal(false);
      
      // Refresh the feed to show the new post
      setPage(1);
      setPosts([]);
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post: ' + (err as Error).message);
    } finally {
      setCreatingPost(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    // Reset to first page when changing tabs
    setPage(1);
    setPosts([]);
    fetchPosts();
  }, [activeTab, fetchPosts]);

  const getUserReaction = (reactionCounts: Reaction[]) => {
    return reactionCounts.find(r => r.userReacted);
  };

  const getTopReactions = (reactionCounts: Reaction[]) => {
    return [...reactionCounts]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const renderPost = (post: Post) => {
    const userReaction = getUserReaction(post.reactionCounts);
    const topReactions = getTopReactions(post.reactionCounts);

    return (
      <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 relative">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => handleProfileClick(post.userId)}
            >
              {post.user.profilePicture ? (
                <img 
                  src={post.user.profilePicture} 
                  alt={`${post.user.firstName} ${post.user.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <h3 className="font-semibold text-gray-900">
                  {post.user.firstName} {post.user.lastName}
                </h3>
                {post.user.verified && (
                  <Check className="h-4 w-4 text-green-600 ml-1" />
                )}
              </div>
              {post.user.farmName && (
                <p className="text-sm text-gray-600">{post.user.farmName}</p>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                {post.user.location || 'Kenya'}
                <span className="mx-2">•</span>
                <Calendar className="h-3 w-3 mr-1" />
                {getTimeAgo(post.timestamp)}
              </div>
            </div>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600"
            aria-label="More options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {!post.isFollowingAuthor && (
          <button 
            className="mb-4 text-sm font-medium text-green-600 hover:text-green-700"
            onClick={() => handleFollow(post.userId)}
          >
            {post.isFollowingAuthor ? 'Following' : 'Follow'}
          </button>
        )}

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed">{post.content}</p>
          {post.image && (
            <div className="mt-4">
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full rounded-lg object-cover max-h-96"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Engagement Stats - Show top reaction icons */}
        <div className="flex items-center mb-4">
          <div className="flex space-x-1 mr-2">
            {topReactions.slice(0, 3).map((reaction) => (
              <span key={reaction.type} className="text-sm">
                {reaction.type === 'celebrate' && <Star className="h-4 w-4 text-yellow-500 inline" />}
                {reaction.type === 'support' && <Users className="h-4 w-4 text-blue-500 inline" />}
                {reaction.type === 'love' && <Heart className="h-4 w-4 text-red-500 inline" />}
                {reaction.type === 'insightful' && <FileText className="h-4 w-4 text-purple-500 inline" />}
                {reaction.type === 'funny' && <span className="text-lg">😂</span>}
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-500">{topReactions.reduce((sum, r) => sum + r.count, 0)} reactions</span>
          <span className="mx-2 text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{post.comments.length} comments</span>
          <span className="mx-2 text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{post.shares} shares</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="relative">
            {/* Reaction Picker Popup */}
            {showReactionPicker.visible && showReactionPicker.postId === post.id && (
              <div 
                className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 p-2 flex space-x-1 z-10 animate-fadeIn"
                onMouseLeave={() => setShowReactionPicker({postId: '', visible: false})}
              >
                <button 
                  onClick={() => {
                    handleReaction(post.id, 'celebrate');
                    setShowReactionPicker({postId: '', visible: false});
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Celebrate"
                >
                  <Star className="h-5 w-5 text-yellow-500" />
                </button>
                <button 
                  onClick={() => {
                    handleReaction(post.id, 'support');
                    setShowReactionPicker({postId: '', visible: false});
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Support"
                >
                  <Users className="h-5 w-5 text-blue-500" />
                </button>
                <button 
                  onClick={() => {
                    handleReaction(post.id, 'love');
                    setShowReactionPicker({postId: '', visible: false});
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Love"
                >
                  <Heart className="h-5 w-5 text-red-500" />
                </button>
                <button 
                  onClick={() => {
                    handleReaction(post.id, 'insightful');
                    setShowReactionPicker({postId: '', visible: false});
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Insightful"
                >
                  <FileText className="h-5 w-5 text-purple-500" />
                </button>
                <button 
                  onClick={() => {
                    handleReaction(post.id, 'funny');
                    setShowReactionPicker({postId: '', visible: false});
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Funny"
                >
                  <span className="text-lg">😂</span>
                </button>
              </div>
            )}
            
            {/* Main Reaction Button */}
            <button 
              onMouseDown={() => handleReactionMouseDown(post.id)}
              onMouseUp={() => handleReactionMouseUp(post.id)}
              onMouseLeave={() => {
                if (reactionTimeoutRef.current) {
                  clearTimeout(reactionTimeoutRef.current);
                  reactionTimeoutRef.current = null;
                }
              }}
              onTouchStart={() => handleReactionTouchStart(post.id)}
              onTouchEnd={() => handleReactionTouchEnd(post.id)}
              className={`p-2 rounded-lg transition-colors ${
                userReaction 
                  ? userReaction.type === 'celebrate' ? 'text-yellow-600 bg-yellow-50' :
                    userReaction.type === 'support' ? 'text-blue-600 bg-blue-50' :
                    userReaction.type === 'love' ? 'text-red-600 bg-red-50' :
                    userReaction.type === 'insightful' ? 'text-purple-600 bg-purple-50' :
                    'text-green-600 bg-green-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="React to post"
            >
              {userReaction ? (
                <>
                  {userReaction.type === 'celebrate' && <Star className={`h-5 w-5 ${userReaction.userReacted ? 'fill-current' : ''}`} />}
                  {userReaction.type === 'support' && <Users className={`h-5 w-5 ${userReaction.userReacted ? 'fill-current' : ''}`} />}
                  {userReaction.type === 'love' && <Heart className={`h-5 w-5 ${userReaction.userReacted ? 'fill-current' : ''}`} />}
                  {userReaction.type === 'insightful' && <FileText className={`h-5 w-5 ${userReaction.userReacted ? 'fill-current' : ''}`} />}
                  {userReaction.type === 'funny' && <span className="text-lg">😂</span>}
                </>
              ) : (
                <Star className="h-5 w-5" />
              )}
            </button>
          </div>
          
          <button 
            onClick={() => handleCommentClick(post.id)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Comment</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Share2 className="h-5 w-5" />
            <span className="font-medium">Share</span>
          </button>
          
          <button 
            onClick={() => handleSave(post.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              post.saved 
                ? 'text-green-600 bg-green-50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${post.saved ? 'fill-current' : ''}`} />
            <span className="font-medium">Save</span>
          </button>
        </div>

        {/* Comments Preview */}
        {post.comments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              {post.comments.slice(0, 2).map(comment => (
                <div key={comment.id} className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{getTimeAgo(comment.timestamp)}</p>
                  </div>
                </div>
              ))}
              {post.comments.length > 2 && (
                <button 
                  onClick={() => handleCommentClick(post.id)}
                  className="text-sm text-green-600 font-medium hover:text-green-700"
                >
                  View all {post.comments.length} comments
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with tabs */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'for-you' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('for-you')}
              >
                For You
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'following' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('following')}
              >
                Following
              </button>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
              aria-label="Refresh feed"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Post Composer */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <button 
              className="flex-1 text-left bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-gray-500 text-sm transition-colors"
              onClick={() => setShowCreatePostModal(true)}
            >
              Start a post…
            </button>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex space-x-2">
              <button 
                className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
                onClick={() => setShowCreatePostModal(true)}
              >
                <Video className="h-5 w-5" />
                <span className="text-sm">Video</span>
              </button>
              <button 
                className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
                onClick={() => setShowCreatePostModal(true)}
              >
                <Image className="h-5 w-5" />
                <span className="text-sm">Photo</span>
              </button>
              <button 
                className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
                onClick={() => setShowCreatePostModal(true)}
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">Write Article</span>
              </button>
            </div>
            <button 
              className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm font-medium hover:bg-green-700"
              onClick={() => setShowCreatePostModal(true)}
              aria-label="Create post"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading && posts.length === 0 ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex space-x-8 pt-4 border-t border-gray-100">
                  <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Feed</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
            <p className="text-gray-600">Be the first to share something with the community!</p>
            <button
              onClick={() => router.push('/dashboard/posts/create')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(renderPost)}
            
            {hasMore && (
              <div className="flex justify-center py-8">
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
                <button 
                  onClick={() => setShowCreatePostModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What do you want to talk about?"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                      <Image className="h-5 w-5" />
                      <span>Photo</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                      <Video className="h-5 w-5" />
                      <span>Video</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                      <FileText className="h-5 w-5" />
                      <span>Write Article</span>
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setShowCreatePostModal(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreatePost}
                      disabled={creatingPost || !newPostContent.trim()}
                      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${
                        creatingPost || !newPostContent.trim() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {creatingPost ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}