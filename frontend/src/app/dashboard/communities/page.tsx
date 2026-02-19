'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search,
  Users,
  Plus,
  Lock,
  Globe,
  Leaf,
  Beef,
  Tractor,
  Droplets,
  Sun,
  Sprout,
  MessageSquare,
  Loader2,
  AlertCircle,
  Check,
  User
} from 'lucide-react';

// Types
interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  type: 'public' | 'private';
  isJoined: boolean;
  isAdmin: boolean;
  lastActivity: string;
  image?: string;
}

const categories = [
  { id: 'all', name: 'All Communities', icon: Globe },
  { id: 'crops', name: 'Crop Farming', icon: Leaf },
  { id: 'livestock', name: 'Livestock', icon: Beef },
  { id: 'equipment', name: 'Equipment', icon: Tractor },
  { id: 'irrigation', name: 'Irrigation', icon: Droplets },
  { id: 'organic', name: 'Organic Farming', icon: Sprout },
  { id: 'solar', name: 'Solar & Energy', icon: Sun },
];

// Mock data
const mockCommunities: Community[] = [
  {
    id: 'comm1',
    name: 'Nakuru Dairy Farmers',
    description: 'A community for dairy farmers in Nakuru County to share knowledge, market prices, and best practices.',
    memberCount: 245,
    category: 'livestock',
    type: 'public',
    isJoined: true,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'comm2',
    name: 'Organic Farming Kenya',
    description: 'Discussions on organic farming practices, certification, and sustainable agriculture methods.',
    memberCount: 892,
    category: 'organic',
    type: 'public',
    isJoined: true,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comm3',
    name: 'Maize Farmers Association',
    description: 'Connect with maize farmers across Kenya. Share tips on planting, pest control, and harvesting.',
    memberCount: 1567,
    category: 'crops',
    type: 'public',
    isJoined: false,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'comm4',
    name: 'Coffee Growers Elite',
    description: 'Exclusive group for commercial coffee farmers. Share market insights and premium farming techniques.',
    memberCount: 128,
    category: 'crops',
    type: 'private',
    isJoined: false,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comm5',
    name: 'Smart Irrigation Solutions',
    description: 'Learn about modern irrigation systems, water management, and drought-resistant farming.',
    memberCount: 456,
    category: 'irrigation',
    type: 'public',
    isJoined: true,
    isAdmin: true,
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comm6',
    name: 'Tractor Owners Club',
    description: 'For farmers who own or lease tractors. Discuss maintenance, attachments, and hiring services.',
    memberCount: 234,
    category: 'equipment',
    type: 'public',
    isJoined: false,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comm7',
    name: 'Solar Powered Farms',
    description: 'Explore solar energy solutions for farming operations. Share installation experiences and cost savings.',
    memberCount: 189,
    category: 'solar',
    type: 'public',
    isJoined: false,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comm8',
    name: 'Poultry Masters Kenya',
    description: 'Everything about poultry farming - broilers, layers, feeds, and disease management.',
    memberCount: 723,
    category: 'livestock',
    type: 'public',
    isJoined: true,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  }
];

// Helper functions
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const getCategoryIcon = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId);
  return category?.icon || Globe;
};

// Community Card Component
const CommunityCard = ({ 
  community, 
  onJoin,
  onOpen
}: { 
  community: Community; 
  onJoin: () => void;
  onOpen: () => void;
}) => {
  const Icon = getCategoryIcon(community.category);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            community.isJoined ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Icon className={`h-7 w-7 ${community.isJoined ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          
          <div className="flex items-center space-x-2">
            {community.type === 'private' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </span>
            )}
            {community.isAdmin && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                Admin
              </span>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{community.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{community.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {community.memberCount.toLocaleString()} members
          </span>
          <span>Active {getTimeAgo(community.lastActivity)}</span>
        </div>
        
        {community.isJoined ? (
          <button
            onClick={onOpen}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Open Chat
          </button>
        ) : (
          <button
            onClick={onJoin}
            className="w-full py-2.5 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            {community.type === 'private' ? 'Request to Join' : 'Join Community'}
          </button>
        )}
      </div>
    </div>
  );
};

// Skeleton Loader
const CommunitySkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 bg-gray-200 rounded-xl animate-pulse" />
        <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse" />
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'joined'>('all');

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setCommunities(mockCommunities);
      } catch (err) {
        setError('Failed to load communities');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const filteredCommunities = communities.filter(community => {
    // Filter by tab
    if (activeTab === 'joined' && !community.isJoined) return false;
    
    // Filter by category
    if (activeCategory !== 'all' && community.category !== activeCategory) return false;
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        community.name.toLowerCase().includes(query) ||
        community.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const joinedCount = communities.filter(c => c.isJoined).length;

  const handleJoin = (communityId: string) => {
    setCommunities(prev => prev.map(c => 
      c.id === communityId ? { ...c, isJoined: true } : c
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Communities</h1>
              <p className="text-sm text-gray-500">Connect with farmers by interest and location</p>
            </div>
            
            <button 
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              title="Create community"
              aria-label="Create community"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Community
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Communities
              </button>
              <button
                onClick={() => setActiveTab('joined')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'joined'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                My Communities ({joinedCount})
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <CommunitySkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Communities</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Communities Found</h3>
            <p className="text-gray-600">
              {searchQuery || activeCategory !== 'all' 
                ? 'Try adjusting your filters'
                : 'Join communities to connect with other farmers'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCommunities.map(community => (
              <CommunityCard
                key={community.id}
                community={community}
                onJoin={() => handleJoin(community.id)}
                onOpen={() => router.push(`/dashboard/messages/${community.id}`)}
              />
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900">Why Join Communities?</h3>
              <ul className="mt-2 space-y-2 text-blue-700">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Connect with farmers who share your interests
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Get advice on farming challenges
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Share market prices and opportunities
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Learn new techniques and best practices
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
