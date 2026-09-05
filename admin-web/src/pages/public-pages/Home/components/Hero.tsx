import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { getAssetUrl } from '../../../../utils/asset';

const defaultSchoolImg = getAssetUrl('/school-images/school-door.png');

interface HeroProps {
  schoolName: string;
  schoolCode?: string;
  coverUrl?: string;
  onJoinClick: () => void;
  onLoginClick?: () => void;
  onExploreClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  schoolName,
  schoolCode,
  coverUrl,
  onJoinClick,
  onLoginClick
}) => {
  const { t, language } = useLanguage();
  const campusImg = getAssetUrl('/school-images/school-door.png');
  const badgeText = schoolCode || (schoolName.length <= 8 ? schoolName : schoolName.split(' ').map(w => w[0]).join('').slice(0, 6).toUpperCase()) || "ALUMNI";

  return (
    <section className="bg-white py-8 sm:py-14 lg:py-24 border-b border-[#E5E7EB] relative overflow-hidden">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-16 items-center">

          {/* Left Column: Single School Photo Card */}
          <div className="lg:col-span-7">
            <div className="p-1.5 sm:p-2.5 bg-white rounded-2xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 relative group">
              <div className="relative overflow-hidden rounded-xl h-64 sm:h-[420px] lg:h-[480px] bg-gray-100">
                <img
                  src={campusImg}
                  alt={schoolName}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== defaultSchoolImg) {
                      target.src = defaultSchoolImg;
                    }
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 block"
                />

                {/* Overlay Text Badge at Bottom Left */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-black/80 backdrop-blur-md text-white font-bold text-xs sm:text-base lg:text-lg px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl border border-white/20 tracking-widest uppercase shadow-xl">
                  {badgeText}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Welcome Text & Primary CTA Button */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-7">
            <div>
              <div className="text-xl xs:text-2xl sm:text-4xl text-[#111111] font-semibold tracking-tight">
                {language === 'ta' ? 'அன்புடன் வரவேற்கிறது' : 'Welcome to'}
              </div>
              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#111111] tracking-tight leading-tight mt-1 sm:mt-2">
                {language === 'ta' ? 'முன்னாள் மாணவர்கள் சங்கம்' : 'The Alumni Portal'}
              </h1>
            </div>

            {/* Description Text */}
            <p className="text-sm sm:text-lg lg:text-xl text-gray-600 font-normal leading-relaxed max-w-xl">
              {t('hero_subtitle')}
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onJoinClick}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-semibold text-sm sm:text-base rounded-2xl sm:rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center space-x-2 border border-[#E0B238] cursor-pointer"
              >
                <span>{t('join_network_btn')}</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* {onLoginClick && (
                <button
                  onClick={onLoginClick}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-gray-50 text-[#111111] font-semibold text-sm sm:text-base rounded-2xl sm:rounded-full shadow-md hover:shadow-lg transition-all border-2 border-gray-300 hover:border-[#111111] cursor-pointer inline-flex items-center justify-center"
                >
                  <span>{language === 'ta' ? 'உள்நுழைக' : 'Alumni Login'}</span>
                </button>
              )} */}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
