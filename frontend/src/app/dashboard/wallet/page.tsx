'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WalletDashboard from '@/components/Wallet/WalletDashboard';
import { 
  Wallet, 
  CreditCard, 
  ArrowLeft,
  Settings,
  BarChart3,
  Shield,
  Users,
  Truck
} from 'lucide-react';

export default function WalletPage() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'orders' | 'escrow' | 'analytics' | 'security'>('dashboard');
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  const navigationItems: Array<{
    id: 'dashboard' | 'orders' | 'escrow' | 'analytics' | 'security';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'dashboard', label: 'Wallet Dashboard', icon: Wallet },
    { id: 'orders', label: 'My Orders', icon: CreditCard },
    { id: 'escrow', label: 'Escrow Transactions', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">MkulimaNet Wallet</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <Wallet className="h-5 w-5 inline mr-2" />
                Add Money
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as 'dashboard' | 'orders' | 'escrow' | 'analytics' | 'security')}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeSection === item.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'dashboard' && (
          <WalletDashboard />
        )}
        
        {activeSection === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
            <div className="text-center py-12">
              <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Management</h3>
              <p className="text-gray-500 mb-6">
                Track your purchases, manage deliveries, and view order history
              </p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                View My Orders
              </button>
            </div>
          </div>
        )}
        
        {activeSection === 'escrow' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Escrow Transactions</h2>
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Transactions</h3>
              <p className="text-gray-500 mb-6">
                Manage your escrow transactions and ensure secure payments
              </p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                View Escrow Transactions
              </button>
            </div>
          </div>
        )}
        
        {activeSection === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Insights</h2>
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Insights</h3>
              <p className="text-gray-500 mb-6">
                Track your spending, earnings, and marketplace performance
              </p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        )}
        
        {activeSection === 'security' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Account Security</h3>
              <p className="text-gray-500 mb-6">
                Manage your PIN, 2FA, and security preferences
              </p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                Security Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}