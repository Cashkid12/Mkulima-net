'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search,
  MapPin,
  Clock,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Heart,
  HeartOff,
  Filter,
  SlidersHorizontal,
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  Building
} from 'lucide-react';

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
  employerId: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    farmName?: string;
    location?: string;
    verified: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

interface Filters {
  location: string;
  type: string;
  category: string;
  experience: string;
  minSalary: string;
  maxSalary: string;
  search: string;
}

const jobTypes = [
  { id: 'all', name: 'All Types' },
  { id: 'Full-time', name: 'Full-time' },
  { id: 'Part-time', name: 'Part-time' },
  { id: 'Internship', name: 'Internship' }
];

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'Crops', name: 'Crops' },
  { id: 'Livestock', name: 'Livestock' },
  { id: 'Agribusiness', name: 'Agribusiness' },
  { id: 'Equipment', name: 'Equipment' },
  { id: 'Research', name: 'Research' },
  { id: 'Consulting', name: 'Consulting' }
];

const experienceLevels = [
  { id: 'all', name: 'All Levels' },
  { id: 'Entry Level', name: 'Entry Level' },
  { id: 'Mid Level', name: 'Mid Level' },
  { id: 'Senior Level', name: 'Senior Level' },
  { id: 'Expert', name: 'Expert' }
];

const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Kajiado', 
  'Machakos', 'Murang\'a', 'Nyeri', 'Kirinyaga', 'Embu', 'Meru',
  'Uasin Gishu', 'Kericho', 'Bomet', 'Nandi', 'Kakamega', 'Vihiga',
  'Bungoma', 'Busia', 'Siaya', 'Kisii', 'Nyamira', 'Migori',
  'Homa Bay', 'Kitui', 'Makueni', 'Taita Taveta', 'Kilifi', 'Kwale'
];

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<Filters>({
    location: '',
    type: 'all',
    category: 'all',
    experience: 'all',
    minSalary: '',
    maxSalary: '',
    search: ''
  });

  // Load saved jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, []);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine which endpoint to use based on filters
      let url;
      const queryParams = new URLSearchParams();
      
      if (filters.search || filters.location || filters.type !== 'all' || 
          filters.category !== 'all' || filters.experience !== 'all' || 
          filters.minSalary || filters.maxSalary) {
        // Use search endpoint for complex filtering
        url = `${process.env.NEXT_PUBLIC_API_URL}/jobs/search`;
        
        if (filters.search) {
          queryParams.append('q', filters.search);
        }
        if (filters.location) {
          queryParams.append('location', filters.location);
        }
        if (filters.type && filters.type !== 'all') {
          queryParams.append('type', filters.type);
        }
        if (filters.category && filters.category !== 'all') {
          queryParams.append('category', filters.category);
        }
        if (filters.experience && filters.experience !== 'all') {
          queryParams.append('experience', filters.experience);
        }
        if (filters.minSalary) {
          queryParams.append('minSalary', filters.minSalary);
        }
        if (filters.maxSalary) {
          queryParams.append('maxSalary', filters.maxSalary);
        }
      } else {
        // Use regular jobs endpoint
        url = `${process.env.NEXT_PUBLIC_API_URL}/jobs`;
      }
      
      if (queryParams.toString()) {
        url += '?' + queryParams.toString();
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch jobs');
      }
      
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const toggleSavedJob = (jobId: string) => {
    const updatedSavedJobs = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      type: 'all',
      category: 'all',
      experience: 'all',
      minSalary: '',
      maxSalary: '',
      search: ''
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false;
    return value !== '' && value !== 'all';
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-green-800">
                MkulimaNet
              </Link>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-600">Jobs</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/jobs/post"
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Post Job
              </Link>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="py-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agricultural jobs..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (County)
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  title="Select county"
                  aria-label="Select county"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Counties</option>
                  {kenyanCounties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>
              
              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  title="Select job type"
                  aria-label="Select job type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {jobTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  title="Select category"
                  aria-label="Select category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                  title="Select experience level"
                  aria-label="Select experience level"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {experienceLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Jobs</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchJobs}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-600 mb-6">
              {activeFiltersCount > 0 
                ? 'Try adjusting your filters to see more jobs'
                : 'No job opportunities available at the moment'}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Clear Filters
              </button>
            )}
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
                          {job.employerId.verified && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleSavedJob(job.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                        aria-label={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                      >
                        {savedJobs.includes(job.id) ? (
                          <Heart className="h-5 w-5 text-red-500 fill-current" />
                        ) : (
                          <HeartOff className="h-5 w-5 text-gray-400" />
                        )}
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
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requiredSkills.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          +{job.requiredSkills.length - 3} more
                        </span>
                      )}
                    </div>
                    
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
      </main>
    </div>
  );
}