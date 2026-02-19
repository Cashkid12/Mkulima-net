'use client';

import { useRouter } from 'next/navigation';
import { Leaf, Users, ShoppingBag, BookOpen } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">


      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl text-center">
          {/* Logo/Brand Section */}
          <div className="mb-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Leaf className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to MkulimaNet
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kenya&#39;s premier agriculture social network and marketplace connecting farmers, buyers, and suppliers
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect with Farmers</h3>
              <p className="text-gray-600 text-sm">Join our community of verified farmers across Kenya</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Marketplace</h3>
              <p className="text-gray-600 text-sm">Buy and sell agricultural products based on location</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Learn & Grow</h3>
              <p className="text-gray-600 text-sm">Access farming tips and best practices from experts</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/auth/register')}
              className="px-8"
            >
              Create Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/auth/login')}
              className="px-8"
            >
              Login
            </Button>
          </div>

          <p className="mt-8 text-gray-500 text-sm">
            Join thousands of farmers already growing their business with MkulimaNet
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2026 MkulimaNet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}