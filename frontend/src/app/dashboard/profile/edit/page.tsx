'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, User, Wrench, Briefcase, Shield, Globe, Eye, Mail, Phone, Calendar, GraduationCap } from 'lucide-react';

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
}

const cropOptions = [
  'Maize', 'Rice', 'Wheat', 'Sorghum', 'Millet', 'Beans', 'Peas', 'Soybeans',
  'Potatoes', 'Sweet Potatoes', 'Bananas', 'Pineapples', 'Avocados', 'Mangoes',
  'Coffee', 'Tea', 'Cotton', 'Sugarcane', 'Flowers', 'Vegetables', 'Other'
];

const livestockOptions = [
  'Dairy Cows', 'Beef Cows', 'Goats', 'Sheep', 'Pigs', 'Chickens', 'Turkeys',
  'Fish', 'Bees', 'Rabbits', 'Other'
];

const farmingTypes = [
  { value: 'crops', label: 'Crops' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'mixed', label: 'Mixed Farming' },
  { value: 'agribusiness', label: 'Agribusiness' }
];

const lookingForOptions = [
  { value: 'jobs', label: 'Jobs' },
  { value: 'buyers', label: 'Buyers' },
  { value: 'partnerships', label: 'Partnerships' },
  { value: 'internships', label: 'Internships' }
];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
    coverImage: '',
    location: {
      county: '',
      subCounty: ''
    },
    bio: '',
    farmInfo: {
      farmName: '',
      farmSize: '',
      farmingType: 'crops',
      crops: [],
      livestock: [],
      experienceYears: 0,
      certifications: []
    },
    professional: {
      skills: [],
      lookingFor: [],
      availability: 'open',
      education: ''
    },
    privacy: {
      profileVisibility: 'public',
      showFarmSize: true,
      showPhone: true,
      messagePermission: 'everyone'
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertificate, setNewCertificate] = useState('');
  const [certificateFiles, setCertificateFiles] = useState<FileList | null>(null);

  useEffect(() => {
    // Fetch current user profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

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
        
        // Map the response to match our form structure
        setFormData(prev => ({
          ...prev,
          id: prev.id,
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          profileImage: data.user.profilePicture || '',
          coverImage: data.user.coverImage || '',
          location: {
            county: data.user.location?.county || data.user.location || '',
            subCounty: data.user.location?.subCounty || ''
          },
          bio: data.user.bio || '',
          farmInfo: {
            ...prev.farmInfo,
            farmName: data.user.farmName || '',
            farmSize: data.user.farmSize || '',
            farmingType: data.user.farmingType || 'crops',
            crops: data.user.crops || [],
            livestock: data.user.livestock || [],
            experienceYears: data.user.yearsExperience || 0,
            certifications: data.user.certifications || []
          },
          professional: {
            ...prev.professional,
            skills: Array.isArray(data.user.skills) 
              ? data.user.skills.map((s: string | { name: string }) => typeof s === 'string' ? s : (s.name || s))
              : [],
            lookingFor: data.user.lookingFor || [],
            availability: data.user.availabilityStatus || 'open',
            education: data.user.education || ''
          },
          privacy: {
            ...prev.privacy,
            profileVisibility: data.user.profileVisibility || 'public',
            showFarmSize: data.user.showFarmSize ?? true,
            showPhone: data.user.showPhone ?? true,
            messagePermission: data.user.messagePermission || 'everyone'
          }
        }));
        
        console.log('Fetched profile data:', data); // Debug log
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const [section, field] = name.split('.');

      if (section === 'location') {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            [field as keyof typeof prev.location]: checkbox.checked
          }
        }));
      } else if (section === 'farmInfo') {
        setFormData(prev => ({
          ...prev,
          farmInfo: {
            ...prev.farmInfo,
            [field as keyof typeof prev.farmInfo]: checkbox.checked
          }
        }));
      } else if (section === 'professional') {
        setFormData(prev => ({
          ...prev,
          professional: {
            ...prev.professional,
            [field as keyof typeof prev.professional]: checkbox.checked
          }
        }));
      } else if (section === 'privacy') {
        setFormData(prev => ({
          ...prev,
          privacy: {
            ...prev.privacy,
            [field as keyof typeof prev.privacy]: checkbox.checked
          }
        }));
      }
    } else {
      // Handle nested object updates
      if (name.includes('.')) {
        const [section, field] = name.split('.');
        
        if (section === 'location') {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              [field as keyof typeof prev.location]: value
            }
          }));
        } else if (section === 'farmInfo') {
          setFormData(prev => ({
            ...prev,
            farmInfo: {
              ...prev.farmInfo,
              [field as keyof typeof prev.farmInfo]: value
            }
          }));
        } else if (section === 'professional') {
          setFormData(prev => ({
            ...prev,
            professional: {
              ...prev.professional,
              [field as keyof typeof prev.professional]: value
            }
          }));
        } else if (section === 'privacy') {
          setFormData(prev => ({
            ...prev,
            privacy: {
              ...prev.privacy,
              [field as keyof typeof prev.privacy]: value
            }
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, field: keyof UserProfile['farmInfo']) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map(option => option.value);
    
    setFormData(prev => ({
      ...prev,
      farmInfo: {
        ...prev.farmInfo,
        [field]: values
      }
    }));
  };

  const handleProfessionalMultiSelect = (value: 'jobs' | 'buyers' | 'partnerships' | 'internships') => {
    setFormData(prev => {
      const currentLookingFor = [...prev.professional.lookingFor];
      if (currentLookingFor.includes(value)) {
        return {
          ...prev,
          professional: {
            ...prev.professional,
            lookingFor: currentLookingFor.filter(item => item !== value)
          }
        };
      } else {
        return {
          ...prev,
          professional: {
            ...prev.professional,
            lookingFor: [...currentLookingFor, value]
          }
        };
      }
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.professional.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        professional: {
          ...prev.professional,
          skills: [...prev.professional.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        skills: prev.professional.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCertificateFiles(e.target.files);
    }
  };

  const handleAddCertificate = () => {
    if (newCertificate.trim() && !formData.farmInfo.certifications?.includes(newCertificate.trim())) {
      setFormData(prev => ({
        ...prev,
        farmInfo: {
          ...prev.farmInfo,
          certifications: [...(prev.farmInfo.certifications || []), newCertificate.trim()]
        }
      }));
      setNewCertificate('');
    }
  };

  const handleRemoveCertificate = (certToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      farmInfo: {
        ...prev.farmInfo,
        certifications: (prev.farmInfo.certifications || []).filter(cert => cert !== certToRemove)
      }
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataObj = new FormData();
    formDataObj.append('file', file);
    formDataObj.append('upload_preset', 'mkulima_net');

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formDataObj
      });

      const data = await response.json();
      
      if (data.secure_url) {
        setFormData(prev => ({
          ...prev,
          [`${type}Image`]: data.secure_url
        }));
      }
    } catch (err) {
      setError('Failed to upload image');
      console.error('Image upload error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare the payload
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        profileImage: formData.profileImage,
        coverImage: formData.coverImage,
        location: {
          county: formData.location.county,
          subCounty: formData.location.subCounty
        },
        bio: formData.bio,
        farmInfo: {
          farmName: formData.farmInfo.farmName,
          farmSize: formData.farmInfo.farmSize,
          farmingType: formData.farmInfo.farmingType,
          crops: formData.farmInfo.crops,
          livestock: formData.farmInfo.livestock,
          experienceYears: formData.farmInfo.experienceYears,
          certifications: formData.farmInfo.certifications || []
        },
        professional: {
          skills: formData.professional.skills,
          lookingFor: formData.professional.lookingFor,
          availability: formData.professional.availability,
          education: formData.professional.education
        },
        privacy: {
          profileVisibility: formData.privacy.profileVisibility,
          showFarmSize: formData.privacy.showFarmSize,
          showPhone: formData.privacy.showPhone,
          messagePermission: formData.privacy.messagePermission
        }
      };

      console.log('Sending profile update payload:', payload); // Debug log

      // First, handle certificate uploads if any
      const uploadedCertificateUrls: string[] = [];
      
      if (certificateFiles && certificateFiles.length > 0) {
        for (let i = 0; i < certificateFiles.length; i++) {
          const file = certificateFiles[i];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'mkulima_net');
          
          try {
            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
              method: 'POST',
              body: formData
            });
            
            const uploadData = await uploadResponse.json();
            if (uploadData.secure_url) {
              uploadedCertificateUrls.push(uploadData.secure_url);
            }
          } catch (uploadErr) {
            console.error('Certificate upload error:', uploadErr);
          }
        }
      }
      
      // Combine existing certifications with newly uploaded ones
      const allCertifications = [...(payload.farmInfo.certifications || []), ...uploadedCertificateUrls];
      payload.farmInfo.certifications = allCertifications;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorData;
        try {
          // Try to parse as JSON first
          errorData = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, try to get text response
          try {
            const errorText = await response.text();
            console.error('API Error (Text Response):', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText || 'Unknown error'}`);
          } catch (textError) {
            // If both JSON and text fail, throw a generic error
            console.error('API Error (Unable to parse response):', response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText || 'Unable to parse error response'}`);
          }
        }
        
        console.error('API Error (JSON Response):', errorData);
        // Handle case where errorData is an empty object
        if (errorData && Object.keys(errorData).length === 0) {
          throw new Error(`HTTP error! status: ${response.status}. Server returned an empty error response.`);
        }
        throw new Error(errorData.message || errorData.msg || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();
      setSuccess('Profile updated successfully!');
      
      // Update the global user context if available
      // For now, just navigate after showing success message
      setTimeout(() => {
        router.push('/dashboard/profile');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                // Check current pathname to determine where to go back to
                const currentPath = window.location.pathname;
                if (currentPath.includes('/dashboard')) {
                  router.push('/dashboard/profile');
                } else {
                  router.push('/profile');
                }
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
            <div className="w-12"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Profile Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-green-600" />
            Profile Photo & Cover
          </h2>
          
          <div className="space-y-6">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
              <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                {formData.coverImage ? (
                  <img 
                    src={formData.coverImage} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-500">No cover photo</span>
                  </div>
                )}
                <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md cursor-pointer">
                  <Camera className="h-5 w-5 text-gray-600" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    aria-label="Upload cover photo"
                  />
                </label>
              </div>
            </div>

            {/* Profile Image */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                  {formData.profileImage ? (
                    <img 
                      src={formData.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-500 text-sm">PP</span>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer">
                  <Camera className="h-4 w-4 text-gray-600" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'profile')}
                    aria-label="Upload profile photo"
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    placeholder="Enter your first name"
                    aria-label="First name"
                  />
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    placeholder="Enter your last name"
                    aria-label="Last name"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-green-600" />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="your@email.com"
                aria-label="Email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="+254..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-label="Phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
              <input
                type="text"
                name="location.county"
                value={formData.location.county}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="Enter your county"
                aria-label="County"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-County</label>
              <input
                type="text"
                name="location.subCounty"
                value={formData.location.subCounty || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your sub-county"
                aria-label="Sub-county"
              />
            </div>
          </div>
        </div>

        {/* Farm Information Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wrench className="h-5 w-5 mr-2 text-green-600" />
            Farm Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
              <input
                type="text"
                name="farmInfo.farmName"
                value={formData.farmInfo.farmName || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your farm name"
                aria-label="Farm name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size</label>
                <input
                  type="text"
                  name="farmInfo.farmSize"
                  value={formData.farmInfo.farmSize || ''}
                  onChange={handleChange}
                  placeholder="e.g., 5 acres"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farming Type</label>
                <select
                  name="farmInfo.farmingType"
                  value={formData.farmInfo.farmingType || 'crops'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  aria-label="Select farming type"
                >
                  {farmingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Crops</label>
              <select
                multiple
                value={formData.farmInfo.crops}
                onChange={(e) => handleMultiSelectChange(e, 'crops')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-32"
                aria-label="Select main crops"
              >
                {cropOptions.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Livestock Type</label>
              <select
                multiple
                value={formData.farmInfo.livestock}
                onChange={(e) => handleMultiSelectChange(e, 'livestock')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-32"
                aria-label="Select livestock types"
              >
                {livestockOptions.map(livestock => (
                  <option key={livestock} value={livestock}>{livestock}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                name="farmInfo.experienceYears"
                value={formData.farmInfo.experienceYears || 0}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Years of experience"
                aria-label="Years of experience"
              />
            </div>
            
            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.farmInfo.certifications || []).map(cert => (
                  <span 
                    key={cert} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {cert.includes('http') ? 'Certificate' : cert}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(cert)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  value={newCertificate}
                  onChange={(e) => setNewCertificate(e.target.value)}
                  placeholder="Add a certification URL..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertificate())}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or upload certificate files</label>
                <label className="block w-full px-4 py-2 bg-gray-100 border border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-200">
                  <span className="text-gray-600">Click to upload certificate files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleCertificateFileChange}
                    aria-label="Upload certificate files"
                  />
                </label>
                {certificateFiles && certificateFiles.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">{certificateFiles.length} file(s) selected</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-green-600" />
            Professional Information
          </h2>
          
          <div className="space-y-4">
            {/* Looking For */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Looking For</label>
              <div className="flex flex-wrap gap-2">
                {lookingForOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleProfessionalMultiSelect(option.value as 'jobs' | 'buyers' | 'partnerships' | 'internships')}
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      formData.professional.lookingFor.includes(option.value as 'jobs' | 'buyers' | 'partnerships' | 'internships')
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.professional.skills.map(skill => (
                  <span 
                    key={skill} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
                <select
                  name="professional.availability"
                  value={formData.professional.availability}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  aria-label="Select availability status"
                >
                  <option value="open">Open to opportunities</option>
                  <option value="not_looking">Not looking</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input
                  type="text"
                  name="professional.education"
                  value={formData.professional.education || ''}
                  onChange={handleChange}
                  placeholder="e.g., Diploma in Agriculture"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-green-600" />
            About You
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              rows={4}
              maxLength={300}
              placeholder="Tell us about yourself and your farming journey..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.bio ? formData.bio.length : 0}/300
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Privacy Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy.profileVisibility"
                    value="public"
                    checked={formData.privacy.profileVisibility === 'public'}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Public - Everyone can see</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy.profileVisibility"
                    value="followers_only"
                    checked={formData.privacy.profileVisibility === 'followers_only'}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Followers Only - Only your followers can see</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="privacy.showFarmSize"
                  checked={formData.privacy.showFarmSize}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                  id="showFarmSize"
                />
                <label htmlFor="showFarmSize" className="ml-2 text-sm text-gray-700">Show farm size</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="privacy.showPhone"
                  checked={formData.privacy.showPhone}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                  id="showPhone"
                />
                <label htmlFor="showPhone" className="ml-2 text-sm text-gray-700">Show phone number</label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allow Direct Messages From</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy.messagePermission"
                    value="everyone"
                    checked={formData.privacy.messagePermission === 'everyone'}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Everyone</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy.messagePermission"
                    value="followers_only"
                    checked={formData.privacy.messagePermission === 'followers_only'}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Followers Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}