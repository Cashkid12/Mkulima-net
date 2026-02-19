'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Briefcase, Building, User, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/jobs/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch job details');
        }

        const data = await response.json();
        setJob(data.job);
      } catch (err) {
        setError(err.message || 'Failed to load job details');
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  // Check if user has already applied for this job
  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !job) return;

        // Get user ID from local storage or session
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        const userId = user.id || user._id;

        // For now, we'll check locally if the user has applied
        // In a real app, we'd make an API call to check application status
      } catch (err) {
        console.error('Error checking application status:', err);
      }
    };

    checkApplicationStatus();
  }, [job]);

  const handleApply = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to apply for jobs');
        router.push('/auth/login');
        return;
      }

      // Get user ID from local storage or session
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('User information not found');
        return;
      }
      
      const user = JSON.parse(userStr);
      const userId = user.id || user._id;

      const response = await fetch(`http://localhost:5001/api/jobs/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        },
        body: JSON.stringify({
          coverLetter: coverLetter || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply for job');
      }

      const data = await response.json();
      setIsApplied(true);
      setApplicationSuccess(true);
      setShowCoverLetterModal(false);
      setCoverLetter('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setApplicationSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to apply for job');
      console.error('Error applying for job:', err);
      alert(err.message || 'Failed to apply for job');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center max-w-md mx-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
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
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {applicationSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Application submitted successfully!
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            {!isApplied && (
              <button 
                onClick={() => setShowCoverLetterModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <div className="flex items-center mt-2">
                  <Building className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-lg font-medium text-gray-700">{job.companyName}</span>
                </div>
                <div className="flex items-center mt-1">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-600">{job.location}</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex space-x-2">
                  <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                  </span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none text-gray-700">
                <p>{job.description}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((requirement, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Experience Level</h2>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700 capitalize">{job.experienceLevel}</span>
              </div>
            </div>

            {job.salary && (job.salary.min || job.salary.max) && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Salary</h2>
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">
                    {job.salary.min && job.salary.max 
                      ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
                      : job.salary.min 
                        ? `${job.salary.currency} ${job.salary.min.toLocaleString()}+`
                        : job.salary.max
                          ? `${job.salary.currency} Up to ${job.salary.max.toLocaleString()}`
                          : 'Salary not specified'}
                  </span>
                </div>
              </div>
            )}

            {job.applicationDeadline && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Application Deadline</h2>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                {!isApplied ? (
                  <button 
                    onClick={() => setShowCoverLetterModal(true)}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Apply for this position
                  </button>
                ) : (
                  <button 
                    disabled
                    className="flex-1 bg-green-100 text-green-800 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                  >
                    Application Submitted
                  </button>
                )}
                <button 
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cover Letter Modal */}
      {showCoverLetterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Apply for {job.title}</h2>
                <button 
                  onClick={() => setShowCoverLetterModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowCoverLetterModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApply}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}