'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your MkulimaNet account</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                footerActionLink: 'text-green-600 hover:text-green-700 font-medium',
              }
            }}
            signUpUrl="/sign-up"
          />
        </div>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-green-600 hover:text-green-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}