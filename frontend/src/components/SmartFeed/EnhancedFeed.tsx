'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search,
  Bell, 
  MessageSquare, 
  User, 
  Video, 
  ImageIcon, 
  FileText, 
  Heart, 
  MessageCircle, 
  Share2,
  Star,
  Users,
  ShoppingCart,
  Briefcase,
  Plus,
  MoreHorizontal,
  X,
  Loader2,
  Bookmark,
  MapPin,
  TrendingUp,
  Award,
  Eye,
  Calendar,
  Hash,
  Pin,
  BarChart3
} from 'lucide-react';
import CreatePostModal from '@/components/CreatePostModal';
import ReactionButton from '@/components/ReactionButton';
import TrendingSidebar from './TrendingSidebar';
import WeatherWidget from '../weather/WeatherWidget';

interface User {
  id: string;
  name: string;
  profileImage?: string;
  location?: string;
  role?: string;
  isFollowing: boolean;
}

interface Reaction {
  type: 'celebrate' | 'support' | 'love' | 'insightful' | 'funny';
  count: number;
  userReacted: boolean;
}

interface Post {
  id: string;
  author: User;
  content: string;
  media?: string;
  reactionCounts: Reaction[];
  commentsCount: number;
  createdAt: string;
  category?: 'crop' | 'livestock' | 'jobs' | 'marketplace' | 'advice';
  hashtags?: string[];
  location?: string;
  views?: number;
  shares?: number;
  isBookmarked?: boolean;
  isPinned?: boolean;
}

interface BackendPost {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    location?: string;
    role?: string;
    isFollowing?: boolean;
  };
  content: string;
  media?: string[];
  reactions?: Reaction[];
  comments?: unknown[];
  createdAt: string;
  category?: 'crop' | 'livestock' | 'jobs' | 'marketplace' | 'advice';
  hashtags?: string[];
  location?: string;
  views?: number;
  sharesCount?: number;
}

