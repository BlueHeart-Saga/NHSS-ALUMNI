import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Calendar, GraduationCap, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import bannerImg from '../../assets/tamil_school_banner.png';

export const PublicSchool: React.FC = () => {
  const [profile, setProfile] = useState<any>({
    name: 'Our School',
    code: 'SCHOOL',
    logo_url: '',
    cover_url: '',
    description: 'Providing holistic education, academic excellence, and character building.',
    address: 'School Campus Address',
    website: '',
    contact_phone: '+919876543210',
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
              <span className="text-sm font-semibold text-[#F4C542] bg-[#111111] px-4 py-1.5 rounded-full uppercase tracking-wider">
                ESTABLISHED {profile.established_year}
              </span>
              <h1 className="text-4xl sm:text-5xl font-semibold text-white mt-1">{profile.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
        {/* Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-7">
            <h2 className="text-4xl font-semibold text-[#111111]">Campus Overview</h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed">
              {profile.description}
            </p>
            <p className="text-lg text-gray-600 font-normal leading-relaxed">
              Our institution has nurtured thousands of successful professionals, researchers, entrepreneurs, and public servants who contribute meaningfully across the globe.
            </p>

            <div className="pt-8 border-t border-[#E5E7EB] space-y-6">
              <h3 className="text-2xl font-semibold text-[#111111]">Key Campus Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-base font-semibold text-[#111111]">
                <div className="p-5 bg-gray-50 border border-[#E5E7EB] rounded-2xl flex items-center space-x-3.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>State-of-the-Art Laboratories</span>
                </div>
                <div className="p-5 bg-gray-50 border border-[#E5E7EB] rounded-2xl flex items-center space-x-3.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>Comprehensive Central Library</span>
                </div>
                <div className="p-5 bg-gray-50 border border-[#E5E7EB] rounded-2xl flex items-center space-x-3.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>Modern Auditorium &amp; Sports Complex</span>
                </div>
                <div className="p-5 bg-gray-50 border border-[#E5E7EB] rounded-2xl flex items-center space-x-3.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>Active Alumni Mentorship Cell</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-9 shadow-sm space-y-7 h-fit">
            <h3 className="text-2xl font-semibold text-[#111111] pb-4 border-b border-[#E5E7EB]">School Information</h3>

            <div className="space-y-5 text-base text-[#111111] font-normal">
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-[#854D0E] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</strong>
                  <span className="text-base font-semibold">{profile.address}</span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-[#854D0E] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Phone</strong>
                  <span className="text-base font-semibold">{profile.contact_phone}</span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-[#854D0E] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Email</strong>
                  <span className="text-base font-semibold">{profile.contact_email}</span>
                </div>
              </div>

              {profile.website && (
                <div className="flex items-start space-x-4">
                  <Globe className="w-6 h-6 text-[#854D0E] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Official Website</strong>
                    <a href={profile.website} target="_blank" rel="noreferrer" className="text-[#854D0E] text-base font-semibold underline">
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
