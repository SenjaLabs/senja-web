"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BearyNotFound } from '@/components/search/beary-not-found';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-senja-background via-senja-cream/30 to-senja-cream-light/40 p-4">
      <div className="w-full max-w-2xl">
        <BearyNotFound
          title="404 - Page Not Found"
          description="Oops! The page you're looking for seems to have wandered off. Let's get you back on track!"
          showRetry={false}
          showClearSearch={false}
          className="shadow-2xl"
        />
        
        {/* Custom Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
          <Button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Go to Home
            </div>
          </Button>

          <Button
            onClick={handleGoBack}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-8 rounded-lg border-2 hover:border-orange-300 transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </div>
          </Button>
        </div>

        {/* Additional Help Text */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            If you think this is a mistake, please{' '}
            <Link 
              href="/" 
              className="text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors duration-200"
            >
              contact support
            </Link>{' '}
            or return to the homepage.
          </p>
        </div>
      </div>
    </div>
  );
}
