'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  MapPin, 
  Star, 
  Users, 
  Package, 
  Briefcase, 
  CheckCircle, 
  Award, 
  Leaf,
  MessageCircle,
  UserPlus,
  MoreHorizontal,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Globe,
  Calendar,
  Shield,
  Heart
} from 'lucide-react';

export default function FarmerProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('about');
  const [isFollowing, setIsFollowing] = useState(false);
  interface ProfileData {
    name: string;
    username: string;
    farmName: string;
    location: string;
    bio: string;
    isVerified: boolean;
    rating: number;
    experienceLevel: string;
    followers: number;
    following: number;
    posts: number;
    products: number;
    reviews: number;
    farmSize: string;
    farmImages: string[];
    availabilityStatus: string;
    skills: {
      name: string;
      level: string;
    }[];
    certifications: string[];
    crops: string[];
    livestock: string[];
    yearsExperience: number;
  }

  interface Post {
    id: string;
    content: string;
    image?: string;
    likes: number;
    comments: number;
    timestamp: string;
  }

  interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
  }

  interface Review {
    id: number;
    reviewer: string;
    rating: number;
    comment: string;
    date: string;
  }

  interface ApiResponse {
    _id: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    price: number;
    currency: string;
    quantity: number;
    unit: string;
    condition: string;
    images: string[];
    location: {
      county: string;
      town?: string;
    };
    seller: {
      id: string;
      name: string;
      type: string;
      verified: boolean;
    };
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
    views: number;
  }

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch user profile
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();

        // Map the response to match our expected structure
        const mappedProfileData = {
          name: `${data.user.firstName} ${data.user.lastName}`,
          username: `@${data.user.username || data.user.firstName.toLowerCase()}_${data.user.lastName.toLowerCase()}`,
          farmName: data.user.farmName || '',
          location: `${data.user.location?.county || data.user.location || ''}, Kenya`,
          bio: data.user.bio || '',
          isVerified: data.user.verified || false,
          rating: 4.5, // Placeholder - would come from actual ratings system
          experienceLevel: 'Professional', // Would be calculated from yearsExperience
          followers: data.user.followersCount || 0,
          following: data.user.followingCount || 0,
          posts: data.user.postsCount || 0,
          products: 0, // Will be updated after fetching products
          reviews: 0, // Would come from reviews endpoint
          farmSize: data.user.farmSize || '',
          farmImages: [], // Would come from user's post images
          availabilityStatus: data.user.availabilityStatus || 'Not looking',
          skills: Array.isArray(data.user.skills) 
            ? data.user.skills.map((s: any) => ({
                name: typeof s === 'string' ? s : s.name,
                level: typeof s === 'string' ? 'Intermediate' : s.level || 'Intermediate'
              }))
            : [],
          certifications: data.user.certifications || [],
          crops: data.user.crops || [],
          livestock: data.user.livestock || [],
          yearsExperience: data.user.yearsExperience || 0
        };

        setProfileData(mappedProfileData);

        // Fetch products for this user
        const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/seller/${data.user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (productsResponse.ok) {
          const productsData: ApiResponse[] = await productsResponse.json();
          const formattedProducts = productsData.map((prod: ApiResponse) => ({
            id: prod._id,
            name: prod.name,
            price: `${prod.currency} ${prod.price}/${prod.unit}`,
            image: prod.images && prod.images.length > 0 ? prod.images[0] : '',
            category: prod.category
          }));
          
          setProducts(formattedProducts);
          
          // Update the products count in profile data
          setProfileData(prev => prev ? {
            ...prev,
            products: productsData.length
          } : null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const services = [
    { name: 'Farm Consultation', description: 'Expert advice on farming practices', price: 'KES 2,000/hr' },
    { name: 'Soil Testing', description: 'Comprehensive soil analysis', price: 'KES 1,500/test' },
    { name: 'Seed Supply', description: 'Quality seeds for various crops', price: 'Negotiable' },
    { name: 'Farm Setup Guidance', description: 'Complete farm establishment', price: 'KES 10,000/project' },
    { name: 'Livestock Breeding', description: 'Breeding services for cattle', price: 'KES 3,000/service' }
  ];

  const posts: Post[] = [
    {
      id: "1",
      content: 'Just harvested 50 bags of organic maize! Quality produce available for sale.',
      image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
      likes: 42,
      comments: 8,
      timestamp: '2 hours ago'
    },
    {
      id: "2",
      content: 'New irrigation system installed. Water efficiency improved by 40%!',
      image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
      likes: 28,
      comments: 5,
      timestamp: '1 day ago'
    }
  ];

  const reviews = [
    {
      id: 1,
      reviewer: 'Mary Wanjiku',
      rating: 5,
      comment: 'Excellent service! Very knowledgeable about organic farming techniques.',
      date: '2 weeks ago'
    },
    {
      id: 2,
      reviewer: 'James Mwangi',
      rating: 4,
      comment: 'Professional and reliable. Would definitely recommend.',
      date: '1 month ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
            aria-label="Go back"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="bg-gray-200 border-4 border-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                <User className="h-12 w-12 text-gray-600" />
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                {profileData.isVerified && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <p className="text-gray-600 mb-1">{profileData.username}</p>
              <p className="text-gray-800 font-medium mb-2">{profileData.farmName}</p>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{profileData.location}</span>
              </div>
              <p className="text-gray-700 mb-4">{profileData.bio}</p>
              
              {/* Experience Level Badge */}
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profileData.experienceLevel === 'Beginner' ? 'bg-blue-100 text-blue-800' :
                  profileData.experienceLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  profileData.experienceLevel === 'Professional' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {profileData.experienceLevel} Level
                </span>
                
                {/* Rating */}
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(profileData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600">{profileData.rating} ({profileData.reviews} reviews)</span>
                </div>
              </div>
              
              {/* Availability Status */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profileData.availabilityStatus === 'Open to Work' ? 'bg-green-100 text-green-800' :
                  profileData.availabilityStatus === 'Open to Internships' ? 'bg-blue-100 text-blue-800' :
                  profileData.availabilityStatus === 'Hiring' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {profileData.availabilityStatus}
                </span>
              </div>
              
              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{profileData.posts}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{profileData.followers}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{profileData.following}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{profileData.products}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isFollowing 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button 
                  onClick={() => router.push('/dashboard/profile/edit')}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex overflow-x-auto gap-1">
            {[
              { id: 'about', label: 'About', icon: User },
              { id: 'posts', label: 'Posts', icon: MessageCircle },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'skills', label: 'Skills', icon: Leaf },
              { id: 'certifications', label: 'Certifications', icon: Award },
              { id: 'services', label: 'Services', icon: Briefcase }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Leaf className="h-5 w-5 text-green-600 mr-2" />
                Skills & Expertise
              </h2>
              <div className="space-y-3">
                {profileData.skills.map((skill: { name: string; level: string }) => (
                  <div key={skill.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-800">{skill.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skill.level === 'Beginner' ? 'bg-blue-100 text-blue-800' :
                      skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      skill.level === 'Professional' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Farm Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 text-green-600 mr-2" />
                Farm Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Farm Size</p>
                  <p className="font-medium">{profileData.farmSize}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Crops Produced</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.crops.map((crop: string) => (
                      <span key={crop} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Livestock</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.livestock.map((animal: string) => (
                      <span key={animal} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {animal}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Farm Images</p>
                  <div className="flex gap-2">
                    {profileData.farmImages.slice(0, 3).map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`Farm ${index + 1}`}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Leaf className="h-5 w-5 text-green-600 mr-2" />
              Skills & Expertise
            </h2>
            <div className="space-y-3">
              {profileData.skills.map((skill: { name: string; level: string }) => (
                <div key={skill.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800">{skill.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    skill.level === 'Beginner' ? 'bg-blue-100 text-blue-800' :
                    skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    skill.level === 'Professional' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 text-yellow-600 mr-2" />
              Certifications
            </h2>
            <div className="space-y-4">
              {profileData.certifications.map((cert: string, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">Certificate {index + 1}</h3>
                    <a 
                      href={cert} 
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Certificate
                    </a>
                  </div>
                  <div className="text-sm text-gray-600 break-all">
                    {cert}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
              Services Offered
            </h2>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <span className="font-semibold text-green-600">{service.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                    Contact for Service
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800 mb-3">{post.content}</p>
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments}
                      </span>
                    </div>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Products</h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      <p className="font-semibold text-green-600 mb-3">{product.price}</p>
                      <button 
                        className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                        onClick={() => router.push(`/marketplace/product/${product.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products listed</h3>
                <p className="text-gray-600">This seller hasn&apos;t listed any products yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{review.date}</span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">{review.reviewer}</p>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Production Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 text-orange-600 mr-2" />
              Crops Produced
            </h2>
            <div className="flex flex-wrap gap-2">
              {profileData.crops.map((crop: string) => (
                <span key={crop} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  {crop}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 text-purple-600 mr-2" />
              Livestock Raised
            </h2>
            <div className="flex flex-wrap gap-2">
              {profileData.livestock.map((animal: string) => (
                <span key={animal} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {animal}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 mb-3">{post.content}</p>
                <img 
                  src={post.image} 
                  alt="Post" 
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </span>
                  </div>
                  <span>{post.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}