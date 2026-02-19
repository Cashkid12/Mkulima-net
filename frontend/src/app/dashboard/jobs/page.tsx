'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, MapPin, Clock, Briefcase, Building } from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState({ suggested: true, all: true });
  const [error, setError] = useState({ suggested: '', all: '' });
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' or 'all'

  // Fetch job suggestions based on user profile
  useEffect(() => {
    const fetchSuggestedJobs = async () => {
      try {
        setLoading(prev => ({ ...prev, suggested: true }));
        const token = localStorage.getItem('token');
        if (!token) {
          setError(prev => ({ ...prev, suggested: 'Authentication required' }));
          return;
        }

        // Get user ID from local storage or session
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setError(prev => ({ ...prev, suggested: 'User information not found' }));
          return;
        }
        
        const user = JSON.parse(userStr);
        const userId = user.id || user._id;

        const response = await fetch(`http://localhost:5001/api/jobs/suggestions/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch job suggestions');
        }

        const data = await response.json();
        setSuggestedJobs(data.jobs || []);
      } catch (err) {
        setError(prev => ({ ...prev, suggested: err.message || 'Failed to load job suggestions' }));
        console.error('Error fetching job suggestions:', err);
      } finally {
        setLoading(prev => ({ ...prev, suggested: false }));
      }
    };

    fetchSuggestedJobs();
  }, []);

  // Fetch all jobs
  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        setLoading(prev => ({ ...prev, all: true }));
        const response = await fetch(`http://localhost:5001/api/jobs?search=${encodeURIComponent(searchTerm)}&jobType=${activeFilter === 'All' ? '' : activeFilter}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch jobs');
        }

        const data = await response.json();
        setAllJobs(data.jobs || []);
      } catch (err) {
        setError(prev => ({ ...prev, all: err.message || 'Failed to load jobs' }));
        console.error('Error fetching all jobs:', err);
      } finally {
        setLoading(prev => ({ ...prev, all: false }));
      }
    };

    if (activeTab === 'all') {
      fetchAllJobs();
    }
  }, [searchTerm, activeFilter, activeTab]);

  const filters = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote', 'On-site'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            <button 
              onClick={() => router.push('/dashboard/jobs/post')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Post Job
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`pb-3 px-4 font-medium text-sm ${
              activeTab === 'recommended'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('recommended')}
          >
            Recommended for You
          </button>
          <button
            className={`pb-3 px-4 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Jobs
          </button>
        </div>

        {/* Filter Chips - Only show for All Jobs tab */}
        {activeTab === 'all' && (
          <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'recommended' && (
          <div>
            {loading.suggested ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                <p className="mt-4 text-gray-600">Finding jobs tailored to your skills...</p>
              </div>
            ) : error.suggested ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700">{error.suggested}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {suggestedJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No job suggestions yet</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Update your profile with skills, certifications, and experience to get personalized job recommendations.
                    </p>
                    <button 
                      onClick={() => router.push('/dashboard/profile/edit')}
                      className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Update Profile
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                      <p className="text-gray-600">Jobs matched to your skills and experience</p>
                    </div>
                    
                    {suggestedJobs.map((job) => (
                      <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                                {job.matchScore > 0 && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    {job.matchScore}% match
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center mt-1">
                                <Building className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-gray-700 font-medium">{job.companyName}</span>
                              </div>
                              <div className="flex items-center mt-1">
                                <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-gray-600">{job.location}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <div className="flex space-x-2">
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-500 text-sm">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-sm font-semibold text-gray-900">Requirements:</h3>
                              {job.matchedSkills && job.matchedSkills.length > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  {job.matchedSkills.length} matching skill{job.matchedSkills.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.matchedSkills && job.matchedSkills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  ✓ {skill}
                                </span>
                              ))}
                            </div>
                            <ul className="space-y-1">
                              {job.requirements.slice(0, 3).map((requirement, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-500 mr-2">•</span>
                                  <span className="text-gray-700">{requirement}</span>
                                </li>
                              ))}
                              {job.requirements.length > 3 && (
                                <li className="text-sm text-gray-500">+{job.requirements.length - 3} more requirements</li>
                              )}
                            </ul>
                          </div>

                          <div className="mt-6 flex space-x-3">
                            <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                              Apply Now
                            </button>
                            <button 
                              onClick={() => router.push(`/jobs/${job._id}`)}
                              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            {loading.all ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                <p className="mt-4 text-gray-600">Loading all jobs...</p>
              </div>
            ) : error.all ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700">{error.all}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">All Available Jobs</h2>
                  <p className="text-gray-600">Browse all available positions</p>
                </div>
                
                {allJobs.map((job) => (
                  <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                          <div className="flex items-center mt-1">
                            <Building className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-700 font-medium">{job.companyName}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-600">{job.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex space-x-2">
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Requirements:</h3>
                        <ul className="space-y-1">
                          {job.requirements.slice(0, 3).map((requirement, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="text-gray-700">{requirement}</span>
                            </li>
                          ))}
                          {job.requirements.length > 3 && (
                            <li className="text-sm text-gray-500">+{job.requirements.length - 3} more requirements</li>
                          )}
                        </ul>
                      </div>

                      <div className="mt-6 flex space-x-3">
                        <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                          Apply Now
                        </button>
                        <button 
                          onClick={() => router.push(`/jobs/${job._id}`)}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}