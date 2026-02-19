'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h2>
          
          <p className="text-gray-600 mb-8">
            We&#39;ve sent a password reset link to <span className="font-medium">{email}</span>. 
            Please check your inbox and follow the instructions to reset your password.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              Didn&#39;t receive the email? Check your spam folder or 
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="font-medium text-blue-600 hover:text-blue-500 ml-1"
              >
                try again
              </button>
            </p>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/auth/login')}
            fullWidth
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-700 p-12 flex-col justify-center text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Forgot Your Password?</h1>
          <p className="text-xl mb-8 opacity-90">
            No worries! We&#39;ll send you a link to reset your password.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="font-semibold mb-3">Password Reset Instructions</h3>
            <ul className="text-sm opacity-80 space-y-2">
              <li>• Enter your email address</li>
              <li>• Check your inbox for reset link</li>
              <li>• Follow the link to create new password</li>
              <li>• Login with your new password</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
            <p className="text-gray-600">
              Enter your email address and we&#39;ll send you a link to reset your password
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              error={!email && error ? error : ''}
              icon={Mail}
              placeholder="you@example.com"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
            >
              Send Reset Link
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-500">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}