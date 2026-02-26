'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  QrCode,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'card' | 'bank' | 'qr';
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isAvailable: boolean;
}

export default function PaymentMethods() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [processing, setProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mpesa',
      type: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay with Safaricom M-Pesa STK Push',
      icon: Smartphone,
      isAvailable: true
    },
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, and other major cards',
      icon: CreditCard,
      isAvailable: true
    },
    {
      id: 'bank',
      type: 'bank',
      name: 'Bank Transfer',
      description: 'Direct bank account transfer',
      icon: Building,
      isAvailable: true
    },
    {
      id: 'qr',
      type: 'qr',
      name: 'QR Code Payment',
      description: 'Scan QR code to pay instantly',
      icon: QrCode,
      isAvailable: false
    }
  ];

  const handlePayment = async (method: PaymentMethod) => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, this would integrate with actual payment gateways
      console.log(`Processing ${method.type} payment for KES ${amount}`);
      
      alert(`Payment of KES ${amount} via ${method.name} completed successfully!`);
      
      // Reset form
      setAmount('');
      setPhoneNumber('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setBankAccount('');
      setSelectedMethod(null);
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value: string) => {
    const number = parseFloat(value);
    if (isNaN(number)) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => window.history.back()}
          className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Add Money to Wallet</h2>
      </div>

      {/* Amount Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount to Add
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full text-3xl font-bold text-gray-900 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            {formatCurrency(amount || '0')}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Minimum amount: KES 50
        </p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>
        
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <div 
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedMethod === method.id 
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${!method.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => method.isAvailable && setSelectedMethod(method.id)}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`h-6 w-6 ${
                    selectedMethod === method.id ? 'text-green-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {!method.isAvailable && (
                  <div className="flex items-center text-sm text-gray-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Coming Soon
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Forms */}
      {selectedMethod && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Details
          </h3>

          {/* M-Pesa Form */}
          {selectedMethod === 'mpesa' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+254</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="712 345 678"
                    className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your M-Pesa registered phone number
                </p>
              </div>
            </div>
          )}

          {/* Card Form */}
          {selectedMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5))}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Form */}
          {selectedMethod === 'bank' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">Bank Transfer Instructions</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      After initiating the transfer, please allow 1-2 business days for the funds to reflect in your wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={() => handlePayment(paymentMethods.find(m => m.id === selectedMethod)!)}
            disabled={processing || !amount || parseFloat(amount) <= 0}
            className="w-full mt-6 bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              `Pay ${formatCurrency(amount || '0')}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}