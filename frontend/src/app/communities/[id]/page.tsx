'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Users,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Circle,
  Loader2,
  MapPin,
  Settings,
  UserPlus,
  LogOut,
  Shield,
  AlertCircle,
  Info,
  ChevronDown,
  Pin
} from 'lucide-react';

// Types
interface CommunityMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'system';
  isPinned?: boolean;
  isAdmin?: boolean;
}

interface CommunityMember {
  id: string;
  name: string;
  avatar?: string;
  isAdmin: boolean;
  isOnline: boolean;
}

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'public' | 'private';
  memberCount: number;
  image?: string;
  location?: string;
  isJoined: boolean;
  isAdmin: boolean;
  rules?: string[];
  pinnedMessage?: CommunityMessage;
}

// Mock data
const mockCommunity: Community = {
  id: '1',
  name: 'Maize Farmers Kenya',
  description: 'A community for maize farmers to share best practices, market prices, and farming tips.',
  category: 'crops',
  type: 'public',
  memberCount: 12543,
  image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
  isJoined: true,
  isAdmin: false,
  rules: [
    'Be respectful to all members',
    'Share accurate market information',
    'No spam or promotional content',
    'Keep discussions agriculture-related'
  ],
  pinnedMessage: {
    id: 'pinned-1',
    senderId: 'admin-1',
    senderName: 'Community Admin',
    content: 'Welcome to Maize Farmers Kenya! Please read the community guidelines before posting.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'system',
    isPinned: true,
    isAdmin: true
  }
};

const mockMessages: CommunityMessage[] = [
  {
    id: '1',
    senderId: 'admin-1',
    senderName: 'Community Admin',
    content: 'Welcome to Maize Farmers Kenya! Please read the community guidelines before posting.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'system',
    isPinned: true,
    isAdmin: true
  },
  {
    id: '2',
    senderId: 'u10',
    senderName: 'James Mwangi',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    content: 'Good morning everyone! What is the current market price for maize in Nairobi?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '3',
    senderId: 'u11',
    senderName: 'Grace Wanjiku',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    content: 'I sold at KES 3,200 per 90kg bag yesterday at Wakulima Market.',
    timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '4',
    senderId: 'u12',
    senderName: 'Peter Njoroge',
    content: 'Prices in Nakuru are slightly lower, around KES 3,000 per bag.',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '5',
    senderId: 'me',
    senderName: 'You',
    content: 'Thank you for the updates. I am planning to sell next week.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '6',
    senderId: 'u13',
    senderName: 'Mary Akinyi',
    senderAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100',
    content: 'Has anyone tried the new KSC maize variety? I heard it has better yield.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '7',
    senderId: 'u14',
    senderName: 'John Kamau',
    senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    content: 'Yes, I planted it last season. Got 35 bags per acre compared to 28 with the old variety.',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  }
];

// Helper functions
function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function shouldShowDateSeparator(currentMsg: CommunityMessage, prevMsg: CommunityMessage | null): boolean {
  if (!prevMsg) return false;
  if (currentMsg.type === 'system' || prevMsg.type === 'system') return false;
  
  const currentDate = new Date(currentMsg.timestamp).toDateString();
  const prevDate = new Date(prevMsg.timestamp).toDateString();
  return currentDate !== prevDate;
}

