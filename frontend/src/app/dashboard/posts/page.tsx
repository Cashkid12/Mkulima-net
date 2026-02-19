'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  Edit3,
  Trash2,
  Heart,
  MessageCircle,
  Share,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  farmName?: string;
  location?: string;
  profilePicture?: string;
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
  liked: boolean;
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'mostLiked' | 'mostCommented'>('newest');
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const router = useRouter();

  // Mock data for demonstration
  const generateMockPosts = (): Post[] => {
    const mockUser: User = {
      id: '1',
      firstName: 'Demo',
      lastName: 'Farmer',
      farmName: 'Demo Farm',
      location: 'Nairobi, Kenya',
      profilePicture: undefined
    };

    const mockComments: Comment[] = [
      {
        id: '1',
        userId: '2',
        userName: 'Mary Wanjiru',
        content: 'Great preparation! What crops are you planting?',
        timestamp: '1 hour ago'
      },
      {
        id: '2',
        userId: '3',
        userName: 'Peter Mwangi',
        content: 'Impressive yields! How much are you expecting?',
        timestamp: '20 hours ago'
      }
    ];

    return [
      {
        id: '1',
        userId: '1',
        user: mockUser,
        content: 'Just completed soil preparation for the new planting season. Organic compost added and pH levels tested. Looking forward to a successful harvest! #SoilPreparation #OrganicFarming',
        image: '/home.jpg',
        timestamp: '2 hours ago',
        likes: 42,
        comments: [mockComments[0]],
        shares: 8,
        liked: true
      },
      {
        id: '2',
        userId: '1',
        user: mockUser,
        content: 'Harvest day for our first batch of tomatoes. Quality looks excellent and yields are promising. Fresh produce available for local markets. #HarvestSeason #FarmFresh',
        image: undefined,
        timestamp: '1 day ago',
        likes: 28,
        comments: [mockComments[1]],
        shares: 12,
        liked: false
      },
      {
        id: '3',
        userId: '1',
        user: mockUser,
        content: 'New irrigation system installed and fully operational. Water efficiency improved by 30% and crop health showing significant improvement. #Irrigation #WaterEfficiency #SustainableFarming',
        image: undefined,
        timestamp: '3 days ago',
        likes: 15,
        comments: [],
        shares: 5,
        liked: false
      }
    ];
  };

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPosts = generateMockPosts();
      
      // Apply sorting
      switch (sortBy) {
        case 'mostLiked':
          mockPosts.sort((a, b) => b.likes - a.likes);
          break;
        case 'mostCommented':
          mockPosts.sort((a, b) => b.comments.length - a.comments.length);
          break;
        case 'newest':
        default:
          // Already sorted by timestamp in mock data
          break;
      }
      
      setPosts(mockPosts);
      setLoading(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your posts');
      setLoading(false);
    }
  };

  const handleEditPost = (postId: string, currentContent: string) => {
    setEditingPost(postId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = async (postId: string) => {
    // Simulate save operation
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, content: editContent }
          : post
      )
    );
    setEditingPost(null);
    setEditContent('');
  };

  const handleDeletePost = async (postId: string) => {
    // Simulate delete operation
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    setDeletingPost(null);
  };

  const handleCreatePost = () => {
    router.push('/dashboard/posts/create');
  };

  const handleSortChange = (newSort: 'newest' | 'mostLiked' | 'mostCommented') => {
    setSortBy(newSort);
    // Re-fetch with new sorting
    fetchUserPosts();
  };

  useEffect(() => {
    const initializePosts = async () => {
      await fetchUserPosts();
    };
    initializePosts();
  }, []);

  const renderPostCard = (post: Post) => (
    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
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
            <h3 className="font-semibold text-gray-900">
              {post.user.firstName} {post.user.lastName}
            </h3>
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
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditPost(post.id, post.content)}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            aria-label="Edit post"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeletingPost(post.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {editingPost === post.id ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={4}
              placeholder="Edit your post content..."
            />
            <div className="flex space-x-3">
              <button
                onClick={() => handleSaveEdit(post.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setEditContent('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 leading-relaxed">{post.content}</p>
        )}
        {post.image && !editingPost && (
          <div className="mt-4">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full rounded-lg object-cover max-h-96"
            />
          </div>
        )}
      </div>

      {/* Engagement Summary */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-gray-600">
            <Heart className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{post.likes} likes</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{post.comments.length} comments</span>
          </div>
          {post.shares > 0 && (
            <div className="flex items-center text-gray-600">
              <Share className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">{post.shares} shares</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
              <p className="text-gray-600 mt-1">Manage and track your published content</p>
            </div>
            <button
              onClick={handleCreatePost}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Post
            </button>
          </div>
          
          {/* Sorting Controls */}
          {posts.length > 0 && (
            <div className="mt-6 flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    sortBy === 'newest'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => handleSortChange('mostLiked')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    sortBy === 'mostLiked'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Most Liked
                </button>
                <button
                  onClick={() => handleSortChange('mostCommented')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    sortBy === 'mostCommented'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Most Commented
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
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
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="flex space-x-4">
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Posts</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchUserPosts}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <MessageCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">You haven&apos;t shared anything yet</h3>
            <p className="text-gray-600 mb-8">Start building your farming community by sharing your experiences and updates.</p>
            <button
              onClick={handleCreatePost}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(renderPostCard)}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deletingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Post</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDeletePost(deletingPost)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeletingPost(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}