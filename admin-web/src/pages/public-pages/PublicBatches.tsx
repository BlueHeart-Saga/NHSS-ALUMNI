import React, { useEffect, useState } from 'react';
import { GraduationCap, Search, Users, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export const PublicBatches: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublicBatches().then(setBatches).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredBatches = batches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.passing_year.toString().includes(search)
  );

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#111111] tracking-tight">
            School Passing Year Batches
          </h1>
         
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {/* Search Bar */}
        <div className="max-w-lg mx-auto relative">
          <Search className="w-6 h-6 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by passing year or batch name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-5 py-4 bg-white border-2 border-[#E5E7EB] rounded-2xl text-lg font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] shadow-sm"
          />
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-md hover:border-[#F4C542] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Bottom-to-Top Glass Fill Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/90 via-[#FFF7D6]/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />

              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#111111] font-semibold text-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-7 h-7 text-[#111111]" />
                    </div>
                    <span className="text-sm font-semibold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/60 px-3.5 py-1 rounded-full">
                      Year {batch.passing_year}
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold text-[#111111]">{batch.name}</h3>
                  <p className="text-sm font-semibold text-gray-500 mt-1">Verified Alumni Cohort</p>
                </div>

                <div className="pt-5 border-t border-gray-200 mt-6 space-y-3.5">
                  <div className="flex items-center justify-between text-base font-semibold text-[#111111]">
                    <span className="flex items-center space-x-2 text-gray-600 font-normal">
                      <Users className="w-5 h-5 text-[#854D0E]" />
                      <span>Members:</span>
                    </span>
                    <span>{batch.total_members} Alumni</span>
                  </div>

                  <Link
                    to="/login"
                    className="w-full py-3.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 border border-[#E0B030]"
                  >
                    <span>View Batch Roster</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
