'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User,
  Shield,
  Bell,
  ShoppingBag,
  Users,
  MessageSquare,
  Palette,
  HelpCircle,
  LogOut,
  Camera,
  Edit,
  Check,
  X,
  Eye,
  EyeOff,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Laptop,
  Clock,
  Trash2,
  Key,
  Lock,
  Power,
  AlertTriangle,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Types
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  profilePicture: string;
  role: string;
  farmName: string;
  verified: boolean;
}

interface NotificationSettings {
  push: {
    followers: boolean;
    messages: boolean;
    marketplace: boolean;
    posts: boolean;
    communities: boolean;
    jobs: boolean;
  };
  email: {
    followers: boolean;
    messages: boolean;
    marketplace: boolean;
    posts: boolean;
    communities: boolean;
    jobs: boolean;
  };
  inApp: boolean;
  sound: boolean;
}

interface PrivacySettings {
  twoFactorAuth: boolean;
  showOnlineStatus: boolean;
  showActivityStatus: boolean;
  dataSharing: boolean;
  allowFollowRequests: boolean;
}

interface MarketplaceSettings {
  defaultVisibility: 'public' | 'private';
  defaultCategory: string;
  priceUnit: 'KES' | 'USD';
  autoRefresh: boolean;
  sortPreference: 'freshness' | 'relevance' | 'price';
}

interface FeedSettings {
  showSuggestedPosts: boolean;
  feedRanking: 'freshness' | 'engagement' | 'relevance';
  followSuggestions: boolean;
  showOnlineStatus: boolean;
}

interface CommunitySettings {
  showOnlineStatus: boolean;
  mentionNotifications: boolean;
  groupChatNotifications: boolean;
  autoAcceptInvites: boolean;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'green';
  language: string;
  measurementUnits: 'metric' | 'imperial';
  defaultLanding: 'dashboard' | 'feed' | 'marketplace';
}

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

interface BlockedUser {
  id: string;
  name: string;
  username: string;
  dateBlocked: string;
}

// Mock data
const mockUserProfile: UserProfile = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Kariuki',
  username: 'johnkariuki',
  email: 'john.kariuki@example.com',
  phone: '+254 712 345 678',
  bio: 'Small-scale farmer specializing in maize and dairy farming. Passionate about sustainable agriculture.',
  location: 'Nakuru County',
  profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  role: 'farmer',
  farmName: 'Kariuki Family Farm',
  verified: true
};

const mockNotificationSettings: NotificationSettings = {
  push: {
    followers: true,
    messages: true,
    marketplace: true,
    posts: true,
    communities: true,
    jobs: true
  },
  email: {
    followers: true,
    messages: true,
    marketplace: false,
    posts: true,
    communities: false,
    jobs: true
  },
  inApp: true,
  sound: true
};

const mockPrivacySettings: PrivacySettings = {
  twoFactorAuth: false,
  showOnlineStatus: true,
  showActivityStatus: true,
  dataSharing: false,
  allowFollowRequests: true
};

const mockMarketplaceSettings: MarketplaceSettings = {
  defaultVisibility: 'public',
  defaultCategory: 'crops',
  priceUnit: 'KES',
  autoRefresh: true,
  sortPreference: 'freshness'
};

const mockFeedSettings: FeedSettings = {
  showSuggestedPosts: true,
  feedRanking: 'freshness',
  followSuggestions: true,
  showOnlineStatus: true
};

const mockCommunitySettings: CommunitySettings = {
  showOnlineStatus: true,
  mentionNotifications: true,
  groupChatNotifications: true,
  autoAcceptInvites: false
};

const mockAppSettings: AppSettings = {
  theme: 'light',
  language: 'en',
  measurementUnits: 'metric',
  defaultLanding: 'dashboard'
};

const mockSessions: Session[] = [
  {
    id: 'session-1',
    device: 'Chrome on Windows',
    location: 'Nairobi, Kenya',
    ip: '192.168.1.100',
    lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    current: true
  },
  {
    id: 'session-2',
    device: 'Firefox on Linux',
    location: 'Mombasa, Kenya',
    ip: '10.0.0.50',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    current: false
  },
  {
    id: 'session-3',
    device: 'Safari on iPhone',
    location: 'Kisumu, Kenya',
    ip: '172.16.0.25',
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    current: false
  }
];