function formatDateSeparator(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function shouldShowSender(currentMsg: CommunityMessage, prevMsg: CommunityMessage | null): boolean {
  if (currentMsg.type === 'system') return false;
  if (!prevMsg) return true;
  if (prevMsg.type === 'system') return true;
  if (currentMsg.senderId !== prevMsg.senderId) return true;
  
  // Show sender if messages are more than 5 minutes apart
  const currentTime = new Date(currentMsg.timestamp).getTime();
  const prevTime = new Date(prevMsg.timestamp).getTime();
  return (currentTime - prevTime) > 5 * 60 * 1000;
}

export default function CommunityChatPage() {
  const params = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [members, setMembers] = useState<CommunityMember[]>([]);

  const communityId = params.id as string;

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCommunity(mockCommunity);
      setMessages(mockMessages);
      setMembers([
        { id: 'admin-1', name: 'Community Admin', isAdmin: true, isOnline: true },
        { id: 'u10', name: 'James Mwangi', isAdmin: false, isOnline: true },
        { id: 'u11', name: 'Grace Wanjiku', isAdmin: false, isOnline: false },
        { id: 'u12', name: 'Peter Njoroge', isAdmin: false, isOnline: true },
        { id: 'u13', name: 'Mary Akinyi', isAdmin: false, isOnline: false },
        { id: 'u14', name: 'John Kamau', isAdmin: false, isOnline: true }
      ]);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [communityId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    setSending(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));

    const newMessage: CommunityMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
              <div>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Community not found</h3>
          <Link href="/communities" className="text-green-600 hover:text-green-700 mt-2 inline-block">
            Back to communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/communities')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                title="Go back"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              {community.image ? (
                <img
                  src={community.image}
                  alt={community.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              )}
              
              <div>
                <h2 className="font-semibold text-gray-900">{community.name}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {community.memberCount.toLocaleString()} members
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-lg transition-colors hidden lg:block ${
                  showInfo ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Community info"
                aria-label="Community info"
              >
                <Info className="h-5 w-5" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="More options"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Pinned Message */}
          {community.pinnedMessage && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Pin className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{community.pinnedMessage.content}</p>
                  <p className="text-xs text-gray-500 mt-1">Pinned by Admin</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
            const showSender = shouldShowSender(message, prevMessage);
            const isSentByMe = message.senderId === 'me';
            const isSystem = message.type === 'system';

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                      {formatDateSeparator(message.timestamp)}
                    </span>
                  </div>
                )}
                
                {isSystem ? (
                  <div className="flex justify-center my-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 max-w-md">
                      <p className="text-sm text-blue-800 text-center">{message.content}</p>
                      <p className="text-xs text-blue-600 text-center mt-1">
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[85%] sm:max-w-[70%] ${isSentByMe ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      {showSender && !isSentByMe ? (
                        message.senderAvatar ? (
                          <img
                            src={message.senderAvatar}
                            alt={message.senderName}
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0 mt-1"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-green-700 text-xs font-semibold">
                              {message.senderName[0]}
                            </span>
                          </div>
                        )
                      ) : !isSentByMe && (
                        <div className="w-8 flex-shrink-0" />
                      )}
                      
                      <div className={`${isSentByMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {/* Sender Name */}
                        {showSender && (
                          <span className="text-xs text-gray-500 mb-0.5 px-1">
                            {message.senderName}
                            {message.isAdmin && (
                              <span className="ml-1 text-blue-600 font-medium">(Admin)</span>
                            )}
                          </span>
                        )}
                        
                        {/* Message Bubble */}
                        <div className={`px-4 py-2 rounded-2xl ${
                          isSentByMe 
                            ? 'bg-green-600 text-white rounded-br-md' 
                            : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                        } shadow-sm`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            isSentByMe ? 'text-green-100' : 'text-gray-400'
                          }`}>
                            <span className="text-xs">{formatMessageTime(message.timestamp)}</span>
                            {isSentByMe && (
                              <span>
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Attach file"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="flex-1 bg-gray-100 rounded-2xl flex items-end">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent px-4 py-3 resize-none outline-none text-gray-900 placeholder-gray-500 max-h-32"
                style={{ minHeight: '48px' }}
              />
              <button
                className="p-2 hover:bg-gray-200 rounded-full transition-colors m-1"
                title="Add emoji"
                aria-label="Add emoji"
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sending}
              className="p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors flex-shrink-0"
              title="Send message"
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Sidebar */}
      {showInfo && (
        <div className="w-80 bg-white border-l border-gray-200 hidden lg:block overflow-y-auto">
          {/* Community Image */}
          <div className="h-40 bg-gray-100 relative">
            {community.image ? (
              <img
                src={community.image}
                alt={community.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-50">
                <Users className="h-16 w-16 text-green-300" />
              </div>
            )}
          </div>

          <div className="p-4">
            {/* Name & Description */}
            <h2 className="font-semibold text-gray-900 mb-1">{community.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{community.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {community.memberCount.toLocaleString()} members
              </span>
              {community.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {community.location}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors">
                <UserPlus className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Invite Members</span>
              </button>
              {community.isAdmin && (
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Community Settings</span>
                </button>
              )}
              <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors text-red-600">
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Leave Community</span>
              </button>
            </div>

            {/* Rules */}
            {community.rules && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Community Rules</h3>
                <ul className="space-y-2">
                  {community.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-600 font-medium">{index + 1}.</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Online Members */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Online ({members.filter(m => m.isOnline).length})
              </h3>
              <div className="space-y-2">
                {members.filter(m => m.isOnline).slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-700 text-xs font-semibold">
                          {member.name[0]}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-700 flex-1">{member.name}</span>
                    {member.isAdmin && (
                      <Shield className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="h-2 w-2 bg-green-500 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
