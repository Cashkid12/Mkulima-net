'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart,
  X,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  MapPin,
  CreditCard,
  Shield,
  AlertCircle
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  unit: string;
  images: string[];
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    location?: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.product._id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item => 
      item.product._id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const total = getTotalPrice();
    return total > 5000 ? 0 : 500; // Free shipping over KES 5,000
  };

  const getTotalWithShipping = () => {
    return getTotalPrice() + getShippingCost();
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCheckout = () => {
    // Save cart to localStorage for checkout page
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    router.push('/dashboard/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard/products')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Marketplace
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {getTotalItems()} items
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cart.length === 0 ? (
          // Empty Cart
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <button
              onClick={() => router.push('/dashboard/products')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">Cart Items ({getTotalItems()})</h2>
                </div>
                
                <div className="divide-y">
                  {cart.map((item) => (
                    <div key={item.product._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.images[0] || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-20 h-20 rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {item.product.name}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {item.product.description}
                              </p>
                              <div className="flex items-center text-sm text-gray-500">
                                <span>Seller: {item.product.seller.firstName} {item.product.seller.lastName}</span>
                                {item.product.seller.location && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <div className="flex items-center">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {item.product.seller.location}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          
                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(item.product.price, item.product.currency)}
                              </div>
                              <div className="text-gray-500">× {item.product.unit}</div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Item Total */}
                          <div className="mt-3 text-right">
                            <span className="text-lg font-semibold text-gray-900">
                              {formatCurrency(item.product.price * item.quantity, item.product.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">Shipping</span>
                    </div>
                    <span className="font-medium">
                      {getShippingCost() > 0 ? formatCurrency(getShippingCost()) : 'Free'}
                    </span>
                  </div>
                  
                  {getShippingCost() > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-800">
                          Add {formatCurrency(5000 - getTotalPrice())} more for free shipping
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(getTotalWithShipping())}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </button>
                  
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Secure Payment
                  </button>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-gray-900 mb-3">Why shop with us?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <Shield className="h-4 w-4 text-green-500 mr-2" />
                      Secure escrow payments
                    </li>
                    <li className="flex items-center">
                      <Truck className="h-4 w-4 text-green-500 mr-2" />
                      Fast and reliable delivery
                    </li>
                    <li className="flex items-center">
                      <Shield className="h-4 w-4 text-green-500 mr-2" />
                      Buyer protection guarantee
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}