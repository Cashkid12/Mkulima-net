'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bell,
  ArrowLeft,
  UserPlus,
  MessageSquare,
  Heart,
  MessageCircle,
  ShoppingBag,
  Users,
  Briefcase,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Loader2,
  AlertCircle,
  Filter,
  X
} from 'lucide-react';

// Types
interface Notification {
  id: string;
  type: 'follower' | 'message' | 'like' | 'comment' | 'share' | 'product_sale' | 'product_like' | 'community' | 'job' | 'system';
  title: string;
  description: string;
  sourceUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  targetObject?: {
    id: string;
    type: 'post' | 'product' | 'message' | 'community' | 'job' | 'profile';
    image?: string;
    title?: string;
  };
  read: boolean;
  createdAt: string;
  actionLink: string;
}

// Icon mapping
const notificationIcons: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  follower: { icon: UserPlus, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Followers' },
  message: { icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Messages' },
  like: { icon: Heart, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Likes' },
  comment: { icon: MessageCircle, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Comments' },
  share: { icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'Shares' },
  product_sale: { icon: ShoppingBag, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Sales' },
  product_like: { icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-100', label: 'Product Likes' },
  community: { icon: Users, color: 'text-teal-600', bgColor: 'bg-teal-100', label: 'Communities' },
  job: { icon: Briefcase, color: 'text-cyan-600', bgColor: 'bg-cyan-100', label: 'Jobs' },
  system: { icon: Bell, color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'System' }
};

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New Message',
    description: 'Mary Wanjiru sent you a message: "Thank you for the information about the dairy feeds..."',
    sourceUser: {
      id: 'u2',
      name: 'Mary Wanjiru',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    actionLink: '/messages/1'
  },
  {
    id: '2',
    type: 'follower',
    title: 'New Follower',
    description: 'John Kariuki started following you',
    sourceUser: {
      id: 'u3',
      name: 'John Kariuki',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    actionLink: '/profile/u3'
  },
  {
    id: '3',
    type: 'like',
    title: 'Post Liked',
    description: 'Grace Muthoni liked your post "Maize harvest photos"',
    sourceUser: {
      id: 'u4',
      name: 'Grace Muthoni',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    },
    targetObject: {
      id: 'p1',
      type: 'post',
      title: 'Maize harvest photos'
    },
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionLink: '/dashboard/feed'
  },
  {
    id: '4',
    type: 'product_sale',
    title: 'Product Sold',
    description: 'Peter Omondi purchased 50kg of Maize from your store',
    sourceUser: {
      id: 'u5',
      name: 'Peter Omondi'
    },
    targetObject: {
      id: 'prod1',
      type: 'product',
      title: 'Fresh Maize'
    },
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    actionLink: '/marketplace/product/prod1'
  },
  {
    id: '5',
    type: 'comment',
    title: 'New Comment',
    description: 'Sarah Akinyi commented on your post: "Great harvest! Congratulations on the good yield!"',
    sourceUser: {
      id: 'u6',
      name: 'Sarah Akinyi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    targetObject: {
      id: 'p1',
      type: 'post'
    },
    read: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    actionLink: '/dashboard/feed'
  },
  {
    id: '6',
    type: 'community',
    title: 'Community Mention',
    description: 'James Mwangi mentioned you in Maize Farmers Kenya',
    sourceUser: {
      id: 'u7',
      name: 'James Mwangi'
    },
    targetObject: {
      id: 'c1',
      type: 'community',
      title: 'Maize Farmers Kenya'
    },
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actionLink: '/communities/1'
  },
  {
    id: '7',
    type: 'product_like',
    title: 'Product Liked',
    description: 'Alice Njeri liked your product "Organic Fertilizer"',
    sourceUser: {
      id: 'u8',
      name: 'Alice Njeri'
    },
    targetObject: {
      id: 'prod2',
      type: 'product',
      title: 'Organic Fertilizer'
    },
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actionLink: '/marketplace/product/prod2'
  },
  {
    id: '8',
    type: 'share',
    title: 'Post Shared',
    description: 'David Kimani shared your post to their followers',
    sourceUser: {
      id: 'u9',
      name: 'David Kimani'
    },
    targetObject: {
      id: 'p2',
      type: 'post'
    },
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actionLink: '/dashboard/feed'
  }
];

// Helper functions
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | Notification['type']>('all');
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    setProcessingIds(prev => [...prev, notificationId]);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setProcessingIds(prev => prev.filter(id => id !== notificationId));
  };

  const handleMarkAllAsRead = async () => {
    setProcessingIds(['all']);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setProcessingIds([]);
  };

  const handleDelete = async (notificationId: string) => {
    setProcessingIds(prev => [...prev, notificationId]);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setProcessingIds(prev => prev.filter(id => id !== notificationId));
  };

  const handleClearAll = async () => {
    setProcessingIds(['clear']);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setNotifications([]);
    setProcessingIds([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    router.push(notification.actionLink);
  };

  // Get unique notification types present in data
  const presentTypes = Array.from(new Set(notifications.map(n => n.type)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={processingIds.includes('all')}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {processingIds.includes('all') ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={handleClearAll}
                disabled={processingIds.includes('clear') || notifications.length === 0}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Clear all"
                aria-label="Clear all"
              >
                {processingIds.includes('clear') ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'unread'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            {presentTypes.map((type) => {
              const { icon: Icon, label } = notificationIcons[type];
              return (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    activeTab === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'unread' 
                ? 'You have read all your notifications'
                : 'You will see notifications here when there is activity'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const { icon: Icon, color, bgColor } = notificationIcons[notification.type] || notificationIcons.system;
              const isProcessing = processingIds.includes(notification.id);
              
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg border transition-all ${
                    !notification.read 
                      ? 'border-green-200 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    onClick={() => handleNotificationClick(notification)}
                    className="flex gap-4 p-4 cursor-pointer"
                  >
                    {/* Icon or Avatar */}
                    {notification.sourceUser?.avatar ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={notification.sourceUser.avatar}
                          alt={notification.sourceUser.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 h-6 w-6 ${bgColor} rounded-full flex items-center justify-center border-2 border-white`}>
                          <Icon className={`h-3.5 w-3.5 ${color}`} />
                        </div>
                      </div>
                    ) : (
                      <div className={`h-12 w-12 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                            {notification.description}
                          </p>
                          {notification.targetObject?.title && (
                            <p className="text-xs text-gray-500 mt-1">
                              Related to: {notification.targetObject.title}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        
                        {/* Status and Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <span className="h-2.5 w-2.5 bg-green-600 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-end gap-2 px-4 pb-3">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
