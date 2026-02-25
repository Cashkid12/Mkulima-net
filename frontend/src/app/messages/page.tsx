'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search,
  Plus,
  ShoppingCart,
  Briefcase,
  User,
  Clock,
  Check,
  AlertCircle,
  Loader2,
  MessageSquare,
  Users,
  Send
} from 'lucide-react';
import io from 'socket.io-client';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  location?: string;
  verified: boolean;
}

interface Product {
  id: string;
  name: string;
  images: string[];
}

interface Job {
  id: string;
  title: string;
  companyName: string;
}

interface LastMessage {
  _id: string;
  content: string;
  messageType: string;
  senderId: User;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  relatedProductId?: string;
  relatedJobId?: string;
  lastMessage?: LastMessage;
  updatedAt: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [socket, setSocket] = useState<any>(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const newSocket = io(`${apiUrl.replace('/api', '')}`, {
      auth: {
        token: token
      }
    });

    setSocket(newSocket);

    // Listen for new messages
    newSocket.on('receive_message', (message: any) => {
      // Update the conversation list with the new message
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv._id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              updatedAt: new Date().toISOString()
            };
          }
          return conv;
        });
        return updated.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [router]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/conversations`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch conversations');
        }

        const data = await response.json();
        setConversations(data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [router]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => 
      p.id !== localStorage.getItem('userId')
    );
    
    if (!otherParticipant) return false;
    
    return (
      otherParticipant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherParticipant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherParticipant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
  });

  const getLastMessagePreview = (lastMessage?: LastMessage) => {
    if (!lastMessage) return 'No messages yet';
    
    let content = lastMessage.content;
    if (lastMessage.messageType === 'image') {
      content = '📷 Photo';
    } else if (lastMessage.messageType === 'file') {
      content = '📁 File';
    } else if (lastMessage.messageType === 'voice') {
      content = '🎤 Voice message';
    }
    
    return content;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const userId = localStorage.getItem('userId');
    return conversation.participants.find(p => p.id !== userId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-green-800">
                MkulimaNet
              </Link>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-600">Messages</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="py-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* New Message Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <Link 
            href="/messages/new"
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Message</span>
          </Link>
        </div>

        {/* Conversations List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-3 bg-gray-200 rounded w-8 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Messages</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversations</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No conversations match your search' : 'You don\'t have any conversations yet'}
            </p>
            <Link
              href="/messages/new"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Start New Conversation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map(conversation => {
              const otherParticipant = getOtherParticipant(conversation);
              if (!otherParticipant) return null;

              return (
                <Link 
                  key={conversation._id} 
                  href={`/messages/${conversation._id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 block"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-green-600" />
                      </div>
                      {/* Online indicator would go here in a real implementation */}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherParticipant.firstName} {otherParticipant.lastName}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-sm text-gray-500">
                            {formatDate(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {getLastMessagePreview(conversation.lastMessage)}
                        </p>
                        
                        {/* Related item indicator */}
                        {conversation.relatedProductId && (
                          <div className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Product
                          </div>
                        )}
                        {conversation.relatedJobId && (
                          <div className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <Briefcase className="h-3 w-3 mr-1" />
                            Job
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Unread count */}
                    {conversation.unreadCount > 0 && (
                      <div className="flex flex-col items-end">
                        <span className="bg-green-600 text-white text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                        <div className="mt-2 flex items-center">
                          <Check className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}