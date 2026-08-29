import React from 'react';
import { ArrowRight } from 'lucide-react';

interface MemoryItem {
  id: string;
  title: string;
  image_url: string;
  uploader_name: string;
}

interface MemoriesPreviewProps {
  memories: MemoryItem[];
  onViewAllClick: () => void;
}

export const MemoriesPreview: React.FC<MemoriesPreviewProps> = ({ memories, onViewAllClick }) => {
  return (
    <section id="memories-gallery" className="py-24 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            {/* <span className="text-sm font-semibold text-[#854D0E] bg-[#FFF7D6] border-2 border-[#F4C542] px-5 py-2 rounded-full uppercase tracking-wider">
              MEMORIES & NOSTALGIA
            </span> */}
            <h2 className="text-4xl sm:text-5xl font-semibold text-[#111111] tracking-tight pt-2">
              Relive Your Best Campus Moments
            </h2>
            {/* <p className="text-lg text-gray-600 font-normal mt-2 max-w-2xl">
              From annual sports days to farewell nights, browse photo memories uploaded by alumni across passing cohorts.
            </p> */}
          </div>

          <button
            onClick={onViewAllClick}
            className="inline-flex items-center space-x-2.5 text-base font-semibold text-[#111111] hover:text-[#854D0E] bg-white border-2 border-[#E5E7EB] hover:border-[#F4C542] hover:bg-[#FFF7D6]/40 px-7 py-4 rounded-2xl transition-all shadow-xs"
          >
            <span>View Alumni Memories</span>
            <ArrowRight className="w-5 h-5 text-[#F4C542]" />
          </button>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white border-2 border-[#E5E7EB] rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl hover:border-[#F4C542] transition-all group relative h-60 cursor-pointer"
              onClick={onViewAllClick}
            >
              <img
                src={memory.image_url}
                alt={memory.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <span className="text-base font-semibold text-[#F4C542] truncate">{memory.title}</span>
                <span className="text-sm text-gray-300 font-normal">{memory.uploader_name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
