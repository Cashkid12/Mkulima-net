'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Upload,
  X,
  Package,
  Leaf,
  Beef,
  Store,
  Tractor,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  Camera
} from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  quantity: string;
  unit: string;
  condition: string;
  location: string;
  town: string;
  // Animal fields
  breed: string;
  age: string;
  healthStatus: string;
  // Equipment fields
  year: string;
  brand: string;
}

const categories = [
  { id: 'produce', name: 'Farm Produce', icon: Leaf, description: 'Crops, vegetables, fruits, grains' },
  { id: 'livestock', name: 'Livestock & Animals', icon: Beef, description: 'Cows, goats, sheep, poultry' },
  { id: 'agrovet', name: 'Agrovet Products', icon: Store, description: 'Seeds, fertilizers, pesticides, feeds' },
  { id: 'equipment', name: 'Equipment & Tools', icon: Tractor, description: 'Tractors, tools, machinery' },
  { id: 'seedlings', name: 'Seedlings & Plants', icon: Leaf, description: 'Tree seedlings, plant starters' },
];

const units = ['kg', 'bags', 'pieces', 'animals', 'liters', 'crates', 'seedlings'];
const conditions = ['fresh', 'live', 'new', 'used', 'refurbished'];
const currencies = ['KES', 'USD'];

const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Kajiado', 
  'Machakos', 'Murang\'a', 'Nyeri', 'Kirinyaga', 'Embu', 'Meru',
  'Uasin Gishu', 'Kericho', 'Bomet', 'Nandi', 'Kakamega', 'Vihiga',
  'Bungoma', 'Busia', 'Siaya', 'Kisii', 'Nyamira', 'Migori',
  'Homa Bay', 'Kitui', 'Makueni', 'Taita Taveta', 'Kilifi', 'Kwale'
];

export default function SellProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    currency: 'KES',
    quantity: '',
    unit: 'kg',
    condition: 'fresh',
    location: '',
    town: '',
    breed: '',
    age: '',
    healthStatus: '',
    year: '',
    brand: ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Preview images
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to create a listing');
      }
      
      // Upload images to Cloudinary
      const uploadedImageUrls: string[] = [];
      
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formDataObj = new FormData();
          formDataObj.append('file', file);
          formDataObj.append('upload_preset', 'mkulima_net');
          
          try {
            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
              method: 'POST',
              body: formDataObj
            });
            
            const uploadData = await uploadResponse.json();
            if (uploadData.secure_url) {
              uploadedImageUrls.push(uploadData.secure_url);
            }
          } catch (uploadErr) {
            console.error('Image upload error:', uploadErr);
            throw new Error('Failed to upload images to Cloudinary');
          }
        }
      }
      
      // Prepare product data
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        currency: formData.currency,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        condition: formData.condition,
        images: uploadedImageUrls, // Use the actual uploaded image URLs
        location: {
          county: formData.location,
          town: formData.town
        },
        // Animal fields
        ...(formData.category === 'livestock' && {
          breed: formData.breed,
          age: formData.age,
          healthStatus: formData.healthStatus
        }),
        // Equipment fields
        ...(formData.category === 'equipment' && {
          year: formData.year ? parseInt(formData.year) : undefined,
          brand: formData.brand
        })
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }
      
      const result = await response.json();
      
      // Redirect to marketplace
      router.push('/marketplace');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.category !== '';
      case 2:
        return formData.name !== '' && formData.description !== '' && images.length > 0;
      case 3:
        return formData.price !== '' && formData.quantity !== '' && formData.location !== '';
      default:
        return true;
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/marketplace" className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Sell Your Product</h1>
            </div>
            
            <div className="flex items-center space-x-1">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s === step
                      ? 'bg-green-600 text-white'
                      : s < step
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">What are you selling?</h2>
                <p className="text-gray-600 mt-2">Select a category for your product</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        formData.category === category.id
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`p-3 rounded-lg ${
                          formData.category === category.id ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            formData.category === category.id ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <h3 className={`font-semibold ${
                            formData.category === category.id ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Product Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                <p className="text-gray-600 mt-2">Tell us about your {selectedCategory?.name.toLowerCase()}</p>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Photos <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">Add up to 5 photos. First photo will be the main image.</p>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fresh Organic Maize"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product in detail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  required
                />
              </div>

              {/* Animal-specific fields */}
              {formData.category === 'livestock' && (
                <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Animal Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                      <input
                        type="text"
                        value={formData.breed}
                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                        placeholder="e.g., Friesian"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="text"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="e.g., 2 years"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Health Status</label>
                    <input
                      type="text"
                      value={formData.healthStatus}
                      onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                      placeholder="e.g., Fully vaccinated, healthy"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              )}

              {/* Equipment-specific fields */}
              {formData.category === 'equipment' && (
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Equipment Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="e.g., Massey Ferguson"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="e.g., 2020"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Pricing & Location */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Pricing & Location</h2>
                <p className="text-gray-600 mt-2">Set your price and location</p>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 3500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    title="Select currency"
                    aria-label="Select currency"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {currencies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Available <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g., 50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    title="Select unit"
                    aria-label="Select unit"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <div className="flex flex-wrap gap-2">
                  {conditions.map(condition => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => setFormData({ ...formData, condition })}
                      className={`px-4 py-2 rounded-lg border capitalize transition-colors ${
                        formData.condition === condition
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    County <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    title="Select county"
                    aria-label="Select county"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select a county</option>
                    {kenyanCounties.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Town/Area (Optional)</label>
                  <input
                    type="text"
                    value={formData.town}
                    onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                    placeholder="e.g., Njoro, Thika Town"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <Link
                href="/marketplace"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </Link>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !isStepValid()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  'Post Listing'
                )}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
