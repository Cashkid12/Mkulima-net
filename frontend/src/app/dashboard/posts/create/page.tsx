'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Image, MapPin, Tag, Send } from 'lucide-react';

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle post creation
    console.log('Creating post:', { content, image, location, tags });
    router.push('/dashboard');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Create Post</h1>
          <button 
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send post"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening on your farm today?"
              className="w-full min-h-[120px] p-0 text-gray-900 placeholder-gray-500 border-0 focus:ring-0 resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">{content.length}/500</span>
            </div>
          </div>

          {/* Image Preview */}
          {image && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="relative">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Media Attachment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 text-gray-600 hover:text-green-600 cursor-pointer">
                <Image className="h-5 w-5" />
                <span className="text-sm font-medium">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
              >
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">Add Location</span>
              </button>
              
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
              >
                <Tag className="h-5 w-5" />
                <span className="text-sm font-medium">Add Tags</span>
              </button>
            </div>
          </div>

          {/* Location Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Tags Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags (e.g., #farming #harvest)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </form>
      </main>
    </div>
  );
}