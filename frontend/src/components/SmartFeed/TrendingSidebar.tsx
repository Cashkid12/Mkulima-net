'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Hash, Users, Award, Eye } from 'lucide-react';

interface TrendingTopic {
  id: string;
  name: string;
  postCount: number;
  category: 'hashtag' | 'user' | 'topic';
}

interface PopularPost {
  id: string;
  title: string;
  author: string;
  views: number;
  reactions: number;
}

export default function TrendingSidebar() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setLoading(true);
        
        // Mock data for now - replace with actual API calls
        const mockTrendingTopics: TrendingTopic[] = [
          { id: '1', name: '#DairyFarming', postCount: 1247, category: 'hashtag' },
          { id: '2', name: '#MaizeHarvest', postCount: 892, category: 'hashtag' },
          { id: '3', name: 'JohnKamau', postCount: 156, category: 'user' },
          { id: '4', name: '#PoultryCare', postCount: 743, category: 'hashtag' },
          { id: '5', name: 'AgriTechKenya', postCount: 234, category: 'user' },
          { id: '6', name: 'SoilHealth', postCount: 567, category: 'topic' }
        ];

        const mockPopularPosts: PopularPost[] = [
          { id: '1', title: 'Best practices for tomato farming in Kenya', author: 'Sarah Mwangi', views: 15420, reactions: 342 },
          { id: '2', title: 'How to identify and treat common cattle diseases', author: 'Dr. Peter Kimani', views: 12890, reactions: 298 },
          { id: '3', title: 'Sustainable irrigation methods for small farms', author: 'GreenFarm Initiative', views: 9876, reactions: 187 }
        ];

        setTrendingTopics(mockTrendingTopics);
        setPopularPosts(mockPopularPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending data:', error);
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  const getTopicIcon = (category: string) => {
    switch (category) {
      case 'hashtag': return <Hash className="h-4 w-4 text-green-600" />;
      case 'user': return <Users className="h-4 w-4 text-blue-600" />;
      case 'topic': return <Award className="h-4 w-4 text-purple-600" />;
      default: return <Hash className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Trending Topics</h3>
        </div>
        
        <div className="space-y-3">
          {trendingTopics.map((topic) => (
            <Link 
              key={topic.id} 
              href={topic.category === 'hashtag' ? `/hashtags/${topic.name.slice(1)}` : `/profile/${topic.name}`}
              className="block group"
            >
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-2">
                  {getTopicIcon(topic.category)}
                  <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                    {topic.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {topic.postCount.toLocaleString()} posts
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <Award className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Popular Posts</h3>
        </div>
        
        <div className="space-y-4">
          {popularPosts.map((post, index) => (
            <div key={post.id} className="group cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{post.author}</p>
                  <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                      <span>{post.reactions} reactions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Farmers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Top Farmers</h3>
        </div>
        
        <div className="space-y-3">
          {[
            { id: '1', name: 'Grace Njeri', specialty: 'Dairy Farming', followers: '12.4K' },
            { id: '2', name: 'James Ochieng', specialty: 'Maize Production', followers: '8.7K' },
            { id: '3', name: 'Mary Wanjiku', specialty: 'Horticulture', followers: '6.2K' }
          ].map((farmer) => (
            <div key={farmer.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-medium">{farmer.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900">{farmer.name}</h4>
                <p className="text-sm text-gray-500">{farmer.specialty}</p>
                <p className="text-xs text-gray-400">{farmer.followers} followers</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}