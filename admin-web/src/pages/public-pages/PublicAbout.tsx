import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const PublicAbout: React.FC = () => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<any>({
    school_name: 'Our School',
    total_alumni: 0,
    total_batches: 0,
    years_connected: 0
  });

  useEffect(() => {
    api.getPublicStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-4 py-1.5 rounded-full uppercase tracking-wider">
            {t('nav_about')}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {t('about_title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-normal max-w-3xl mx-auto leading-relaxed">
            {t('about_subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] px-3.5 py-1 rounded-full border border-[#F4C542]">
              <Sparkles className="w-4 h-4 text-[#F4C542]" />
              <span>{t('our_mission_title')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#111111] leading-tight">
              {language === 'ta' ? 'வாழ்நாள் தொடர்புகள் மற்றும் பரஸ்பர வளர்ச்சி' : 'Fostering Lifelong Connections & Mutual Growth'}
            </h2>
            <p className="text-base text-gray-600 font-normal leading-relaxed">
              {t('our_mission_desc')}
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-sm sm:text-base font-semibold text-[#111111]">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{language === 'ta' ? 'சரிபார்க்கப்பட்ட பழைய மாணவர்கள் பட்டியல்' : 'Verified Alumni Roster ensuring authentic school community engagement'}</span>
              </div>
              <div className="flex items-start space-x-3 text-sm sm:text-base font-semibold text-[#111111]">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{language === 'ta' ? 'வருடாந்திர சந்திப்புகள் மற்றும் வெள்ளி விழாக்களின் ஏற்பாடு' : 'Annual get-togethers, batch Silver & Golden Jubilees, and reunions'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FFF7D6]/30 p-8 sm:p-10 rounded-3xl border-2 border-[#F4C542]/50 space-y-6">
            <h3 className="text-2xl font-bold text-[#111111]">{t('our_vision_title')}</h3>
            <p className="text-base text-gray-700 leading-relaxed font-normal">
              {t('our_vision_desc')}
            </p>
            <div className="pt-4 border-t border-[#F4C542]/30 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#111111]">{stats.total_alumni}+</div>
                <div className="text-xs text-gray-500 font-medium">{t('stat_alumni')}</div>
              </div>
              <Link
                to="/register"
                className="px-6 py-3 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
              >
                <span>{t('nav_register')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
