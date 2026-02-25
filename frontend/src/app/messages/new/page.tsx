'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User,
  Search,
  ShoppingCart,
  Briefcase,
  AlertCircle,
  Loader2,
  MessageSquare
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  location?: string;
  verified: boolean;
}

export default function NewMessagePage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [relatedType, setRelatedType] = useState<'product' | 'job' | null>(null);
  const [relatedId, setRelatedId] = useState('');

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/search?q=${encodeURIComponent(searchTerm)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm, router]);

  const handleCreateConversation = async () => {
    if (!selectedUser) {
      alert('Please select a user to message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const requestBody: {
        recipientId: string;
        productId?: string;
        jobId?: string;
      } = {
        recipientId: selectedUser
      };

      if (relatedType === 'product' && relatedId) {
        requestBody.productId = relatedId;
      } else if (relatedType === 'job' && relatedId) {
        requestBody.jobId = relatedId;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create conversation');
      }

      const data = await response.json();
      router.push(`/messages/${data._id}`);
    } catch (err) {
      console.error('Error creating conversation:', err);
      alert(err instanceof Error ? err.message : 'Failed to start conversation');
    }
  };

  const filteredUsers = users.filter(user => 
    user.id !== localStorage.getItem('userId')
  );

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
              <Link href="/messages" className="text-gray-600 hover:text-gray-900 font-medium">
                Messages
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-600">New Message</span>
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
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">New Message</h1>
            <p className="text-gray-600 mt-2">
              Start a new conversation with another user
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Search for user */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search for user
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Selected user */}
            {selectedUser && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {users.find(u => u.id === selectedUser)?.firstName} {users.find(u => u.id === selectedUser)?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      @{users.find(u => u.id === selectedUser)?.username}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Related item */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related to (optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRelatedType('product')}
                  className={`p-4 border rounded-lg text-center ${
                    relatedType === 'product'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
                  <span>Product</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setRelatedType('job')}
                  className={`p-4 border rounded-lg text-center ${
                    relatedType === 'job'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="h-6 w-6 mx-auto mb-2" />
                  <span>Job</span>
                </button>
              </div>
              
              {relatedType && (
                <div className="mt-4">
                  <label htmlFor="relatedId" className="block text-sm font-medium text-gray-700 mb-2">
                    {relatedType === 'product' ? 'Product ID' : 'Job ID'}
                  </label>
                  <input
                    type="text"
                    id="relatedId"
                    placeholder={`Enter ${relatedType} ID...`}
                    value={relatedId}
                    onChange={(e) => setRelatedId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* User list */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center p-3 border border-gray-200 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedUser === user.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No users found matching "{searchTerm}"</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">Search for users to start a conversation</p>
              </div>
            )}

            {/* Create conversation button */}
            <div className="pt-4">
              <button
                onClick={handleCreateConversation}
                disabled={!selectedUser}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}