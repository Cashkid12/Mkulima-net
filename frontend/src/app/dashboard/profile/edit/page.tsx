'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Check,
  AlertCircle
} from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Predefined options
  const predefinedSkills = [
    'Organic Farming', 'Dairy Management', 'Irrigation Systems', 
    'Farm Equipment Operation', 'Crop Rotation Planning', 'Agribusiness Management',
    'Soil Testing', 'Pest Control', 'Greenhouse Management', 'Livestock Breeding',
    'Aquaculture', 'Apiculture', 'Poultry Farming', 'Horticulture', 'Agroforestry'
  ];

  const predefinedServices = [
    'Farm Consultation', 'Soil Testing', 'Seed Supply', 
    'Farm Setup Guidance', 'Livestock Breeding', 'Crop Protection',
    'Farm Mechanization', 'Marketing Assistance', 'Financial Planning',
    'Training & Education', 'Equipment Rental', 'Harvesting Services'
  ];

  const predefinedCrops = [
    'Maize', 'Beans', 'Wheat', 'Rice', 'Potatoes', 'Tomatoes',
    'Cassava', 'Sweet Potatoes', 'Bananas', 'Mangoes', 'Avocados',
    'Coffee', 'Tea', 'Sugarcane', 'Cotton', 'Soybeans', 'Groundnuts'
  ];

  const predefinedLivestock = [
    'Cattle', 'Goats', 'Sheep', 'Poultry', 'Pigs', 'Fish',
    'Rabbits', 'Bees', 'Donkeys', 'Camels', 'Horses', 'Turkeys'
  ];

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    farmName: '',
    location: '',
    bio: '',
    skills: [],
    certifications: [],
    services: [],
    crops: [],
    livestock: [],
    farmSize: '',
    yearsExperience: 0,
    experienceLevel: 'Beginner',
    availabilityStatus: 'Not Available',
    farmImages: []
  });

  // Load user profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        const response = await fetch('http://localhost:5001/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load profile data');
        }

        const data = await response.json();
        
        setFormData({
          name: data.firstName + ' ' + data.lastName,
          username: data.username,
          farmName: data.farmName || '',
          location: data.location || '',
          bio: data.bio || '',
          skills: data.skills || [],
          certifications: data.certifications || [],
          services: data.services || [],
          crops: data.crops || [],
          livestock: data.livestock || [],
          farmSize: data.farmSize || '',
          yearsExperience: data.yearsExperience || 0,
          experienceLevel: data.experienceLevel || 'Beginner',
          availabilityStatus: data.availabilityStatus || 'Not Available',
          farmImages: data.farmImages || []
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      }
    };

    loadProfileData();
  }, []);

  // Input states for new items
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Beginner');
  const [newCertification, setNewCertification] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertDate, setNewCertDate] = useState('');
  const [newService, setNewService] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newCrop, setNewCrop] = useState('');
  const [newLivestock, setNewLivestock] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.some(s => s.name === newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { name: newSkill.trim(), level: newSkillLevel }]
      }));
      setNewSkill('');
      setNewSkillLevel('Beginner');
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  const handleAddCertification = () => {
    if (newCertification.trim() && !formData.certifications.some(c => c.name === newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, { 
          name: newCertification.trim(), 
          issuer: newCertIssuer.trim(),
          date: newCertDate.trim(),
          file: null
        }]
      }));
      setNewCertification('');
      setNewCertIssuer('');
      setNewCertDate('');
    }
  };

  const handleRemoveCertification = (certName: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.name !== certName)
    }));
  };

  const handleAddService = () => {
    if (newService.trim() && !formData.services.some(s => s.name === newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, { 
          name: newService.trim(), 
          description: newServiceDesc.trim(),
          price: newServicePrice.trim()
        }]
      }));
      setNewService('');
      setNewServiceDesc('');
      setNewServicePrice('');
    }
  };

  const handleRemoveService = (serviceName: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.name !== serviceName)
    }));
  };

  const handleAddCrop = () => {
    if (newCrop.trim() && !formData.crops.includes(newCrop.trim())) {
      setFormData(prev => ({
        ...prev,
        crops: [...prev.crops, newCrop.trim()]
      }));
      setNewCrop('');
    }
  };

  const handleRemoveCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.filter(c => c !== crop)
    }));
  };

  const handleAddLivestock = () => {
    if (newLivestock.trim() && !formData.livestock.includes(newLivestock.trim())) {
      setFormData(prev => ({
        ...prev,
        livestock: [...prev.livestock, newLivestock.trim()]
      }));
      setNewLivestock('');
    }
  };

  const handleRemoveLivestock = (animal: string) => {
    setFormData(prev => ({
      ...prev,
      livestock: prev.livestock.filter(l => l !== animal)
    }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.farmName.trim()) {
        throw new Error('Farm name is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }
      if (!formData.bio.trim()) {
        throw new Error('Bio is required');
      }
      if (formData.skills.length === 0) {
        throw new Error('Please add at least one skill');
      }
      if (formData.farmSize === '') {
        throw new Error('Please enter your farm size');
      }
      if (formData.yearsExperience < 0 || formData.yearsExperience > 50) {
        throw new Error('Please enter valid years of experience (0-50)');
      }

      // Prepare data for API submission
      const profileData = {
        name: formData.name,
        username: formData.username,
        farmName: formData.farmName,
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills,
        certifications: formData.certifications,
        services: formData.services,
        crops: formData.crops,
        livestock: formData.livestock,
        farmSize: formData.farmSize,
        yearsExperience: formData.yearsExperience,
        experienceLevel: formData.experienceLevel,
        availabilityStatus: formData.availabilityStatus,
        farmImages: formData.farmImages
      };

      // Make API call to backend
      const response = await fetch('http://localhost:5001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-auth-token': localStorage.getItem('token') // Alternative header used by the backend
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      
      // Update user data in localStorage
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...existingUser, ...result.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/profile');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-sm text-gray-600">Update your professional information</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700">Profile updated successfully!</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Your username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name</label>
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Your farm name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Your location"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Tell us about yourself and your farming experience..."
              />
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>
            <p className="text-sm text-gray-600 mb-3">Add your farming skills and expertise level</p>
            
            <div className="space-y-3 mb-4">
              {formData.skills.map((skill) => (
                <div 
                  key={skill.name} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-gray-800 mr-2">{skill.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skill.level === 'Beginner' ? 'bg-blue-100 text-blue-800' :
                      skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      skill.level === 'Professional' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveSkill(skill.name)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove ${skill.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add your farming skill"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              
              <label htmlFor="skillLevel" className="sr-only">Skill Level</label>
              <select
                id="skillLevel"
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Professional">Professional</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            
            <button
              onClick={handleAddSkill}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Skill
            </button>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {predefinedSkills
                .filter(skill => !formData.skills.some(s => s.name === skill))
                .map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      setNewSkill(skill);
                      handleAddSkill();
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    {skill}
                  </button>
                ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Certifications</h2>
            <p className="text-sm text-gray-600 mb-3">Add your professional certifications</p>
            
            <div className="space-y-4 mb-4">
              {formData.certifications.map((cert) => (
                <div key={cert.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                    <button 
                      onClick={() => handleRemoveCertification(cert.name)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Remove ${cert.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <span>Issuer: {cert.issuer}</span>
                    <span>Date: {cert.date}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Certificate name"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="text"
                  value={newCertIssuer}
                  onChange={(e) => setNewCertIssuer(e.target.value)}
                  placeholder="Issuing organization"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="text"
                  value={newCertDate}
                  onChange={(e) => setNewCertDate(e.target.value)}
                  placeholder="Year (e.g., 2023)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="flex items-center">
                <label htmlFor="certFile" className="sr-only">Upload Certificate File</label>
                <input
                  id="certFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      
                      // Create FormData for file upload
                      const formData = new FormData();
                      formData.append('certificate', file);
                      
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch('http://localhost:5001/api/profile/certificate', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'x-auth-token': token
                          },
                          body: formData
                        });
                        
                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.msg || 'Failed to upload certificate');
                        }
                        
                        const result = await response.json();
                        
                        // Add the certificate with file path to the form data
                        setFormData(prev => ({
                          ...prev,
                          certifications: [
                            ...prev.certifications,
                            { 
                              name: newCertification, 
                              issuer: newCertIssuer,
                              date: newCertDate,
                              fileUrl: result.filePath
                            }
                          ]
                        }));
                        
                        // Reset the form fields
                        setNewCertification('');
                        setNewCertIssuer('');
                        setNewCertDate('');
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to upload certificate');
                      }
                    }
                  }}
                />
                <button
                  onClick={handleAddCertification}
                  className="ml-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Certification
                </button>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Services Offered</h2>
            <p className="text-sm text-gray-600 mb-3">Add services you provide</p>
            
            <div className="space-y-4 mb-4">
              {formData.services.map((service) => (
                <div key={service.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <button 
                      onClick={() => handleRemoveService(service.name)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Remove ${service.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <p className="font-semibold text-green-600">{service.price}</p>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Service name (e.g., Farm Consultation)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="text"
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                placeholder="Service description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="text"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="Price (e.g., KES 2,000/hr)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              
              <button
                onClick={handleAddService}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Service
              </button>
            </div>
          </div>

          {/* Crops Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Crops</h2>
            <p className="text-sm text-gray-600 mb-3">Add crops you produce</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.crops.map((crop) => (
                <span 
                  key={crop} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {crop}
                  <button 
                    onClick={() => handleRemoveCrop(crop)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    aria-label={`Remove ${crop}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                placeholder="Add crops you produce"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCrop()}
              />
              <button
                onClick={handleAddCrop}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                aria-label="Add crop"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {predefinedCrops
                .filter(crop => !formData.crops.includes(crop))
                .map((crop) => (
                  <button
                    key={crop}
                    onClick={() => {
                      setNewCrop(crop);
                      handleAddCrop();
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    {crop}
                  </button>
                ))}
            </div>
          </div>

          {/* Livestock Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Livestock</h2>
            <p className="text-sm text-gray-600 mb-3">Add livestock you raise</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.livestock.map((animal) => (
                <span 
                  key={animal} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                >
                  {animal}
                  <button 
                    onClick={() => handleRemoveLivestock(animal)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                    aria-label={`Remove ${animal}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newLivestock}
                onChange={(e) => setNewLivestock(e.target.value)}
                placeholder="Add livestock you raise"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddLivestock()}
              />
              <button
                onClick={handleAddLivestock}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                aria-label="Add livestock"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {predefinedLivestock
                .filter(animal => !formData.livestock.includes(animal))
                .map((animal) => (
                  <button
                    key={animal}
                    onClick={() => {
                      setNewLivestock(animal);
                      handleAddLivestock();
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    {animal}
                  </button>
                ))}
            </div>
          </div>

          {/* Farm Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Farm Size</h2>
              <input
                type="text"
                value={formData.farmSize}
                onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                placeholder="e.g., 15 acres"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-label="Farm size"
              />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Experience Level</h2>
              <div className="space-y-3">
                {['Beginner', 'Intermediate', 'Professional', 'Expert'].map((level) => (
                  <label key={level} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={level}
                      checked={formData.experienceLevel === level}
                      onChange={() => setFormData({...formData, experienceLevel: level})}
                      className="h-4 w-4 text-green-600"
                    />
                    <span className="ml-3 text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience: {formData.yearsExperience}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({...formData, yearsExperience: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Years of experience slider"
                />
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Availability Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Open to Work', 'Open to Internships', 'Hiring', 'Not Available'].map((status) => (
                <label key={status} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value={status}
                    checked={formData.availabilityStatus === status}
                    onChange={() => setFormData({...formData, availabilityStatus: status})}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="ml-3 text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Crops Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Crops</h2>
            <p className="text-sm text-gray-600 mb-3">Add crops you produce</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.crops.map((crop) => (
                <span 
                  key={crop} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {crop}
                  <button 
                    onClick={() => handleRemoveCrop(crop)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    aria-label={`Remove ${crop}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                placeholder="Add crops you produce"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCrop()}
              />
              <button
                onClick={handleAddCrop}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                aria-label="Add crop"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {predefinedCrops
                .filter(crop => !formData.crops.includes(crop))
                .map((crop) => (
                  <button
                    key={crop}
                    onClick={() => {
                      setNewCrop(crop);
                      handleAddCrop();
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    {crop}
                  </button>
                ))}
            </div>
          </div>

          {/* Livestock Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Livestock</h2>
            <p className="text-sm text-gray-600 mb-3">Add livestock you raise</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.livestock.map((animal) => (
                <span 
                  key={animal} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                >
                  {animal}
                  <button 
                    onClick={() => handleRemoveLivestock(animal)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                    aria-label={`Remove ${animal}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newLivestock}
                onChange={(e) => setNewLivestock(e.target.value)}
                placeholder="Add livestock you raise"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddLivestock()}
              />
              <button
                onClick={handleAddLivestock}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                aria-label="Add livestock"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {predefinedLivestock
                .filter(animal => !formData.livestock.includes(animal))
                .map((animal) => (
                  <button
                    key={animal}
                    onClick={() => {
                      setNewLivestock(animal);
                      handleAddLivestock();
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    {animal}
                  </button>
                ))}
            </div>
          </div>

          {/* Farm Size & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Farm Size</h2>
              <select
                value={formData.farmSize}
                onChange={(e) => setFormData(prev => ({ ...prev, farmSize: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-label="Select farm size"
              >
                <option value="">Select farm size</option>
                <option value="1-5 Acres">1-5 Acres</option>
                <option value="10-50 Acres">10-50 Acres</option>
                <option value="Commercial Scale">Commercial Scale</option>
              </select>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Experience Level</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="beginner"
                    name="experience"
                    value="Beginner"
                    checked={formData.yearsExperience >= 0 && formData.yearsExperience <= 2}
                    onChange={() => setFormData(prev => ({ ...prev, yearsExperience: 1 }))}
                    className="h-4 w-4 text-green-600"
                  />
                  <label htmlFor="beginner" className="ml-2 text-gray-700">Beginner (0-2 years)</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="intermediate"
                    name="experience"
                    value="Intermediate"
                    checked={formData.yearsExperience >= 3 && formData.yearsExperience <= 5}
                    onChange={() => setFormData(prev => ({ ...prev, yearsExperience: 4 }))}
                    className="h-4 w-4 text-green-600"
                  />
                  <label htmlFor="intermediate" className="ml-2 text-gray-700">Intermediate (3-5 years)</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="professional"
                    name="experience"
                    value="Professional"
                    checked={formData.yearsExperience >= 6 && formData.yearsExperience <= 10}
                    onChange={() => setFormData(prev => ({ ...prev, yearsExperience: 8 }))}
                    className="h-4 w-4 text-green-600"
                  />
                  <label htmlFor="professional" className="ml-2 text-gray-700">Professional (6-10 years)</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="expert"
                    name="experience"
                    value="Expert"
                    checked={formData.yearsExperience > 10}
                    onChange={() => setFormData(prev => ({ ...prev, yearsExperience: 15 }))}
                    className="h-4 w-4 text-green-600"
                  />
                  <label htmlFor="expert" className="ml-2 text-gray-700">Expert (10+ years)</label>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience: {formData.yearsExperience}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Years of experience slider"
                />
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Availability Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Open to Work', 'Open to Internships', 'Hiring', 'Not Available'].map((status) => (
                <label key={status} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value={status}
                    checked={formData.availabilityStatus === status}
                    onChange={() => setFormData(prev => ({ ...prev, availabilityStatus: status }))}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="ml-3 text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}