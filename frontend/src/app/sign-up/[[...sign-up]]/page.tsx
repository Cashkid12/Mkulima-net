'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join MkulimaNet</h1>
          <p className="text-gray-600">Create your agricultural network account</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                footerActionLink: 'text-green-600 hover:text-green-700 font-medium',
              }
            }}
            signInUrl="/sign-in"
          />
        </div>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-green-600 hover:text-green-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}