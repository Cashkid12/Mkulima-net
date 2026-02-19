'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search,
  MessageSquare,
  Users,
  User,
  Clock,
  Check,
  CheckCheck,
  MoreVertical,
  Plus,
  Loader2,
  AlertCircle,
  Circle
} from 'lucide-react';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  farmName?: string;
  profilePicture?: string;
  location?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface Conversation {
  id: string;
  type: 'private' | 'community';
  participant?: User;
  community?: {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    category: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
  updatedAt: string;
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    type: 'private',
    participant: {
      id: 'u2',
      firstName: 'Mary',
      lastName: 'Wanjiru',
      farmName: 'Wanjiru Dairy Farm',
      location: 'Kiambu County',
      isOnline: true
    },
    lastMessage: {
      content: 'Thank you! I will check the cows tomorrow morning.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isRead: false,
      senderId: 'u2'
    },
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'conv2',
    type: 'private',
    participant: {
      id: 'u3',
      firstName: 'Peter',
      lastName: 'Mwangi',
      farmName: 'Highland Coffee Estate',
      location: 'Nyeri County',
      isOnline: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    lastMessage: {
      content: 'The soil pH test results are ready. Let me share them with you.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      senderId: 'u3'
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conv3',
    type: 'community',
    community: {
      id: 'comm1',
      name: 'Nakuru Dairy Farmers',
      description: 'A community for dairy farmers in Nakuru County',
      memberCount: 245,
      category: 'Livestock'
    },
    lastMessage: {
      content: 'John: Anyone selling quality hay in the area?',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isRead: false,
      senderId: 'u5'
    },
    unreadCount: 5,
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'conv4',
    type: 'private',
    participant: {
      id: 'u4',
      firstName: 'Sarah',
      lastName: 'Kimani',
      farmName: 'Kimani Organics',
      location: 'Nakuru County',
      isOnline: true
    },
    lastMessage: {
      content: 'I have fresh tomatoes available this week. Would you like to place an order?',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      senderId: 'u1'
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conv5',
    type: 'community',
    community: {
      id: 'comm2',
      name: 'Organic Farming Kenya',
      description: 'Discussions on organic farming practices',
      memberCount: 892,
      category: 'Farming'
    },
    lastMessage: {
      content: 'Admin: Welcome to all new members! Please read the community guidelines.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      senderId: 'admin'
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conv6',
    type: 'private',
    participant: {
      id: 'u6',
      firstName: 'James',
      lastName: 'Otieno',
      farmName: 'Otieno Grains',
      location: 'Uasin Gishu County',
      isOnline: false,
      lastSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    lastMessage: {
      content: 'Thanks for the advice on wheat planting. The crop is doing well!',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      senderId: 'u6'
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper functions
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
};

const getLastSeenText = (lastSeen?: string): string => {
  if (!lastSeen) return 'Offline';
  return `Last seen ${getTimeAgo(lastSeen)}`;
};

// Conversation Item Component
const ConversationItem = ({ 
  conversation, 
  isActive,
  onClick 
}: { 
  conversation: Conversation; 
  isActive: boolean;
  onClick: () => void;
}) => {
  const isPrivate = conversation.type === 'private';
  const displayName = isPrivate 
    ? `${conversation.participant?.firstName} ${conversation.participant?.lastName}`
    : conversation.community?.name;
  const subtitle = isPrivate
    ? conversation.participant?.farmName || conversation.participant?.location
    : `${conversation.community?.memberCount} members`;

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 cursor-pointer transition-colors ${
        isActive ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isPrivate ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          {isPrivate ? (
            <User className="h-6 w-6 text-green-600" />
          ) : (
            <Users className="h-6 w-6 text-blue-600" />
          )}
        </div>
        
        {/* Online indicator for private chats */}
        {isPrivate && conversation.participant?.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 ml-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {getTimeAgo(conversation.lastMessage.timestamp)}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        
        <div className="flex items-center justify-between mt-1">
          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
            {conversation.lastMessage.content}
          </p>
          
          {conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 ml-2 bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton Loader
const ConversationSkeleton = () => (
  <div className="flex items-center p-4">
    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
    <div className="flex-1 ml-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
    </div>
  </div>
);

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'private' | 'communities'>('all');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Sort by most recent
        const sorted = [...mockConversations].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        
        setConversations(sorted);
      } catch (err) {
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(conv => {
    // Filter by tab
    if (activeTab === 'private' && conv.type !== 'private') return false;
    if (activeTab === 'communities' && conv.type !== 'community') return false;
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (conv.type === 'private') {
        const name = `${conv.participant?.firstName} ${conv.participant?.lastName}`.toLowerCase();
        return name.includes(query) || conv.participant?.farmName?.toLowerCase().includes(query);
      } else {
        return conv.community?.name.toLowerCase().includes(query);
      }
    }
    
    return true;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              {totalUnread > 0 && (
                <span className="ml-2 bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
            
            <button 
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="New message"
              aria-label="New message"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {(['all', 'private', 'communities'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'all' ? 'All' : tab}
                  </button>
                ))}
              </div>

              {/* Conversations */}
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <>
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                  </>
                ) : error ? (
                  <div className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-gray-600">{error}</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchQuery ? 'No conversations found' : 'No messages yet'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={false}
                      onClick={() => router.push(`/dashboard/messages/${conversation.id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Empty State / Welcome */}
          <div className="lg:col-span-2 hidden lg:flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-center p-8">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h2>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
