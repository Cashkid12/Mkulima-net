'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search,
  Plus,
  MoreVertical,
  Phone,
  Video,
  Users,
  MessageCircle,
  Clock,
  Check,
  CheckCheck,
  Circle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

// Types
interface Conversation {
  id: string;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    farmName?: string;
    profilePicture?: string;
    location?: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
    sentByMe: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: '1',
    participant: {
      id: 'u2',
      firstName: 'Mary',
      lastName: 'Wanjiru',
      farmName: 'Green Valley Dairy',
      location: 'Nakuru County',
      isOnline: true,
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    lastMessage: {
      content: 'Thank you for the information about the dairy feeds. I will check with my supplier.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isRead: false,
      sentByMe: false
    },
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    participant: {
      id: 'u3',
      firstName: 'John',
      lastName: 'Kariuki',
      farmName: 'Kariuki Farms',
      location: 'Kiambu County',
      isOnline: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    lastMessage: {
      content: 'The maize harvest will be ready next week. Are you still interested?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      sentByMe: true
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    participant: {
      id: 'u4',
      firstName: 'Grace',
      lastName: 'Muthoni',
      farmName: 'Muthoni Agrovet',
      location: 'Nairobi County',
      isOnline: true,
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    },
    lastMessage: {
      content: 'We have a new stock of fertilizers arriving tomorrow.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      sentByMe: false
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    participant: {
      id: 'u5',
      firstName: 'Peter',
      lastName: 'Omondi',
      farmName: 'Lakeview Farms',
      location: 'Kisumu County',
      isOnline: false,
      lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    lastMessage: {
      content: 'Can you deliver the equipment to my farm?',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      sentByMe: false
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    participant: {
      id: 'u6',
      firstName: 'Sarah',
      lastName: 'Akinyi',
      farmName: 'Akinyi Poultry',
      location: 'Machakos County',
      isOnline: true,
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    lastMessage: {
      content: 'I have 200 layers ready for sale. Let me know if you are interested.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      sentByMe: true
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
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

function formatLastSeen(timestamp: string): string {
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
  return `${diffDays} days ago`;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.participant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participant.farmName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'unread') {
      return matchesSearch && conv.unreadCount > 0;
    }
    return matchesSearch;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Conversations Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg mb-2">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              {totalUnread > 0 && (
                <span className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/communities"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Communities</span>
              </Link>
              <button
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="New message"
                aria-label="New message"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'unread'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread {totalUnread > 0 && `(${totalUnread})`}
            </button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Try adjusting your search'
                : 'Start a conversation with farmers, buyers, or sellers'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {conversation.participant.profilePicture ? (
                    <img
                      src={conversation.participant.profilePicture}
                      alt={`${conversation.participant.firstName} ${conversation.participant.lastName}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-semibold text-lg">
                        {conversation.participant.firstName[0]}{conversation.participant.lastName[0]}
                      </span>
                    </div>
                  )}
                  {/* Online Indicator */}
                  {conversation.participant.isOnline ? (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                  ) : (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-gray-400 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {conversation.participant.firstName} {conversation.participant.lastName}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTimeAgo(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {conversation.participant.farmName || conversation.participant.location}
                  </p>
                  <div className="flex items-center gap-1">
                    {conversation.lastMessage.sentByMe && (
                      <span className="text-gray-400">
                        {conversation.lastMessage.isRead ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </span>
                    )}
                    <p className={`text-sm truncate ${
                      conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                </div>

                {/* Unread Badge */}
                {conversation.unreadCount > 0 && (
                  <span className="flex-shrink-0 bg-green-600 text-white text-xs font-medium h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
