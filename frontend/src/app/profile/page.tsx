'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, User, Wrench, Briefcase, Shield, Globe, Eye, Mail, Phone, Calendar, GraduationCap, CheckCircle, Award, Users, ShoppingCart, BriefcaseBusiness } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  coverImage?: string;
  location: {
    county: string;
    subCounty?: string;
  };
  bio?: string;
  farmInfo: {
    farmName?: string;
    farmSize?: string;
    farmingType?: 'crops' | 'livestock' | 'mixed' | 'agribusiness';
    crops: string[];
    livestock: string[];
    experienceYears?: number;
    certifications?: string[];
  };
  professional: {
    skills: string[];
    lookingFor: ('jobs' | 'buyers' | 'partnerships' | 'internships')[];
    availability: 'open' | 'not_looking';
    education?: string;
  };
  privacy: {
    profileVisibility: 'public' | 'followers_only';
    showFarmSize: boolean;
    showPhone: boolean;
    messagePermission: 'everyone' | 'followers_only';
  };
  isProfileComplete: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  verified: boolean;
}

interface Post {
  id: string;
  content: string;
  media?: string[];
  postType: 'text' | 'image' | 'video' | 'article';
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    verified: boolean;
  };
  reactions: {
    type: string;
    count: number;
    userReacted: boolean;
  }[];
  commentsCount: number;
  sharesCount: number;
  saved: boolean;
  isFollowingAuthor: boolean;
}

