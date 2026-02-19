'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search,
  Plus,
  Users,
  MessageCircle,
  Lock,
  Globe,
  ArrowLeft,
  Loader2,
  MapPin,
  Leaf,
  Beef,
  Droplets,
  Sprout,
  Tractor,
  ChevronRight,
  Check
} from 'lucide-react';

// Types
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
  lastActivity: string;
}

// Category icons
const categoryIcons: Record<string, React.ElementType> = {
  crops: Leaf,
  livestock: Beef,
  irrigation: Droplets,
  organic: Sprout,
  equipment: Tractor,
  general: Users
};

// Mock communities data
const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Maize Farmers Kenya',
    description: 'A community for maize farmers to share best practices, market prices, and farming tips.',
    category: 'crops',
    type: 'public',
    memberCount: 12543,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
    isJoined: true,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Dairy Farmers Association',
    description: 'Connect with dairy farmers across Kenya. Discuss milk production, feeds, and dairy management.',
    category: 'livestock',
    type: 'public',
    memberCount: 8932,
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400',
    isJoined: true,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Nakuru Farmers Network',
    description: 'Local farmers network for Nakuru County. Share local market info and farming events.',
    category: 'general',
    type: 'public',
    memberCount: 3421,
    location: 'Nakuru County',
    isJoined: false,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    name: 'Organic Farming Kenya',
    description: 'Learn and share about organic farming methods, certification, and organic markets.',
    category: 'organic',
    type: 'public',
    memberCount: 5678,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
    isJoined: false,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    name: 'Irrigation Experts',
    description: 'Discussion group for irrigation systems, water management, and drought-resistant farming.',
    category: 'irrigation',
    type: 'private',
    memberCount: 2156,
    isJoined: false,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    name: 'Farm Equipment Traders',
    description: 'Buy, sell, and discuss farm equipment. Tractors, harvesters, tools, and machinery.',
    category: 'equipment',
    type: 'public',
    memberCount: 4521,
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400',
    isJoined: true,
    isAdmin: true,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: '7',
    name: 'Poultry Farmers Kenya',
    description: 'Everything about poultry farming - layers, broilers, feeds, and disease management.',
    category: 'livestock',
    type: 'public',
    memberCount: 9876,
    isJoined: false,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '8',
    name: 'Coffee Growers Elite',
    description: 'Exclusive group for commercial coffee farmers. Market insights and premium farming tips.',
    category: 'crops',
    type: 'private',
    memberCount: 892,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
    isJoined: false,
    isAdmin: false,
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
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
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMemberCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'public' | 'private'>('all');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCommunities(mockCommunities);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleJoin = async (communityId: string) => {
    setJoiningId(communityId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCommunities(prev => prev.map(c => 
      c.id === communityId ? { ...c, isJoined: true } : c
    ));
    setJoiningId(null);
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = 
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case 'joined':
        return matchesSearch && community.isJoined;
      case 'public':
        return matchesSearch && community.type === 'public';
      case 'private':
        return matchesSearch && community.type === 'private';
      default:
        return matchesSearch;
    }
  });

  const joinedCount = communities.filter(c => c.isJoined).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Communities Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="h-32 bg-gray-200 rounded-lg animate-pulse mb-4" />
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4" />
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
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
                onClick={() => router.push('/messages')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Communities</h1>
            </div>
            <button
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Community</span>
            </button>
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
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Communities' },
              { id: 'joined', label: `Joined (${joinedCount})` },
              { id: 'public', label: 'Public' },
              { id: 'private', label: 'Private' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchQuery ? 'No communities found' : 'No communities yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Try adjusting your search'
                : 'Join communities to connect with other farmers'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map((community) => {
              const IconComponent = categoryIcons[community.category] || Users;
              
              return (
                <div
                  key={community.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-md transition-all"
                >
                  {/* Image */}
                  <div className="h-32 bg-gray-100 relative">
                    {community.image ? (
                      <img
                        src={community.image}
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-50">
                        <IconComponent className="h-12 w-12 text-green-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {community.type === 'private' ? (
                        <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Private
                        </span>
                      ) : (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Public
                        </span>
                      )}
                    </div>
                    {community.isAdmin && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          Admin
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {community.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {community.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {formatMemberCount(community.memberCount)}
                      </span>
                      {community.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {community.location}
                        </span>
                      )}
                      <span className="text-xs">
                        Active {formatTimeAgo(community.lastActivity)}
                      </span>
                    </div>

                    {/* Action */}
                    {community.isJoined ? (
                      <Link
                        href={`/communities/${community.id}`}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Open Chat
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleJoin(community.id)}
                        disabled={joiningId === community.id}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {joiningId === community.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : community.type === 'private' ? (
                          <>
                            <Lock className="h-4 w-4" />
                            Request to Join
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Join Community
                          </>
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
    </div>
  );
}
