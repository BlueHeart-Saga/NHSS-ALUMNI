import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, ArrowRight, X, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';

export const PublicAbout: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    school_name: 'Our School',
    total_alumni: 0,
    total_batches: 0,
    years_connected: 0
  });
  const [activePhoto, setActivePhoto] = useState<{ src: string; title: string; cat: string } | null>(null);

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

        {/* Real School Life & Campus Photo Showcase */}
        <div className="space-y-8 pt-6 border-t border-gray-200">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1 rounded-full uppercase tracking-wider">
              {language === 'ta' ? 'பள்ளி படங்கள்' : 'Campus & School Life'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#111111]">
              {language === 'ta' ? 'எங்கள் பள்ளி வாழ்க்கையின் வரலாற்றுத் தருணங்கள்' : 'Glimpses of Our School History & Alumni Traditions'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { src: '/school-images/school-door.png', title: language === 'ta' ? 'பாரம்பரிய நுழைவாயில்' : 'Heritage School Entrance', cat: 'Heritage' },
              { src: '/school-images/banner.png', title: language === 'ta' ? 'முதன்மை வளாகக் கட்டிடம்' : 'Main School Campus', cat: 'Infrastructure' },
              { src: '/school-images/Republic-Day.png', title: language === 'ta' ? 'குடியரசு தின விழா கொண்டாட்டம்' : 'Republic Day Celebrations', cat: 'National Festival' },
              { src: '/school-images/give-cycle.png', title: language === 'ta' ? 'இலவச மிதிவண்டி வழங்கும் திட்டம்' : 'Student Welfare & Bicycle Distribution', cat: 'Welfare Scheme' },
              { src: '/school-images/meeting.png', title: language === 'ta' ? 'பழைய மாணவர்கள் நிர்வாகக் கூட்டம்' : 'Alumni Executive Meeting', cat: 'Alumni Network' },
              { src: '/school-images/old-pricipal.png', title: language === 'ta' ? 'முன்னாள் தலைமையாசிரியர்கள்' : 'Former Principals & School Mentors', cat: 'School Leadership' },
              { src: '/school-images/old-students-selfie.png', title: language === 'ta' ? 'பழைய மாணவர்கள் சந்திப்பு செல்ஃபி' : 'Alumni Reunion Group Celebration', cat: 'Batch Reunion' },
              { src: '/school-images/our-students.png', title: language === 'ta' ? 'பள்ளி மாணவர்கள் பேரணி' : 'Student Assemblies & Academics', cat: 'Student Life' },
              { src: '/school-images/staff-speech.png', title: language === 'ta' ? 'ஆசிரியர்கள் சிறப்புரை' : 'Faculty Address & Annual Ceremonies', cat: 'Faculty' },
              { src: '/school-images/studentaward.png', title: language === 'ta' ? 'மாணவர் சிறப்பு விருதுகள்' : 'Academic & Excellence Awards', cat: 'Achievements' },
              { src: '/school-images/students-events.png', title: language === 'ta' ? 'மாணவர்களின் கலை நிகழ்ச்சிகள்' : 'Cultural Programs & Student Events', cat: 'Co-Curricular' },
              { src: '/school-images/sudentgetprize.png', title: language === 'ta' ? 'வருடாந்திர பரிசு அளிப்பு விழா' : 'Annual Prize Distribution Ceremony', cat: 'Awards' },
              { src: '/school-images/flag-inaguration.png', title: language === 'ta' ? 'தேசியக் கொடியேற்று விழா' : 'Flag Hoisting Ceremony', cat: 'Celebrations' }
            ].map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setActivePhoto(photo)}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 shadow-md bg-white hover:shadow-2xl hover:border-[#F4C542] transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                  <img src={getAssetUrl(photo.src)} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 backdrop-blur-xs text-[#111111] text-xs font-bold px-3 py-1.5 rounded-full border border-white shadow-md">
                      {language === 'ta' ? 'பெரிதாக்குக' : 'Click to View'}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <span className="text-[11px] font-bold text-[#854D0E] uppercase tracking-wider">{photo.cat}</span>
                  <h4 className="font-bold text-sm text-[#111111] mt-0.5 leading-snug">{photo.title}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* View More Button leading to Login */}
          <div className="text-center pt-8">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-3 px-8 py-3.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-[#F4C542]/40"
            >
              <span>{language === 'ta' ? 'மேலும் புகைப்படங்கள் பார்க்க உள்நுழைக' : 'Log In to View More Memories'}</span>
              <ArrowRight className="w-4 h-4 text-[#F4C542]" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Lightbox Popup Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border-2 border-[#F4C542]/60">
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview */}
            <div className="max-h-[60vh] bg-black overflow-hidden flex items-center justify-center">
              <img
                src={getAssetUrl(activePhoto.src)}
                alt={activePhoto.title}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            {/* Modal Info Bar */}
            <div className="p-6 bg-white space-y-4">
              <div>
                <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] px-3 py-1 rounded-full uppercase tracking-wider border border-[#F4C542]">
                  {activePhoto.cat}
                </span>
                <h3 className="text-xl font-bold text-[#111111] mt-2">{activePhoto.title}</h3>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  {language === 'ta' ? 'மேலும் புகைப்படங்கள் மற்றும் நினைவுகளுக்கு உள்நுழைக' : 'Log in to explore the complete school photo archive'}
                </p>
                <button
                  onClick={() => {
                    setActivePhoto(null);
                    navigate('/login');
                  }}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all border border-[#F4C542]/40 cursor-pointer"
                >
                  <span>{language === 'ta' ? 'உள்நுழைக' : 'Log In'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
