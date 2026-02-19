'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell,
  UserPlus,
  MessageSquare,
  Heart,
  MessageCircle,
  ShoppingBag,
  Users,
  Briefcase,
  Check,
  X,
  Loader2,
  Settings,
  ArrowRight
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

// Icon mapping for notification types
const notificationIcons: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  follower: { icon: UserPlus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  message: { icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-100' },
  like: { icon: Heart, color: 'text-red-600', bgColor: 'bg-red-100' },
  comment: { icon: MessageCircle, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  share: { icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  product_sale: { icon: ShoppingBag, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  product_like: { icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  community: { icon: Users, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  job: { icon: Briefcase, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  system: { icon: Bell, color: 'text-gray-600', bgColor: 'bg-gray-100' }
};

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New Message',
    description: 'Mary Wanjiru sent you a message',
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
    description: 'Grace Muthoni liked your post',
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
    description: 'Peter Omondi purchased 50kg of Maize',
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
    description: 'Sarah Akinyi commented: "Great harvest! Congratulations!"',
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
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    setMarkingRead(notificationId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setMarkingRead(null);
  };

  const handleMarkAllAsRead = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ));
    }
    
    // Navigate
    router.push(notification.actionLink);
    onClose();
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Mark all as read"
              aria-label="Mark all as read"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <Link
            href="/notifications"
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Notification settings"
            aria-label="Notification settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          // Loading skeleton
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification) => {
              const { icon: Icon, color, bgColor } = notificationIcons[notification.type] || notificationIcons.system;
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-green-50/50' : ''
                  }`}
                >
                  {/* Icon or Avatar */}
                  {notification.sourceUser?.avatar ? (
                    <div className="relative flex-shrink-0">
                      <img
                        src={notification.sourceUser.avatar}
                        alt={notification.sourceUser.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 h-5 w-5 ${bgColor} rounded-full flex items-center justify-center border-2 border-white`}>
                        <Icon className={`h-3 w-3 ${color}`} />
                      </div>
                    </div>
                  ) : (
                    <div className={`h-10 w-10 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1">
                    {!notification.read && (
                      <span className="h-2 w-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0" />
                    )}
                    {!notification.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        disabled={markingRead === notification.id}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Mark as read"
                        aria-label="Mark as read"
                      >
                        {markingRead === notification.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3">
        <Link
          href="/notifications"
          onClick={onClose}
          className="flex items-center justify-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium py-2 hover:bg-green-50 rounded-lg transition-colors"
        >
          View all notifications
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
