'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Store,
  Tractor,
  Leaf,
  Beef,
  Package,
  MessageCircle,
  Phone,
  Share2,
  Flag,
  Check,
  Star,
  Eye,
  Calendar,
  Shield,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  quantity: number;
  unit: string;
  condition: string;
  images: string[];
  location: {
    county: string;
    town?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  seller: {
    id: string;
    name: string;
    type: 'farmer' | 'agrovet' | 'supplier' | 'equipment_seller';
    verified: boolean;
    rating?: number;
    memberSince?: string;
    totalListings?: number;
    phone?: string;
  };
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
  // Animal specific fields
  breed?: string;
  age?: string;
  healthStatus?: string;
  // Equipment specific
  year?: number;
  brand?: string;
}

const categories: Record<string, { name: string; icon: React.ElementType }> = {
  produce: { name: 'Farm Produce', icon: Leaf },
  livestock: { name: 'Livestock & Animals', icon: Beef },
  agrovet: { name: 'Agrovet Products', icon: Store },
  equipment: { name: 'Equipment & Tools', icon: Tractor },
  seedlings: { name: 'Seedlings & Plants', icon: Leaf },
};

// Helper functions
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 7200) return '1 hour ago';
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

const formatPrice = (price: number, currency: string): string => {
  return `${currency} ${price.toLocaleString()}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Loading Skeleton
const ProductSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handlePrevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Product Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">The product you are looking for does not exist.</p>
          <Link 
            href="/marketplace"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = categories[product.category]?.icon || Package;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <Link href="/" className="text-xl font-bold text-green-800">
                MkulimaNet
              </Link>
              <span className="mx-2 text-gray-300">|</span>
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">
                Marketplace
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share product"
                aria-label="Share product"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Report listing"
                aria-label="Report listing"
              >
                <Flag className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
              {product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                        title="Previous image"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                        title="Next image"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {product.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                            title={`View image ${index + 1}`}
                            aria-label={`View image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CategoryIcon className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-green-600' : 'border-transparent'
                    }`}
                    title={`View image ${index + 1}`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  <CategoryIcon className="h-4 w-4 mr-1" />
                  {categories[product.category]?.name || product.category}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 capitalize">
                  {product.condition}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {product.views} views
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Posted {getTimeAgo(product.createdAt)}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-green-50 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">Price</p>
              <p className="text-4xl font-bold text-green-700">
                {formatPrice(product.price, product.currency)}
              </p>
              <p className="text-gray-600 mt-1">
                per {product.unit} • {product.quantity} {product.unit} available
              </p>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Animal Specific Details */}
            {product.category === 'livestock' && (product.breed || product.age || product.healthStatus) && (
              <div className="bg-blue-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Animal Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {product.breed && (
                    <div>
                      <p className="text-sm text-gray-500">Breed</p>
                      <p className="font-medium text-gray-900">{product.breed}</p>
                    </div>
                  )}
                  {product.age && (
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium text-gray-900">{product.age}</p>
                    </div>
                  )}
                  {product.healthStatus && (
                    <div>
                      <p className="text-sm text-gray-500">Health Status</p>
                      <p className="font-medium text-gray-900">{product.healthStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Equipment Specific Details */}
            {product.category === 'equipment' && (product.year || product.brand) && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.brand && (
                    <div>
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="font-medium text-gray-900">{product.brand}</p>
                    </div>
                  )}
                  {product.year && (
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-medium text-gray-900">{product.year}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Location</h2>
                <p className="text-gray-600">
                  {product.location.county}{product.location.town ? `, ${product.location.town}` : ''}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPhone(!showPhone)}
                className="w-full flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                {showPhone ? product.seller.phone : 'Show Contact Number'}
              </button>
              
              <Link
                href={`/dashboard/messages?user=${product.seller.id}`}
                className="w-full flex items-center justify-center px-6 py-4 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Message Seller
              </Link>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">Safety Tips</h3>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>Meet in a safe, public place</li>
                    <li>Inspect the product before paying</li>
                    <li>Never pay in advance without seeing the item</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">About the Seller</h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{product.seller.name}</h3>
                  {product.seller.verified && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600 capitalize">{product.seller.type.replace('_', ' ')}</p>
                
                {product.seller.rating && (
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {product.seller.rating}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {product.seller.totalListings} listings
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
              {product.seller.memberSince && (
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Member since {formatDate(product.seller.memberSince)}
                </span>
              )}
              <Link
                href={`/marketplace?seller=${product.seller.id}`}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                View all listings
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Products Placeholder */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Similar Products</h2>
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">More products from this category will appear here</p>
          </div>
        </div>
      </main>
    </div>
  );
}
