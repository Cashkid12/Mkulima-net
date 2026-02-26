'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp,
  ShoppingCart,
  Eye,
  Star,
  Package,
  Plus,
  Edit3,
  BarChart3,
  Users,
  AlertCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  views: number;
  sales: number;
  revenue: number;
  status: 'active' | 'sold' | 'inactive';
  createdAt: string;
}

interface SellerStats {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  activeProducts: number;
  averageRating: number;
  totalReviews: number;
  monthlyGrowth: number;
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'analytics'>('overview');

  // Mock data for demonstration
  useEffect(() => {
    const mockStats: SellerStats = {
      totalRevenue: 125000,
      totalSales: 47,
      totalProducts: 23,
      activeProducts: 18,
      averageRating: 4.7,
      totalReviews: 124,
      monthlyGrowth: 15.3
    };

    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Organic Maize Seeds - 50kg Bag',
        price: 2500,
        quantity: 150,
        category: 'Seeds',
        views: 1247,
        sales: 32,
        revenue: 80000,
        status: 'active',
        createdAt: new Date(Date.now() - 2592000000).toISOString() // 30 days ago
      },
      {
        id: '2',
        name: 'Dairy Cattle - 2 Year Old Heifer',
        price: 45000,
        quantity: 5,
        category: 'Livestock',
        views: 892,
        sales: 3,
        revenue: 135000,
        status: 'active',
        createdAt: new Date(Date.now() - 1209600000).toISOString() // 14 days ago
      },
      {
        id: '3',
        name: 'Tomato Seedlings - 1000 plants',
        price: 3500,
        quantity: 75,
        category: 'Seedlings',
        views: 2156,
        sales: 45,
        revenue: 157500,
        status: 'sold',
        createdAt: new Date(Date.now() - 518400000).toISOString() // 6 days ago
      },
      {
        id: '4',
        name: 'Organic Fertilizer - 25kg Bag',
        price: 1200,
        quantity: 200,
        category: 'Fertilizers',
        views: 743,
        sales: 67,
        revenue: 80400,
        status: 'active',
        createdAt: new Date(Date.now() - 864000000).toISOString() // 10 days ago
      }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTopProducts = () => {
    return [...products]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  };

  const getProductStats = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.map(category => ({
      category,
      count: products.filter(p => p.category === category).length,
      revenue: products
        .filter(p => p.category === category)
        .reduce((sum, p) => sum + p.revenue, 0)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Seller Data</h3>
        <p className="text-gray-500">Start selling to see your dashboard</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Seller Dashboard</h2>
            <p className="text-gray-600 mt-1">Track your sales performance and manage your products</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'products', label: 'My Products', icon: Package },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'products' | 'analytics')}
                className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center">
                  <div className="bg-green-500 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-700">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.monthlyGrowth)}%
                      </span>
                      <span className="text-xs text-green-700 ml-1">this month</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-700">Total Sales</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {stats.totalSales}
                    </p>
                    <p className="text-xs text-blue-700 mt-2">All time</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center">
                  <div className="bg-purple-500 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-700">Active Products</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {stats.activeProducts}/{stats.totalProducts}
                    </p>
                    <p className="text-xs text-purple-700 mt-2">Listed items</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center">
                  <div className="bg-yellow-500 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-700">Rating</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">
                      {stats.averageRating}
                    </p>
                    <div className="flex items-center mt-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-xs text-yellow-700 ml-1">
                        ({stats.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getTopProducts().map((product, index) => (
                  <div key={product.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-gray-900">#{index + 1}</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {product.sales} sales
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Products</h3>
              <div className="flex gap-3">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-label="Filter by status"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Sold</option>
                  <option>Inactive</option>
                </select>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-label="Filter by category"
                >
                  <option>All Categories</option>
                  <option>Seeds</option>
                  <option>Livestock</option>
                  <option>Seedlings</option>
                  <option>Fertilizers</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inventory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.quantity > 10 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.quantity} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {product.views.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(product.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : product.status === 'sold'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-green-600 hover:text-green-900 mr-3"
                          aria-label="Edit product"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getProductStats().map((category) => (
                  <div key={category.category} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                    <p className="text-2xl font-bold text-green-600 mb-1">
                      {formatCurrency(category.revenue)}
                    </p>
                    <p className="text-sm text-gray-500">{category.count} products</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">87%</div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2.4x</div>
                  <p className="text-sm text-gray-600">Industry Average</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                  <p className="text-sm text-gray-600">Customer Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}