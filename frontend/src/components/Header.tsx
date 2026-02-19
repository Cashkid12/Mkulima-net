'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';

export default function Header({ showAuthButtons = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Check if user is logged in
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token') !== null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">


          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard/feed" className="text-gray-700 hover:text-green-600 font-medium">
              Feed
            </Link>
            <Link href="/marketplace" className="text-gray-700 hover:text-green-600 font-medium">
              Marketplace
            </Link>
            <Link href="/dashboard/jobs" className="text-gray-700 hover:text-green-600 font-medium">
              Jobs
            </Link>
            {isLoggedIn ? (
              <Link href="/dashboard/profile" className="text-gray-700 hover:text-green-600 font-medium">
                Profile
              </Link>
            ) : null}
          </nav>

          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {showAuthButtons && !isLoggedIn ? (
              <>
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
              </>
            ) : isLoggedIn ? (
              <div className="relative">
                <button className="flex items-center text-gray-700 hover:text-green-600" aria-label="User menu">
                  <User className="h-6 w-6" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {showAuthButtons && !isLoggedIn && (
              <Link 
                href="/auth/login" 
                className="mr-4 text-gray-700 hover:text-green-600"
              >
                <User className="h-6 w-6" />
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/dashboard/feed" 
                className="text-gray-700 hover:text-green-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Feed
              </Link>
              <Link 
                href="/marketplace" 
                className="text-gray-700 hover:text-green-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link 
                href="/dashboard/jobs" 
                className="text-gray-700 hover:text-green-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Jobs
              </Link>
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/dashboard/profile" 
                    className="text-gray-700 hover:text-green-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center text-gray-700 hover:text-green-600 font-medium py-2 text-left"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : showAuthButtons ? (
                <>
                  <Link 
                    href="/auth/login" 
                    className="text-gray-700 hover:text-green-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}