'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, MessageSquare, Bell, User, Settings, Package, Briefcase, Mail, Users, Wallet } from 'lucide-react';
import NotificationDropdown from '@/components/NotificationDropdown';
import WeatherWidget from '@/components/weather/WeatherWidget';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    // PERSONAL ANALYTICS GROUP
    { name: 'Dashboard', href: '/dashboard/dashboard-home', current: pathname === '/dashboard/dashboard-home', icon: Home },
    
    // SOCIAL FEED GROUP
    { name: 'Feed', href: '/dashboard/feed', current: pathname === '/dashboard/feed', icon: Users },
    
    // CONTENT MANAGEMENT GROUP
    { name: 'My Posts', href: '/dashboard/posts', current: pathname === '/dashboard/posts', icon: MessageSquare },
    { name: 'Create Post', href: '/dashboard/posts/create', current: pathname === '/dashboard/posts/create', icon: Package },
    
    // PROFESSIONAL OPPORTUNITIES GROUP
    { name: 'Jobs', href: '/dashboard/jobs', current: pathname === '/dashboard/jobs', icon: Briefcase },
    { name: 'Marketplace', href: '/marketplace', current: pathname.startsWith('/marketplace'), icon: ShoppingBag },
    { name: 'Wallet', href: '/dashboard/wallet', current: pathname === '/dashboard/wallet', icon: Wallet },
    
    // COMMUNICATION GROUP
    { name: 'Messages', href: '/messages', current: pathname.startsWith('/messages'), icon: Mail },
    { name: 'Communities', href: '/communities', current: pathname.startsWith('/communities'), icon: Users },
    { name: 'Notifications', href: '/notifications', current: pathname === '/notifications', icon: Bell },
    
    // ACCOUNT GROUP
    { name: 'Profile', href: '/dashboard/profile', current: pathname === '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/settings', current: pathname === '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-30">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-lg">

          
          {/* Navigation Groups */}
          <div className="flex-1 flex flex-col overflow-y-auto py-6 px-4 space-y-8">
            {/* PERSONAL ANALYTICS GROUP */}
            <div>
              <div className="px-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Personal Analytics</span>
              </div>
              <nav className="space-y-1">
                {navigation.filter(item => ['Dashboard'].includes(item.name)).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-500 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        item.current ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-600'
                      } mr-3 h-5 w-5 flex-shrink-0`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* SOCIAL FEED GROUP */}
            <div>
              <div className="px-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Social Feed</span>
              </div>
              <nav className="space-y-1">
                {navigation.filter(item => ['Feed'].includes(item.name)).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-500 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        item.current ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-600'
                      } mr-3 h-5 w-5 flex-shrink-0`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* CONTENT MANAGEMENT GROUP */}
            <div>
              <div className="px-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Content Management</span>
              </div>
              <nav className="space-y-1">
                {navigation.filter(item => ['My Posts', 'Create Post'].includes(item.name)).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-500 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        item.current ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-600'
                      } mr-3 h-5 w-5 flex-shrink-0`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* PROFESSIONAL OPPORTUNITIES GROUP */}
            <div>
              <div className="px-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Opportunities</span>
              </div>
              <nav className="space-y-1">
                {navigation.filter(item => ['Jobs', 'Marketplace', 'Wallet'].includes(item.name)).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-500 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        item.current ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-600'
                      } mr-3 h-5 w-5 flex-shrink-0`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* COMMUNICATION GROUP */}
            <div>
              <div className="px-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Communication</span>
              </div>
              <nav className="space-y-1">
                {navigation.filter(item => ['Messages', 'Notifications'].includes(item.name)).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-500 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        item.current ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-600'
                      } mr-3 h-5 w-5 flex-shrink-0`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* ACCOUNT GROUP */}
            <div className="mt-auto">
              <div className="px-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account</span>
              </div>
              <nav className="space-y-1">
                {navigation.filter(item => ['Profile', 'Settings'].includes(item.name)).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-500 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        item.current ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-600'
                      } mr-3 h-5 w-5 flex-shrink-0`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:hidden fixed inset-0 z-40 flex`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        <div className="relative flex-1 flex flex-col w-full max-w-xs bg-white shadow-xl">
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">

            
            {/* Navigation Groups - Mobile */}
            <div className="mt-5 px-4 space-y-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-3 text-base font-medium rounded-lg`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`${
                      item.current ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-600'
                    } mr-3 h-5 w-5 flex-shrink-0`}
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Desktop Header with Notifications and Weather */}
        <header className="hidden md:flex sticky top-0 z-20 bg-white border-b border-gray-200 h-16 items-center justify-between px-6 shadow-sm">
          <div className="flex items-center">
            <WeatherWidget />
          </div>
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" />
              {/* Unread badge - would be dynamic */}
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80">
                <NotificationDropdown onClose={() => setNotificationOpen(false)} />
              </div>
            )}
          </div>
        </header>

        {/* Mobile Header */}
        <header className="sticky top-0 z-20 md:hidden bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3">
              <WeatherWidget />
              
              {/* Mobile Notification Bell */}
              <Link
                href="/notifications"
                className="relative p-2 text-gray-500 hover:text-gray-700"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}