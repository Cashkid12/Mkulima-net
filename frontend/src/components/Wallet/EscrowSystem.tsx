'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  User,
  Package,
  Calendar,
  DollarSign,
  Truck,
  MessageSquare
} from 'lucide-react';

interface EscrowTransaction {
  id: string;
  buyer: {
    id: string;
    name: string;
    profileImage?: string;
  };
  seller: {
    id: string;
    name: string;
    profileImage?: string;
  };
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  amount: number;
  status: 'created' | 'funded' | 'shipped' | 'delivered' | 'released' | 'cancelled' | 'disputed';
  createdAt: string;
  fundedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  releasedAt?: string;
  autoReleaseDate?: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  disputed: boolean;
  disputeReason?: string;
}

export default function EscrowSystem() {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockTransactions: EscrowTransaction[] = [
      {
        id: '1',
        buyer: {
          id: 'buyer1',
          name: 'John Kamau',
          profileImage: undefined
        },
        seller: {
          id: 'seller1',
          name: 'Sarah Mwangi',
          profileImage: undefined
        },
        product: {
          id: 'prod1',
          name: 'Organic Maize Seeds - 50kg',
          price: 2500,
          image: undefined
        },
        amount: 2500,
        status: 'shipped',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        fundedAt: new Date(Date.now() - 82800000).toISOString(), // 23 hours ago
        shippedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        buyerConfirmed: false,
        sellerConfirmed: true,
        disputed: false
      },
      {
        id: '2',
        buyer: {
          id: 'buyer2',
          name: 'Peter Kimani',
          profileImage: undefined
        },
        seller: {
          id: 'seller2',
          name: 'Mary Wanjiru',
          profileImage: undefined
        },
        product: {
          id: 'prod2',
          name: 'Dairy Cattle - 2 Year Old Heifer',
          price: 45000,
          image: undefined
        },
        amount: 45000,
        status: 'delivered',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        fundedAt: new Date(Date.now() - 169200000).toISOString(), // 23 hours ago
        shippedAt: new Date(Date.now() - 129600000).toISOString(), // 36 hours ago
        deliveredAt: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
        autoReleaseDate: new Date(Date.now() + 518400000).toISOString(), // 6 days from now
        buyerConfirmed: false,
        sellerConfirmed: true,
        disputed: false
      },
      {
        id: '3',
        buyer: {
          id: 'buyer3',
          name: 'James Ochieng',
          profileImage: undefined
        },
        seller: {
          id: 'seller3',
          name: 'Grace Njeri',
          profileImage: undefined
        },
        product: {
          id: 'prod3',
          name: 'Tomato Seedlings - 1000 plants',
          price: 3500,
          image: undefined
        },
        amount: 3500,
        status: 'released',
        createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
        fundedAt: new Date(Date.now() - 590400000).toISOString(), // 6 days ago
        shippedAt: new Date(Date.now() - 547200000).toISOString(), // 5 days ago
        deliveredAt: new Date(Date.now() - 504000000).toISOString(), // 4 days ago
        releasedAt: new Date(Date.now() - 460800000).toISOString(), // 3 days ago
        buyerConfirmed: true,
        sellerConfirmed: true,
        disputed: false
      }
    ];

    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { icon: React.ComponentType, color: string, text: string }> = {
      'created': { icon: Clock, color: 'text-yellow-600', text: 'Awaiting Payment' },
      'funded': { icon: DollarSign, color: 'text-blue-600', text: 'Payment Received' },
      'shipped': { icon: Truck, color: 'text-indigo-600', text: 'Item Shipped' },
      'delivered': { icon: CheckCircle, color: 'text-green-600', text: 'Delivered' },
      'released': { icon: CheckCircle, color: 'text-green-600', text: 'Completed' },
      'cancelled': { icon: XCircle, color: 'text-red-600', text: 'Cancelled' },
      'disputed': { icon: AlertCircle, color: 'text-orange-600', text: 'Disputed' }
    };
    return statusMap[status] || { icon: Clock, color: 'text-gray-600', text: status };
  };

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleConfirmDelivery = (transactionId: string) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === transactionId 
        ? { ...tx, status: 'delivered', deliveredAt: new Date().toISOString(), buyerConfirmed: true }
        : tx
    ));
  };

  const handleReleaseFunds = (transactionId: string) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === transactionId 
        ? { ...tx, status: 'released', releasedAt: new Date().toISOString() }
        : tx
    ));
  };

  const handleOpenDispute = (transaction: EscrowTransaction) => {
    setSelectedTransaction(transaction);
    setShowDisputeModal(true);
  };

  const handleSubmitDispute = () => {
    if (selectedTransaction && disputeReason) {
      setTransactions(prev => prev.map(tx => 
        tx.id === selectedTransaction.id 
          ? { ...tx, status: 'disputed', disputed: true, disputeReason }
          : tx
      ));
      setShowDisputeModal(false);
      setDisputeReason('');
      setSelectedTransaction(null);
    }
  };

  const getTransactionTimeline = (transaction: EscrowTransaction) => {
    const timeline = [];
    
    timeline.push({
      event: 'Order Created',
      timestamp: transaction.createdAt,
      completed: true
    });
    
    if (transaction.fundedAt) {
      timeline.push({
        event: 'Payment Received',
        timestamp: transaction.fundedAt,
        completed: true
      });
    }
    
    if (transaction.shippedAt) {
      timeline.push({
        event: 'Item Shipped',
        timestamp: transaction.shippedAt,
        completed: true
      });
    }
    
    if (transaction.deliveredAt) {
      timeline.push({
        event: 'Delivery Confirmed',
        timestamp: transaction.deliveredAt,
        completed: true
      });
    }
    
    if (transaction.releasedAt) {
      timeline.push({
        event: 'Funds Released',
        timestamp: transaction.releasedAt,
        completed: true
      });
    }
    
    return timeline;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-green-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Escrow Transactions</h2>
        </div>
        <p className="text-gray-600 mt-2">
          Secure transactions with buyer protection
        </p>
      </div>

      <div className="p-6">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Escrow Transactions</h3>
            <p className="text-gray-500">Your secure transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {transactions.map((transaction) => {
              const StatusIcon = getStatusInfo(transaction.status).icon;
              return (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Transaction Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {transaction.product.name}
                            </h3>
                            <div className="flex items-center">
                              <StatusIcon />
                              <span className={`ml-2 text-sm font-medium ${getStatusInfo(transaction.status).color}`}>
                                {getStatusInfo(transaction.status).text}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="flex items-center">
                              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                              <div>
                                <p className="text-sm text-gray-500">Amount</p>
                                <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <User className="h-5 w-5 text-blue-600 mr-2" />
                              <div>
                                <p className="text-sm text-gray-500">Buyer</p>
                                <p className="font-medium text-gray-900">{transaction.buyer.name}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <Package className="h-5 w-5 text-purple-600 mr-2" />
                              <div>
                                <p className="text-sm text-gray-500">Seller</p>
                                <p className="font-medium text-gray-900">{transaction.seller.name}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="font-medium text-gray-900">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                      
                      {/* Timeline */}
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3">Transaction Timeline</h4>
                        <div className="flex flex-wrap gap-4">
                          {getTransactionTimeline(transaction).map((event, index) => (
                            <div key={index} className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${event.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <div className="ml-2">
                                <p className="text-sm font-medium text-gray-900">{event.event}</p>
                                <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                              </div>
                              {index < getTransactionTimeline(transaction).length - 1 && (
                                <div className="w-8 h-0.5 bg-gray-200 mx-2"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      {transaction.status === 'shipped' && !transaction.buyerConfirmed && (
                        <button
                          onClick={() => handleConfirmDelivery(transaction.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Delivery
                        </button>
                      )}
                      
                      {transaction.status === 'delivered' && transaction.buyerConfirmed && !transaction.disputed && (
                        <button
                          onClick={() => handleReleaseFunds(transaction.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Release Funds
                        </button>
                      )}
                      
                      {['shipped', 'delivered'].includes(transaction.status) && !transaction.disputed && (
                        <button
                          onClick={() => handleOpenDispute(transaction)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Open Dispute
                        </button>
                      )}
                      
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">Open Dispute</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Transaction: {selectedTransaction.product.name}
              </p>
              <p className="text-gray-600 text-sm">
                Amount: {formatCurrency(selectedTransaction.amount)}
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Dispute
              </label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe the issue with your transaction..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDisputeModal(false);
                  setDisputeReason('');
                  setSelectedTransaction(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDispute}
                disabled={!disputeReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}