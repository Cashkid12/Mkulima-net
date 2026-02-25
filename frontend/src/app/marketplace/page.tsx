'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search,
  Filter,
  MapPin,
  Clock,
  User,
  Store,
  Tractor,
  Leaf,
  Beef,
  Package,
  ChevronDown,
  X,
  SlidersHorizontal,
  Grid3X3,
  List,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

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
  };
  seller: {
    id: string;
    name: string;
    type: 'farmer' | 'agrovet' | 'supplier' | 'equipment_seller';
    verified: boolean;
    rating?: number;
  };
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
  // Animal specific fields
  breed?: string;
  age?: string;
  healthStatus?: string;
}

interface Filters {
  category: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  sellerType: string;
  freshness: string;
  search: string;
}

// Categories configuration
const categories = [
  { id: 'all', name: 'All Products', icon: Package },
  { id: 'produce', name: 'Farm Produce', icon: Leaf },
  { id: 'livestock', name: 'Livestock & Animals', icon: Beef },
  { id: 'agrovet', name: 'Agrovet Products', icon: Store },
  { id: 'equipment', name: 'Equipment & Tools', icon: Tractor },
  { id: 'seedlings', name: 'Seedlings & Plants', icon: Leaf },
];

const sellerTypes = [
  { id: 'all', name: 'All Sellers' },
  { id: 'farmer', name: 'Farmers' },
  { id: 'agrovet', name: 'Agrovets' },
  { id: 'supplier', name: 'Suppliers' },
  { id: 'equipment_seller', name: 'Equipment Sellers' },
];

const freshnessOptions = [
  { id: 'all', name: 'Any Time' },
  { id: '24h', name: 'Last 24 Hours' },
  { id: '3d', name: 'Last 3 Days' },
  { id: '7d', name: 'Last 7 Days' },
];

const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Kajiado', 
  'Machakos', 'Murang\'a', 'Nyeri', 'Kirinyaga', 'Embu', 'Meru',
  'Uasin Gishu', 'Kericho', 'Bomet', 'Nandi', 'Kakamega', 'Vihiga'
];

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

const getFreshnessColor = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 6) return 'bg-green-100 text-green-700';
  if (diffInHours < 24) return 'bg-blue-100 text-blue-700';
  if (diffInHours < 72) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
};

const formatPrice = (price: number, currency: string): string => {
  return `${currency} ${price.toLocaleString()}`;
};

const getCategoryIcon = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId);
  return category?.icon || Package;
};

