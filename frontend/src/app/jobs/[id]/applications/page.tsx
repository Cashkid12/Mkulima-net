'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

interface Application {
  id: string;
  applicantId: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    farmName?: string;
    location?: string;
    verified: boolean;
  };
  message: string;
  cvUrl?: string;
  status: string;
  appliedAt: string;
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

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job details and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Fetch job details
        const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!jobResponse.ok) {
          const errorData = await jobResponse.json();
          throw new Error(errorData.message || 'Failed to fetch job details');
        }

        const jobData = await jobResponse.json();
        setJob(jobData);

        // Fetch applications for this job
        const applicationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/applications/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!applicationsResponse.ok) {
          const errorData = await applicationsResponse.json();
          throw new Error(errorData.message || 'Failed to fetch applications');
        }

        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load job applications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      // In a real implementation, you would make an API call to update the application status
      // For now, we'll just update the local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus } 
            : app
        )
      );
    } catch (err) {
      console.error('Error updating application status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update application status');
    }
  };

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
            Browse Jobs
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
              <Link href={`/jobs/${job.id}`} className="text-gray-600 hover:text-gray-900 font-medium">
                {job.title}
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-600">Applications</span>
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
        {/* Job Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center mb-2">
                <button
                  onClick={() => router.back()}
                  className="mr-4 flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Back
                </button>
                <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <Briefcase className="h-4 w-4 mr-1" />
                <span className="font-medium">{job.companyName}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 text-sm text-gray-500">
              <div className="font-semibold text-lg">{applications.length} Applications</div>
              <div>Deadline: {new Date(job.deadline).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Job Applications</h2>
            <p className="text-gray-600 mt-1">
              Review and manage applications for this position
            </p>
          </div>
          
          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600">
                No one has applied to this job yet. The job is still active and accepting applications.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map(application => (
                <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <div className="flex-1 mb-4 sm:mb-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                              <User className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {application.applicantId.firstName} {application.applicantId.lastName}
                              </h3>
                              <p className="text-gray-600">{application.applicantId.farmName || application.applicantId.username}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              <span>{application.applicantId.email}</span>
                            </div>
                            
                            {application.applicantId.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                <span>{application.applicantId.phone}</span>
                              </div>
                            )}
                            
                            {application.applicantId.location && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{application.applicantId.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 sm:mt-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1 capitalize">{application.status}</span>
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {application.message && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {application.message}
                          </p>
                        </div>
                      )}
                      
                      {application.cvUrl && (
                        <div className="mt-4">
                          <a 
                            href={application.cvUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                          >
                            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View CV/Resume
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div className="sm:ml-6 flex flex-col space-y-2 min-w-[140px]">
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'accepted')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                      >
                        Reject
                      </button>
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