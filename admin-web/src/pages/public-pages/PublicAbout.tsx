import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  X, 
  ExternalLink, 
  GraduationCap, 
  BookOpen, 
  Compass, 
  Building2, 
  Briefcase, 
  HeartHandshake, 
  Users, 
  Quote, 
  Award,
  ChevronRight,
  BookMarked,
  Lightbulb
} from 'lucide-react';
import { api } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';
import { AlumniAssociationSection } from './components/AlumniAssociationSection';

export const PublicAbout: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    school_name: 'Our School',
    total_alumni: 0,
    total_batches: 0,
    years_connected: 0
  });
  const [memories, setMemories] = useState<any[]>([]);
  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  useEffect(() => {
    api.getPublicStats().then(setStats).catch(console.error);
    api.getPublicMemories().then(setMemories).catch(() => setMemories([]));
  }, []);

  const missionPointsTa = [
    {
      title: 'வழிகாட்டுதல் & உறவுப் பாலம்',
      icon: Users
    },
    {
      title: 'கல்வி உதவி & உதவித்தொகைகள்',
      icon: BookOpen
    },
    {
      title: 'உயர்கல்வி & தொழில் வழிகாட்டுதல்',
      icon: Compass
    },
    {
      title: 'பள்ளி கட்டமைப்பு & மின்னணுக் கற்றல்',
      icon: Building2
    },
    {
      title: 'தொழில்முறை அறிவுப் பகிர்வு',
      icon: Briefcase
    },
    {
      title: 'பண்பாடு & சமூகப் பொறுப்பு',
      icon: HeartHandshake
    },
    {
      title: 'முன்னேற்றமிக்க முன்னாள் மாணவர் சமூகம்',
      icon: Award
    }
  ];

  const missionPointsEn = [
    {
      title: 'Mentorship & Bridge',
      icon: Users
    },
    {
      title: 'Educational Aid & Scholarships',
      icon: BookOpen
    },
    {
      title: 'Career & Higher Ed Guidance',
      icon: Compass
    },
    {
      title: 'School Infrastructure & E-Learning',
      icon: Building2
    },
    {
      title: 'Professional Alumni Network',
      icon: Briefcase
    },
    {
      title: 'Heritage & Ethics',
      icon: HeartHandshake
    },
    {
      title: 'Empowered Alumni Community',
      icon: Award
    }
  ];

  const missionList = language === 'ta' ? missionPointsTa : missionPointsEn;

  const activitiesTa = [
    { name: 'கல்வி உதவி', desc: 'புத்தகங்கள், உபகரணங்கள் & உதவித்தொகை', icon: BookMarked },
    { name: 'வழிகாட்டுதல்', desc: 'உயர்கல்வி & தொழில் தேர்வு ஆலோசனை', icon: Compass },
    { name: 'பள்ளி மேம்பாடு', desc: 'நூலகம், விளையாட்டரங்கம் & மின்னணுக் கற்றல்', icon: Building2 },
    { name: 'திறன் வளர்ப்பு', desc: 'பயிற்சிப் பட்டறைகள் & தலைமைப் பண்பு', icon: Lightbulb },
    { name: 'சமூக சேவை', desc: 'ஒற்றுமை, சேவை & கிராமச் சமூக முன்னேற்றம்', icon: HeartHandshake }
  ];

  const activitiesEn = [
    { name: 'Educational Aid', desc: 'Books, Equipment & Scholarships', icon: BookMarked },
    { name: 'Career Guidance', desc: 'Higher Ed & Professional Counseling', icon: Compass },
    { name: 'Infrastructure', desc: 'Library, Sports & E-Learning Upgrades', icon: Building2 },
    { name: 'Skill Building', desc: 'Workshops & Leadership Training', icon: Lightbulb },
    { name: 'Community Service', desc: 'Unity, Welfare & Social Empowerment', icon: HeartHandshake }
  ];

  const activitiesList = language === 'ta' ? activitiesTa : activitiesEn;

  // Duplicated 7-card array for seamless infinite auto-scroll
  const marqueeMissionList = [...missionList, ...missionList];

  return (
    <div className="bg-white text-[#111111] animate-fadeIn font-sans">
      
      {/* 1. HERO HEADER */}
      <div className="bg-white text-[#111111] py-10 sm:py-16 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] tracking-tight leading-tight">
              {language === 'ta' ? 'முன்னாள் மாணவர் சங்கம்' : 'Our Alumni Association'}
            </h1>
            <p className="text-base sm:text-xl text-gray-600 font-normal leading-relaxed">
              {language === 'ta'
                ? 'எங்கள் முன்னாள் மாணவர் சங்கம் என்பது, எங்கள் பள்ளியின் மீது கொண்ட அன்பையும், நன்றியையும், பொறுப்புணர்வையும் அடிப்படையாகக் கொண்டு ஒன்றிணைந்த வலுவான அமைப்பாகும்.'
                : 'Connecting past and present students to empower the next generation through education, unity, and community service.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. ABOUT US INTRODUCTION SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-bold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#854D0E]" />
              <span>{language === 'ta' ? 'எங்கள் அடிப்படை நோக்கம்' : 'Our Foundational Philosophy'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] leading-tight">
              {language === 'ta'
                ? 'கல்வியின் விதை, சமூகத்தின் விருட்சம்'
                : 'Transforming Educational Foundations into Community Strength'}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              <p>
                {language === 'ta'
                  ? 'எங்கள் பள்ளியில் பெற்ற கல்வி, ஒழுக்கம் மற்றும் வாழ்க்கைப் பாடங்களை அடுத்த தலைமுறைக்கும் கொண்டு செல்வதே எங்கள் அடிப்படை நோக்கம்.'
                  : 'Our core purpose is to carry forward the quality education, discipline, and life lessons we received at school to the upcoming generation of students.'}
              </p>
              <p>
                {language === 'ta'
                  ? 'முன்னாள் மாணவர்களின் அனுபவம், அறிவு, திறன் மற்றும் வளங்களை ஒருங்கிணைத்து, தற்போதைய மாணவர்களின் கல்வி, திறன், உயர்கல்வி, தொழில் மற்றும் வாழ்க்கை முன்னேற்றத்திற்கு ஆதரவளிக்க விரும்புகிறோம்.'
                  : 'By uniting the experience, knowledge, skills, and resources of alumni worldwide, we mentor and support current students in their academics, career choices, higher education, and personal growth.'}
              </p>
              <p>
                {language === 'ta'
                  ? 'அதே நேரத்தில், எங்கள் பள்ளியையும், அதைச் சுற்றியுள்ள சமூகத்தையும் கல்வி, ஒற்றுமை மற்றும் சேவை வழியாக தொடர்ந்து முன்னேற்றுவதற்காக ஒன்றிணைந்து செயல்படுகிறோம்.'
                  : 'Simultaneously, we work together to continuously elevate our school infrastructure and support our local community through education, unity, and active service.'}
              </p>
            </div>
          </div>

          {/* Quick Stats Highlight Card */}
          <div className="lg:col-span-5 bg-[#FAFAFA] border-2 border-[#111111] rounded-3xl p-8 shadow-[8px_8px_0px_0px_#F4C542] space-y-6">
            <h3 className="text-xl font-bold text-[#111111] border-b border-gray-200 pb-3 flex items-center justify-between">
              <span>{language === 'ta' ? 'சமூகத் தாக்கம்' : 'Impact Metrics'}</span>
              <Award className="w-5 h-5 text-[#854D0E]" />
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="text-3xl font-extrabold text-[#111111]">{stats.total_alumni || '500'}+</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">
                  {language === 'ta' ? 'முன்னாள் உறுப்பினர்கள்' : 'Registered Alumni'}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="text-3xl font-extrabold text-[#111111]">{stats.total_batches || '50'}+</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">
                  {language === 'ta' ? 'கல்வி வகுப்புகள்' : 'Graduating Batches'}
                </div>
              </div>
            </div>

            <div className="bg-[#FFF7D6] border border-[#F4C542] p-4 rounded-2xl space-y-2">
              <div className="text-xs font-extrabold text-[#854D0E] uppercase tracking-wider">
                {language === 'ta' ? 'சேவை மையம்' : 'Core Focus'}
              </div>
              <p className="text-xs text-[#111111] font-medium leading-normal">
                {language === 'ta'
                  ? 'பள்ளி + முன்னாள் மாணவர்கள் + தற்போதைய மாணவர்கள் + சமூக நலன்'
                  : 'School Infrastructure + Alumni Synergy + Student Support + Social Welfare'}
              </p>
            </div>

            <Link
              to="/register"
              className="w-full py-3.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md inline-flex items-center justify-center space-x-2 border-2 border-[#F4C542]"
            >
              <span>{t('nav_register')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3. VISION CARD (எங்கள் தொலைநோக்கு) */}
        <div className="bg-gradient-to-br from-[#FFF7D6] via-[#FEF3C7] to-[#FFF7D6] border-2 border-[#F4C542] rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden text-center">
          <Quote className="w-16 h-16 text-[#F4C542]/40 absolute top-4 right-4 pointer-events-none" />
          
          <div className="max-w-4xl mx-auto space-y-4 relative z-10 text-center">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#854D0E] uppercase tracking-wider">
              {language === 'ta' ? 'எங்கள் தொலைநோக்கு' : 'Our Vision'}
            </h2>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111111] leading-tight">
              {language === 'ta'
                ? '“கல்வி, ஒற்றுமை மற்றும் சேவை வழியாக, ஒவ்வொரு மாணவரின் கனவையும் நனவாக்கி, அறிவார்ந்த, தன்னம்பிக்கைமிக்க, தன்னிறைவு பெற்ற மற்றும் முன்னேற்றமிக்க சமூகத்தை உருவாக்குதல்.”'
                : '“To realize the dream of every student through education, unity, and service, creating an enlightened, self-confident, self-reliant, and progressive society.”'}
            </h3>
          </div>
        </div>

        {/* 4. MISSION CARDS (7 CARDS WITH INLINE AUTO-SCROLL) */}
        <div className="space-y-8 overflow-hidden">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1 rounded-full uppercase tracking-wider">
              {language === 'ta' ? 'எங்கள் பணிநோக்கம்' : 'Our Mission Pillars'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111]">
              {language === 'ta' ? 'நாங்கள் செயல்படும் 7 முக்கிய வழிகள்' : '7 Strategic Pathways of Execution'}
            </h2>
          </div>

          {/* Marquee Animation Custom Styles */}
          <style>{`
            @keyframes marqueeScroll {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              display: flex;
              width: max-content;
              animation: marqueeScroll 35s linear infinite;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Auto-scrolling inline horizontal container */}
          <div className="w-full overflow-hidden py-4 cursor-grab active:cursor-grabbing">
            <div className="marquee-track space-x-6">
              {marqueeMissionList.map((item, index) => {
                const IconComp = item.icon;
                const originalIndex = (index % 7) + 1;

                return (
                  <div
                    key={index}
                    className="w-72 sm:w-80 shrink-0 bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-xs hover:border-[#F4C542] hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group"
                  >
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center text-[#854D0E] group-hover:scale-110 transition-transform">
                        <IconComp className="w-7 h-7" />
                      </div>
                      <h4 className="text-lg font-extrabold text-[#111111] leading-snug">{item.title}</h4>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#854D0E]">
                      <span>0{originalIndex}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. KEY ACTIVITIES HIGHLIGHTS (எங்கள் செயல்பாடுகள்) */}
        <div className="bg-[#FAFAFA] border-2 border-[#111111] rounded-3xl p-8 sm:p-12 space-y-8 shadow-[8px_8px_0px_0px_#111111]">
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-3xl font-extrabold text-[#111111]">
              {language === 'ta' ? 'எங்கள் முதன்மைச் செயல்பாடுகள்' : 'Key Domains of Activity'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {language === 'ta' ? 'மாணவர்கள் மற்றும் சமூக மேம்பாட்டிற்கான முதன்மைத் தளங்கள்' : 'Core initiatives driving student & community advancement'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {activitiesList.map((act, i) => {
              const ActIcon = act.icon;
              return (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center space-y-2 hover:border-[#F4C542] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center text-[#854D0E] mx-auto">
                    <ActIcon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-[#111111]">{act.name}</h4>
                  <p className="text-[11px] text-gray-500 font-medium leading-tight">{act.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. OUR PROMISE / MOTTO FOOTER BANNER (எங்கள் உறுதி) */}
        <div className="bg-[#111111] text-white border-2 border-[#F4C542] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
          <span className="text-xs font-bold bg-[#F4C542] text-[#111111] px-4 py-1.5 rounded-full uppercase tracking-wider inline-block">
            {language === 'ta' ? 'எங்கள் உறுதி' : 'Our Solemn Pledge'}
          </span>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4C542] leading-tight">
            {language === 'ta'
              ? '“நாம் பெற்ற கல்வியின் பயனை, அடுத்த தலைமுறையின் முன்னேற்றமாக மாற்றுவோம்.”'
              : '“Let us transform the fruits of our education into the progress of the next generation.”'}
          </h2>

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 bg-[#F4C542] hover:bg-[#e0b236] text-[#111111] font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <span>{language === 'ta' ? 'இப்போதே எங்களுடன் இணையுங்கள்' : 'Join Our Alumni Movement Today'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7. ASSOCIATION LEADERSHIP BOARD */}
        <AlumniAssociationSection />

        {/* 8. MEMORIES PHOTO SHOWCASE */}
        <div className="space-y-6 sm:space-y-8 pt-6 border-t border-gray-200">
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-3xl font-bold text-[#111111]">
              {language === 'ta' ? 'எங்கள் பள்ளி வாழ்க்கையின் வரலாற்றுத் தருணங்கள்' : 'Glimpses of Our School History & Alumni Traditions'}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {memories.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 shadow-md bg-white hover:shadow-2xl hover:border-[#F4C542] transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="h-36 sm:h-48 overflow-hidden bg-gray-100 relative">
                  <img src={getAssetUrl(photo.image_url) || photo.image_url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3 sm:p-4 bg-white">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#854D0E] uppercase tracking-wider">{photo.batch_year ? `Batch ${photo.batch_year}` : 'School Memory'}</span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#111111] mt-0.5 leading-snug line-clamp-1">{photo.title}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center pt-6 sm:pt-8">
            <button
              onClick={() => navigate('/memories')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-6 sm:px-8 py-3.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-[#F4C542]/40"
            >
              <span>{language === 'ta' ? 'மேலும் நினைவுகள் ஆல்பம் பார்க்க' : 'View Full Memories Gallery'}</span>
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
                src={getAssetUrl(activePhoto.image_url) || activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            {/* Modal Info Bar */}
            <div className="p-6 bg-white space-y-4">
              <div>
                <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] px-3 py-1 rounded-full uppercase tracking-wider border border-[#F4C542]">
                  {activePhoto.batch_year ? `Batch ${activePhoto.batch_year}` : 'School Archive'}
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
