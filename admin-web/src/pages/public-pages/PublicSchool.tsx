import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Calendar, GraduationCap, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import bannerImg from '../../assets/tamil_school_banner.png';
import { useLanguage } from '../../context/LanguageContext';

export const PublicSchool: React.FC = () => {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<any>({
    name: 'Our School',
    code: 'SCHOOL',
    logo_url: '',
    cover_url: '',
    description: 'Providing holistic education, academic excellence, and character building for future leaders.',
    address: 'School Campus, Educational Hub',
    website: '',
    contact_phone: '+91 98765 43210',
    contact_email: 'info@school.edu',
    established_year: 2005
  });

  useEffect(() => {
    api.getPublicStats().then((s) => {
      setProfile((prev: any) => ({
        ...prev,
        name: s.school_name,
        code: s.school_code,
        logo_url: s.logo_url,
        cover_url: s.cover_url,
        description: s.description || prev.description
      }));
    }).catch(console.error);
  }, []);

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Campus Hero Cover */}
      <div className="relative h-96 sm:h-[420px] overflow-hidden bg-gray-900">
        <img
          src={(profile.cover_url && profile.cover_url.trim() !== '') ? profile.cover_url : bannerImg}
          alt={profile.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = bannerImg;
          }}
          className="w-full h-full object-cover filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white flex items-end justify-between">
          <div className="flex items-center space-x-5">
            <img
              src="/assets/logo/image.png"
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

      {/* Profile Details & Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-3xl font-semibold text-[#111111]">
                {t('school_profile_title')}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed font-normal">
                {profile.description}
              </p>
            </div>

            {/* Principal's Welcome Card */}
            <div className="bg-[#FFF7D6]/50 p-8 rounded-3xl border-2 border-[#F4C542]/50 space-y-4">
              <div className="flex items-center space-x-3 text-[#854D0E]">
                <ShieldCheck className="w-7 h-7" />
                <h3 className="text-2xl font-bold">{t('principal_message')}</h3>
              </div>
              <p className="text-gray-800 text-base leading-relaxed italic font-medium">
                {language === 'ta'
                  ? '"நமது பழைய மாணவர்கள் நமது பள்ளியின் மிகப்பெரிய பலம். உங்கள் சாதனைகள் நமது பள்ளிக்கு பெருமை சேர்க்கின்றன. எப்போதும் இணைந்து இருங்கள், தாய் பள்ளிக்கு ஆதரவளியுங்கள்."'
                  : '"Our alumni network is the cornerstone of our school\'s pride and legacy. We welcome all former students to stay connected, mentor the upcoming generations, and support our institution\'s growth."'}
              </p>
            </div>
          </div>

          {/* Sidebar Stats & Contact Info */}
          <div className="lg:col-span-4 space-y-6">
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
                    <div className="text-gray-800">{profile.contact_phone}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-[#854D0E] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Email</div>
                    <div className="text-gray-800">{profile.contact_email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
