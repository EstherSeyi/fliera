import React from 'react';

export const MyEventCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3 animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="h-16 w-16 rounded-lg bg-gray-200 flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>

      <div className="flex space-x-2 pt-2">
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};