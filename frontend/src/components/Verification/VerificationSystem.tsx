'use client';

import { useState } from 'react';
import { ShieldCheck, Award, Star, CheckCircle, Clock, AlertCircle, UserCheck, FileText, Camera, Upload, Eye, EyeOff } from 'lucide-react';

interface VerificationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements: string[];
  earned: boolean;
  earnedDate?: string;
  progress: number;
}

interface VerificationRequest {
  id: string;
  type: 'identity' | 'business' | 'quality' | 'premium';
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  submittedDate: string;
  reviewedDate?: string;
  documents: string[];
  notes?: string;
}

export default function VerificationSystem() {
  const [activeTab, setActiveTab] = useState<'badges' | 'requests' | 'verification'>('badges');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<'identity' | 'business' | 'quality' | 'premium'>('identity');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const badges: VerificationBadge[] = [
    {
      id: '1',
      name: 'Verified User',
      description: 'Identity verified through government documents',
      icon: 'shield',
      color: 'blue',
      requirements: ['Government ID', 'Selfie verification', 'Phone number verification'],
      earned: true,
      earnedDate: '2024-01-15',
      progress: 100
    },
    {
      id: '2',
      name: 'Verified Business',
      description: 'Business registration and license verified',
      icon: 'award',
      color: 'green',
      requirements: ['Business registration', 'Tax compliance certificate', 'Business license'],
      earned: false,
      progress: 60
    },
    {
      id: '3',
      name: 'Quality Producer',
      description: 'Products meet quality standards',
      icon: 'star',
      color: 'yellow',
      requirements: ['Quality certification', 'Product testing reports', 'Farm inspection'],
      earned: false,
      progress: 30
    },
    {
      id: '4',
      name: 'Premium Seller',
      description: 'Top-rated seller with excellent reviews',
      icon: 'crown',
      color: 'purple',
      requirements: ['95%+ positive reviews', '100+ completed transactions', 'No disputes'],
      earned: false,
      progress: 75
    }
  ];

  const verificationRequests: VerificationRequest[] = [
    {
      id: '1',
      type: 'identity',
      status: 'approved',
      submittedDate: '2024-01-10',
      reviewedDate: '2024-01-15',
      documents: ['id_front.jpg', 'id_back.jpg', 'selfie.jpg'],
      notes: 'Identity verification completed successfully'
    },
    {
      id: '2',
      type: 'business',
      status: 'pending',
      submittedDate: '2024-02-01',
      documents: ['business_cert.pdf', 'tax_clearance.pdf'],
      notes: 'Awaiting document review'
    }
  ];

  const getBadgeIcon = (icon: string, color: string) => {
    const colorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600'
    };

    const iconClasses = `w-8 h-8 ${colorClasses[color as keyof typeof colorClasses] || 'text-gray-600'}`;

    switch (icon) {
      case 'shield': return <ShieldCheck className={iconClasses} />;
      case 'award': return <Award className={iconClasses} />;
      case 'star': return <Star className={iconClasses} />;
      case 'crown': return <Award className={`w-8 h-8 ${colorClasses.purple}`} />;
      default: return <ShieldCheck className={iconClasses} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      case 'in_review': return 'In Review';
      default: return 'Unknown';
    }
  };

  const getVerificationTypeText = (type: string) => {
    switch (type) {
      case 'identity': return 'Identity Verification';
      case 'business': return 'Business Verification';
      case 'quality': return 'Quality Certification';
      case 'premium': return 'Premium Seller';
      default: return 'Unknown';
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const fileNames = files.map(file => file.name);
      setUploadedDocuments(prev => [...prev, ...fileNames]);
    }
  };

  const submitVerification = () => {
    // Submit verification request logic
    setShowVerificationModal(false);
    setUploadedDocuments([]);
    // Reset form
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <UserCheck className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Trust & Verification</h2>
        </div>
        <p className="text-gray-600">
          Build trust with verification badges and certified status
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'badges'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Badges
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'requests'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Requests
              </div>
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'verification'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Get Verified
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Your Verification Badges</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {badges.map((badge) => (
                  <div key={badge.id} className={`border-2 rounded-xl p-6 ${
                    badge.earned 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        badge.earned ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {getBadgeIcon(badge.icon, badge.color)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{badge.name}</h4>
                          {badge.earned && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{badge.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-medium text-gray-700">Requirements:</p>
                          <ul className="space-y-1">
                            {badge.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <div className={`w-2 h-2 rounded-full ${
                                  badge.earned || index < Math.floor(badge.requirements.length * badge.progress / 100)
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                                }`} />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {badge.earned ? (
                          <div className="text-sm text-green-700">
                            Earned on {new Date(badge.earnedDate!).toLocaleDateString()}
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Progress</span>
                              <span>{badge.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${badge.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Verification Requests</h3>
              
              <div className="space-y-4">
                {verificationRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {getVerificationTypeText(request.type)}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">
                          Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                          {request.reviewedDate && (
                            <span className="block">
                              Reviewed: {new Date(request.reviewedDate).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Documents:</p>
                          <div className="flex flex-wrap gap-2">
                            {request.documents.map((doc, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>

                        {request.notes && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">{request.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                        {request.status === 'rejected' && (
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Resubmit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Verified</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Increase your credibility and unlock premium features by completing our verification process
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    type: 'identity',
                    title: 'Identity Verification',
                    description: 'Verify your personal identity',
                    icon: <UserCheck className="w-8 h-8 text-blue-600" />,
                    requirements: ['Government ID', 'Selfie', 'Phone verification'],
                    price: 'Free'
                  },
                  {
                    type: 'business',
                    title: 'Business Verification',
                    description: 'Verify your business credentials',
                    icon: <Award className="w-8 h-8 text-green-600" />,
                    requirements: ['Business registration', 'Tax certificate', 'License'],
                    price: 'KSh 1,500'
                  },
                  {
                    type: 'quality',
                    title: 'Quality Certification',
                    description: 'Get quality certified',
                    icon: <Star className="w-8 h-8 text-yellow-600" />,
                    requirements: ['Quality reports', 'Inspection', 'Certification'],
                    price: 'KSh 3,000'
                  },
                  {
                    type: 'premium',
                    title: 'Premium Seller',
                    description: 'Become a premium seller',
                    icon: <Award className="w-8 h-8 text-purple-600" />,
                    requirements: ['High ratings', 'Transaction history', 'No disputes'],
                    price: 'KSh 5,000'
                  }
                ].map((option) => (
                  <div key={option.type} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {option.icon}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h4>
                      <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                      <p className="text-2xl font-bold text-green-600">{option.price}</p>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {option.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setVerificationType(option.type as 'identity' | 'business' | 'quality' | 'premium');
                        setShowVerificationModal(true);
                      }}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Get Started
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {getVerificationTypeText(verificationType)}
                </h3>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Required Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {verificationType === 'identity' && (
                      <>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Government ID (Front)</p>
                          <label className="text-green-600 hover:text-green-700 cursor-pointer text-sm font-medium">
                            Upload File
                            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
                          </label>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Government ID (Back)</p>
                          <label className="text-green-600 hover:text-green-700 cursor-pointer text-sm font-medium">
                            Upload File
                            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
                          </label>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center md:col-span-2">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Selfie with ID</p>
                          <label className="text-green-600 hover:text-green-700 cursor-pointer text-sm font-medium">
                            Take Photo
                            <input type="file" className="hidden" accept="image/*" capture="user" />
                          </label>
                        </div>
                      </>
                    )}
                    
                    {verificationType === 'business' && (
                      <>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Business Registration</p>
                          <label className="text-green-600 hover:text-green-700 cursor-pointer text-sm font-medium">
                            Upload File
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                          </label>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Tax Compliance Certificate</p>
                          <label className="text-green-600 hover:text-green-700 cursor-pointer text-sm font-medium">
                            Upload File
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Any additional information..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900 mb-1">Processing Time</h5>
                      <p className="text-sm text-blue-800">
                        Verification typically takes 2-3 business days. You will receive a notification once reviewed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitVerification}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Submit for Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}