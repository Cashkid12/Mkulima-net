'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin,
  Clock,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Heart,
  HeartOff,
  Building,
  Users,
  ExternalLink,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle
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

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);

  // Load saved jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, []);

  // Check if user has applied to this job
  useEffect(() => {
    const appliedJobs = localStorage.getItem('appliedJobs');
    if (appliedJobs) {
      const appliedJobIds = JSON.parse(appliedJobs);
      setApplied(appliedJobIds.includes(id));
    }
  }, [id]);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch job details');
        }
        
        const data = await response.json();
        setJob(data);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err instanceof Error ? err.message : 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const toggleSavedJob = () => {
    if (!job) return;
    
    const updatedSavedJobs = savedJobs.includes(job.id)
      ? savedJobs.filter(id => id !== job.id)
      : [...savedJobs, job.id];
    
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
  };

  const handleApply = async () => {
    if (!job) return;
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Check if user has completed profile
    try {
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!profileResponse.ok) {
        router.push('/login');
        return;
      }
      
      const profileData = await profileResponse.json();
      if (!profileData.firstName || !profileData.lastName) {
        alert('Please complete your profile before applying to jobs');
        router.push('/dashboard/profile');
        return;
      }
    } catch (err) {
      router.push('/login');
      return;
    }
    
    setApplicationLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply to job');
      }
      
      // Mark as applied
      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      localStorage.setItem('appliedJobs', JSON.stringify([...appliedJobs, job.id]));
      setApplied(true);
      
      alert('Successfully applied to the job!');
    } catch (err) {
      console.error('Error applying to job:', err);
      alert(err instanceof Error ? err.message : 'Failed to apply to job. Please try again.');
    } finally {
      setApplicationLoading(false);
    }
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Job</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
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
                {job.title}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSavedJob}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Job Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <Building className="h-5 w-5 mr-2" />
                  <span className="font-medium text-lg">{job.companyName}</span>
                  {job.employerId.verified && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Verified
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {job.location.county}
                      {job.location.town && `, ${job.location.town}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    <span>{job.jobType}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span className="capitalize">{job.category.toLowerCase()}</span>
                  </div>
                  
                  {job.salary?.amount && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>
                        {job.salary.currency} {job.salary.amount.toLocaleString()}
                        {job.salary.negotiable && ' (Negotiable)'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Posted {new Date(job.createdAt).toLocaleDateString()} • 
                  Application Deadline: {new Date(job.deadline).toLocaleDateString()}
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-end space-y-3">
                {applied ? (
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Applied
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applicationLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {applicationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Applying...
                      </>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                )}
                
                <Link
                  href={`/jobs/employer/${job.employerId.id}`}
                  className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  View Employer Profile
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Job Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Job Description */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                  <div className="prose prose-green max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                  </div>
                </section>
                
                {/* Required Skills */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
                
                {/* Experience Required */}
                {job.experienceRequired && (
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience Required</h2>
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium">{job.experienceRequired}</span>
                    </div>
                  </section>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  {/* Employer Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Employer Information</h3>
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Building className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{job.employerId.farmName || job.employerId.username}</div>
                        <div className="text-sm text-gray-500">{job.employerId.location || 'Kenya'}</div>
                      </div>
                    </div>
                    
                    <Link
                      href={`/jobs/employer/${job.employerId.id}`}
                      className="w-full text-center px-4 py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                  
                  {/* Application Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Application Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Job Type:</span>
                        <span className="font-medium">{job.jobType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium capitalize">{job.category.toLowerCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{job.experienceRequired || 'Any'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium">{new Date(job.deadline).toLocaleDateString()}</span>
                      </div>
                      {job.salary?.amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Salary:</span>
                          <span className="font-medium">
                            {job.salary.currency} {job.salary.amount.toLocaleString()}
                            {job.salary.negotiable && '*'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {!applied ? (
                      <button
                        onClick={handleApply}
                        disabled={applicationLoading}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applicationLoading ? 'Processing...' : 'Apply Now'}
                      </button>
                    ) : (
                      <div className="w-full px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium text-center flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Applied Successfully
                      </div>
                    )}
                    
                    <button
                      onClick={toggleSavedJob}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                        savedJobs.includes(job.id)
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {savedJobs.includes(job.id) ? (
                        <span className="flex items-center justify-center">
                          <Heart className="h-5 w-5 mr-2 fill-current" /> Unsave Job
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <HeartOff className="h-5 w-5 mr-2" /> Save Job
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}