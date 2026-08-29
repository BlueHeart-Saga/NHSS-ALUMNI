import React from 'react';
import { ArrowRight } from 'lucide-react';
import defaultSchoolImg from '../../../../assets/tamil_school_campus.png';

interface HeroProps {
  schoolName: string;
  schoolCode?: string;
  coverUrl?: string;
  onJoinClick: () => void;
  onExploreClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  schoolName,
  schoolCode,
  coverUrl,
  onJoinClick
}) => {
  const campusImg = (coverUrl && coverUrl.trim() !== '') ? coverUrl : defaultSchoolImg;
  const badgeText = schoolCode || (schoolName.length <= 8 ? schoolName : schoolName.split(' ').map(w => w[0]).join('').slice(0, 6).toUpperCase()) || "SDMCET";

  return (
    <section className="bg-white py-14 lg:py-24 border-b border-[#E5E7EB] relative overflow-hidden">
      {/* Background Ambient Decorative Waves */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-40 -z-0">
        <svg viewBox="0 0 500 500" className="w-full h-full text-gray-200" fill="none">
          <path d="M0,100 C150,200 350,0 500,100 L500,500 L0,500 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0,180 C180,280 320,80 500,180" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0,260 C200,340 300,160 500,260" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0,340 C220,400 280,240 500,340" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Sharp Framed Tamil School Campus Photo Card */}
          <div className="lg:col-span-7">
            <div className="p-2 sm:p-2.5 bg-white rounded-lg border-2 border-gray-300 shadow-[0_12px_36px_rgba(0,0,0,0.12)] hover:shadow-2xl transition-all duration-300 relative group">
              <div className="relative overflow-hidden rounded-md h-[380px] sm:h-[480px] bg-gray-100">
                <img
                  src={campusImg}
                  alt={schoolName}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== defaultSchoolImg) {
                      target.src = defaultSchoolImg;
                    } else {
                      target.src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80";
                    }
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 block"
                />
                
                {/* Overlay Text Badge at Bottom Left (e.g. SDMCET) - Sharp Box */}
                <div className="absolute bottom-6 left-6 bg-black/85 backdrop-blur-md text-white font-bold text-base sm:text-lg px-5 py-2 rounded-sm border border-white/30 tracking-widest uppercase shadow-xl">
                  {badgeText}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Welcome Text & Primary CTA Button */}
          <div className="lg:col-span-5 space-y-7">
            <div>
              <div className="text-3xl sm:text-4xl text-[#111111] font-semibold tracking-tight">
                Welcome to
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#111111] tracking-tight leading-tight mt-2">
                The Alumni Portal
              </h1>
            </div>

            {/* Description Text */}
            <p className="text-lg sm:text-xl text-gray-600 font-normal leading-relaxed max-w-xl">
              Connect with your Classmates, Share Memories, Mentor Students and Seek Help from your own &amp; Powerful Alumni Network
            </p>

            {/* Primary Action Button */}
            <div className="pt-3">
              <button
                onClick={onJoinClick}
                className="px-10 py-4 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-semibold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center space-x-3 border border-[#E0B238]"
              >
                <span>Register Now</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
