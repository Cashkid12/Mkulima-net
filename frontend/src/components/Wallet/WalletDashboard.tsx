'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  History,
  User,
  Building,
  Shield,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';

interface WalletData {
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  accountNumber: string;
  currency: string;
  trustScore: number;
  kycLevel: string;
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  reference: string;
}

export default function WalletDashboard() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'security'>('overview');
  
  const router = useRouter();

  // Form states
  const [depositData, setDepositData] = useState({
    amount: '',
    paymentMethod: 'mpesa',
    phoneNumber: ''
  });

  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    destination: '',
    pin: ''
  });

  const [transferData, setTransferData] = useState({
    amount: '',
    recipientAccount: '',
    description: '',
    pin: ''
  });

  const [pinData, setPinData] = useState({
    pin: '',
    confirmPin: ''
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // Fetch wallet data
      const walletResponse = await fetch(`${apiUrl}/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!walletResponse.ok) {
        throw new Error('Failed to fetch wallet data');
      }

      const walletData = await walletResponse.json();
      setWallet(walletData.wallet);
      
      // Fetch recent transactions
      const transactionsResponse = await fetch(`${apiUrl}/wallet/transactions?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data');
      setLoading(false);
    }
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/wallet/deposit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(depositData.amount),
          paymentMethod: depositData.paymentMethod,
          phoneNumber: depositData.phoneNumber
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowAddMoneyModal(false);
        setDepositData({ amount: '', paymentMethod: 'mpesa', phoneNumber: '' });
        // Refresh wallet data
        fetchWalletData();
      } else {
        setError(data.message || 'Failed to add money');
      }
    } catch (err) {
      setError('Failed to add money');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawData.amount),
          destination: withdrawData.destination,
          pin: withdrawData.pin
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowWithdrawModal(false);
        setWithdrawData({ amount: '', destination: '', pin: '' });
        // Refresh wallet data
        fetchWalletData();
      } else {
        setError(data.message || 'Failed to withdraw money');
      }
    } catch (err) {
      setError('Failed to withdraw money');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/wallet/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(transferData.amount),
          recipientAccount: transferData.recipientAccount,
          description: transferData.description,
          pin: transferData.pin
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowTransferModal(false);
        setTransferData({ amount: '', recipientAccount: '', description: '', pin: '' });
        // Refresh wallet data
        fetchWalletData();
      } else {
        setError(data.message || 'Failed to transfer money');
      }
    } catch (err) {
      setError('Failed to transfer money');
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinData.pin !== pinData.confirmPin) {
      setError('PINs do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/wallet/pin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pin: pinData.pin
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowPinModal(false);
        setPinData({ pin: '', confirmPin: '' });
      } else {
        setError(data.message || 'Failed to set PIN');
      }
    } catch (err) {
      setError('Failed to set PIN');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'withdrawal': return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'transfer': return <ArrowUpRight className="h-5 w-5 text-blue-500" />;
      case 'payment': return <Minus className="h-5 w-5 text-red-500" />;
      case 'refund': return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      default: return <History className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-600';
      case 'withdrawal': return 'text-red-600';
      case 'transfer': return 'text-blue-600';
      case 'payment': return 'text-red-600';
      case 'refund': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getKycBadge = (level: string) => {
    switch (level) {
      case 'basic': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Basic</span>;
      case 'verified': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Verified</span>;
      case 'business': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Business</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Basic</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MkulimaNet Wallet</h1>
              <p className="text-gray-600">Manage your agricultural transactions securely</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                {balanceVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
              >
                <User className="h-5 w-5 text-green-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Wallet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Balance Card */}
          <div className="md:col-span-2 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Available Balance</h2>
                <p className="text-green-100">Your wallet balance</p>
              </div>
              <Wallet className="h-8 w-8 text-green-200" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {balanceVisible ? `KES ${wallet?.balance.toLocaleString() || '0'}` : '••••••'}
            </div>
            <div className="flex items-center space-x-4 text-green-100">
              <span className="text-sm">Account: {wallet?.accountNumber}</span>
              {wallet && getKycBadge(wallet.kycLevel)}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Trust Score</p>
                  <p className={`text-xl font-bold ${wallet ? getTrustScoreColor(wallet.trustScore) : 'text-gray-900'}`}>
                    {wallet?.trustScore || 0}/100
                  </p>
                </div>
                <Shield className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Balance</p>
                  <p className="text-xl font-bold text-orange-600">
                    {balanceVisible ? `KES ${wallet?.pendingBalance.toLocaleString() || '0'}` : '••••••'}
                  </p>
                </div>
                <AlertCircle className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowAddMoneyModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Money</span>
          </button>
          
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl p-4 flex items-center justify-center space-x-2 transition-colors"
          >
            <Minus className="h-5 w-5" />
            <span className="font-medium">Withdraw</span>
          </button>
          
          <button
            onClick={() => setShowTransferModal(true)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl p-4 flex items-center justify-center space-x-2 transition-colors"
          >
            <ArrowUpRight className="h-5 w-5" />
            <span className="font-medium">Transfer</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: Wallet },
                { id: 'transactions', label: 'Transactions', icon: History },
                { id: 'security', label: 'Security', icon: Lock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                              {transaction.type === 'deposit' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No transactions yet</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Tips</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Enable 2FA</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Set Transaction PIN</h4>
                        <p className="text-sm text-gray-600">Protect your transactions with a 4-digit PIN</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Monitor Activity</h4>
                        <p className="text-sm text-gray-600">Regularly check your transaction history</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getTransactionIcon(transaction.type)}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {transaction.description}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Ref: {transaction.reference}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === 'deposit' ? '+' : ''}{transaction.type === 'withdrawal' ? '-' : ''}KES {transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Transaction PIN</h4>
                        <p className="text-sm text-gray-600">Set up a 4-digit PIN for transactions</p>
                      </div>
                      <button
                        onClick={() => setShowPinModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Set PIN
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add extra security to your account</p>
                      </div>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Verification</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Basic Verification</h4>
                      </div>
                      <p className="text-sm text-blue-800 mb-3">
                        Complete your profile to unlock basic features
                      </p>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                        Complete Profile
                      </button>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-900">Verified Account</h4>
                      </div>
                      <p className="text-sm text-green-800 mb-3">
                        Upload ID documents to get verified and increase limits
                      </p>
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                        Get Verified
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Money</h3>
                <button
                  onClick={() => setShowAddMoneyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddMoney} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={depositData.amount}
                    onChange={(e) => setDepositData({...depositData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={depositData.paymentMethod}
                    onChange={(e) => setDepositData({...depositData, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={depositData.phoneNumber}
                    onChange={(e) => setDepositData({...depositData, phoneNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="2547..."
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMoneyModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Money
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Withdraw Money</h3>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={withdrawData.amount}
                    onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={withdrawData.destination}
                    onChange={(e) => setWithdrawData({...withdrawData, destination: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="M-Pesa number or bank account"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction PIN
                  </label>
                  <input
                    type="password"
                    value={withdrawData.pin}
                    onChange={(e) => setWithdrawData({...withdrawData, pin: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter 4-digit PIN"
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Withdraw
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Transfer Money</h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Account Number
                  </label>
                  <input
                    type="text"
                    value={transferData.recipientAccount}
                    onChange={(e) => setTransferData({...transferData, recipientAccount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="MN1234567890"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={transferData.description}
                    onChange={(e) => setTransferData({...transferData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Payment for..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction PIN
                  </label>
                  <input
                    type="password"
                    value={transferData.pin}
                    onChange={(e) => setTransferData({...transferData, pin: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter 4-digit PIN"
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Set Transaction PIN</h3>
                <button
                  onClick={() => setShowPinModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSetPin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4-Digit PIN
                  </label>
                  <input
                    type="password"
                    value={pinData.pin}
                    onChange={(e) => setPinData({...pinData, pin: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    value={pinData.confirmPin}
                    onChange={(e) => setPinData({...pinData, confirmPin: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Confirm 4-digit PIN"
                    maxLength={4}
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Set PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}