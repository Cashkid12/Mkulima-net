'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User,
  FileText,
  Heart,
  Users,
  Plus,
  ShoppingBag,
  Edit3,
  TrendingUp,
  AlertCircle,
  Briefcase
} from 'lucide-react';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  farmName?: string;
  location?: string;
  isProfileComplete: boolean;
}

interface StatsData {
  totalPosts: number;
  totalLikes: number;
  followers: number;
  following: number;
  // Marketplace specific stats
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  messagesReceived: number;
  // Job specific stats
  jobsApplied: number;
  jobsPosted: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
}

interface AnalyticsData {
  postsOverTime: { date: string; count: number }[];
  likesOverTime: { date: string; count: number }[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Fetch user profile
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await userResponse.json();
        const userProfile: UserData = {
          firstName: userData.firstName || userData.username?.split(' ')[0] || 'Demo',
          lastName: userData.lastName || '',
          email: userData.email,
          farmName: userData.farmName || userData.username,
          location: userData.location || 'Kenya',
          isProfileComplete: !!userData.firstName && !!userData.email
        };

        // Fetch marketplace stats
        const marketplaceStatsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        let marketplaceStats = {
          totalListings: 0,
          activeListings: 0,
          soldListings: 0,
          totalViews: 0,
          messagesReceived: 0
        };

        if (marketplaceStatsResponse.ok) {
          marketplaceStats = await marketplaceStatsResponse.json();
        }

        // Fetch job stats
        const jobStatsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        let jobStats = {
          jobsApplied: 0,
          jobsPosted: 0,
          totalApplications: 0,
          pendingApplications: 0,
          acceptedApplications: 0
        };

        if (jobStatsResponse.ok) {
          jobStats = await jobStatsResponse.json();
        }

        // Fetch general stats
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        let generalStats = {
          totalPosts: 0,
          totalLikes: 0,
          followers: 0,
          following: 0
        };

        if (statsResponse.ok) {
          generalStats = await statsResponse.json();
        }

        // Combine stats
        const combinedStats: StatsData = {
          ...generalStats,
          ...marketplaceStats,
          ...jobStats
        };

        const mockAnalytics: AnalyticsData = {
          postsOverTime: [],
          likesOverTime: []
        };

        setUser(userProfile);
        setStats(combinedStats);
        setAnalytics(mockAnalytics);
        setLoading(false);
        
        console.log('Dashboard loaded successfully with real data');
        
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        setError('Failed to load dashboard');
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-green-800">MkulimaNet</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.firstName}
              </h1>
              <p className="text-gray-600 mt-1">Here is your performance overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{user.farmName}</p>
                  <p className="text-sm text-gray-500">{user.location}</p>
                </div>
              </div>
              <Link
                href="/dashboard/profile/edit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalPosts || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalListings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jobs Applied</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.jobsApplied || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jobs Posted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.jobsPosted || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalApplications || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Performance Analytics</h2>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No engagement data yet</h3>
            <p className="text-gray-600">Start posting and listing products to see insights about your activity.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Create New Post</h3>
              <p className="text-gray-600 text-sm mb-4">Share updates about your farm activities</p>
              <Link
                href="/dashboard/posts/create"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Create Post
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Add Product</h3>
              <p className="text-gray-600 text-sm mb-4">List your products in the marketplace</p>
              <Link
                href="/marketplace/sell"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Add Product
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Post a Job</h3>
              <p className="text-gray-600 text-sm mb-4">
                Looking for employees? Post a job opportunity
              </p>
              <Link
                href="/jobs/post"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Post Job
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}