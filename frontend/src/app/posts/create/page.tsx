'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Image, Video, X, Loader2 } from 'lucide-react';

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

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'article'>('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newMedia = [...media, ...files];
      setMedia(newMedia);
      
      // Create preview URLs for images/videos
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = [...media];
    newMedia.splice(index, 1);
    setMedia(newMedia);
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    const newPreviews = [...previewUrls];
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate content
      if (!content.trim() && media.length === 0) {
        throw new Error('Please add content or media to your post');
      }

      // Determine post type based on media
      let finalPostType = postType;
      if (media.length > 0) {
        if (media.some(file => file.type.startsWith('video/'))) {
          finalPostType = 'video';
        } else if (media.some(file => file.type.startsWith('image/'))) {
          finalPostType = 'image';
        }
      }

      // Create form data for upload
      const formData = new FormData();
      formData.append('content', content);
      formData.append('postType', finalPostType);
      
      // Add media files if present
      media.forEach(file => {
        formData.append('media', file);
      });

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Upload media to Cloudinary if there are media files
      const mediaUrls: string[] = [];
      if (media.length > 0) {
        for (const file of media) {
          const mediaFormData = new FormData();
          mediaFormData.append('file', file);
          mediaFormData.append('upload_preset', 'mkulima_net');

          const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${file.type.startsWith('image/') ? 'image' : 'video'}/upload`,
            {
              method: 'POST',
              body: mediaFormData
            }
          );

          const cloudinaryData = await cloudinaryResponse.json();
          if (!cloudinaryData.secure_url) {
            throw new Error('Failed to upload media to Cloudinary');
          }
          
          mediaUrls.push(cloudinaryData.secure_url);
        }
      }

      // Create the post with the backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          postType: finalPostType,
          media: mediaUrls
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const createdPost: Post = await response.json();
      setSuccess('Post created successfully!');
      
      // Clear form
      setContent('');
      setMedia([]);
      setPreviewUrls([]);
      
      // Wait a bit to show success message, then redirect
      setTimeout(() => {
        router.push('/dashboard/feed');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      console.error('Post creation error:', err);
    } finally {
      setLoading(false);
    }
  };

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
              ← Cancel
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Create Post</h1>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Post'}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Content Editor */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your farming experience, ask a question, or post about your farm..."
            className="w-full min-h-[120px] border-none focus:ring-0 resize-none text-gray-900 placeholder-gray-500"
            maxLength={280}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {content.length}/280
          </div>
        </div>

        {/* Media Previews */}
        {previewUrls.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="grid grid-cols-2 gap-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    {media[index].type.startsWith('image/') ? (
                      <img 
                        src={url} 
                        alt={`Preview ${index}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video 
                        src={url} 
                        className="w-full h-full object-cover"
                        controls={false}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    aria-label="Remove media"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Options */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center text-gray-600 hover:text-green-600"
              >
                <Image className="h-5 w-5 mr-2" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  // For video, we'd need to add a separate handler
                }}
                className="flex items-center text-gray-600 hover:text-green-600"
              >
                <Video className="h-5 w-5 mr-2" />
                <span>Video</span>
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              {postType === 'text' ? 'Text post' : 
               postType === 'image' ? 'Image post' : 
               postType === 'video' ? 'Video post' : 'Article'}
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMediaChange}
            multiple
            accept="image/*,video/*"
            className="hidden"
            aria-label="Upload media"
          />
        </div>
      </form>
    </div>
  );
}