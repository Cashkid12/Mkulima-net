'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  Circle,
  Loader2,
  MapPin,
  Store,
  AlertCircle
} from 'lucide-react';

// Types
interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image';
  imageUrl?: string;
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  farmName?: string;
  profilePicture?: string;
  location?: string;
  isOnline: boolean;
  lastSeen?: string;
  verified: boolean;
}

// Mock data
const mockParticipant: Participant = {
  id: 'u2',
  firstName: 'Mary',
  lastName: 'Wanjiru',
  farmName: 'Green Valley Dairy',
  location: 'Nakuru County',
  isOnline: true,
  verified: true,
  profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
};

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'u2',
    content: 'Hello! I saw your post about dairy farming. I have some questions about feed management.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '2',
    senderId: 'me',
    content: 'Hi Mary! I would be happy to help. What would you like to know?',
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '3',
    senderId: 'u2',
    content: 'I am trying to improve milk production in my herd. Currently getting about 15 liters per cow per day.',
    timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '4',
    senderId: 'me',
    content: 'That is a good start. What type of feed are you currently using?',
    timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '5',
    senderId: 'u2',
    content: 'Mostly napier grass and some commercial dairy meal. I have been thinking about adding silage.',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '6',
    senderId: 'me',
    content: 'Silage is excellent for dairy cows. It provides consistent nutrition and can help increase milk production. I would recommend starting with maize silage.',
    timestamp: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'text'
  },
  {
    id: '7',
    senderId: 'u2',
    content: 'Thank you for the information about the dairy feeds. I will check with my supplier.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
    type: 'text'
  }
];

// Helper functions
function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function shouldShowDateSeparator(currentMsg: Message, prevMsg: Message | null): boolean {
  if (!prevMsg) return true;
  
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

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);

  const conversationId = params.id as string;

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setMessages(mockMessages);
      setParticipant(mockParticipant);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    setSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setSending(false);

    // Simulate typing indicator from other user
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate reply
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          senderId: participant?.id || 'u2',
          content: 'That sounds great! I will look into it.',
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'text'
        };
        setMessages(prev => [...prev, reply]);
      }, 2000);
    }, 1000);
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
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`h-16 w-64 bg-gray-200 rounded-2xl animate-pulse ${
                i % 2 === 0 ? 'rounded-br-md' : 'rounded-bl-md'
              }`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Conversation not found</h3>
          <Link href="/messages" className="text-green-600 hover:text-green-700 mt-2 inline-block">
            Back to messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/messages')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Participant Info */}
            <div className="relative">
              {participant.profilePicture ? (
                <img
                  src={participant.profilePicture}
                  alt={`${participant.firstName} ${participant.lastName}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 font-semibold">
                    {participant.firstName[0]}{participant.lastName[0]}
                  </span>
                </div>
              )}
              {participant.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold text-gray-900">
                  {participant.firstName} {participant.lastName}
                </h2>
                {participant.verified && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {participant.isOnline ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <Circle className="h-2 w-2 fill-current" />
                    Online
                  </span>
                ) : (
                  <span>Last seen {participant.lastSeen && formatLastSeen(participant.lastSeen)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
              title="Voice call"
              aria-label="Voice call"
            >
              <Phone className="h-5 w-5 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
              title="Video call"
              aria-label="Video call"
            >
              <Video className="h-5 w-5 text-gray-600" />
            </button>
            <Link
              href={`/profile/${participant.id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
              title="View profile"
              aria-label="View profile"
            >
              <Store className="h-5 w-5 text-gray-600" />
            </Link>
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
        {/* Participant Info Card */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-start gap-3">
            {participant.profilePicture ? (
              <img
                src={participant.profilePicture}
                alt={`${participant.firstName} ${participant.lastName}`}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-700 font-semibold text-lg">
                  {participant.firstName[0]}{participant.lastName[0]}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {participant.firstName} {participant.lastName}
              </h3>
              {participant.farmName && (
                <p className="text-sm text-gray-600">{participant.farmName}</p>
              )}
              {participant.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {participant.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
          const isSentByMe = message.senderId === 'me';

          return (
            <div key={message.id}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                    {formatDateSeparator(message.timestamp)}
                  </span>
                </div>
              )}
              
              <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] sm:max-w-[60%] ${
                  isSentByMe 
                    ? 'bg-green-600 text-white rounded-2xl rounded-br-md' 
                    : 'bg-white text-gray-900 rounded-2xl rounded-bl-md border border-gray-200'
                } px-4 py-2.5 shadow-sm`}>
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
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md border border-gray-200 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

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
  );
}
