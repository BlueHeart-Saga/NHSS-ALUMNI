import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Calendar, GraduationCap, ShieldCheck, X, ExternalLink, ArrowRight, Image as ImageIcon } from 'lucide-react';
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

interface GalleryPhotoItem {
  id: string;
  title: string;
  src: string;
  category: string;
}

export const PublicSchool: React.FC = () => {
  const { t, language, logoUrl } = useLanguage();
  const navigate = useNavigate();

  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhotoItem | null>(null);
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

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    // 1. Fetch School Stats
    api.getPublicStats()
      .then((s: any) => setProfile({
        name: s.school_name || (language === 'ta' ? 'நடராஜன் மேல்நிலைப் பள்ளி' : 'NHSS SCHOOL'),
        code: s.school_code || 'NHSS',
        established_year: s.established_year || 1965,
        total_alumni: s.total_alumni || 0,
        active_batches: s.total_batches || 0,
        upcoming_events: s.total_events || 0,
        cover_url: s.cover_url || '',
        logo_url: s.logo_url || '',
        description: s.description || 'Empowering generations through quality education.',
        address: s.address || 'Main Campus, School Alumni Building, Tamil Nadu',
        phone: s.phone || s.contact_phone || '+91 98765 43210',
        email: s.email || s.contact_email || 'info@nhssalumni.com'
      }))
      .catch(console.error);

    // 2. Fetch Real Campus Photos & Events from Database
    Promise.all([
      api.getPublicSchoolEvents().catch(() => []),
      api.getPublicMemories().catch(() => [])
    ]).then(([schoolEvents, memories]) => {
      const photos: GalleryPhotoItem[] = [];

      (schoolEvents || []).forEach((ev: any) => {
        if (ev.cover_image_url) {
          photos.push({
            id: `se-${ev.id}`,
            title: ev.title,
            src: getAssetUrl(ev.cover_image_url),
            category: ev.category?.replace('_', ' ') || 'School Event'
          });
        }
        (ev.gallery_urls || []).forEach((gUrl: string, idx: number) => {
          photos.push({
            id: `se-${ev.id}-g-${idx}`,
            title: `${ev.title} Gallery`,
            src: getAssetUrl(gUrl),
            category: ev.category?.replace('_', ' ') || 'School Event'
          });
        });
      });

      (memories || []).forEach((mem: any) => {
        if (mem.cover_image_url || mem.image_url) {
          photos.push({
            id: `mem-${mem.id}`,
            title: mem.title,
            src: getAssetUrl(mem.cover_image_url || mem.image_url),
            category: mem.album_name || 'Campus Heritage'
          });
        }
      });

      setGalleryPhotos(photos);
    }).finally(() => setLoadingGallery(false));
  }, [language]);

  return (
    <div className="min-h-screen bg-white text-[#111111] animate-fadeIn font-sans">
      {/* Campus Hero Cover */}
      <div className="relative h-64 sm:h-96 lg:h-[420px] overflow-hidden bg-gray-900">
        <img
          src={(profile.cover_url && profile.cover_url.trim() !== '') ? profile.cover_url : realCampusBanner}
          alt={profile.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = realCampusBanner;
          }}
          className="w-full h-full object-cover filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-5">
            <img
              src={logoUrl}
              alt={profile.name}
              className="h-14 sm:h-24 w-auto object-contain flex-shrink-0"
            />
            <div className="space-y-1">
              <span className="text-[10px] sm:text-sm font-semibold text-[#F4C542] bg-[#111111] px-3 py-1 sm:px-4 sm:py-1.5 rounded-full uppercase tracking-wider border border-[#F4C542]/40">
                {t('established')} {profile.established_year}
              </span>
              <h1 className="text-xl sm:text-4xl lg:text-5xl font-semibold text-white mt-0.5 sm:mt-1 leading-snug">{profile.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          
          {/* Left Description Block */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-3xl font-bold text-[#111111]">{t('nav_about')}</h2>
              <p className="text-sm sm:text-lg text-gray-700 leading-relaxed font-normal">
                {profile.description}
              </p>
            </div>

            {/* School Stats Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-4 border-t border-b border-gray-100 py-4 sm:py-6">
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200">
                <div className="text-lg sm:text-3xl font-extrabold text-[#111111]">{profile.total_alumni}+</div>
                <div className="text-[11px] sm:text-xs text-gray-500 font-semibold mt-0.5 sm:mt-1">{t('stat_alumni')}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-[#FFF7D6]/40 rounded-xl sm:rounded-2xl border border-[#F4C542]/50">
                <div className="text-lg sm:text-3xl font-extrabold text-[#854D0E]">{profile.active_batches}</div>
                <div className="text-[11px] sm:text-xs text-[#854D0E] font-semibold mt-0.5 sm:mt-1">{t('stat_batches')}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200">
                <div className="text-lg sm:text-3xl font-extrabold text-[#111111]">{profile.upcoming_events}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 font-semibold mt-0.5 sm:mt-1">{t('stat_events')}</div>
              </div>
            </div>
          </div>

          {/* Right Contact Card */}
          <div className="lg:col-span-5">
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-5 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#111111] pb-3 sm:pb-4 border-b border-gray-100">
                {t('contact_info')}
              </h3>

              <div className="space-y-4 text-xs sm:text-sm font-medium text-gray-700">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">{t('school_code')}</div>
                    <div className="font-semibold text-gray-900">{profile.code}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">{t('location')}</div>
                    <div className="text-gray-800">{profile.address}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">Phone</div>
                    <div className="text-gray-800">{profile.phone}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">Email</div>
                    <div className="text-gray-800">{profile.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Real Campus Photos Gallery (From DB) */}
        <div className="space-y-6 pt-8 sm:pt-10 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#854D0E] uppercase tracking-wider bg-[#FFF7D6] px-3 py-1 rounded-full border border-[#F4C542]">
                {language === 'ta' ? 'பள்ளி புகைப்படங்கள்' : 'Campus Photo Gallery'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111111] mt-2">
                {language === 'ta' ? 'பள்ளியின் புகைப்படக் கேலரி' : 'Explore Our Campus & Event Highlights'}
              </h3>
            </div>
          </div>

          {loadingGallery ? (
            <div className="text-center py-12 text-gray-500 font-semibold text-sm">
              Loading Campus Gallery...
            </div>
          ) : galleryPhotos.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300 max-w-xl mx-auto space-y-2 p-6">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
              <h4 className="font-bold text-sm text-[#111111]">
                {language === 'ta' ? 'புகைப்படங்கள் எதுவும் பதிவேற்றப்படவில்லை' : 'No Campus Photos or Events Added Yet'}
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Campus photos and celebration event highlights will appear here once added by the school administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {galleryPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-2xl hover:border-[#F4C542] transition-all bg-white cursor-pointer transform hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                    <img src={photo.src} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <span className="text-[11px] font-bold text-[#854D0E] uppercase">{photo.category}</span>
                    <h4 className="font-bold text-sm text-[#111111] mt-0.5 line-clamp-1">{photo.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}

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
