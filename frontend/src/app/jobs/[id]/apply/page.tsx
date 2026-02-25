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
  Building,
  AlertTriangle,
  Loader2,
  CheckCircle,
  FileText,
  Upload
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

interface FormData {
  message: string;
  cvFile: File | null;
}

export default function JobApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    message: '',
    cvFile: null
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setError('Please upload a PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        cvFile: file
      }));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to apply to jobs');
      }
      
      // Check if user has completed profile
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error('Please complete your profile before applying to jobs');
      }
      
      const profileData = await profileResponse.json();
      if (!profileData.firstName || !profileData.lastName) {
        throw new Error('Please complete your profile before applying to jobs');
      }
      
      // Check if user has already applied
      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      if (appliedJobs.includes(id)) {
        throw new Error('You have already applied to this job');
      }
      
      // Prepare form data
      const applicationData = {
        message: formData.message,
        cvUrl: formData.cvFile ? URL.createObjectURL(formData.cvFile) : undefined
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }
      
      const result = await response.json();
      
      // Mark as applied in localStorage
      const updatedAppliedJobs = [...appliedJobs, id];
      localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs));
      
      setSuccess(true);
      
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push(`/jobs/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Application Submitted!</h3>
          <p className="mt-2 text-gray-600">
            Your application for {job?.title} at {job?.companyName} has been successfully submitted.
          </p>
          <div className="mt-6">
            <Link
              href={`/jobs/${id}`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 mr-3"
            >
              View Job
            </Link>
            <Link
              href="/jobs"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Browse More Jobs
            </Link>
          </div>
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
          <p className="text-gray-600 mb-6">The job you're trying to apply for doesn't exist or has been removed.</p>
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
              <Link href={`/jobs/${job.id}`} className="text-gray-600 hover:text-gray-900 font-medium">
                {job.title}
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-600">Apply</span>
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
        {/* Job Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h1>
              <div className="flex items-center text-gray-600 mb-2">
                <Building className="h-4 w-4 mr-1" />
                <span className="font-medium">{job.companyName}</span>
                {job.employerId.verified && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Verified
                  </span>
                )}
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
            </div>
            
            <div className="mt-4 sm:mt-0 text-sm text-gray-500">
              <Clock className="h-4 w-4 inline mr-1" />
              Application Deadline: {new Date(job.deadline).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Apply for This Position</h1>
            <p className="text-gray-600 mt-2">
              Fill out the form below to submit your application
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            {/* Application Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter / Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
                rows={6}
              />
              <p className="mt-1 text-sm text-gray-500">
                Briefly explain your interest in this position and highlight relevant experience.
              </p>
            </div>
            
            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CV/Resume (Optional)
              </label>
              <div className="mt-1 flex items-center">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {formData.cvFile ? formData.cvFile.name : 'Choose a PDF file'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                PDF format only, maximum file size 5MB
              </p>
            </div>
            
            {/* Job Requirements Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Job Requirements</h3>
              
              {job.experienceRequired && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4 mr-2 text-green-600" />
                  <span><strong>Experience:</strong> {job.experienceRequired}</span>
                </div>
              )}
              
              {job.requiredSkills.length > 0 && (
                <div className="mb-2">
                  <div className="text-sm text-gray-600 mb-1"><strong>Required Skills:</strong></div>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.slice(0, 5).map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{job.requiredSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-600 mt-2">
                <strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
              
              <p className="text-sm text-gray-500 mt-4 text-center">
                By submitting this application, you agree to our terms and confirm that the information provided is accurate.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}