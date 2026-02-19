'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Upload, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    profileImage: null as File | null,
  });
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: 'Image must be less than 5MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, profileImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      if (errors.profileImage) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.profileImage;
          return newErrors;
        });
      }
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, profileImage: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // In a real app, this would upload the image and update the profile
      const profileData = {
        bio: formData.bio,
        location: {
          town: formData.location,
        },
        profilePicture: previewImage || undefined,
      };
      
      // Update user data in localStorage
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...existingUser, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
              <p className="text-gray-600 mt-1">Help others get to know you better</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-medium">1</span>
              </div>
              <span>of</span>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 font-medium">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Image Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Photo</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Add a profile photo to help others recognize you
                </p>
                
                <div className="flex items-center space-x-6">
                  {previewImage ? (
                    <div className="relative">
                      <img 
                        src={previewImage} 
                        alt="Profile preview" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-sm"
                        aria-label="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                    {errors.profileImage && (
                      <p className="text-xs text-red-600 mt-1">{errors.profileImage}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Bio</h2>
                  <span className={`text-sm ${formData.bio.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.bio.length}/500
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Tell us about yourself, your farming experience, or what you hope to achieve
                </p>
                
                <textarea
                  value={formData.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setFormData(prev => ({ ...prev, bio: e.target.value }));
                      if (errors.bio) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.bio;
                          return newErrors;
                        });
                      }
                    }
                  }}
                  className={`w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Share a bit about yourself..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                )}
              </div>

              {/* Location Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Location</h2>
                <p className="text-gray-600 text-sm mb-3">
                  Where are you based? This helps connect you with local farmers
                </p>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, location: e.target.value }));
                      if (errors.location) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.location;
                          return newErrors;
                        });
                      }
                    }}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Nairobi, Nakuru, Mombasa"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  fullWidth
                >
                  Save & Continue
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={handleSkip}
                  fullWidth
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Progress Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            You can always update your profile later in your account settings
          </p>
        </div>
      </div>
    </div>
  );
}