import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export const PublicMemories: React.FC = () => {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  useEffect(() => {
    api.getPublicMemories().then(setMemories).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
       
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#111111] tracking-tight">
            Alumni Memory Gallery
          </h1>
         
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {memories.map((memory) => (
            <div
              key={memory.id}
              onClick={() => setActivePhoto(memory)}
              className="bg-white border-2 border-[#E5E7EB] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:border-[#F4C542] transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer relative"
            >
              <div className="h-60 overflow-hidden bg-gray-100 relative">
                <img
                  src={memory.image_url}
                  alt={memory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Bottom-to-Top Glass Fill Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-85 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end z-10">
                  <h3 className="text-base font-semibold text-[#F4C542] truncate">{memory.title}</h3>
                  <span className="text-sm text-gray-300 font-normal">Uploaded by {memory.uploader_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Memory Callout */}
        <div className="bg-white border-2 border-[#F4C542] rounded-3xl p-8 text-center space-y-4 shadow-xl max-w-2xl mx-auto relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/80 via-[#FFF7D6]/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />
          
          <div className="relative z-10 space-y-4">
            <h3 className="text-3xl font-semibold text-[#111111]">Have photos from your school days?</h3>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              Sign in to your alumni account to upload your batch photos to the permanent school memory archive.
            </p>
            <div className="flex justify-center pt-2">
              <Link
                to="/login"
                className="px-8 py-3.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-base rounded-2xl shadow-xs border border-[#E0B030] inline-flex items-center space-x-2"
              >
                <span>Upload Photo Memories</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
