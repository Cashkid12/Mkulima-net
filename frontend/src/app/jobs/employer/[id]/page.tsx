'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin,
  User,
  Briefcase,
  Building,
  Users,
  Mail,
  Phone,
  Globe,
  Calendar,
  Star,
  Heart,
  HeartOff,
  ExternalLink,
  AlertCircle,
  Loader2,
  DollarSign
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  profilePicture?: string;
  farmName?: string;
  location?: string;
  role: string;
  verified: boolean;
  followers: number;
  following: number;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: {
    county: string;
    town?: string;
  };
  jobType: string;
  category: string;
  salary?: {
    amount?: number;
    currency?: string;
    negotiable?: boolean;
  };
  requiredSkills: string[];
  experienceRequired: string;
  description: string;
  deadline: string;
  employerId: string;
  isActive: boolean;
  createdAt: string;
}

export default function EmployerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followed, setFollowed] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);

  // Load followed status from localStorage
  useEffect(() => {
    const followedUsers = localStorage.getItem('followedUsers');
    if (followedUsers) {
      const followedUserIds = JSON.parse(followedUsers);
      setFollowed(followedUserIds.includes(id));
    }
  }, [id]);

  // Fetch employer profile and jobs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.message || 'Failed to fetch employer profile');
        }
        
        const userData = await userResponse.json();
        setUser(userData);
        
        // Fetch jobs posted by this employer
        const jobsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/employer/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!jobsResponse.ok) {
          const errorData = await jobsResponse.json();
          throw new Error(errorData.message || 'Failed to fetch employer jobs');
        }
        
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load employer profile and jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFollow = () => {
    if (!user) return;
    
    const followedUsers = JSON.parse(localStorage.getItem('followedUsers') || '[]');
    let updatedFollowed;
    
    if (followed) {
      updatedFollowed = followedUsers.filter((userId: string) => userId !== user.id);
      setFollowingCount(prev => prev - 1);
    } else {
      updatedFollowed = [...followedUsers, user.id];
      setFollowingCount(prev => prev + 1);
    }
    
    localStorage.setItem('followedUsers', JSON.stringify(updatedFollowed));
    setFollowed(!followed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Employer Not Found</h3>
          <p className="text-gray-600 mb-6">The employer profile you're looking for doesn't exist.</p>
          <Link
            href="/jobs"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-green-800">
                MkulimaNet
              </Link>
              <span className="mx-2 text-gray-300">|</span>
              <Link href="/jobs" className="text-gray-600 hover:text-gray-900 font-medium">
                Jobs
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-600 truncate max-w-xs md:max-w-md">
                {user.farmName || user.username}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Employer Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Building className="h-10 w-10 text-green-600" />
                </div>
                
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900 mr-2">
                      {user.farmName || user.username}
                    </h1>
                    {user.verified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{user.location || 'Kenya'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Member since {new Date(user.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:items-end space-y-3">
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    followed
                      ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {followed ? 'Following' : 'Follow'}
                </button>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{user.followers} followers</span>
                </div>
              </div>
            </div>
            
            {user.bio && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-2" />
                <span>{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posted Jobs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Open Positions ({jobs.length})
          </h2>
          
          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Job Postings</h3>
              <p className="text-gray-600">
                This employer doesn't have any active job postings at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <div 
                  key={job.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">{job.title}</h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <Building className="h-4 w-4 mr-1" />
                            <span className="font-medium">{job.companyName}</span>
                          </div>
                        </div>
                        
                        <button
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title="Save job"
                          aria-label="Save job"
                        >
                          <HeartOff className="h-5 w-5 text-gray-400" />
                        </button>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>
                          {job.location.county}
                          {job.location.town && `, ${job.location.town}`}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{job.jobType.toLowerCase()}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{job.category.toLowerCase()}</span>
                      </div>
                      
                      {job.salary?.amount && (
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>
                            {job.salary.currency} {job.salary.amount.toLocaleString()}
                            {job.salary.negotiable && ' (Negotiable)'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex space-x-3">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/jobs/${job.id}/apply`}
                            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
                          >
                            Apply Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}