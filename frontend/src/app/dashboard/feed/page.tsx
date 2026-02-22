'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  User,
  Check,
  MapPin,
  Calendar,
  RefreshCw,
  AlertCircle
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

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  shares: number;
  saved: boolean;
  liked: boolean;
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

interface BackendPost {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    farmName?: string;
    location?: string;
    profilePicture?: string;
    verified?: boolean;
  };
  content: string;
  image?: string;
  createdAt: string;
  likesCount?: number;
  sharesCount?: number;
  saved?: boolean;
  liked?: boolean;
  comments?: BackendComment[];
}

interface BackendResponse {
  posts: BackendPost[];
  hasMore?: boolean;
}

// Mock data for development
const mockPosts: BackendPost[] = [
  {
    _id: '1',
    user: {
      _id: 'u1',
      firstName: 'John',
      lastName: 'Kariuki',
      farmName: 'Green Valley Farm',
      location: 'Nakuru County',
      verified: true
    },
    content: 'Just harvested 50 bags of organic maize! Quality produce available for sale. Contact me for bulk orders. 🌽',
    image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likesCount: 42,
    sharesCount: 5,
    saved: false,
    liked: false,
    comments: [
      {
        _id: 'c1',
        user: { _id: 'u2', firstName: 'Mary', lastName: 'Wanjiru' },
        content: 'Great harvest! Congratulations!',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'c2',
        user: { _id: 'u3', firstName: 'Peter', lastName: 'Mwangi' },
        content: 'How much are you selling per bag?',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: '2',
    user: {
      _id: 'u2',
      firstName: 'Mary',
      lastName: 'Wanjiru',
      farmName: 'Wanjiru Dairy',
      location: 'Kiambu County',
      verified: true
    },
    content: 'New dairy cows arrived today! Looking forward to increased milk production. #Livestock #Farming 🐄',
    image: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=600',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likesCount: 28,
    sharesCount: 3,
    saved: false,
    liked: false,
    comments: [
      {
        _id: 'c3',
        user: { _id: 'u1', firstName: 'John', lastName: 'Kariuki' },
        content: 'Beautiful cows! What breed are they?',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: '3',
    user: {
      _id: 'u3',
      firstName: 'Peter',
      lastName: 'Mwangi',
      farmName: 'Highland Coffee Estate',
      location: 'Nyeri County',
      verified: false
    },
    content: 'Soil testing completed. pH levels perfect for coffee farming in this region. Sharing my results to help fellow farmers. #Coffee #SoilHealth ☕',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likesCount: 15,
    sharesCount: 8,
    saved: true,
    liked: false,
    comments: [
      {
        _id: 'c4',
        user: { _id: 'u4', firstName: 'Sarah', lastName: 'Kimani' },
        content: 'Very informative! Thanks for sharing.',
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'c5',
        user: { _id: 'u5', firstName: 'James', lastName: 'Otieno' },
        content: 'Which lab did you use for testing?',
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: '4',
    user: {
      _id: 'u4',
      firstName: 'Sarah',
      lastName: 'Kimani',
      farmName: 'Kimani Organics',
      location: 'Nakuru County',
      verified: true
    },
    content: 'Organic vegetables available for pickup. Fresh harvest daily! Tomatoes, kale, spinach, and carrots. DM for prices. 🥬🍅',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    likesCount: 56,
    sharesCount: 12,
    saved: false,
    liked: true,
    comments: []
  },
  {
    _id: '5',
    user: {
      _id: 'u5',
      firstName: 'James',
      lastName: 'Otieno',
      farmName: 'Otieno Grains',
      location: 'Uasin Gishu County',
      verified: false
    },
    content: 'Wheat farming tips: Best time to plant is now! The rains are here and the soil is ready. Who else is planting this season? 🌾',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    likesCount: 34,
    sharesCount: 15,
    saved: false,
    liked: false,
    comments: [
      {
        _id: 'c6',
        user: { _id: 'u1', firstName: 'John', lastName: 'Kariuki' },
        content: 'Already prepared my land!',
        createdAt: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'c7',
        user: { _id: 'u2', firstName: 'Mary', lastName: 'Wanjiru' },
        content: 'Thanks for the reminder',
        createdAt: new Date(Date.now() - 68 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'c8',
        user: { _id: 'u6', firstName: 'Grace', lastName: 'Mutua' },
        content: 'Which wheat variety do you recommend?',
        createdAt: new Date(Date.now() - 65 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data for development
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const data: BackendResponse = {
        posts: mockPosts,
        hasMore: false
      };
      
      // Transform backend data to match our interface
      const transformedPosts: Post[] = data.posts.map((post: BackendPost) => ({
        id: post._id,
        userId: post.user._id,
        user: {
          id: post.user._id,
          firstName: post.user.firstName,
          lastName: post.user.lastName,
          farmName: post.user.farmName || '',
          location: post.user.location || '',
          profilePicture: post.user.profilePicture,
          verified: post.user.verified || false
        },
        content: post.content,
        image: post.image,
        timestamp: getTimeAgo(post.createdAt),
        likes: post.likesCount || 0,
        comments: post.comments?.map((comment: BackendComment) => ({
          id: comment._id,
          userId: comment.user._id,
          userName: `${comment.user.firstName} ${comment.user.lastName}`,
          content: comment.content,
          timestamp: getTimeAgo(comment.createdAt)
        })) || [],
        shares: post.sharesCount || 0,
        saved: post.saved || false,
        liked: post.liked || false
      }));

      setPosts(prevPosts => page === 1 ? transformedPosts : [...prevPosts, ...transformedPosts]);
      setHasMore(data.hasMore || false);
      setLoading(false);
      
    } catch (err) {
      console.error('Feed fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feed');
      setLoading(false);
    }
  }, [page, router]);

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

  const handleLike = async (postId: string) => {
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
            const newLiked = !post.liked;
            return {
              ...post,
              liked: newLiked,
              likes: newLiked ? post.likes + 1 : post.likes - 1
            };
          }
          return post;
        })
      );

      // Backend call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

    } catch (err) {
      console.error('Like error:', err);
      // Revert optimistic update on error
      fetchPosts();
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
      console.error('Save error:', err);
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

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const renderPost = (post: Post) => (
    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => handleProfileClick(post.user.id)}
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
              {post.timestamp}
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

      {/* Engagement Stats */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <span className="font-medium">{post.likes} likes</span>
        {post.comments.length > 0 && (
          <>
            <span className="mx-2">•</span>
            <span>{post.comments.length} comments</span>
          </>
        )}
        {post.shares > 0 && (
          <>
            <span className="mx-2">•</span>
            <span>{post.shares} shares</span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button 
          onClick={() => handleLike(post.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            post.liked 
              ? 'text-red-600 bg-red-50' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart className={`h-5 w-5 ${post.liked ? 'fill-current' : ''}`} />
          <span className="font-medium">Like</span>
        </button>
        
        <button 
          onClick={() => handleCommentClick(post.id)}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Comment</span>
        </button>
        
        <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Share className="h-5 w-5" />
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
                  <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Mkulima Feed</h1>
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

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
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
    </div>
  );
}