'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UserSettings {
  account: {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    location: {
      county: string;
      subCounty: string;
    };
    farmName: string;
    profilePicture: string;
  };
  privacy: {
    profileVisibility: 'public' | 'followers' | 'private';
    defaultPostVisibility: 'public' | 'followers';
    messagePermission: 'everyone' | 'followers' | 'no_one';
    allowProductMessages: boolean;
    allowJobMessages: boolean;
  };
  notifications: {
    reactions: boolean;
    comments: boolean;
    followers: boolean;
    messages: boolean;
    marketplace: boolean;
    jobs: boolean;
  };
  appearance: 'light' | 'dark' | 'system';
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<UserSettings>({
    account: {
      firstName: '',
      lastName: '',
      email: '',
      bio: '',
      location: {
        county: '',
        subCounty: ''
      },
      farmName: '',
      profilePicture: ''
    },
    privacy: {
      profileVisibility: 'public',
      defaultPostVisibility: 'public',
      messagePermission: 'everyone',
      allowProductMessages: true,
      allowJobMessages: true
    },
    notifications: {
      reactions: true,
      comments: true,
      followers: true,
      messages: true,
      marketplace: true,
      jobs: true
    },
    appearance: 'system'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Type assertion to ensure proper structure
        const settingsData: UserSettings = {
          account: {
            firstName: data.account.firstName || '',
            lastName: data.account.lastName || '',
            email: data.account.email || '',
            bio: data.account.bio || '',
            location: {
              county: data.account.location?.county || '',
              subCounty: data.account.location?.subCounty || ''
            },
            farmName: data.account.farmName || '',
            profilePicture: data.account.profilePicture || ''
          },
          privacy: {
            profileVisibility: data.privacy.profileVisibility || 'public',
            defaultPostVisibility: data.privacy.defaultPostVisibility || 'public',
            messagePermission: data.privacy.messagePermission || 'everyone',
            allowProductMessages: data.privacy.allowProductMessages ?? true,
            allowJobMessages: data.privacy.allowJobMessages ?? true
          },
          notifications: {
            reactions: data.notifications.reactions ?? true,
            comments: data.notifications.comments ?? true,
            followers: data.notifications.followers ?? true,
            messages: data.notifications.messages ?? true,
            marketplace: data.notifications.marketplace ?? true,
            jobs: data.notifications.jobs ?? true
          },
          appearance: data.appearance || 'system'
        };
        
        setFormData(settingsData);
      } else {
        setErrorMessage('Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setErrorMessage('An error occurred while loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section: keyof UserSettings, field: string, value: unknown) => {
    setFormData(prev => {
      if (section === 'account') {
        const updatedAccount = { ...prev.account };
        (updatedAccount as Record<string, unknown>)[field] = value;
        return { ...prev, account: updatedAccount as typeof prev.account };
      } else if (section === 'privacy') {
        const updatedPrivacy = { ...prev.privacy };
        (updatedPrivacy as Record<string, unknown>)[field] = value;
        return { ...prev, privacy: updatedPrivacy as typeof prev.privacy };
      } else if (section === 'notifications') {
        const updatedNotifications = { ...prev.notifications };
        (updatedNotifications as Record<string, unknown>)[field] = value;
        return { ...prev, notifications: updatedNotifications as typeof prev.notifications };
      } else if (section === 'appearance') {
        return { ...prev, appearance: value as 'light' | 'dark' | 'system' };
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      let response;
      let successMsg = '';

      switch (activeTab) {
        case 'account':
          response = await fetch('/api/settings/account', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              firstName: formData.account.firstName,
              lastName: formData.account.lastName,
              email: formData.account.email,
              bio: formData.account.bio,
              location: formData.account.location,
              farmName: formData.account.farmName,
              profilePicture: formData.account.profilePicture
            })
          });
          successMsg = 'Account settings updated successfully';
          break;

        case 'privacy':
          response = await fetch('/api/settings/privacy', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              profileVisibility: formData.privacy.profileVisibility,
              defaultPostVisibility: formData.privacy.defaultPostVisibility,
              messagePermission: formData.privacy.messagePermission,
              allowProductMessages: formData.privacy.allowProductMessages,
              allowJobMessages: formData.privacy.allowJobMessages
            })
          });
          successMsg = 'Privacy settings updated successfully';
          break;

        case 'notifications':
          response = await fetch('/api/settings/notifications', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              reactions: formData.notifications.reactions,
              comments: formData.notifications.comments,
              followers: formData.notifications.followers,
              messages: formData.notifications.messages,
              marketplace: formData.notifications.marketplace,
              jobs: formData.notifications.jobs
            })
          });
          successMsg = 'Notification settings updated successfully';
          break;

        case 'appearance':
          response = await fetch('/api/settings/appearance', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              theme: formData.appearance
            })
          });
          successMsg = 'Appearance settings updated successfully';
          break;

        default:
          throw new Error('Invalid tab');
      }

      if (response.ok) {
        setSuccessMessage(successMsg);
        // Optionally update user context with new settings
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.msg || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setErrorMessage('An error occurred while updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement).value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/settings/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (response.ok) {
        setSuccessMessage('Password changed successfully');
        (document.getElementById('passwordForm') as HTMLFormElement)?.reset();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.msg || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage('An error occurred while changing password');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/settings/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Log out user and redirect to home
        localStorage.removeItem('token');
        router.push('/');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.msg || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setErrorMessage('An error occurred while deleting account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['account', 'privacy', 'notifications', 'security', 'appearance'].map((tab) => (
                <button
                  key={tab}
                  className={`py-4 px-6 text-center font-medium text-sm ${
                    activeTab === tab
                      ? 'border-b-2 border-green-500 text-green-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.account.firstName}
                      onChange={(e) => handleChange('account', 'firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.account.lastName}
                      onChange={(e) => handleChange('account', 'lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.account.email}
                      onChange={(e) => handleChange('account', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-1">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      id="farmName"
                      value={formData.account.farmName}
                      onChange={(e) => handleChange('account', 'farmName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      value={formData.account.bio}
                      onChange={(e) => handleChange('account', 'bio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
                      County
                    </label>
                    <input
                      type="text"
                      id="county"
                      value={formData.account.location.county}
                      onChange={(e) => handleChange('account', 'location', { ...formData.account.location, county: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="subCounty" className="block text-sm font-medium text-gray-700 mb-1">
                      Sub County
                    </label>
                    <input
                      type="text"
                      id="subCounty"
                      value={formData.account.location.subCounty}
                      onChange={(e) => handleChange('account', 'location', { ...formData.account.location, subCounty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Account Settings'}
                  </button>
                </div>
              </form>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Visibility
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'public', label: 'Public - Anyone can see your profile' },
                        { value: 'followers', label: 'Followers only - Only your followers can see your profile' },
                        { value: 'private', label: 'Private - Only you can see your profile' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            id={`profile-${option.value}`}
                            name="profileVisibility"
                            value={option.value}
                            checked={formData.privacy.profileVisibility === option.value}
                            onChange={(e) => handleChange('privacy', 'profileVisibility', e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500"
                          />
                          <label htmlFor={`profile-${option.value}`} className="ml-3 block text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Post Visibility
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'public', label: 'Public - Posts visible to everyone' },
                        { value: 'followers', label: 'Followers only - Posts visible to followers only' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            id={`post-${option.value}`}
                            name="defaultPostVisibility"
                            value={option.value}
                            checked={formData.privacy.defaultPostVisibility === option.value}
                            onChange={(e) => handleChange('privacy', 'defaultPostVisibility', e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500"
                          />
                          <label htmlFor={`post-${option.value}`} className="ml-3 block text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who Can Message You
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'everyone', label: 'Everyone - Anyone can message you' },
                        { value: 'followers', label: 'Followers only - Only people you follow can message you' },
                        { value: 'no_one', label: 'No one - Nobody can message you' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            id={`message-${option.value}`}
                            name="messagePermission"
                            value={option.value}
                            checked={formData.privacy.messagePermission === option.value}
                            onChange={(e) => handleChange('privacy', 'messagePermission', e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500"
                          />
                          <label htmlFor={`message-${option.value}`} className="ml-3 block text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="allowProductMessages"
                        type="checkbox"
                        checked={formData.privacy.allowProductMessages}
                        onChange={(e) => handleChange('privacy', 'allowProductMessages', e.target.checked)}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="allowProductMessages" className="font-medium text-gray-700">
                        Allow messages about products
                      </label>
                      <p className="text-gray-500">Allow other users to send you messages about products listed in the marketplace</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="allowJobMessages"
                        type="checkbox"
                        checked={formData.privacy.allowJobMessages}
                        onChange={(e) => handleChange('privacy', 'allowJobMessages', e.target.checked)}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="allowJobMessages" className="font-medium text-gray-700">
                        Allow messages about jobs
                      </label>
                      <p className="text-gray-500">Allow other users to send you messages about job postings</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Privacy Settings'}
                  </button>
                </div>
              </form>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="reactions"
                        type="checkbox"
                        checked={formData.notifications.reactions}
                        onChange={(e) => handleChange('notifications', 'reactions', e.target.checked)}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="reactions" className="font-medium text-gray-700">
                        Reactions
                      </label>
                      <p className="text-gray-500">Receive notifications when someone reacts to your posts</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="comments"
                        type="checkbox"
                        checked={formData.notifications.comments}
                        onChange={(e) => handleChange('notifications', 'comments', e.target.checked)}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="comments" className="font-medium text-gray-700">
                        Comments
                      </label>
                      <p className="text-gray-500">Receive notifications when someone comments on your posts</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="followers"
                        type="checkbox"
                        checked={formData.notifications.followers}
                        onChange={(e) => handleChange('notifications', 'followers', e.target.checked)}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="followers" className="font-medium text-gray-700">
                        Followers
                      </label>
                      <p className="text-gray-500">Receive notifications when someone follows you</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="messages"
                        type="checkbox"
                        checked={formData.notifications.messages}
                        onChange={(e) => handleChange('notifications', 'messages', e.target.checked)}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="messages" className="font-medium text-gray-700">
                        Messages
                      </label>
                      <p className="text-gray-500">Receive notifications when someone sends you a message</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="marketplace"
                        type="checkbox"
                        checked={formData.notifications.marketplace}
                        onChange={(e) => handleChange('notifications', 'marketplace', e.target.checked)}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="marketplace" className="font-medium text-gray-700">
                        Marketplace
                      </label>
                      <p className="text-gray-500">Receive notifications about marketplace activity</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="jobs"
                        type="checkbox"
                        checked={formData.notifications.jobs}
                        onChange={(e) => handleChange('notifications', 'jobs', e.target.checked)}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="jobs" className="font-medium text-gray-700">
                        Jobs
                      </label>
                      <p className="text-gray-500">Receive notifications about job postings and applications</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </button>
                </div>
              </form>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  <form id="passwordForm" onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {saving ? 'Updating...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Account Deletion</h3>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      type="button"
                      onClick={handleAccountDeletion}
                      disabled={saving}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {saving ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <form onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'light', label: 'Light - Light theme with white background' },
                      { value: 'dark', label: 'Dark - Dark theme with black background' },
                      { value: 'system', label: 'System - Use system preference' }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`theme-${option.value}`}
                          name="appearance"
                          value={option.value}
                          checked={formData.appearance === option.value}
                          onChange={(e) => handleChange('appearance', 'appearance', e.target.value)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor={`theme-${option.value}`} className="ml-3 block text-sm text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Appearance Settings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}