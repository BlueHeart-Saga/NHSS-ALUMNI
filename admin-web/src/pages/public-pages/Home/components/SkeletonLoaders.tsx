import React from 'react';

export const EventsSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {[1, 2].map((i) => (
      <div key={i} className="bg-gray-100 border-2 border-gray-200 rounded-3xl overflow-hidden flex flex-col md:flex-row h-64 md:h-56">
        <div className="md:w-5/12 bg-gray-200 h-full shrink-0" />
        <div className="p-6 md:w-7/12 space-y-4 flex flex-col justify-between w-full">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-md w-1/3" />
            <div className="h-6 bg-gray-200 rounded-md w-3/4" />
            <div className="h-4 bg-gray-200 rounded-md w-full" />
          </div>
          <div className="h-10 bg-gray-200 rounded-xl w-36" />
        </div>
      </div>
    ))}
  </div>
);

export const BatchCirclesSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 sm:gap-8 justify-items-center max-w-4xl mx-auto pt-2 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex flex-col items-center space-y-3">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 border-2 border-gray-300" />
        <div className="h-4 bg-gray-200 rounded-md w-20" />
        <div className="h-3 bg-gray-200 rounded-md w-16" />
      </div>
    ))}
  </div>
);

export const HighlightsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-gray-100 border border-gray-200 rounded-3xl p-5 space-y-4 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-gray-200" />
        <div className="h-5 bg-gray-200 rounded-md w-3/4" />
        <div className="h-4 bg-gray-200 rounded-md w-1/2" />
        <div className="h-3 bg-gray-200 rounded-md w-2/3" />
      </div>
    ))}
  </div>
);

export const MemoriesSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="h-44 sm:h-52 bg-gray-200 rounded-2xl border border-gray-300" />
    ))}
  </div>
);

export const NewsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-gray-100 border border-gray-200 rounded-3xl p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded-md w-1/4" />
        <div className="h-6 bg-gray-200 rounded-md w-4/5" />
        <div className="h-12 bg-gray-200 rounded-md w-full" />
      </div>
    ))}
  </div>
);

export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-gray-100 border border-gray-200 rounded-3xl p-6 text-center space-y-2">
        <div className="h-8 bg-gray-200 rounded-md w-1/2 mx-auto" />
        <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto" />
      </div>
    ))}
  </div>
);
