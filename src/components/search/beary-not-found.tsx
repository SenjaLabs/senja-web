"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface BearyNotFoundProps {
  /** Search query that was not found */
  searchQuery?: string;
  /** Custom title for the not found message */
  title?: string;
  /** Custom description for the not found message */
  description?: string;
  /** Callback when user clicks retry button */
  onRetry?: () => void;
  /** Callback when user clicks clear search button */
  onClearSearch?: () => void;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Whether to show clear search button */
  showClearSearch?: boolean;
  /** Custom className */
  className?: string;
}

export const BearyNotFound = ({
  searchQuery,
  title = "No Results Found",
  description,
  onRetry,
  onClearSearch,
  showRetry = true,
  showClearSearch = true,
  className = "",
}: BearyNotFoundProps) => {
  const defaultDescription = searchQuery 
    ? `No results found for "${searchQuery}". Try adjusting your search terms.`
    : "No results found. Try adjusting your search terms.";

  return (
    <Card className={`w-full max-w-xl mx-auto bg-white/80 backdrop-blur-sm border border-orange-200/50 shadow-lg ${className}`}>
      <div className="p-6 text-center">
        {/* Beary Not Found Image */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 relative">
            <img
              src="/beary/beary-not-found.png"
              alt="Beary not found"
              className="w-full h-full object-contain animate-bounce"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {description || defaultDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </div>
            </Button>
          )}

          {showClearSearch && onClearSearch && (
            <Button
              onClick={onClearSearch}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-6 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Clear Search
              </div>
            </Button>
          )}
        </div>

      </div>
    </Card>
  );
};

BearyNotFound.displayName = 'BearyNotFound';
