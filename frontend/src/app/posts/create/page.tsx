'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Hash, Tag, Users, Package, Store, Globe, Lock, Eye, X, Image as ImageIcon } from 'lucide-react';

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [productsTagged, setProductsTagged] = useState<string[]>([]);
  const [servicesTagged, setServicesTagged] = useState<string[]>([]);
  const [communitiesTagged, setCommunitiesTagged] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'community'>('public');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = images.length + newFiles.length;

      if (totalImages > MAX_IMAGES) {
        alert(`You can only upload up to ${MAX_IMAGES} images`);
        return;
      }

      const newImageFiles = newFiles.filter(file => file.type.startsWith('image/'));
      if (newImageFiles.length !== newFiles.length) {
        alert('Some files were not images and were skipped');
      }

      const newPreviews = newImageFiles.map(file => URL.createObjectURL(file));

      setImages(prev => [...prev, ...newImageFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    // Revoke object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      setHashtags(prev => [...prev, newHashtag.trim()]);
      setNewHashtag('');
    }
  };

  const removeHashtag = (index: number) => {
    const newHashtags = [...hashtags];
    newHashtags.splice(index, 1);
    setHashtags(newHashtags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && images.length === 0) {
      setError('Please add content or at least one image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, upload images if any
      let mediaUrls: string[] = [];
      
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('media', image);
        });

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/posts/upload-media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to upload images');
        }

        const data = await response.json();
        mediaUrls = data.mediaPaths;
      }

      // Create the post
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        },
        body: JSON.stringify({
          content,
          media: mediaUrls,
          productsTagged,
          servicesTagged,
          communitiesTagged,
          location,
          visibility,
          tags: hashtags
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.msg || 'Failed to create post');
      }

      // Clear form and redirect
      setContent('');
      setImages([]);
      setImagePreviews([]);
      setProductsTagged([]);
      setServicesTagged([]);
      setCommunitiesTagged([]);
      setLocation('');
      setHashtags([]);
      router.push('/dashboard/feed');
    } catch (err) {
      setError(err.message || 'An error occurred while creating the post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <h1 className="text-xl font-bold text-gray-900">Create Post</h1>
            <button
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && images.length === 0)}
              className={`px-4 py-2 rounded-lg font-medium ${
                loading || (!content.trim() && images.length === 0)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Text Input */}
            <div className="mb-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening on your farm?"
                className="w-full min-h-[120px] p-4 text-lg border border-transparent focus:border-transparent focus:outline-none resize-none"
                maxLength={1000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {content.length}/1000
              </div>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Images Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={triggerFileInput}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Camera className="h-5 w-5" />
                <span>Add Photos</span>
              </button>
              <input
                id="image-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
                aria-label="Upload images for post"
              />
              <p className="text-sm text-gray-500 mt-1">
                {images.length}/{MAX_IMAGES} images selected
              </p>
            </div>

            {/* Hashtags */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-5 w-5 text-gray-500" />
                <label className="font-medium text-gray-700">Hashtags</label>
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                  placeholder="Add hashtag (press Enter)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  onClick={addHashtag}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                >
                  Add
                </button>
              </div>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => removeHashtag(index)}
                        className="ml-1 text-green-600 hover:text-green-800"
                        aria-label={`Remove hashtag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <label className="font-medium text-gray-700">Location</label>
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location (e.g., Nakuru County, Kenya)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Visibility */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-gray-500" />
                <label className="font-medium text-gray-700">Who can see this?</label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${
                    visibility === 'public'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('followers')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${
                    visibility === 'followers'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Followers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('community')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${
                    visibility === 'community'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Tag className="h-4 w-4" />
                  <span>Community</span>
                </button>
              </div>
            </div>

            {/* Tag Products/Services/Communities */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-gray-500" />
                  <label className="font-medium text-gray-700">Tag Products</label>
                </div>
                <input
                  type="text"
                  placeholder="Search and select products"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {productsTagged.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {productsTagged.map((product, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {product}
                        <button className="ml-1 text-blue-600 hover:text-blue-800" aria-label={`Remove product ${product}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Store className="h-5 w-5 text-gray-500" />
                  <label className="font-medium text-gray-700">Tag Services</label>
                </div>
                <input
                  type="text"
                  placeholder="Search and select services"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {servicesTagged.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {servicesTagged.map((service, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {service}
                        <button className="ml-1 text-purple-600 hover:text-purple-800" aria-label={`Remove service ${service}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <label className="font-medium text-gray-700">Tag Communities</label>
                </div>
                <input
                  type="text"
                  placeholder="Search and select communities"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {communitiesTagged.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {communitiesTagged.map((community, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                      >
                        {community}
                        <button className="ml-1 text-yellow-600 hover:text-yellow-800" aria-label={`Remove community ${community}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}