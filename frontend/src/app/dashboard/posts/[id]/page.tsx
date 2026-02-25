'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  User, 
  Check, 
  MapPin, 
  Calendar, 
  Star,
  Users,
  FileText
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

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Call backend API to get post
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }

        const postData = await response.json();

        // Transform the data to match our interface
        const transformedPost: Post = {
          id: postData._id,
          userId: postData.user._id,
          user: {
            id: postData.user._id,
            firstName: postData.user.firstName,
            lastName: postData.user.lastName,
            farmName: postData.user.farmName || '',
            location: postData.user.location || '',
            profilePicture: postData.user.profilePicture,
            verified: postData.user.verified || false
          },
          content: postData.content,
          image: postData.media && postData.media.length > 0 ? postData.media[0] : undefined,
          timestamp: postData.createdAt,
          reactionCounts: postData.reactions || [],
          comments: postData.comments || [],
          shares: postData.sharesCount || 0,
          saved: postData.saved || false,
          isFollowingAuthor: postData.user.isFollowing || false
        };

        setPost(transformedPost);
        setLoading(false);
      } catch (err) {
        console.error('Post detail fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load post');
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id, router]);

  const handleReaction = async (reactionType: Reaction['type']) => {
    if (!post) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Optimistic update
      const updatedPost = { ...post };
      const updatedReactions = [...updatedPost.reactionCounts];
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
      
      updatedPost.reactionCounts = updatedReactions;
      setPost(updatedPost);

      // Backend call
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feed/${post.id}/react`, {
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
        const fetchPost = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${params.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) return;

            const postData = await response.json();
            const transformedPost: Post = {
              id: postData._id,
              userId: postData.user._id,
              user: {
                id: postData.user._id,
                firstName: postData.user.firstName,
                lastName: postData.user.lastName,
                farmName: postData.user.farmName || '',
                location: postData.user.location || '',
                profilePicture: postData.user.profilePicture,
                verified: postData.user.verified || false
              },
              content: postData.content,
              image: postData.media && postData.media.length > 0 ? postData.media[0] : undefined,
              timestamp: postData.createdAt,
              reactionCounts: postData.reactions || [],
              comments: postData.comments || [],
              shares: postData.sharesCount || 0,
              saved: postData.saved || false,
              isFollowingAuthor: postData.user.isFollowing || false
            };

            setPost(transformedPost);
          } catch (error) {
            console.error('Reload error:', error);
          }
        };

        fetchPost();
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Optimistic update
      const updatedPost = { ...post };
      const newCommentObj: Comment = {
        id: `temp-${Date.now()}`,
        userId: 'current-user-id', // Will be updated with actual ID from backend
        userName: 'Current User', // Will be updated with actual name from backend
        content: newComment,
        timestamp: new Date().toISOString()
      };
      updatedPost.comments = [...updatedPost.comments, newCommentObj];
      setPost(updatedPost);
      setNewComment('');

      // Backend call
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}/comment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: newComment })
        });

        if (!response.ok) {
          throw new Error('Failed to add comment');
        }

        // Refresh the post to get the updated comment with proper IDs
        const fetchPost = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${params.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) return;

            const postData = await response.json();
            const transformedPost: Post = {
              id: postData._id,
              userId: postData.user._id,
              user: {
                id: postData.user._id,
                firstName: postData.user.firstName,
                lastName: postData.user.lastName,
                farmName: postData.user.farmName || '',
                location: postData.user.location || '',
                profilePicture: postData.user.profilePicture,
                verified: postData.user.verified || false
              },
              content: postData.content,
              image: postData.media && postData.media.length > 0 ? postData.media[0] : undefined,
              timestamp: postData.createdAt,
              reactionCounts: postData.reactions || [],
              comments: postData.comments || [],
              shares: postData.sharesCount || 0,
              saved: postData.saved || false,
              isFollowingAuthor: postData.user.isFollowing || false
            };

            setPost(transformedPost);
          } catch (error) {
            console.error('Reload error:', error);
          }
        };

        fetchPost();
      } catch (err) {
        console.warn('Comment API call failed, reverting optimistic update:', err);
        // Revert optimistic update
        const fetchPost = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${params.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) return;

            const postData = await response.json();
            const transformedPost: Post = {
              id: postData._id,
              userId: postData.user._id,
              user: {
                id: postData.user._id,
                firstName: postData.user.firstName,
                lastName: postData.user.lastName,
                farmName: postData.user.farmName || '',
                location: postData.user.location || '',
                profilePicture: postData.user.profilePicture,
                verified: postData.user.verified || false
              },
              content: postData.content,
              image: postData.media && postData.media.length > 0 ? postData.media[0] : undefined,
              timestamp: postData.createdAt,
              reactionCounts: postData.reactions || [],
              comments: postData.comments || [],
              shares: postData.sharesCount || 0,
              saved: postData.saved || false,
              isFollowingAuthor: postData.user.isFollowing || false
            };

            setPost(transformedPost);
          } catch (error) {
            console.error('Reload error:', error);
          }
        };

        fetchPost();
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const handleFollow = async () => {
    if (!post) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Optimistic update
      if (post) {
        const updatedPost = { ...post, isFollowingAuthor: !post.isFollowingAuthor };
        setPost(updatedPost);
      }

      // Backend call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow/${post?.userId}/follow`, {
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
      if (post) {
        const updatedPost = { ...post, isFollowingAuthor: !post.isFollowingAuthor };
        setPost(updatedPost);
      }
    }
  };

  const handleSave = async () => {
    if (!post) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Optimistic update
      if (post) {
        const updatedPost = { ...post, saved: !post.saved };
        setPost(updatedPost);
      }

      // Backend call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feed/${post?.id}/save`, {
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
      if (post) {
        const updatedPost = { ...post, saved: !post.saved };
        setPost(updatedPost);
      }
    }
  };

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

  const getUserReaction = (reactionCounts: Reaction[]) => {
    return reactionCounts.find(r => r.userReacted);
  };

  const getTopReactions = (reactionCounts: Reaction[]) => {
    return [...reactionCounts]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
            <button 
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 ml-2">Post</h1>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
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
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
            <button 
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 ml-2">Post</h1>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Post</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
            <button 
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 ml-2">Post</h1>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Post Not Found</h3>
            <p className="text-gray-600">The post you are looking for does not exist or has been removed.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userReaction = getUserReaction(post.reactionCounts);
  const topReactions = getTopReactions(post.reactionCounts);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 ml-2">Post</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
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
          </div>

          {!post.isFollowingAuthor && (
            <button 
              className="mb-4 text-sm font-medium text-green-600 hover:text-green-700"
              onClick={handleFollow}
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
            <div className="flex space-x-6">
              <button
                className={`flex items-center space-x-1 ${
                  userReaction ? 'text-green-600' : 'text-gray-600'
                } hover:text-green-600`}
                onClick={() => handleReaction('celebrate')}
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
                <span className="text-sm">
                  {userReaction ? userReaction.type.charAt(0).toUpperCase() + userReaction.type.slice(1) : 'React'}
                </span>
              </button>
              
              <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">{post.comments.length} Comments</span>
              </button>
              
              <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                <Share2 className="h-5 w-5" />
                <span className="text-sm">Share</span>
              </button>
              
              <button 
                onClick={handleSave}
                className={`flex items-center space-x-1 ${
                  post.saved 
                    ? 'text-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${post.saved ? 'fill-current' : ''}`} />
                <span className="text-sm">Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments ({post.comments.length})</h3>
          
          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={`px-4 py-2 rounded-lg font-medium ${
                  newComment.trim() 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Comment
              </button>
            </div>
          </form>
          
          {/* Comments List */}
          <div className="space-y-4">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{comment.userName}</h4>
                      <span className="text-xs text-gray-500">{getTimeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}