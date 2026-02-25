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

  const trustIndicators = [
    {
      icon: Shield,
      title: "Verified Farmer Profiles",
      description: "Every farmer is verified to build trust and transparency across the platform."
    },
    {
      icon: ShoppingBag,
      title: "Smart Local Marketplace",
      description: "Buy and sell crops, livestock, and farm inputs based on your location."
    },
    {
      icon: MessageCircle,
      title: "Secure Communication",
      description: "Chat safely with buyers, suppliers, and employers inside the platform."
    },
    {
      icon: Briefcase,
      title: "Real Agricultural Opportunities",
      description: "Access verified jobs, internships, and agribusiness partnerships."
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Social Feed for Farmers",
      description: "Share farm updates, learn from others, and grow your network."
    },
    {
      icon: ShoppingBag,
      title: "Local Marketplace",
      description: "Buy and sell crops, livestock, and farm inputs."
    },
    {
      icon: Shield,
      title: "Professional Profiles",
      description: "Build credibility and showcase your farming expertise."
    },
    {
      icon: Briefcase,
      title: "Jobs & Internships",
      description: "Find agricultural jobs, internships, and farm partnerships."
    },
    {
      icon: MessageCircle,
      title: "Secure Messaging",
      description: "Communicate directly with verified users."
    },
    {
      icon: ShoppingBag,
      title: "Farm Services",
      description: "Access equipment rental, consulting, and technical services."
    }
  ];

  const samplePosts = [
    {
      id: 1,
      farmer: "Mary Wanjiru",
      location: "Kiambu County",
      content: "New dairy cows arrived today! Excited for increased milk production.",
      time: "2 hours ago",
      likes: 42,
      image: "/placeholder-farm-1.jpg"
    },
    {
      id: 2,
      farmer: "Peter Mwangi",
      location: "Nyeri County",
      content: "Soil testing completed. Perfect pH for coffee farming.",
      time: "5 hours ago",
      likes: 28,
      image: "/placeholder-farm-2.jpg"
    },
    {
      id: 3,
      farmer: "Sarah Kimani",
      location: "Nakuru County",
      content: "Fresh organic vegetables available for pickup.",
      time: "1 day ago",
      likes: 15,
      image: "/placeholder-farm-3.jpg"
    }
  ];

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
                    <h3 className="text-lg font-bold text-gray-900">Jobs & Employment</h3>
                    <p className="text-gray-600 mt-1">Find agricultural jobs, internships, and partnership opportunities</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Join thousands of farmers already growing together</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Free to join and use</span>
                </div>
                
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Verified farmer community</span>
                </div>
                
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Secure transactions</span>
                </div>
                
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Local marketplace connections</span>
                </div>
                
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">24/7 customer support</span>
                </div>
              </div>
              
              <Link 
                href="/auth/register"
                className="mt-8 block w-full py-4 bg-green-600 text-white text-center font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ TESTIMONIALS */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Farmers Are Saying</h2>
            <p className="text-xl text-gray-600">Real stories from our community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-600 mb-6 italic">
                {"\"MkulimaNet helped me sell my maize harvest to buyers in Nairobi within days. The platform is a game-changer for us farmers!\""}
              </p>
              <div className="flex items-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">JM</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">John Mwangi</p>
                  <p className="text-sm text-gray-600">Maize Farmer, Nakuru</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-600 mb-6 italic">
                {"\"I found my current job through MkulimaNet. The job board has genuine opportunities for agricultural professionals.\""}
              </p>
              <div className="flex items-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">SW</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah Wanjiku</p>
                  <p className="text-sm text-gray-600">Agricultural Engineer</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-600 mb-6 italic">
                {"\"The community aspect is amazing. I've learned so much from other farmers and made valuable business connections.\""}
              </p>
              <div className="flex items-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">DK</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">David Kiprotich</p>
                  <p className="text-sm text-gray-600">Coffee Farmer, Kericho</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Agricultural Business?
          </h2>
          <p className="text-xl text-green-100 mb-10">
            Join thousands of farmers who are already growing together on MkulimaNet.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="px-8 py-4 bg-white text-green-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-colors text-center"
            >
              Get Started Free
            </Link>
            <Link 
              href="/auth/login" 
              className="px-8 py-4 bg-transparent text-white font-bold rounded-lg border-2 border-white hover:bg-white hover:text-green-600 transition-colors text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 7️⃣ FOOTER */}
      <SiteFooter />
    </div>
  );
}