export default function EnhancedFeed() {
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'trending' | 'crop-updates' | 'livestock' | 'marketplace' | 'jobs' | 'advice'>('for-you');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [suggestedConnections, setSuggestedConnections] = useState<User[]>([]);
  const router = useRouter();

  // Smart feed filters
  const smartFilters = [
    { id: 'for-you', label: 'For You', icon: Star },
    { id: 'following', label: 'Following', icon: Users },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'crop-updates', label: 'Crop Updates', icon: Award },
    { id: 'livestock', label: 'Livestock', icon: Heart },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'advice', label: 'Advice', icon: MessageCircle }
  ];

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const feedType = activeTab === 'following' ? 'following' : 
                        activeTab === 'trending' ? 'trending' : 'forYou';
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/feed?feedType=${feedType}&limit=20&offset=0`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch posts');
        }

        const data = await response.json();

        // Transform the data to match our interface
        const transformedPosts: Post[] = data.map((post: BackendPost) => {
          return {
            id: post._id,
            author: {
              id: post.user._id,
              name: `${post.user.firstName} ${post.user.lastName}`,
              profileImage: post.user.profilePicture,
              location: post.user.location || 'Kenya',
              role: post.user.role || 'Farmer',
              isFollowing: post.user.isFollowing || false
            },
            content: post.content,
            media: post.media && post.media.length > 0 ? post.media[0] : undefined,
            reactionCounts: post.reactions || [],
            commentsCount: post.comments ? post.comments.length : 0,
            createdAt: post.createdAt,
            category: post.category as 'crop' | 'livestock' | 'jobs' | 'marketplace' | 'advice' | undefined,
            hashtags: post.hashtags,
            location: post.location,
            views: post.views || 0,
            shares: post.sharesCount || 0,
            isBookmarked: false,
            isPinned: false
          };
        });

        setPosts(transformedPosts);
        setLoading(false);
      } catch (err) {
        console.error('Feed fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feed');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab, router]);

  // Fetch suggested connections
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/users/suggestions?limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestedConnections(data.map((user: { _id: string; firstName: string; lastName: string; profilePicture?: string; location?: string; role?: string }) => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            profileImage: user.profilePicture,
            location: user.location || 'Kenya',
            role: user.role || 'Farmer',
            isFollowing: false
          })));
        }
      } catch (err) {
        console.error('Suggestion fetch error:', err);
      }
    };

    fetchSuggestions();
  }, []);

  const handlePostCreated = (newPost: BackendPost) => {
    const transformedPost: Post = {
      id: newPost._id,
      author: {
        id: newPost.user._id,
        name: `${newPost.user.firstName} ${newPost.user.lastName}`,
        profileImage: newPost.user.profilePicture,
        location: newPost.user.location || 'Kenya',
        role: newPost.user.role || 'Farmer',
        isFollowing: true
      },
      content: newPost.content,
      media: newPost.media && newPost.media.length > 0 ? newPost.media[0] : undefined,
      reactionCounts: [],
      commentsCount: 0,
      createdAt: newPost.createdAt,
      category: newPost.category as 'crop' | 'livestock' | 'jobs' | 'marketplace' | 'advice' | undefined,
      hashtags: newPost.hashtags,
      location: newPost.location,
      views: 0,
      shares: 0,
      isBookmarked: false,
      isPinned: false
    };
    
    setPosts(prev => [transformedPost, ...prev]);
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
          if (post.author.id === userId) {
            return {
              ...post,
              author: {
                ...post.author,
                isFollowing: !post.author.isFollowing
              }
            };
          }
          return post;
        })
      );

      setSuggestedConnections(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
        )
      );

      // Backend call
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/follow/${userId}/follow`, {
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
      // Revert on error
      const fetchPosts = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${apiUrl}/feed?feedType=${activeTab === 'following' ? 'following' : 'forYou'}&limit=20&offset=0`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) return;

          const data = await response.json();
          const transformedPosts: Post[] = data.map((post: BackendPost) => ({
            id: post._id,
            author: {
              id: post.user._id,
              name: `${post.user.firstName} ${post.user.lastName}`,
              profileImage: post.user.profilePicture,
              location: post.user.location || 'Kenya',
              role: post.user.role || 'Farmer',
              isFollowing: post.user.isFollowing || false
            },
            content: post.content,
            media: post.media && post.media.length > 0 ? post.media[0] : undefined,
            reactionCounts: post.reactions || [],
            commentsCount: post.comments ? post.comments.length : 0,
            createdAt: post.createdAt,
            category: post.category as 'crop' | 'livestock' | 'jobs' | 'marketplace' | 'advice' | undefined,
            hashtags: post.hashtags,
            location: post.location,
            views: post.views || 0,
            shares: post.sharesCount || 0,
            isBookmarked: false,
            isPinned: false
          }));

          setPosts(transformedPosts);
        } catch (error) {
          console.error('Reload error:', error);
        }
      };

      fetchPosts();
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      ));

      // Backend call
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to bookmark post');
      }
    } catch (err) {
      console.error('Bookmark error:', err);
      // Revert on error
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      ));
    }
  };

  const handlePinPost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, isPinned: !post.isPinned } : post
      ));

      // Backend call
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/posts/${postId}/pin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to pin post');
      }
    } catch (err) {
      console.error('Pin error:', err);
      // Revert on error
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, isPinned: !post.isPinned } : post
      ));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const getUserReaction = (reactionCounts: Reaction[]) => {
    return reactionCounts.find(r => r.userReacted);
  };

  const getTopReactions = (reactionCounts: Reaction[]) => {
    return [...reactionCounts]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-green-600">MkulimaNet</Link>
            
            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search users, posts, products, jobs..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border border-transparent focus:border-green-500 focus:bg-white focus:outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-600 hover:text-green-600 transition-colors" aria-label="Notifications">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="relative p-2 text-gray-600 hover:text-green-600 transition-colors" aria-label="Messages">
                <MessageSquare className="h-6 w-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/profile" className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors">
                <User className="h-5 w-5 text-green-600" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Smart Feed Filters */}
        <div className="max-w-6xl mx-auto px-4 py-2 border-t border-gray-100">
          <div className="flex space-x-1 overflow-x-auto pb-2">
            {smartFilters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <button
                  key={filter.id}
                  className={`flex items-center space-x-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === filter.id
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                  }`}
                  onClick={() => setActiveTab(filter.id as 'for-you' | 'following' | 'trending' | 'crop-updates' | 'livestock' | 'marketplace' | 'jobs' | 'advice')}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Feed Content */}
          <div className="flex-1">
            {/* Weather Widget (Optional Top Card) */}
            <div className="mb-6">
              <WeatherWidget />
            </div>

            {/* Create Post Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <button 
                  className="flex-1 text-left bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-3 text-gray-500 text-base transition-colors font-medium"
                  onClick={() => setShowCreatePostModal(true)}
                >
                  Start a post, share your farming insights...
                </button>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex space-x-3">
                  <button 
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                    onClick={() => setShowCreatePostModal(true)}
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-sm">Photo</span>
                  </button>
                  <button 
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                    onClick={() => setShowCreatePostModal(true)}
                  >
                    <Video className="h-5 w-5" />
                    <span className="text-sm">Video</span>
                  </button>
                  <button 
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                    onClick={() => setShowCreatePostModal(true)}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Write Article</span>
                  </button>
                  <button 
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                    onClick={() => setShowCreatePostModal(true)}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">Poll</span>
                  </button>
                </div>
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  onClick={() => setShowCreatePostModal(true)}
                >
                  Create Post
                </button>
              </div>
            </div>

            {/* Suggested Connections */}
            {suggestedConnections.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Farmers you may know
                </h3>
                <div className="flex overflow-x-auto space-x-3 pb-2">
                  {suggestedConnections.map((user) => (
                    <div key={user.id} className="flex-shrink-0 w-64 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                          <p className="text-sm text-gray-500 truncate">{user.role}</p>
                          <p className="text-xs text-gray-400">{user.location}</p>
                        </div>
                        <button
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            user.isFollowing
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-green-600 text-white'
                          }`}
                          onClick={() => handleFollow(user.id)}
                        >
                          {user.isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feed Posts */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  <p className="mt-4 text-gray-600">Loading your feed...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Feed</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
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
                    onClick={() => setShowCreatePostModal(true)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Create Your First Post
                  </button>
                </div>
              ) : (
                posts.map((post) => {
                  const userReaction = getUserReaction(post.reactionCounts);
                  const topReactions = getTopReactions(post.reactionCounts);
                  
                  return (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Post Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              {post.author.profileImage ? (
                                <img 
                                  src={post.author.profileImage} 
                                  alt={post.author.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-6 w-6 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                                {post.isPinned && <Pin className="h-4 w-4 text-green-600" />}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 space-x-2">
                                <span>{post.author.role}</span>
                                <span>•</span>
                                <span>{post.author.location}</span>
                                <span>•</span>
                                <span>{formatDate(post.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors" aria-label="More options">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                        
                        {!post.author.isFollowing && (
                          <button 
                            className="mt-3 text-sm font-medium text-green-600 hover:text-green-700"
                            onClick={() => handleFollow(post.author.id)}
                          >
                            Follow
                          </button>
                        )}
                      </div>

                      {/* Post Content */}
                      <div className="px-4 pb-3">
                        <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
                        
                        {/* Hashtags */}
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {post.hashtags.map((hashtag, index) => (
                              <Link 
                                key={index} 
                                href={`/hashtags/${hashtag.slice(1)}`}
                                className="text-sm text-green-600 hover:text-green-700 hover:underline"
                              >
                                {hashtag}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      {post.media && (
                        <div className="px-4 pb-3">
                          <img 
                            src={post.media} 
                            alt="Post media" 
                            className="w-full h-96 object-cover rounded-xl"
                          />
                        </div>
                      )}

                      {/* Post Location */}
                      {post.location && (
                        <div className="px-4 pb-3">
                          <div className="inline-flex items-center space-x-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{post.location}</span>
                          </div>
                        </div>
                      )}

                      {/* Post Insights */}
                      <div className="px-4 pb-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views?.toLocaleString()} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{post.reactionCounts.reduce((sum, r) => sum + r.count, 0)} reactions</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span>{post.commentsCount} comments</span>
                        </div>
                      </div>

                      {/* Post Actions */}
                      <div className="px-4 py-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <ReactionButton
                            postId={post.id}
                            userReaction={userReaction?.type || null}
                            reactionCounts={{
                              celebrate: post.reactionCounts.find(r => r.type === 'celebrate')?.count || 0,
                              support: post.reactionCounts.find(r => r.type === 'support')?.count || 0,
                              love: post.reactionCounts.find(r => r.type === 'love')?.count || 0,
                              insightful: post.reactionCounts.find(r => r.type === 'insightful')?.count || 0,
                              funny: post.reactionCounts.find(r => r.type === 'funny')?.count || 0
                            }}
                            totalReactions={post.reactionCounts.reduce((sum, r) => sum + r.count, 0)}
                            onReact={async (type) => {
                              const token = localStorage.getItem('token');
                              if (!token) {
                                router.push('/auth/login');
                                return;
                              }
                              
                              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                              const response = await fetch(`${apiUrl}/posts/${post.id}/react`, {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ type })
                              });
                            }}
                            onRemoveReaction={async () => {
                              const token = localStorage.getItem('token');
                              if (!token) {
                                router.push('/auth/login');
                                return;
                              }
                              
                              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                              const response = await fetch(`${apiUrl}/posts/${post.id}/react`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                }
                              });
                            }}
                          />
                          
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                              <MessageCircle className="h-5 w-5" />
                              <span className="text-sm">{post.commentsCount}</span>
                            </button>
                            
                            <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                              <Share2 className="h-5 w-5" />
                              <span className="text-sm">Share</span>
                            </button>
                            
                            <button 
                              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                              onClick={() => handleBookmark(post.id)}
                            >
                              <Bookmark className={`h-5 w-5 ${post.isBookmarked ? 'fill-green-600 text-green-600' : ''}`} />
                              <span className="text-sm">{post.isBookmarked ? 'Saved' : 'Save'}</span>
                            </button>
                          </div>
                          
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => handlePinPost(post.id)}
                            aria-label="Pin post"
                          >
                            <Pin className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="w-80 space-y-6">
            <TrendingSidebar />
            { /* Further sidebar components can be added here */ }
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}