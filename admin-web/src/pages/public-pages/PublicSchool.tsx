import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Calendar, GraduationCap, ShieldCheck, X, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';

interface PublicSchoolProfile {
  name: string;
  code: string;
  established_year: number;
  total_alumni: number;
  active_batches: number;
  upcoming_events: number;
  cover_url: string;
  logo_url: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}

export const PublicSchool: React.FC = () => {
  const { t, language, logoUrl } = useLanguage();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; title: string; category: string } | null>(null);
  const realCampusBanner = getAssetUrl('/school-images/banner.png');
  const [profile, setProfile] = useState<PublicSchoolProfile>({
    name: language === 'ta' ? 'நடராஜன் மேல்நிலைப் பள்ளி' : 'NHSS SCHOOL',
    code: 'NHSS',
    established_year: 1965,
    total_alumni: 1250,
    active_batches: 48,
    upcoming_events: 5,
    cover_url: '',
    logo_url: '',
    description: 'Empowering generations through quality education, holistic development, and strong alumni connections.',
    address: 'Main Campus, School Alumni Building, Tamil Nadu',
    phone: '+91 98765 43210',
    email: 'info@nhssalumni.com'
  });

  useEffect(() => {
    api.getPublicStats()
      .then((s: any) => setProfile({
        name: s.school_name || (language === 'ta' ? 'நடராஜன் மேல்நிலைப் பள்ளி' : 'NHSS SCHOOL'),
        code: s.school_code || 'NHSS',
        established_year: s.established_year || 1965,
        total_alumni: s.total_alumni || 1250,
        active_batches: s.total_batches || 48,
        upcoming_events: s.total_events || 5,
        cover_url: s.cover_url || '',
        logo_url: s.logo_url || '',
        description: s.description || 'Empowering generations through quality education.',
        address: s.address || 'Main Campus, School Alumni Building, Tamil Nadu',
        phone: s.phone || s.contact_phone || '+91 98765 43210',
        email: s.email || s.contact_email || 'info@nhssalumni.com'
      }))
      .catch(console.error);
  }, []);

  const campusPhotos = [
    { title: language === 'ta' ? 'பாரம்பரிய நுழைவாயில்' : 'Heritage School Entrance', src: getAssetUrl('/school-images/school-door.png'), category: 'Campus Heritage' },
    { title: language === 'ta' ? 'முதன்மை வளாகக் கட்டிடம்' : 'Main School Campus', src: getAssetUrl('/school-images/banner.png'), category: 'Campus Infrastructure' },
    { title: language === 'ta' ? 'குடியரசு தின விழா' : 'Republic Day Celebrations', src: getAssetUrl('/school-images/Republic-Day.png'), category: 'National Events' },
    { title: language === 'ta' ? 'இலவச மிதிவண்டி திட்டம்' : 'Student Welfare & Bicycle Scheme', src: getAssetUrl('/school-images/give-cycle.png'), category: 'Welfare Schemes' },
    { title: language === 'ta' ? 'பழைய மாணவர்கள் நிர்வாகக் கூட்டம்' : 'Alumni Reunion Executive Gathering', src: getAssetUrl('/school-images/meeting.png'), category: 'Alumni Network' },
    { title: language === 'ta' ? 'முன்னாள் தலைமையாசிரியர்கள்' : 'Former Principals & School Honors', src: getAssetUrl('/school-images/old-pricipal.png'), category: 'Leadership' },
    { title: language === 'ta' ? 'பழைய மாணவர்கள் செல்ஃபி' : 'Alumni Reunion Batch Group Photo', src: getAssetUrl('/school-images/old-students-selfie.png'), category: 'Batch Reunion' },
    { title: language === 'ta' ? 'பள்ளி மாணவர்கள்' : 'Student Assembly & Cohorts', src: getAssetUrl('/school-images/our-students.png'), category: 'Student Life' },
    { title: language === 'ta' ? 'ஆசிரியர்கள் உரை' : 'Faculty Address & Speeches', src: getAssetUrl('/school-images/staff-speech.png'), category: 'Faculty & Mentors' },
    { title: language === 'ta' ? 'மாணவர் விருதுகள்' : 'Academic & Sports Awards', src: getAssetUrl('/school-images/studentaward.png'), category: 'Excellence Awards' },
    { title: language === 'ta' ? 'கலை நிகழ்ச்சிகள்' : 'Cultural Programs & Student Events', src: getAssetUrl('/school-images/students-events.png'), category: 'Co-Curricular' },
    { title: language === 'ta' ? 'பரிசு அளிப்பு விழா' : 'Annual Prize Distribution', src: getAssetUrl('/school-images/sudentgetprize.png'), category: 'Annual Function' },
    { title: language === 'ta' ? 'கொடியேற்று விழா' : 'Flag Hoisting Ceremony', src: getAssetUrl('/school-images/flag-inaguration.png'), category: 'Celebrations' }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111111] animate-fadeIn">
      {/* Campus Hero Cover */}
      <div className="relative h-96 sm:h-[420px] overflow-hidden bg-gray-900">
        <img
          src={(profile.cover_url && profile.cover_url.trim() !== '') ? profile.cover_url : realCampusBanner}
          alt={profile.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = realCampusBanner;
          }}
          className="w-full h-full object-cover filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white flex items-end justify-between">
          <div className="flex items-center space-x-5">
            <img
              src={logoUrl}
              alt={profile.name}
              className="h-20 sm:h-24 w-auto object-contain flex-shrink-0"
            />
            <div className="space-y-1">
              <span className="text-sm font-semibold text-[#F4C542] bg-[#111111] px-4 py-1.5 rounded-full uppercase tracking-wider border border-[#F4C542]/40">
                {t('established')} {profile.established_year}
              </span>
              <h1 className="text-4xl sm:text-5xl font-semibold text-white mt-1">{profile.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Description Block */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111111]">{t('nav_about')}</h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-normal">
                {profile.description}
              </p>
            </div>

            {/* School Stats Cards */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-b border-gray-100 py-6">
              <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{profile.total_alumni}+</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">{t('stat_alumni')}</div>
              </div>
              <div className="text-center p-4 bg-[#FFF7D6]/40 rounded-2xl border border-[#F4C542]/50">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#854D0E]">{profile.active_batches}</div>
                <div className="text-xs text-[#854D0E] font-semibold mt-1">{t('stat_batches')}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{profile.upcoming_events}</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">{t('stat_events')}</div>
              </div>
            </div>
          </div>

          {/* Right Contact Card */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-[#111111] pb-4 border-b border-gray-100">
                {t('contact_info')}
              </h3>

              <div className="space-y-4 text-sm font-medium text-gray-700">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-5 h-5 text-[#854D0E] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">{t('school_code')}</div>
                    <div className="font-semibold text-gray-900">{profile.code}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#854D0E] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">{t('location')}</div>
                    <div className="text-gray-800">{profile.address}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-[#854D0E] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Phone</div>
                    <div className="text-gray-800">{profile.phone}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-[#854D0E] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Email</div>
                    <div className="text-gray-800">{profile.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Real Campus Photos Gallery */}
        <div className="space-y-6 pt-10 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#854D0E] uppercase tracking-wider bg-[#FFF7D6] px-3 py-1 rounded-full border border-[#F4C542]">
                {language === 'ta' ? 'பள்ளி புகைப்படங்கள்' : 'Campus Photo Gallery'}
              </span>
              <h3 className="text-2xl font-bold text-[#111111] mt-2">
                {language === 'ta' ? 'பள்ளியின் புகைப்படத் கேலரி' : 'Explore Our Campus & Event Highlights'}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {campusPhotos.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhoto(photo)}
                className="group overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-2xl hover:border-[#F4C542] transition-all bg-white cursor-pointer transform hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                  <img src={photo.src} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className="text-[11px] font-bold text-[#854D0E] uppercase">{photo.category}</span>
                  <h4 className="font-bold text-sm text-[#111111] mt-0.5">{photo.title}</h4>
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
              <span>{language === 'ta' ? 'மேலும் புகைப்படங்கள் பார்க்க உள்நுழைக' : 'Log In to View Full Campus Gallery'}</span>
              <ArrowRight className="w-4 h-4 text-[#F4C542]" />
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Lightbox Popup Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border-2 border-[#F4C542]/60">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview */}
            <div className="max-h-[60vh] bg-black overflow-hidden flex items-center justify-center">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            {/* Modal Info Bar */}
            <div className="p-6 bg-white space-y-4">
              <div>
                <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] px-3 py-1 rounded-full uppercase tracking-wider border border-[#F4C542]">
                  {selectedPhoto.category}
                </span>
                <h3 className="text-xl font-bold text-[#111111] mt-2">{selectedPhoto.title}</h3>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  {language === 'ta' ? 'மேலும் புகைப்படங்கள் மற்றும் நிகழ்வுகளுக்கு உள்நுழைக' : 'Log in to access the full school photo & event gallery'}
                </p>
                <button
                  onClick={() => {
                    setSelectedPhoto(null);
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