// Product Card Component
const ProductCard = ({ product, onClick }: { product: Product; onClick: () => void }) => {
  const freshnessClass = getFreshnessColor(product.createdAt);
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gray-100">
        {product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {(() => {
              const Icon = getCategoryIcon(product.category);
              return <Icon className="h-16 w-16 text-gray-300" />;
            })()}
          </div>
        )}
        
        {/* Freshness Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${freshnessClass}`}>
          <Clock className="h-3 w-3 inline mr-1" />
          {getTimeAgo(product.createdAt)}
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
          {categories.find(c => c.id === product.category)?.name || product.category}
        </div>
        
        {/* Condition Badge */}
        <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium capitalize">
          {product.condition}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{product.name}</h3>
        
        {/* Price */}
        <p className="text-xl font-bold text-green-600 mb-2">
          {formatPrice(product.price, product.currency)}
          <span className="text-sm font-normal text-gray-500 ml-1">/ {product.unit}</span>
        </p>
        
        {/* Quantity */}
        <p className="text-sm text-gray-600 mb-3">
          {product.quantity} {product.unit} available
        </p>
        
        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{product.location.county}{product.location.town ? `, ${product.location.town}` : ''}</span>
        </div>
        
        {/* Seller Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{product.seller.name}</p>
              <p className="text-xs text-gray-500 capitalize">{product.seller.type.replace('_', ' ')}</p>
            </div>
          </div>
          
          {product.seller.verified && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              Verified
            </span>
          )}
        </div>
        
        {/* Animal Specific Info */}
        {product.category === 'livestock' && (product.breed || product.age) && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
            {product.breed && <span className="mr-3">Breed: {product.breed}</span>}
            {product.age && <span>Age: {product.age}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
      <div className="pt-3 border-t border-gray-100 flex items-center">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-2" />
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-2 bg-gray-200 rounded animate-pulse w-16" />
        </div>
      </div>
    </div>
  </div>
);

// Main Marketplace Page
export default function MarketplacePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    location: '',
    minPrice: '',
    maxPrice: '',
    sellerType: 'all',
    freshness: 'all',
    search: ''
  });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine which endpoint to use based on filters
      let url;
      const queryParams = new URLSearchParams();
      
      // Check if we need to use the search endpoint (for complex filters)
      const hasAdvancedFilters = filters.sellerType !== 'all' || filters.freshness !== 'all';
      
      if (hasAdvancedFilters || filters.search) {
        // Use search endpoint for advanced filtering
        url = `${process.env.NEXT_PUBLIC_API_URL}/products/search`;
        
        // Add all filters to search endpoint
        if (filters.category && filters.category !== 'all') {
          queryParams.append('category', filters.category);
        }
        if (filters.location) {
          queryParams.append('county', filters.location);
        }
        if (filters.minPrice) {
          queryParams.append('minPrice', filters.minPrice);
        }
        if (filters.maxPrice) {
          queryParams.append('maxPrice', filters.maxPrice);
        }
        if (filters.search) {
          queryParams.append('q', filters.search);
        }
        if (filters.sellerType && filters.sellerType !== 'all') {
          queryParams.append('sellerType', filters.sellerType);
        }
        if (filters.freshness && filters.freshness !== 'all') {
          queryParams.append('freshness', filters.freshness);
        }
      } else {
        // Use regular products endpoint for basic filtering
        url = `${process.env.NEXT_PUBLIC_API_URL}/products`;
        
        // Add basic filters to regular endpoint
        if (filters.category && filters.category !== 'all') {
          queryParams.append('category', filters.category);
        }
        if (filters.location) {
          queryParams.append('county', filters.location);
        }
        if (filters.minPrice) {
          queryParams.append('minPrice', filters.minPrice);
        }
        if (filters.maxPrice) {
          queryParams.append('maxPrice', filters.maxPrice);
        }
        if (filters.search) {
          queryParams.append('q', filters.search);
        }
      }
      
      // Add pagination (we'll use a reasonable limit)
      queryParams.append('limit', '50');
      
      if (queryParams.toString()) {
        url += '?' + queryParams.toString();
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters
  // Note: With the API now handling filtering, we'll keep this for any client-side filters
  // that aren't sent to the server, or for when we want to implement instant filtering
  // without API calls. For now, we'll rely on the API response.
  useEffect(() => {
    // Since we're fetching filtered data from the API, we'll just use the products as-is
    // but we can still apply any client-side filters that aren't handled by the API
    let result = [...products];
    
    // Seller type filter (not handled by API yet)
    if (filters.sellerType !== 'all') {
      result = result.filter(p => p.seller.type === filters.sellerType);
    }
    
    // Freshness filter (not handled by API yet)
    if (filters.freshness !== 'all') {
      const now = new Date();
      result = result.filter(p => {
        const productDate = new Date(p.createdAt);
        const diffInHours = (now.getTime() - productDate.getTime()) / (1000 * 60 * 60);
        
        switch (filters.freshness) {
          case '24h': return diffInHours <= 24;
          case '3d': return diffInHours <= 72;
          case '7d': return diffInHours <= 168;
          default: return true;
        }
      });
    }
    
    // Sort by freshness (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredProducts(result);
  }, [filters, products]);

  const handleProductClick = (productId: string) => {
    router.push(`/marketplace/product/${productId}`);
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      location: '',
      minPrice: '',
      maxPrice: '',
      sellerType: 'all',
      freshness: 'all',
      search: ''
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false;
    return value !== '' && value !== 'all';
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-green-800">
                MkulimaNet
              </Link>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-600">Marketplace</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/marketplace/sell"
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Sell Product
              </Link>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="py-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products, produce, livestock, equipment..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setFilters({ ...filters, category: category.id })}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    filters.category === category.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            
            <div className="flex items-center bg-white rounded-lg border border-gray-300">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-label="Grid view"
                className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                aria-label="List view"
                className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (County)
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  title="Select county"
                  aria-label="Select county"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Counties</option>
                  {kenyanCounties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>
              
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (KES)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              {/* Seller Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller Type
                </label>
                <select
                  value={filters.sellerType}
                  onChange={(e) => setFilters({ ...filters, sellerType: e.target.value })}
                  title="Select seller type"
                  aria-label="Select seller type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {sellerTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Freshness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posted Within
                </label>
                <select
                  value={filters.freshness}
                  onChange={(e) => setFilters({ ...filters, freshness: e.target.value })}
                  title="Select freshness period"
                  aria-label="Select freshness period"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {freshnessOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              {activeFiltersCount > 0 
                ? 'Try adjusting your filters to see more products'
                : 'No products available in this area yet'}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