const mockBlockedUsers: BlockedUser[] = [
  {
    id: 'blocked-1',
    name: 'Jane Doe',
    username: 'janedoe',
    dateBlocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'blocked-2',
    name: 'Bob Smith',
    username: 'bobsmith',
    dateBlocked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State for all settings
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(mockPrivacySettings);
  const [marketplaceSettings, setMarketplaceSettings] = useState<MarketplaceSettings>(mockMarketplaceSettings);
  const [feedSettings, setFeedSettings] = useState<FeedSettings>(mockFeedSettings);
  const [communitySettings, setCommunitySettings] = useState<CommunitySettings>(mockCommunitySettings);
  const [appSettings, setAppSettings] = useState<AppSettings>(mockAppSettings);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(mockBlockedUsers);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    account: true,
    privacy: false,
    notifications: false,
    marketplace: false,
    feed: false,
    communities: false,
    app: false,
    support: false
  });

  useEffect(() => {
    // Simulate API call to load settings
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    // In a real app, you would save to backend here
  };

  const handleLogout = () => {
    // In a real app, you would clear tokens and redirect
    router.push('/auth/login');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateNotificationSetting = (type: 'push' | 'email', category: keyof NotificationSettings['push'], value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [category]: value
      }
    }));
  };

  // Render section based on active section
  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={profile.profilePicture}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-200" aria-label="Change profile picture">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">JPG, PNG or GIF (Max 5MB)</p>
                  <div className="flex gap-2 mt-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" title="Upload new profile picture">
                      Upload
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title="Remove profile picture">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                  <input
                    type="text"
                    value={profile.farmName}
                    onChange={(e) => setProfile({...profile, farmName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            {/* Privacy Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Controls</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => setPrivacySettings({...privacySettings, twoFactorAuth: !privacySettings.twoFactorAuth})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacySettings.twoFactorAuth ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Show Online Status</h4>
                    <p className="text-sm text-gray-500">Others can see when you're online</p>
                  </div>
                  <button
                    onClick={() => setPrivacySettings({...privacySettings, showOnlineStatus: !privacySettings.showOnlineStatus})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacySettings.showOnlineStatus ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacySettings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Allow Follow Requests</h4>
                    <p className="text-sm text-gray-500">Allow others to send follow requests</p>
                  </div>
                  <button
                    onClick={() => setPrivacySettings({...privacySettings, allowFollowRequests: !privacySettings.allowFollowRequests})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacySettings.allowFollowRequests ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacySettings.allowFollowRequests ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
              <div className="space-y-4">
                {sessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {session.current ? <Laptop className="h-5 w-5 text-green-600" /> : <Smartphone className="h-5 w-5 text-gray-500" />}
                      <div>
                        <p className="font-medium text-gray-900">{session.device}</p>
                        <p className="text-sm text-gray-500">{session.location} • {session.ip}</p>
                        <p className="text-xs text-gray-400">Active {formatTimeAgo(session.lastActive)}</p>
                      </div>
                    </div>
                    {session.current ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Current
                      </span>
                    ) : (
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium" title="Logout from this session">
                        Logout
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Blocked Users */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Blocked Users</h3>
              <div className="space-y-4">
                {blockedUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      <p className="text-xs text-gray-400">Blocked on {formatDate(user.dateBlocked)}</p>
                    </div>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium" title="Unblock user">
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-red-50 transition-colors" title="Deactivate Account">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-700">Deactivate Account</p>
                      <p className="text-sm text-gray-500">Temporarily disable your account</p>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
                <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors" title="Delete Account">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-700">Delete Account</p>
                      <p className="text-sm text-gray-500">Permanently delete your account</p>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            {/* Push Notifications */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Followers</h4>
                    <p className="text-sm text-gray-500">Someone starts following you</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('push', 'followers', !notificationSettings.push.followers)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.push.followers ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.push.followers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Messages</h4>
                    <p className="text-sm text-gray-500">New messages or replies</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('push', 'messages', !notificationSettings.push.messages)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.push.messages ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.push.messages ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Marketplace</h4>
                    <p className="text-sm text-gray-500">Product sales, interest, or bids</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('push', 'marketplace', !notificationSettings.push.marketplace)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.push.marketplace ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.push.marketplace ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Posts</h4>
                    <p className="text-sm text-gray-500">Likes, comments, or shares on your posts</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('push', 'posts', !notificationSettings.push.posts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.push.posts ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.push.posts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Communities</h4>
                    <p className="text-sm text-gray-500">Mentions or activity in communities</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('push', 'communities', !notificationSettings.push.communities)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.push.communities ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.push.communities ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Jobs</h4>
                    <p className="text-sm text-gray-500">Job applications or new opportunities</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('push', 'jobs', !notificationSettings.push.jobs)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.push.jobs ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.push.jobs ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Followers</h4>
                    <p className="text-sm text-gray-500">Someone starts following you</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('email', 'followers', !notificationSettings.email.followers)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.email.followers ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.email.followers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Messages</h4>
                    <p className="text-sm text-gray-500">New messages or replies</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('email', 'messages', !notificationSettings.email.messages)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.email.messages ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.email.messages ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Marketplace</h4>
                    <p className="text-sm text-gray-500">Product sales, interest, or bids</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('email', 'marketplace', !notificationSettings.email.marketplace)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.email.marketplace ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.email.marketplace ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">In-App Notifications</h4>
                    <p className="text-sm text-gray-500">Show notifications within the app</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({...notificationSettings, inApp: !notificationSettings.inApp})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.inApp ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.inApp ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Sound Notifications</h4>
                    <p className="text-sm text-gray-500">Play sound when notifications arrive</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({...notificationSettings, sound: !notificationSettings.sound})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.sound ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.sound ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'marketplace':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Marketplace Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Visibility</label>
                  <select
                    value={marketplaceSettings.defaultVisibility}
                    onChange={(e) => setMarketplaceSettings({...marketplaceSettings, defaultVisibility: e.target.value as 'public' | 'private'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Category</label>
                  <select
                    value={marketplaceSettings.defaultCategory}
                    onChange={(e) => setMarketplaceSettings({...marketplaceSettings, defaultCategory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="crops">Crops</option>
                    <option value="livestock">Livestock</option>
                    <option value="agrovet">Agrovet</option>
                    <option value="equipment">Equipment</option>
                    <option value="seedlings">Seedlings</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Unit</label>
                  <select
                    value={marketplaceSettings.priceUnit}
                    onChange={(e) => setMarketplaceSettings({...marketplaceSettings, priceUnit: e.target.value as 'KES' | 'USD'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="KES">KES (Kenyan Shilling)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Preference</label>
                  <select
                    value={marketplaceSettings.sortPreference}
                    onChange={(e) => setMarketplaceSettings({...marketplaceSettings, sortPreference: e.target.value as 'freshness' | 'relevance' | 'price'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="freshness">Freshness</option>
                    <option value="relevance">Relevance</option>
                    <option value="price">Price</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-Refresh</h4>
                    <p className="text-sm text-gray-500">Automatically refresh marketplace listings</p>
                  </div>
                  <button
                    onClick={() => setMarketplaceSettings({...marketplaceSettings, autoRefresh: !marketplaceSettings.autoRefresh})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      marketplaceSettings.autoRefresh ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        marketplaceSettings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'feed':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Feed Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feed Ranking</label>
                  <select
                    value={feedSettings.feedRanking}
                    onChange={(e) => setFeedSettings({...feedSettings, feedRanking: e.target.value as 'freshness' | 'engagement' | 'relevance'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="freshness">Freshness</option>
                    <option value="engagement">Engagement</option>
                    <option value="relevance">Relevance</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Show Suggested Posts</h4>
                    <p className="text-sm text-gray-500">Display recommended content based on your interests</p>
                  </div>
                  <button
                    onClick={() => setFeedSettings({...feedSettings, showSuggestedPosts: !feedSettings.showSuggestedPosts})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      feedSettings.showSuggestedPosts ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        feedSettings.showSuggestedPosts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Follow Suggestions</h4>
                    <p className="text-sm text-gray-500">Receive suggestions for users to follow</p>
                  </div>
                  <button
                    onClick={() => setFeedSettings({...feedSettings, followSuggestions: !feedSettings.followSuggestions})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      feedSettings.followSuggestions ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        feedSettings.followSuggestions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Show Online Status</h4>
                    <p className="text-sm text-gray-500">Others can see when you're active</p>
                  </div>
                  <button
                    onClick={() => setFeedSettings({...feedSettings, showOnlineStatus: !feedSettings.showOnlineStatus})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      feedSettings.showOnlineStatus ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        feedSettings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'communities':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Community Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Show Online Status</h4>
                    <p className="text-sm text-gray-500">Others can see when you're online in communities</p>
                  </div>
                  <button
                    onClick={() => setCommunitySettings({...communitySettings, showOnlineStatus: !communitySettings.showOnlineStatus})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      communitySettings.showOnlineStatus ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        communitySettings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Mention Notifications</h4>
                    <p className="text-sm text-gray-500">Notify when you're mentioned in communities</p>
                  </div>
                  <button
                    onClick={() => setCommunitySettings({...communitySettings, mentionNotifications: !communitySettings.mentionNotifications})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      communitySettings.mentionNotifications ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        communitySettings.mentionNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Group Chat Notifications</h4>
                    <p className="text-sm text-gray-500">Notify when there's activity in groups</p>
                  </div>
                  <button
                    onClick={() => setCommunitySettings({...communitySettings, groupChatNotifications: !communitySettings.groupChatNotifications})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      communitySettings.groupChatNotifications ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        communitySettings.groupChatNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-Accept Invites</h4>
                    <p className="text-sm text-gray-500">Automatically join communities when invited</p>
                  </div>
                  <button
                    onClick={() => setCommunitySettings({...communitySettings, autoAcceptInvites: !communitySettings.autoAcceptInvites})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      communitySettings.autoAcceptInvites ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        communitySettings.autoAcceptInvites ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'app':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">App Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <select
                    value={appSettings.theme}
                    onChange={(e) => setAppSettings({...appSettings, theme: e.target.value as 'light' | 'dark' | 'green'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="green">Green (Agriculture)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={appSettings.language}
                    onChange={(e) => setAppSettings({...appSettings, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Units</label>
                  <select
                    value={appSettings.measurementUnits}
                    onChange={(e) => setAppSettings({...appSettings, measurementUnits: e.target.value as 'metric' | 'imperial'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="metric">Metric (kg, liters, hectares)</option>
                    <option value="imperial">Imperial (lbs, gallons, acres)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Landing Page</label>
                  <select
                    value={appSettings.defaultLanding}
                    onChange={(e) => setAppSettings({...appSettings, defaultLanding: e.target.value as 'dashboard' | 'feed' | 'marketplace'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="dashboard">Dashboard</option>
                    <option value="feed">Feed</option>
                    <option value="marketplace">Marketplace</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Support & Help</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Help Center">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Help Center</p>
                      <p className="text-sm text-gray-500">Find answers to common questions</p>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Contact Support">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Contact Support</p>
                      <p className="text-sm text-gray-500">Get help from our support team</p>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Report a Bug">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-700">Report a Bug</p>
                      <p className="text-sm text-gray-500">Report issues with the platform</p>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Terms & Privacy">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Terms & Privacy</p>
                      <p className="text-sm text-gray-500">Review our policies</p>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Version Info</p>
                      <p className="text-sm text-gray-500">Platform version and updates</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">v1.0.0</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-700">Logout</p>
                      <p className="text-sm text-gray-500">Sign out of your account</p>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </h2>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection('account')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === 'account'
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('privacy')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === 'privacy'
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span>Privacy & Security</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('notifications')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === 'notifications'
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('marketplace')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === 'marketplace'
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Marketplace</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('feed')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === 'feed'
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Feed</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('communities')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === 'communities'
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Communities</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('app')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === 'app'
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Palette className="h-5 w-5" />
                  <span>App Preferences</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('support')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === 'support'
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>Support & Help</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeSection.replace(/([A-Z])/g, ' $1').trim()}
                </h2>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
