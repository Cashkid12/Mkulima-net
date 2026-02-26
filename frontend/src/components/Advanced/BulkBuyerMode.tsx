'use client';

import { useState } from 'react';
import { ShoppingCart, FileText, Calendar, Users, TrendingUp, Scale, Leaf, Clock, MapPin, DollarSign, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface BulkOrder {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  targetPrice: number;
  currentOrders: number;
  minOrders: number;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
  participants: number;
  description: string;
  specifications: string[];
  deliveryLocation: string;
  deliveryDate: string;
}

interface ContractFarming {
  id: string;
  farmerName: string;
  cropType: string;
  landSize: string;
  duration: string;
  investment: number;
  expectedYield: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  investorCount: number;
  totalInvestment: number;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  completed: boolean;
  amount: number;
}

export default function BulkBuyerMode() {
  const [activeTab, setActiveTab] = useState<'bulk' | 'contracts' | 'analytics'>('bulk');
  const [showCreateBulk, setShowCreateBulk] = useState(false);
  const [showCreateContract, setShowCreateContract] = useState(false);

  const bulkOrders: BulkOrder[] = [
    {
      id: '1',
      productName: 'Fresh Tomatoes',
      category: 'Vegetables',
      quantity: 500,
      unit: 'kg',
      totalPrice: 25000,
      targetPrice: 50,
      currentOrders: 23,
      minOrders: 50,
      deadline: '2024-02-25',
      status: 'active',
      participants: 23,
      description: 'Fresh, organic tomatoes for processing',
      specifications: ['Organic', 'Firm texture', 'Red color', 'Minimum 60mm diameter'],
      deliveryLocation: 'Nairobi Industrial Area',
      deliveryDate: '2024-02-28'
    },
    {
      id: '2',
      productName: 'Maize Grain',
      category: 'Grains',
      quantity: 2000,
      unit: 'kg',
      totalPrice: 80000,
      targetPrice: 40,
      currentOrders: 45,
      minOrders: 100,
      deadline: '2024-03-01',
      status: 'active',
      participants: 45,
      description: 'High-quality white maize for animal feed',
      specifications: ['White variety', 'Moisture content <14%', 'No aflatoxin', 'Clean'],
      deliveryLocation: 'Mombasa Port',
      deliveryDate: '2024-03-05'
    }
  ];

  const contractFarming: ContractFarming[] = [
    {
      id: '1',
      farmerName: 'John Kamau',
      cropType: 'Avocados',
      landSize: '2 acres',
      duration: '8 months',
      investment: 150000,
      expectedYield: 5000,
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-09-15',
      investorCount: 3,
      totalInvestment: 150000,
      milestones: [
        {
          id: '1',
          name: 'Land Preparation',
          description: 'Soil testing and preparation',
          targetDate: '2024-01-31',
          completed: true,
          amount: 30000
        },
        {
          id: '2',
          name: 'Planting',
          description: 'Seedling planting and irrigation setup',
          targetDate: '2024-02-28',
          completed: true,
          amount: 50000
        },
        {
          id: '3',
          name: 'Maintenance',
          description: 'Regular maintenance and pest control',
          targetDate: '2024-06-30',
          completed: false,
          amount: 40000
        },
        {
          id: '4',
          name: 'Harvesting',
          description: 'Harvest and quality control',
          targetDate: '2024-09-15',
          completed: false,
          amount: 30000
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Bulk Buyer & Contract Farming</h2>
        </div>
        <p className="text-gray-600">
          Access bulk purchasing opportunities and invest in contract farming projects
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'bulk'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Bulk Orders
              </div>
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'contracts'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contract Farming
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Analytics
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'bulk' && (
            <div className="space-y-6">
              {/* Bulk Orders List */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Active Bulk Orders</h3>
                <button
                  onClick={() => setShowCreateBulk(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Create Bulk Order
                </button>
              </div>

              <div className="grid gap-6">
                {bulkOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-xl font-semibold text-gray-900">{order.productName}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-semibold text-gray-900">{order.quantity} {order.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Target Price</p>
                            <p className="font-semibold text-gray-900">KSh {order.targetPrice}/{order.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Price</p>
                            <p className="font-semibold text-gray-900">KSh {order.totalPrice.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Deadline</p>
                            <p className="font-semibold text-gray-900">{new Date(order.deadline).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Specifications</p>
                          <div className="flex flex-wrap gap-2">
                            {order.specifications.map((spec, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{order.participants} participants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{order.deliveryLocation}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                          Join Order
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Order Progress</span>
                        <span>{order.currentOrders} of {order.minOrders} required</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(order.currentOrders / order.minOrders) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Contract Farming Projects</h3>
                <button
                  onClick={() => setShowCreateContract(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Create Contract
                </button>
              </div>

              <div className="grid gap-6">
                {contractFarming.map((contract) => (
                  <div key={contract.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900">{contract.cropType}</h4>
                            <p className="text-gray-600">Farmer: {contract.farmerName}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                            {getStatusText(contract.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div>
                            <p className="text-sm text-gray-600">Land Size</p>
                            <p className="font-semibold text-gray-900">{contract.landSize}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold text-gray-900">{contract.duration}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Investment</p>
                            <p className="font-semibold text-gray-900">KSh {contract.investment.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Expected Yield</p>
                            <p className="font-semibold text-gray-900">{contract.expectedYield.toLocaleString()} kg</p>
                          </div>
                        </div>

                        {/* Milestones */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Project Milestones</h5>
                          <div className="space-y-3">
                            {contract.milestones.map((milestone) => (
                              <div key={milestone.id} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  milestone.completed 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {milestone.completed ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <Clock className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h6 className="font-medium text-gray-900">{milestone.name}</h6>
                                  <p className="text-sm text-gray-600">{milestone.description}</p>
                                  <p className="text-xs text-gray-500">Target: {new Date(milestone.targetDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">KSh {milestone.amount.toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 w-full lg:w-48">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                          Invest Now
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800 font-medium">{contract.investorCount} investors</p>
                          <p className="text-xs text-blue-600">KSh {contract.totalInvestment.toLocaleString()} raised</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Bulk Trading Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ShoppingCart className="w-8 h-8 text-green-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Total Orders</h4>
                  </div>
                  <p className="text-3xl font-bold text-green-700">127</p>
                  <p className="text-sm text-green-600 mt-1">+12% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Total Value</h4>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">KSh 2.4M</p>
                  <p className="text-sm text-blue-600 mt-1">+18% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Active Partners</h4>
                  </div>
                  <p className="text-3xl font-bold text-purple-700">89</p>
                  <p className="text-sm text-purple-600 mt-1">+5 new this month</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h4>
                <div className="space-y-4">
                  {[
                    { category: 'Vegetables', orders: 45, value: 'KSh 890,000' },
                    { category: 'Grains', orders: 32, value: 'KSh 650,000' },
                    { category: 'Fruits', orders: 28, value: 'KSh 420,000' },
                    { category: 'Dairy', orders: 22, value: 'KSh 340,000' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-600 font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{item.category}</h5>
                          <p className="text-sm text-gray-600">{item.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.value}</p>
                        <p className="text-sm text-gray-600">Total value</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Bulk Order Modal */}
      {showCreateBulk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Create Bulk Order</h3>
                <button
                  onClick={() => setShowCreateBulk(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Fresh Tomatoes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      aria-label="Select unit of measurement"
                    >
                      <option>kg</option>
                      <option>tons</option>
                      <option>boxes</option>
                      <option>crates</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Price (per unit)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Orders Required
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    aria-label="Select order deadline"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specifications
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter product specifications..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateBulk(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Create Order
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