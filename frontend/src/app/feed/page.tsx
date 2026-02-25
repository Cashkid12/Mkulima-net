'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
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
  Bookmark
} from 'lucide-react';
import CreatePostModal from '@/components/CreatePostModal';
import ReactionButton from '@/components/ReactionButton';

interface User {
  id: string;
  name: string;
  profileImage?: string;
  location?: string;
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
}

interface BackendPost {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    location?: string;
    isFollowing?: boolean;
  };
  content: string;
  media?: string[];
  reactions?: Reaction[];
  comments?: any[];
  createdAt: string;
  sharesCount?: number;
}

interface BackendPost {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    location?: string;
    isFollowing?: boolean;
  };
  content: string;
  media?: string[];
  reactions?: Reaction[];
  comments?: any[];
  createdAt: string;
  sharesCount?: number;
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [activeFilter, setActiveFilter] = useState<'all' | 'crops' | 'livestock' | 'jobs' | 'marketplace'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          // Redirect to login if no token
          window.location.href = '/auth/login';
          return;
        }

        // Determine feed type based on active tab
        const feedType = activeTab === 'following' ? 'following' : 'forYou';
        
        // Call backend API to get posts - fix the endpoint to include /api/
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feed?feedType=${feedType}&limit=20&offset=0`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch posts:', errorData);
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
              isFollowing: post.user.isFollowing || false
            },
            content: post.content,
            media: post.media && post.media.length > 0 ? post.media[0] : undefined,
            reactionCounts: post.reactions || [],
            commentsCount: post.comments ? post.comments.length : 0,
            createdAt: post.createdAt
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
  }, [activeTab]);

  const handlePostCreated = (newPost: BackendPost) => {
    // Add the new post to the beginning of the feed
    const transformedPost: Post = {
      id: newPost._id,
      author: {
        id: newPost.user._id,
        name: `${newPost.user.firstName} ${newPost.user.lastName}`,
        profileImage: newPost.user.profilePicture,
        location: newPost.user.location || 'Kenya',
        isFollowing: true // User is always following themselves
      },
      content: newPost.content,
      media: newPost.media && newPost.media.length > 0 ? newPost.media[0] : undefined,
      reactionCounts: [],
      commentsCount: 0,
      createdAt: newPost.createdAt
    };
    
    setPosts(prev => [transformedPost, ...prev]);
  };

  const handleReact = async (postId: string, type: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        throw new Error('Failed to react to post');
      }

      const data = await response.json();
      
      // Update the post with new reaction data
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            reactionCounts: Object.entries(data.reactionCounts).map(([type, count]) => ({
              type: type as Reaction['type'],
              count: count as number,
              userReacted: type === data.userReaction
            }))
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const handleRemoveReaction = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/react`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove reaction');
      }

      const data = await response.json();
      
      // Update the post with new reaction data
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            reactionCounts: Object.entries(data.reactionCounts).map(([type, count]) => ({
              type: type as Reaction['type'],
              count: count as number,
              userReacted: false
            }))
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Remove reaction error:', err);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/login';
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
      const fetchPosts = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feed?feedType=${activeTab === 'following' ? 'following' : 'forYou'}&limit=20&offset=0`, {
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
              isFollowing: post.user.isFollowing || false
            },
            content: post.content,
            media: post.media && post.media.length > 0 ? post.media[0] : undefined,
            reactionCounts: post.reactions || [],
            commentsCount: post.comments ? post.comments.length : 0,
            createdAt: post.createdAt
          }));

          setPosts(transformedPosts);
        } catch (error) {
          console.error('Reload error:', error);
        }
      };

      fetchPosts();
    }
  };

  const handleReaction = async (postId: string, reactionType: Reaction['type']) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/login';
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
            
            return { ...post, reactionCounts: updatedReactions };
          }
          return post;
        })
      );

      // Backend call
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
      console.error('Reaction error:', err);
      // Revert optimistic update on error
      const fetchPosts = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feed?feedType=${activeTab === 'following' ? 'following' : 'forYou'}&limit=20&offset=0`, {
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
              isFollowing: post.user.isFollowing || false
            },
            content: post.content,
            media: post.media && post.media.length > 0 ? post.media[0] : undefined,
            reactionCounts: post.reactions || [],
            commentsCount: post.comments ? post.comments.length : 0,
            createdAt: post.createdAt
          }));

          setPosts(transformedPosts);
        } catch (error) {
          console.error('Reload error:', error);
        }
      };

      fetchPosts();
    }
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'crops', label: 'Crops' },
    { id: 'livestock', label: 'Livestock' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'marketplace', label: 'Marketplace' }
  ];

  const getUserReaction = (reactionCounts: Reaction[]) => {
    return reactionCounts.find(r => r.userReacted);
  };

  const getTopReactions = (reactionCounts: Reaction[]) => {
    return [...reactionCounts]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-green-600">MkulimaNet</Link>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-green-600" aria-label="Notifications">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="relative p-2 text-gray-600 hover:text-green-600" aria-label="Messages">
                <MessageSquare className="h-6 w-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/profile" className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'for-you' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('for-you')}
          >
            For You
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'following' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
                activeFilter === filter.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter(filter.id as any)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Post Composer */}
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
                <ImageIcon className="h-5 w-5" />
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

        {/* Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-4 text-gray-600">Loading feed...</p>
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
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          {post.author.profileImage ? (
                            <img 
                              src={post.author.profileImage} 
                              alt={post.author.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                          <p className="text-sm text-gray-600">{post.author.location}</p>
                          <p className="text-xs text-gray-500">{post.createdAt}</p>
                        </div>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600" aria-label="More options">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {!post.author.isFollowing && (
                      <button 
                        className="mt-3 ml-auto text-sm font-medium text-green-600 hover:text-green-700"
                        onClick={() => handleFollow(post.author.id)}
                      >
                        {post.author.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <p className="text-gray-800">{post.content}</p>
                  </div>

                  {post.media && (
                    <div className="px-4 pb-3">
                      <img 
                        src={post.media} 
                        alt="Post media" 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Engagement Stats - Show top reaction icons */}
                  <div className="px-4 pb-3 flex items-center">
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
                    <span className="text-sm text-gray-500">{post.commentsCount} comments</span>
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
                        onReact={(type) => handleReact(post.id, type)}
                        onRemoveReaction={() => handleRemoveReaction(post.id)}
                      />
                      
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-gray-600 hover:text-green-600">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm">{post.commentsCount}</span>
                        </button>
                        
                        <button className="flex items-center gap-1 text-gray-600 hover:text-green-600">
                          <Share2 className="h-5 w-5" />
                          <span className="text-sm hidden sm:inline">Share</span>
                        </button>
                        
                        <button 
                          className="flex items-center gap-1 text-gray-600 hover:text-green-600"
                          aria-label="Save post"
                          title="Save"
                        >
                          <Bookmark className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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