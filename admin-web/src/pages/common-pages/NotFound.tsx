import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-2xl flex items-center justify-center mx-auto text-[#111111]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-[#111111]">404 - Page Not Found</h1>
          <p className="text-xs text-[#6B7280] mt-2">
            The page or resource you requested could not be found or has been moved.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#111111] text-white font-bold text-xs rounded-xl hover:bg-black transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Home Page
        </Link>
      </div>
    </div>
  );
};
