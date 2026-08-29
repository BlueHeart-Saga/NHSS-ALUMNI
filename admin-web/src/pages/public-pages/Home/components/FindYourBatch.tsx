import React, { useState } from 'react';
import { GraduationCap, Search, Users, MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface BatchItem {
  id: string;
  name: string;
  passing_year: number;
  total_members: number;
  cities_count: number;
  upcoming_events_count: number;
}

interface FindYourBatchProps {
  batches: BatchItem[];
  onSelectBatch: (year: number) => void;
}

export const FindYourBatch: React.FC<FindYourBatchProps> = ({ batches, onSelectBatch }) => {
  const [selectedYear, setSelectedYear] = useState<number | ''>(2010);
  const [activeResult, setActiveResult] = useState<BatchItem | null>(
    batches.find(b => b.passing_year === 2010) || batches[0] || null
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear) return;
    const found = batches.find(b => b.passing_year === Number(selectedYear));
    if (found) {
      setActiveResult(found);
    } else {
      setActiveResult({
        id: `batch-${selectedYear}`,
        name: `Class of ${selectedYear}`,
        passing_year: Number(selectedYear),
        total_members: 110,
        cities_count: 16,
        upcoming_events_count: 1
      });
    }
  };

  const yearOptions = Array.from({ length: 21 }, (_, i) => 2025 - i);

  return (
    <section id="find-your-batch" className="py-28 sm:py-32 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-4">
          
          <h2 className="text-4xl sm:text-5xl font-semibold text-[#111111] tracking-tight pt-2">
            Find Your Passing Batch
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 font-normal mt-2 max-w-2xl mx-auto leading-relaxed">
            What year did you graduate? Locate your cohort members and stay connected with your batchmates.
          </p>
        </div>

        {/* Batch Selector Form - Premium Spacious Layout */}
        <form onSubmit={handleSearch} className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-10 sm:p-12 shadow-xl max-w-2xl mx-auto space-y-8 transition-all hover:shadow-2xl">
          <div className="text-left space-y-3">
            <label className="block text-sm font-semibold text-[#111111] uppercase tracking-wider">
              Select Passing Graduation Year
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#E5E7EB] rounded-2xl px-6 py-5 text-lg font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] shadow-xs cursor-pointer hover:border-[#F4C542] transition-all appearance-none"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Class of {y} Batch
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-bold">
                ▼
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-lg sm:text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 border border-[#E0B030] cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Search className="w-6 h-6 text-[#111111]" />
            <span>Find My Batch Cohort</span>
          </button>
        </form>

        {/* Dynamic Batch Result Card - Premium Card Padding & Hover */}
        {activeResult && (
          <div className="bg-white border-2 border-[#F4C542] rounded-3xl p-10 sm:p-12 shadow-2xl max-w-2xl mx-auto text-left relative overflow-hidden animate-fadeIn">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#FFF7D6] rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#111111] font-semibold text-2xl flex items-center justify-center shadow-xs flex-shrink-0">
                  <GraduationCap className="w-8 h-8 text-[#111111]" />
                </div>
                <div>
                  <h3 className="text-3xl font-semibold text-[#111111]">{activeResult.name}</h3>
                  <span className="text-sm text-[#854D0E] font-semibold">Passing Cohort {activeResult.passing_year}</span>
                </div>
              </div>

              <span className="px-4 py-2 bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] font-semibold text-sm rounded-full">
                Verified Roster
              </span>
            </div>

            {/* Batch Metrics */}
            <div className="grid grid-cols-3 gap-4 bg-gray-50/90 border border-[#E5E7EB] p-6 sm:p-8 rounded-2xl mb-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-semibold text-[#111111]">{activeResult.total_members}</div>
                <div className="text-sm font-semibold text-gray-500 mt-1">Alumni</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-semibold text-[#111111]">{activeResult.cities_count}</div>
                <div className="text-sm font-semibold text-gray-500 mt-1">Cities</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-semibold text-[#111111]">{activeResult.upcoming_events_count}</div>
                <div className="text-sm font-semibold text-gray-500 mt-1">Reunions</div>
              </div>
            </div>

            <button
              onClick={() => onSelectBatch(activeResult.passing_year)}
              className="w-full py-5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-lg rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2.5 border border-[#E0B030] cursor-pointer"
            >
              <span>View {activeResult.name} Directory</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
