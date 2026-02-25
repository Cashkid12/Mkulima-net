"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User,
  Clock,
  Check,
  Paperclip,
  Camera,
  Send,
  ArrowLeft,
  AlertCircle,
  Loader2,
  MessageSquare,
  ShoppingCart,
  Briefcase
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

interface Message {
  id: string;
  conversationId: string;
  senderId: User;
  content: string;
  messageType: string;
  mediaUrl?: string;
  fileName?: string;
  readStatus: Record<string, boolean>;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  relatedProductId?: string;
  relatedJobId?: string;
  lastMessage?: Message;
  updatedAt: string;
}

type SocketClient = ReturnType<typeof io>;

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [socket, setSocket] = useState<SocketClient | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [attachmentType, setAttachmentType] = useState<'image' | 'file' | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    const newSocket = io(apiUrl.replace('/api', ''), {
      auth: {
        token: token
      }
    });

    setSocket(newSocket);

    // Join conversation room
    newSocket.emit('join_conversation', id);

    // Listen for new messages
    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data) => {
      // Update UI to show typing indicator
      setIsTyping(true);
    });

    newSocket.on('user_stopped_typing', (data) => {
      // Update UI to hide typing indicator
      setIsTyping(false);
    });

    // Cleanup
    return () => {
      newSocket.emit('leave_conversation', id);
      newSocket.disconnect();
    };
  }, [id, router]);

  // Fetch conversation and messages
  useEffect(() => {
    const fetchConversationAndMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Fetch conversation details
        const conversationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!conversationResponse.ok) {
          const errorData = await conversationResponse.json();
          throw new Error(errorData.message || 'Failed to fetch conversation');
        }

        const conversationData = await conversationResponse.json();
        setConversation(conversationData);

        // Fetch messages in conversation
        const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${id}/messages`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!messagesResponse.ok) {
          const errorData = await messagesResponse.json();
          throw new Error(errorData.message || 'Failed to fetch messages');
        }

        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
      } catch (err) {
        console.error('Error fetching conversation and messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    fetchConversationAndMessages();
  }, [id, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = () => {
    if (!conversation) return null;
    const userId = localStorage.getItem('userId');
    return conversation.participants.find(p => p.id !== userId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachedFile) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Prepare message data
      const messageData: {
        conversationId: string;
        content: string;
        messageType: string;
        mediaUrl?: string;
        fileName?: string;
      } = {
        conversationId: id,
        content: newMessage.trim() || (attachedFile ? 'File attachment' : ''),
        messageType: attachedFile ? (attachmentType === 'image' ? 'image' : 'file') : 'text'
      };

      // If there's an attached file, upload it first
      if (attachedFile) {
        // For simplicity, we'll simulate file upload
        // In a real app, you'd upload to a service like Cloudinary
        const formData = new FormData();
        formData.append('file', attachedFile);
        formData.append('upload_preset', 'mkulima_net');

        // Simulate file upload and get URL
        // In a real implementation, you would upload to a service
        messageData.mediaUrl = URL.createObjectURL(attachedFile);
        messageData.fileName = attachedFileName || attachedFile.name;
      }

      // Send message via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const sentMessage = await response.json();

      // Emit via socket for real-time update
      if (socket) {
        socket.emit('send_message', {
          ...sentMessage,
          conversationId: id,
          senderId: localStorage.getItem('userId')
        });
      }

      // Clear input
      setNewMessage('');
      setAttachedFile(null);
      setAttachedFileName('');
      setAttachmentType(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFile(file);
      setAttachedFileName(file.name);
      
      // Determine file type
      if (file.type.startsWith('image/')) {
        setAttachmentType('image');
      } else {
        setAttachmentType('file');
      }
    }
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

  const isCurrentUser = (senderId: string) => {
    return senderId === localStorage.getItem('userId');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Chat</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Conversation Not Found</h3>
          <p className="text-gray-600 mb-6">The conversation you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/messages"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
              </button>
              
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isTyping ? 'Typing...' : 'Online'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href={`/dashboard/profile/${otherParticipant?.id}`}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Header - Context */}
      {(conversation.relatedProductId || conversation.relatedJobId) && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center">
            {conversation.relatedProductId ? (
              <div className="flex items-center text-blue-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span>Regarding: Product Inquiry</span>
              </div>
            ) : conversation.relatedJobId ? (
              <div className="flex items-center text-blue-700">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>Regarding: Job Inquiry</span>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
            <p className="text-gray-600">Send your first message to start the conversation</p>
          </div>
        ) : (
          messages.map(message => {
            const isMe = isCurrentUser(message.senderId.id);
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMe 
                      ? 'bg-green-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {message.messageType === 'image' && message.mediaUrl ? (
                    <div className="mb-2">
                      <img 
                        src={message.mediaUrl} 
                        alt="Attached" 
                        className="max-w-full h-auto rounded-md"
                      />
                    </div>
                  ) : message.messageType === 'file' && message.mediaUrl ? (
                    <div className="mb-2 flex items-center p-2 bg-gray-100 rounded">
                      <Paperclip className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm">{message.fileName || 'File'}</span>
                    </div>
                  ) : null}
                  
                  {message.content && (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  <div className={`text-xs mt-1 flex ${isMe ? 'justify-end text-green-100' : 'justify-end text-gray-500'}`}>
                    <span>{formatDate(message.createdAt)}</span>
                    {isMe && (
                      <span className="ml-1">
                        <Check className="h-3 w-3 inline" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachedFile && (
        <div className="bg-gray-100 border-t border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {attachmentType === 'image' ? (
                <Camera className="h-5 w-5 text-gray-500 mr-2" />
              ) : (
                <Paperclip className="h-5 w-5 text-gray-500 mr-2" />
              )}
              <span className="text-sm text-gray-700 truncate max-w-xs">{attachedFileName}</span>
            </div>
            <button 
              onClick={() => {
                setAttachedFile(null);
                setAttachedFileName('');
                setAttachmentType(null);
              }}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="relative rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 border-0 resize-none focus:ring-0 focus:outline-none max-h-32"
                  rows={1}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileAttach}
                />
                <Paperclip className="h-6 w-6 text-gray-500 hover:text-gray-700" />
              </label>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && !attachedFile}
                className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}