export default function ViewProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'about'>('posts');
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    // Fetch current user profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        
        // Map the response to match our user structure
        const mappedUser: UserProfile = {
          id: data.user._id || '',
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phone: data.user.phone || undefined,
          profileImage: data.user.profilePicture || undefined,
          coverImage: data.user.coverImage || undefined,
          location: {
            county: data.user.location?.county || data.user.location || '',
            subCounty: data.user.location?.subCounty || undefined
          },
          bio: data.user.bio || undefined,
          farmInfo: {
            farmName: data.user.farmName || undefined,
            farmSize: data.user.farmSize || undefined,
            farmingType: data.user.farmingType || 'crops',
            crops: data.user.crops || [],
            livestock: data.user.livestock || [],
            experienceYears: data.user.yearsExperience || 0,
            certifications: data.user.certifications || []
          },
          professional: {
            skills: Array.isArray(data.user.skills) 
              ? data.user.skills.map((s: any) => typeof s === 'string' ? s : s.name) 
              : [],
            lookingFor: data.user.lookingFor || [],
            availability: data.user.availabilityStatus || 'not_looking',
            education: data.user.education || undefined
          },
          privacy: {
            profileVisibility: data.user.profileVisibility || 'public',
            showFarmSize: data.user.showFarmSize ?? true,
            showPhone: data.user.showPhone ?? true,
            messagePermission: data.user.messagePermission || 'everyone'
          },
          isProfileComplete: data.user.isProfileComplete || false,
          postsCount: data.user.postsCount || 0,
          followersCount: data.user.followersCount || 0,
          followingCount: data.user.followingCount || 0,
          verified: data.user.verified || false
        };
        
        setUser(mappedUser);
        
        // Fetch user's posts
        const fetchUserPosts = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              return;
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/users/${data.user._id}/posts`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch user posts');
            }
            
            const postsData = await response.json();
            setPosts(postsData.posts);
          } catch (err) {
            console.error('Error fetching user posts:', err);
          } finally {
            setPostsLoading(false);
          }
        };
        
        fetchUserPosts();
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const locationDisplay = user.location.subCounty 
    ? `${user.location.subCounty}, ${user.location.county}`
    : user.location.county;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            <Link 
              href="/profile/edit"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-green-400 to-green-600 relative">
            {user.coverImage && (
              <img 
                src={user.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Profile Info */}
          <div className="px-4 pb-4 -mt-16">
            <div className="flex items-end">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                {user.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{locationDisplay}</span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex justify-around mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="font-bold text-gray-900">{user.postsCount}</div>
                <div className="text-xs text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{user.followersCount}</div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{user.followingCount}</div>
                <div className="text-xs text-gray-500">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {user.bio && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-green-600" />
              About
            </h2>
            <p className="text-gray-700">{user.bio}</p>
          </div>
        )}

        {/* Farm Information */}
        {(user.farmInfo.farmName || user.farmInfo.farmSize || user.farmInfo.farmingType || user.farmInfo.crops.length > 0 || user.farmInfo.livestock.length > 0 || user.farmInfo.experienceYears) && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-green-600" />
              Farm Information
            </h2>
            
            <div className="space-y-3">
              {user.farmInfo.farmName && (
                <div>
                  <span className="font-medium text-gray-700">Farm Name:</span>
                  <p className="text-gray-600">{user.farmInfo.farmName}</p>
                </div>
              )}
              
              {user.farmInfo.farmSize && user.privacy.showFarmSize && (
                <div>
                  <span className="font-medium text-gray-700">Farm Size:</span>
                  <p className="text-gray-600">{user.farmInfo.farmSize}</p>
                </div>
              )}
              
              {user.farmInfo.farmingType && (
                <div>
                  <span className="font-medium text-gray-700">Farming Type:</span>
                  <p className="text-gray-600 capitalize">{user.farmInfo.farmingType}</p>
                </div>
              )}
              
              {user.farmInfo.crops.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Crops:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.farmInfo.crops.map((crop, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {user.farmInfo.livestock.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Livestock:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.farmInfo.livestock.map((livestock, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {livestock}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {user.farmInfo.experienceYears && user.farmInfo.experienceYears > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Years of Experience:</span>
                  <p className="text-gray-600">{user.farmInfo.experienceYears} years</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Professional Information */}
        {(user.professional.skills.length > 0 || user.professional.lookingFor.length > 0 || user.professional.education) && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-green-600" />
              Professional Information
            </h2>
            
            <div className="space-y-4">
              {user.professional.skills.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {user.professional.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {user.professional.lookingFor.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Looking For:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.professional.lookingFor.map((lookingFor, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {lookingFor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {user.professional.availability && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Availability:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.professional.availability === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.professional.availability === 'open' ? 'Open to opportunities' : 'Not looking'}
                  </span>
                </div>
              )}
              
              {user.professional.education && (
                <div>
                  <span className="font-medium text-gray-700">Education:</span>
                  <p className="text-gray-600">{user.professional.education}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posts Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'media'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Media
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No posts yet
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {post.author.profilePicture ? (
                            <img
                              src={post.author.profilePicture}
                              alt={`${post.author.firstName} ${post.author.lastName}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-800 font-medium">
                                {post.author.firstName.charAt(0)}{post.author.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {post.author.firstName} {post.author.lastName}
                            </p>
                            {post.author.verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />
                            )}
                            <span className="text-gray-400 mx-2">·</span>
                            <p className="text-xs text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mt-2">
                            <p className="text-gray-800">{post.content}</p>
                            {post.media && post.media.length > 0 && (
                              <div className="mt-3 grid grid-cols-1 gap-2">
                                {post.media.map((media, idx) => (
                                  <div key={idx} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                    <img
                                      src={media}
                                      alt={`Post media ${idx}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex space-x-4 text-gray-500">
                            <button className="flex items-center space-x-1 text-sm hover:text-green-600">
                              <span>🌾 {post.reactions.reduce((acc, r) => acc + r.count, 0)}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-sm hover:text-green-600">
                              <span>💬 {post.commentsCount}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-sm hover:text-green-600">
                              <span>📤 {post.sharesCount}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'media' && (
              <div className="space-y-4">
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : (
                  <>
                    {posts
                      .filter(post => post.media && post.media.length > 0)
                      .flatMap(post => 
                        post.media!.map((media, idx) => ({
                          url: media,
                          id: `${post.id}-${idx}`,
                          postDate: post.createdAt
                        }))
                      )
                      .length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {posts
                          .filter(post => post.media && post.media.length > 0)
                          .flatMap(post => 
                            post.media!.map((media, idx) => ({
                              url: media,
                              id: `${post.id}-${idx}`,
                              postDate: post.createdAt
                            }))
                          )
                          .map((mediaItem) => (
                            <div key={mediaItem.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={mediaItem.url}
                                alt="Media"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No media yet
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {activeTab === 'about' && (
              <div className="space-y-6">
                {user.bio && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-2">Bio</h3>
                    <p className="text-gray-700">{user.bio}</p>
                  </div>
                )}
                
                {(user.farmInfo.farmName || user.farmInfo.farmSize || user.farmInfo.farmingType || user.farmInfo.crops.length > 0 || user.farmInfo.livestock.length > 0 || user.farmInfo.experienceYears) && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-2">Farm Information</h3>
                    <div className="space-y-2">
                      {user.farmInfo.farmName && (
                        <p><span className="font-medium">Farm Name:</span> {user.farmInfo.farmName}</p>
                      )}
                      {user.farmInfo.farmSize && user.privacy.showFarmSize && (
                        <p><span className="font-medium">Farm Size:</span> {user.farmInfo.farmSize}</p>
                      )}
                      {user.farmInfo.farmingType && (
                        <p><span className="font-medium">Farming Type:</span> {user.farmInfo.farmingType}</p>
                      )}
                      {user.farmInfo.crops.length > 0 && (
                        <p><span className="font-medium">Crops:</span> {user.farmInfo.crops.join(', ')}</p>
                      )}
                      {user.farmInfo.livestock.length > 0 && (
                        <p><span className="font-medium">Livestock:</span> {user.farmInfo.livestock.join(', ')}</p>
                      )}
                      {user.farmInfo.experienceYears && user.farmInfo.experienceYears > 0 && (
                        <p><span className="font-medium">Years of Experience:</span> {user.farmInfo.experienceYears}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {(user.professional.skills.length > 0 || user.professional.lookingFor.length > 0 || user.professional.education) && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-2">Professional Info</h3>
                    <div className="space-y-2">
                      {user.professional.skills.length > 0 && (
                        <p><span className="font-medium">Skills:</span> {user.professional.skills.join(', ')}</p>
                      )}
                      {user.professional.lookingFor.length > 0 && (
                        <p><span className="font-medium">Looking For:</span> {user.professional.lookingFor.join(', ')}</p>
                      )}
                      {user.professional.availability && (
                        <p><span className="font-medium">Availability:</span> {user.professional.availability === 'open' ? 'Open to opportunities' : 'Not looking'}</p>
                      )}
                      {user.professional.education && (
                        <p><span className="font-medium">Education:</span> {user.professional.education}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Contact Information */}
        {(user.phone || user.email) && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              Contact Information
            </h2>
            
            <div className="space-y-3">
              {user.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
              )}
              
              {user.phone && user.privacy.showPhone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="text-gray-700">{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}