'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Send,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  User,
  Users,
  Clock,
  Circle,
  Loader2,
  AlertCircle,
  Info
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
  phone?: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isAdmin?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

interface Conversation {
  id: string;
  type: 'private' | 'community';
  participant?: User;
  community?: Community;
}

// Mock data
const mockConversations: Record<string, Conversation> = {
  'conv1': {
    id: 'conv1',
    type: 'private',
    participant: {
      id: 'u2',
      firstName: 'Mary',
      lastName: 'Wanjiru',
      farmName: 'Wanjiru Dairy Farm',
      location: 'Kiambu County',
      isOnline: true,
      phone: '+254723456789'
    }
  },
  'conv2': {
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
    }
  },
  'conv3': {
    id: 'conv3',
    type: 'community',
    community: {
      id: 'comm1',
      name: 'Nakuru Dairy Farmers',
      description: 'A community for dairy farmers in Nakuru County',
      memberCount: 245,
      category: 'Livestock',
      isAdmin: false
    }
  }
};

const mockMessages: Record<string, Message[]> = {
  'conv1': [
    {
      id: 'm1',
      senderId: 'u2',
      content: 'Hello! I saw your listing for the dairy cows.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm2',
      senderId: 'me',
      content: 'Hi Mary! Yes, they are still available. Are you interested?',
      timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm3',
      senderId: 'u2',
      content: 'Very interested! Can I come see them tomorrow morning?',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm4',
      senderId: 'me',
      content: 'Absolutely! I am available from 8 AM. Here is my location: Thika Road, 2km past the weighbridge.',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm5',
      senderId: 'u2',
      content: 'Perfect! I will be there at 9 AM. Thank you!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isRead: false,
      type: 'text'
    },
    {
      id: 'm6',
      senderId: 'u2',
      content: 'Thank you! I will check the cows tomorrow morning.',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      isRead: false,
      type: 'text'
    }
  ],
  'conv2': [
    {
      id: 'm1',
      senderId: 'u3',
      content: 'Hi! How are your coffee plants doing?',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm2',
      senderId: 'me',
      content: 'They are doing well, thanks for asking! How about yours?',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm3',
      senderId: 'u3',
      content: 'Great! The soil pH test results are ready. Let me share them with you.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text'
    }
  ],
  'conv3': [
    {
      id: 'm1',
      senderId: 'admin',
      content: 'Welcome to Nakuru Dairy Farmers community! This is a space to share knowledge and connect with fellow dairy farmers.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text',
      sender: { id: 'admin', firstName: 'Community', lastName: 'Admin' }
    },
    {
      id: 'm2',
      senderId: 'u5',
      content: 'Hello everyone! I am new here. I have a question about feeding during the dry season.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text',
      sender: { id: 'u5', firstName: 'Grace', lastName: 'Mutua' }
    },
    {
      id: 'm3',
      senderId: 'u8',
      content: 'Welcome Grace! For dry season feeding, I recommend supplementing with hay and mineral blocks.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text',
      sender: { id: 'u8', firstName: 'David', lastName: 'Kamau' }
    },
    {
      id: 'm4',
      senderId: 'u5',
      content: 'Thank you David! Where can I get quality hay in Nakuru?',
      timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text',
      sender: { id: 'u5', firstName: 'Grace', lastName: 'Mutua' }
    },
    {
      id: 'm5',
      senderId: 'me',
      content: 'I sell quality hay from my farm in Njoro. DM me if interested.',
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm6',
      senderId: 'u5',
      content: 'Anyone selling quality hay in the area?',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isRead: false,
      type: 'text',
      sender: { id: 'u5', firstName: 'Grace', lastName: 'Mutua' }
    }
  ]
};

// Helper functions
const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
  }
};

