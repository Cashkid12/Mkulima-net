'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  AlertTriangle,
  Loader2,
  CheckCircle
} from 'lucide-react';

interface FormData {
  title: string;
  companyName: string;
  location: {
    county: string;
    town: string;
  };
  jobType: string;
  category: string;
  salary: {
    amount: string;
    currency: string;
    negotiable: boolean;
  };
  requiredSkills: string;
  experienceRequired: string;
  description: string;
  deadline: string;
}

const jobTypes = [
  { id: 'Full-time', name: 'Full-time' },
  { id: 'Part-time', name: 'Part-time' },
  { id: 'Internship', name: 'Internship' }
];

const categories = [
  { id: 'Crops', name: 'Crops' },
  { id: 'Livestock', name: 'Livestock' },
  { id: 'Agribusiness', name: 'Agribusiness' },
  { id: 'Equipment', name: 'Equipment' },
  { id: 'Research', name: 'Research' },
  { id: 'Consulting', name: 'Consulting' }
];

const experienceLevels = [
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

export default function PostJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    companyName: '',
    location: {
      county: '',
      town: ''
    },
    jobType: 'Full-time',
    category: 'Crops',
    salary: {
      amount: '',
      currency: 'KES',
      negotiable: false
    },
    requiredSkills: '',
    experienceRequired: 'Entry Level',
    description: '',
    deadline: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: 'county' | 'town', value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleSalaryChange = (field: keyof FormData['salary'], value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to post a job');
      }
      
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Job title is required');
      }
      
      if (!formData.companyName.trim()) {
        throw new Error('Company name is required');
      }
      
      if (!formData.location.county.trim()) {
        throw new Error('County is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Job description is required');
      }
      
      if (!formData.deadline) {
        throw new Error('Application deadline is required');
      }
      
      // Prepare job data
      const jobData = {
        title: formData.title.trim(),
        companyName: formData.companyName.trim(),
        location: {
          county: formData.location.county.trim(),
          town: formData.location.town.trim()
        },
        jobType: formData.jobType,
        category: formData.category,
        salary: {
          amount: formData.salary.amount ? parseFloat(formData.salary.amount) : undefined,
          currency: formData.salary.currency,
          negotiable: formData.salary.negotiable
        },
        requiredSkills: formData.requiredSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0),
        experienceRequired: formData.experienceRequired,
        description: formData.description.trim(),
        deadline: formData.deadline
      };
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post job');
      }
      
      const result = await response.json();
      
      setSuccess(true);
      
      // Optionally redirect to the created job or jobs page after a delay
      setTimeout(() => {
        router.push('/jobs');
      }, 2000);
    } catch (err) {
      console.error('Error posting job:', err);
      setError(err instanceof Error ? err.message : 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Job Posted Successfully!</h3>
          <p className="mt-2 text-gray-600">
            Your job opportunity has been successfully posted and is now visible to job seekers.
          </p>
          <div className="mt-6">
            <Link
              href="/jobs"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              View Jobs
            </Link>
          </div>
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
              <span className="text-gray-600">Post Job</span>
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Post a New Job Opportunity</h1>
            <p className="text-gray-600 mt-2">
              Reach qualified candidates for your agricultural business
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
            
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="e.g., Agricultural Extension Officer"
                required
              />
            </div>
            
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company/Farm Name *
              </label>
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="e.g., Green Valley Farm Ltd"
                required
              />
            </div>
            
            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-2">
                  County *
                </label>
                <select
                  id="county"
                  value={formData.location.county}
                  onChange={(e) => handleLocationChange('county', e.target.value)}
                  title="Select county"
                  aria-label="Select county"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                >
                  <option value="">Select County</option>
                  {kenyanCounties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-2">
                  Town
                </label>
                <input
                  type="text"
                  id="town"
                  value={formData.location.town}
                  onChange={(e) => handleLocationChange('town', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="e.g., Nakuru Town"
                />
              </div>
            </div>
            
            {/* Job Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  id="jobType"
                  value={formData.jobType}
                  onChange={(e) => handleChange('jobType', e.target.value)}
                  title="Select job type"
                  aria-label="Select job type"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                >
                  {jobTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  title="Select category"
                  aria-label="Select category"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Salary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="salaryAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="salaryAmount"
                    value={formData.salary.amount}
                    onChange={(e) => handleSalaryChange('amount', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.salary.currency}
                  onChange={(e) => handleSalaryChange('currency', e.target.value)}
                  title="Select currency"
                  aria-label="Select currency"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Negotiable
                </label>
                <div className="flex items-center h-12">
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={formData.salary.negotiable}
                    onChange={(e) => handleSalaryChange('negotiable', e.target.checked)}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="negotiable" className="ml-2 text-sm text-gray-700">
                    Salary is negotiable
                  </label>
                </div>
              </div>
            </div>
            
            {/* Required Skills */}
            <div>
              <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <textarea
                id="requiredSkills"
                value={formData.requiredSkills}
                onChange={(e) => handleChange('requiredSkills', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Enter required skills separated by commas, e.g., irrigation, pest control, crop rotation"
                rows={3}
              />
            </div>
            
            {/* Experience Required */}
            <div>
              <label htmlFor="experienceRequired" className="block text-sm font-medium text-gray-700 mb-2">
                Experience Required
              </label>
              <select
                id="experienceRequired"
                value={formData.experienceRequired}
                onChange={(e) => handleChange('experienceRequired', e.target.value)}
                title="Select experience level"
                aria-label="Select experience level"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                {experienceLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Provide a detailed description of the job responsibilities, requirements, and any other relevant information..."
                rows={6}
                required
              />
            </div>
            
            {/* Application Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline *
              </label>
              <input
                type="date"
                id="deadline"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
              />
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Posting Job...
                  </>
                ) : (
                  'Post Job Opportunity'
                )}
              </button>
              
              <p className="text-sm text-gray-500 mt-4 text-center">
                By posting this job, you agree to our terms and conditions and confirm that the information provided is accurate.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}