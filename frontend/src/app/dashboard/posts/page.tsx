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
  X,
  Star,
  Users,
  FileText,
  Loader2
} from 'lucide-react';
import CreatePostModal from '@/components/CreatePostModal';
import ReactionButton from '@/components/ReactionButton';

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
  media?: string[];
  timestamp: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
  commentsCount: number;
  shares: number;
  liked: boolean;
  reactions: Reaction[];
  reactionCounts: Record<string, number>;
  totalReactions: number;
  userReaction: string | null;
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'mostLiked' | 'mostCommented'>('newest');
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/my-posts?sort=${sortBy}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      
      // Transform backend data to match our interface
      const transformedPosts: Post[] = data.posts.map((post: { 
        _id: string; 
        user: { 
          _id: string; 
          firstName: string; 
          lastName: string; 
          farmName?: string; 
          location?: string; 
          profilePicture?: string; 
        }; 
        content: string; 
        media?: string[]; 
        createdAt: string; 
        likes?: string[]; 
        comments?: Comment[]; 
        sharesCount?: number; 
        liked?: boolean; 
        reactions?: Reaction[]; 
        reactionCounts?: Record<string, number>; 
        totalReactions?: number; 
        userReaction?: string | null; 
      }) => ({
        id: post._id,
        userId: post.user._id,
        user: {
          id: post.user._id,
          firstName: post.user.firstName,
          lastName: post.user.lastName,
          farmName: post.user.farmName,
          location: post.user.location,
          profilePicture: post.user.profilePicture
        },
        content: post.content,
        media: post.media,
        image: post.media && post.media.length > 0 ? post.media[0] : undefined,
        timestamp: new Date(post.createdAt).toLocaleDateString(),
        createdAt: post.createdAt,
        likes: post.likes?.length || 0,
        comments: post.comments || [],
        commentsCount: post.comments?.length || 0,
        shares: post.sharesCount || 0,
        liked: post.liked || false,
        reactions: post.reactions || [],
        reactionCounts: post.reactionCounts || {},
        totalReactions: post.totalReactions || 0,
        userReaction: post.userReaction || null
      }));
      
      setPosts(transformedPosts);
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
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, content: editContent }
            : post
        )
      );
      setEditingPost(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating post:', err);
      alert('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setDeletingPost(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  const handleCreatePost = () => {
    setShowCreateModal(true);
  };

  const handlePostCreated = () => {
    fetchUserPosts();
    setShowCreateModal(false);
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
          {/* Reactions */}
          <ReactionButton
            postId={post.id}
            userReaction={post.userReaction}
            reactionCounts={post.reactionCounts}
            totalReactions={post.totalReactions}
            onReact={async (type) => {
              try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/react`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ type })
                });

                if (!response.ok) throw new Error('Failed to react');

                const data = await response.json();
                setPosts(prev => prev.map(p => 
                  p.id === post.id 
                    ? { ...p, reactionCounts: data.reactionCounts, userReaction: data.userReaction, totalReactions: data.totalReactions }
                    : p
                ));
              } catch (err) {
                console.error('Reaction error:', err);
              }
            }}
            onRemoveReaction={async () => {
              try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/react`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (!response.ok) throw new Error('Failed to remove reaction');

                const data = await response.json();
                setPosts(prev => prev.map(p => 
                  p.id === post.id 
                    ? { ...p, reactionCounts: data.reactionCounts, userReaction: null, totalReactions: data.totalReactions }
                    : p
                ));
              } catch (err) {
                console.error('Remove reaction error:', err);
              }
            }}
          />
          
          <div className="flex items-center text-gray-600">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{post.commentsCount} comments</span>
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

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}