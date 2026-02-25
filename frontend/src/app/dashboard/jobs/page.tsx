'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Building,
  MapPin,
  DollarSign,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface JobApplication {
  id: string;
  jobId: {
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
    deadline: string;
  };
  message: string;
  cvUrl?: string;
  status: string;
  appliedAt: string;
}

interface PostedJob {
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
  applications: string[];
  isActive: boolean;
  createdAt: string;
}

export default function JobsDashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applied' | 'posted'>('applied');

  // Fetch user's job applications and posted jobs
  useEffect(() => {
    const fetchJobsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Fetch applications made by user
        const applicationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData);
        }

        // Fetch jobs posted by user
        const postedJobsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/employer/${JSON.parse(atob(token.split('.')[1])).userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (postedJobsResponse.ok) {
          const postedJobsData = await postedJobsResponse.json();
          setPostedJobs(postedJobsData);
        }
      } catch (err) {
        console.error('Error fetching jobs data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load jobs data');
      } finally {
        setLoading(false);
      }
    };

    fetchJobsData();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'reviewed':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'pending':
      default:
        return <Send className="h-4 w-4 text-yellow-600" />;
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Try Again
          </button>
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
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-600">Jobs</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/jobs"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Job Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track your job applications and posted opportunities
            </p>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('applied')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'applied'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Jobs Applied ({applications.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('posted')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'posted'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Building className="h-4 w-4 mr-2" />
                  Jobs Posted ({postedJobs.length})
                </div>
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'applied' ? (
              // Applied Jobs Tab
              applications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't applied to any jobs yet. Start applying to opportunities that match your skills.
                  </p>
                  <Link
                    href="/jobs"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map(application => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {application.jobId.title}
                              </h3>
                              <div className="flex items-center text-gray-600 mt-1">
                                <Building className="h-4 w-4 mr-1" />
                                <span className="font-medium">{application.jobId.companyName}</span>
                              </div>
                            </div>
                            
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status}</span>
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                {application.jobId.location.county}
                                {application.jobId.location.town && `, ${application.jobId.location.town}`}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              <span className="capitalize">{application.jobId.jobType.toLowerCase()}</span>
                            </div>
                            
                            {application.jobId.salary?.amount && (
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>
                                  {application.jobId.salary.currency} {application.jobId.salary.amount.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {application.message && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Cover Letter:</span> {application.message}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col space-y-2">
                          <Link
                            href={`/jobs/${application.jobId.id}`}
                            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center"
                          >
                            View Job
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Posted Jobs Tab
              postedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Posted Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't posted any job opportunities yet. Start by posting a job to attract talent.
                  </p>
                  <Link
                    href="/jobs/post"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Post a Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {postedJobs.map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {job.title}
                              </h3>
                              <div className="flex items-center text-gray-600 mt-1">
                                <Building className="h-4 w-4 mr-1" />
                                <span className="font-medium">{job.companyName}</span>
                              </div>
                            </div>
                            
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Briefcase className="h-4 w-4 mr-1" />
                              <span>{job.applications.length} Applications</span>
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                {job.location.county}
                                {job.location.town && `, ${job.location.town}`}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              <span className="capitalize">{job.jobType.toLowerCase()}</span>
                            </div>
                            
                            {job.salary?.amount && (
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>
                                  {job.salary.currency} {job.salary.amount.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <Clock className="h-4 w-4 mr-1" />
                            Posted {new Date(job.createdAt).toLocaleDateString()} • 
                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
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
                        </div>
                        
                        <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col space-y-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center"
                          >
                            View Job
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Link>
                          
                          <Link
                            href={`/jobs/${job.id}/applications`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                          >
                            View Applications
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}