const getLastSeenText = (lastSeen?: string): string => {
  if (!lastSeen) return 'Offline';
  const date = new Date(lastSeen);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Last seen just now';
  if (diffInMinutes < 60) return `Last seen ${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `Last seen ${Math.floor(diffInMinutes / 60)} hours ago`;
  return `Last seen ${formatDate(lastSeen)}`;
};

// Message Bubble Component
const MessageBubble = ({ 
  message, 
  isMe, 
  showSender,
  isCommunity
}: { 
  message: Message; 
  isMe: boolean;
  showSender: boolean;
  isCommunity: boolean;
}) => {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Sender name for community messages */}
        {isCommunity && !isMe && showSender && message.sender && (
          <p className="text-xs text-gray-500 mb-1 ml-1">
            {message.sender.firstName} {message.sender.lastName}
          </p>
        )}
        
        <div
          className={`px-4 py-2 rounded-2xl ${
            isMe
              ? 'bg-green-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        
        <div className={`flex items-center mt-1 space-x-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
          {isMe && (
            message.isRead ? (
              <CheckCheck className="h-3 w-3 text-blue-500" />
            ) : (
              <Check className="h-3 w-3 text-gray-400" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

// Date Separator
const DateSeparator = ({ date }: { date: string }) => (
  <div className="flex items-center justify-center my-6">
    <div className="bg-gray-100 px-4 py-1 rounded-full">
      <span className="text-xs text-gray-500 font-medium">{formatDate(date)}</span>
    </div>
  </div>
);

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const conv = mockConversations[conversationId];
        const msgs = mockMessages[conversationId] || [];
        
        if (conv) {
          setConversation(conv);
          setMessages(msgs);
        } else {
          setError('Conversation not found');
        }
      } catch (err) {
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `new-${Date.now()}`,
      senderId: 'me',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator from other user
    if (conversation?.type === 'private') {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          // Simulate reply
          const reply: Message = {
            id: `reply-${Date.now()}`,
            senderId: conversation.participant?.id || 'other',
            content: 'Thanks for your message! I will get back to you shortly.',
            timestamp: new Date().toISOString(),
            isRead: false,
            type: 'text'
          };
          setMessages(prev => [...prev, reply]);
        }, 2000);
      }, 1000);
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">{error || 'Not Found'}</h1>
          <Link 
            href="/dashboard/messages"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const isPrivate = conversation.type === 'private';
  const displayName = isPrivate 
    ? `${conversation.participant?.firstName} ${conversation.participant?.lastName}`
    : conversation.community?.name;
  const subtitle = isPrivate
    ? conversation.participant?.isOnline 
      ? 'Online'
      : getLastSeenText(conversation.participant?.lastSeen)
    : `${conversation.community?.memberCount} members`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/dashboard/messages"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              
              {/* Avatar */}
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isPrivate ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {isPrivate ? (
                    <User className="h-5 w-5 text-green-600" />
                  ) : (
                    <Users className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                {isPrivate && conversation.participant?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              
              {/* Info */}
              <div className="ml-3">
                <h1 className="font-semibold text-gray-900">{displayName}</h1>
                <p className={`text-sm ${
                  isPrivate && conversation.participant?.isOnline 
                    ? 'text-green-600' 
                    : 'text-gray-500'
                }`}>
                  {subtitle}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              {isPrivate && (
                <>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Voice call"
                    aria-label="Voice call"
                  >
                    <Phone className="h-5 w-5 text-gray-600" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Video call"
                    aria-label="Video call"
                  >
                    <Video className="h-5 w-5 text-gray-600" />
                  </button>
                </>
              )}
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="More options"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Messages Area */}
        <div className={`flex-1 flex flex-col ${showInfo ? 'lg:w-2/3' : 'w-full'}`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Start the conversation!</p>
                </div>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <DateSeparator date={dateMessages[0].timestamp} />
                  {dateMessages.map((message, index) => {
                    const isMe = message.senderId === 'me';
                    const showSender = index === 0 || dateMessages[index - 1].senderId !== message.senderId;
                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isMe={isMe}
                        showSender={showSender}
                        isCommunity={!isPrivate}
                      />
                    );
                  })}
                </div>
              ))
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                title="Attach file"
                aria-label="Attach file"
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>
              
              <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                title="Add emoji"
                aria-label="Add emoji"
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </button>
              
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
                title="Send message"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Info Sidebar */}
        {showInfo && (
          <div className="hidden lg:block w-80 bg-white border-l border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isPrivate ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {isPrivate ? (
                  <User className="h-10 w-10 text-green-600" />
                ) : (
                  <Users className="h-10 w-10 text-blue-600" />
                )}
              </div>
              <h2 className="font-semibold text-gray-900">{displayName}</h2>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>

            {isPrivate && conversation.participant && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Farm/Business</p>
                    <p className="font-medium text-gray-900">{conversation.participant.farmName || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{conversation.participant.location || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}

            {!isPrivate && conversation.community && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Members</p>
                    <p className="font-medium text-gray-900">{conversation.community.memberCount}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{conversation.community.category}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700">{conversation.community.description}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
