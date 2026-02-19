'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users,
  ShoppingBag,
  Shield,
  Briefcase,
  Leaf,
  Smartphone,
  MessageCircle,
  Star,
  Check,
  ArrowRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Auth Buttons - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-4">
        <Link 
          href="/auth/login" 
          className="text-gray-700 hover:text-green-600 font-medium"
        >
          Log in
        </Link>
        <Link 
          href="/auth/register" 
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Register
        </Link>
      </div>
      
      {/* 1️⃣ HERO SECTION */}
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Connect. Grow. Sell. Work — All in One Agriculture Platform.
              </h1>
              <p className="text-lg text-gray-600 mb-10 max-w-xl">
                MkulimaNet connects farmers, buyers, and employers in one trusted digital ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-green-600 text-white font-medium rounded-lg shadow-lg hover:bg-green-700 transition duration-300 text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/dashboard/feed"
                  className="px-8 py-4 bg-white text-green-600 font-medium rounded-lg shadow-lg hover:bg-green-50 transition duration-300 text-center border border-green-200"
                >
                  Explore Feed
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-green-200 rounded-full flex items-center justify-center overflow-hidden border-8 border-white shadow-xl">
                  <img 
                    src="/home.jpg" 
                    alt="Agriculture in Kenya" 
                    className="w-full h-full object-cover"
                    width={320}
                    height={320}
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-xl p-4 w-48">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Leaf className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">10,000+</p>
                      <p className="text-xs text-gray-500">Active Farmers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ TRUST INDICATORS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Farmers Trust MkulimaNet</h2>
            <p className="text-xl text-gray-600">Built for Kenya&apos;s agricultural community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Farmers</h3>
              <p className="text-gray-600">
                Every farmer profile is verified for authenticity and trust
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <ShoppingBag className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Local Marketplace</h3>
              <p className="text-gray-600">
                Buy and sell agricultural products based on your location
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Messaging</h3>
              <p className="text-gray-600">
                Communicate safely with verified buyers and suppliers
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <Briefcase className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real Opportunities</h3>
              <p className="text-gray-600">
                Access genuine job opportunities and internships in agriculture
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3️⃣ HOW IT WORKS */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create Your Farmer Profile</h3>
              <p className="text-gray-600">
                Sign up and build your professional farming profile with farm details, skills, and experience
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Share & Connect</h3>
              <p className="text-gray-600">
                Share farm updates, sell products, find jobs, and connect with the agricultural community
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Grow Together</h3>
              <p className="text-gray-600">
                Build relationships with buyers, employers, and fellow farmers across Kenya
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ FEATURE HIGHLIGHTS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need in One Place</h2>
            <p className="text-xl text-gray-600">Designed for Kenya&apos;s agricultural community</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">Social Feed for Farmers</h3>
                    <p className="text-gray-600 mt-1">Share farm activities, connect with peers, and build your agricultural network</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-green-100 p-3 rounded-full">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">Marketplace for Crops & Animals</h3>
                    <p className="text-gray-600 mt-1">Buy and sell agricultural products based on your location</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">Professional Farmer Profiles</h3>
                    <p className="text-gray-600 mt-1">Showcase your farm, skills, certifications, and build credibility</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Briefcase className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">Jobs & Internships</h3>
                    <p className="text-gray-600 mt-1">Find agricultural opportunities and connect with employers</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-green-100 p-3 rounded-full">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">Messaging & Networking</h3>
                    <p className="text-gray-600 mt-1">Communicate safely with verified buyers, suppliers, and employers</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-2xl p-8 w-full max-w-md">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">John Kariuki</p>
                      <p className="text-sm text-gray-500">Nakuru County</p>
                    </div>
                  </div>
                  <p className="text-gray-700">Just harvested 50 bags of organic maize! Quality produce available for sale.</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Fresh Tomatoes</p>
                      <p className="text-sm text-gray-500">Ksh 200/bag</p>
                    </div>
                  </div>
                  <p className="text-gray-700">Organic tomatoes from Kiambu County. Available for immediate pickup.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ COMMUNITY PREVIEW */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Growing Community</h2>
            <p className="text-xl text-gray-600">See what farmers are sharing today</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Mary Wanjiru</p>
                  <p className="text-sm text-gray-500">Kiambu County</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">New dairy cows arrived today! Looking forward to increased milk production. #Livestock #Farming</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>2 hours ago</span>
                <span className="mx-2">•</span>
                <span>42 likes</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Peter Mwangi</p>
                  <p className="text-sm text-gray-500">Nyeri County</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">Soil testing completed. pH levels perfect for coffee farming in this region. #Coffee #SoilHealth</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>5 hours ago</span>
                <span className="mx-2">•</span>
                <span>28 likes</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Sarah Kimani</p>
                  <p className="text-sm text-gray-500">Nakuru County</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">Organic vegetables available for pickup. Fresh harvest daily! #Organic #Vegetables</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>1 day ago</span>
                <span className="mx-2">•</span>
                <span>15 likes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ CALL TO ACTION */}
      <section className="py-20 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join thousands of farmers growing together</h2>
          <p className="text-xl mb-10 text-green-100">
            Connect with Kenya&apos;s agricultural community today
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-12 py-4 bg-white text-green-700 font-bold rounded-lg shadow-lg hover:bg-green-50 transition duration-300 text-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* 7️⃣ FOOTER */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <span className="text-xl font-bold">MkulimaNet</span>
              </div>
              <p className="text-gray-400 mb-4">
                Kenya&apos;s premier agriculture social network and marketplace connecting farmers, buyers, and suppliers.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Mail className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Phone className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <MapPin className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard/feed" className="text-gray-400 hover:text-white">Social Feed</Link></li>
                <li><Link href="/dashboard/feed" className="text-gray-400 hover:text-white">Marketplace</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Jobs Board</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Farmer Profiles</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2026 MkulimaNet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}