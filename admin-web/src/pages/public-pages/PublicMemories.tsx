import React, { useEffect, useState } from 'react';
import { ArrowRight, Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';

export const PublicMemories: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  const defaultRealMemories = [
    { id: '1', title: language === 'ta' ? 'பாரம்பரிய நுழைவாயில்' : 'Heritage School Door Entrance', image_url: getAssetUrl('/school-images/school-door.png'), uploader_name: 'School Archives' },
    { id: '2', title: language === 'ta' ? 'முதன்மை வளாகம்' : 'School Campus & Main Block', image_url: getAssetUrl('/school-images/banner.png'), uploader_name: 'School Admin' },
    { id: '3', title: language === 'ta' ? 'குடியரசு தின விழா' : 'Republic Day Celebrations', image_url: getAssetUrl('/school-images/Republic-Day.png'), uploader_name: 'Alumni Association' },
    { id: '4', title: language === 'ta' ? 'இலவச மிதிவண்டி திட்டம்' : 'Free Bicycle Distribution Ceremony', image_url: getAssetUrl('/school-images/give-cycle.png'), uploader_name: 'Batch of 2012' },
    { id: '5', title: language === 'ta' ? 'பழைய மாணவர்கள் கூட்டம்' : 'Alumni Reunion Executive Meeting', image_url: getAssetUrl('/school-images/meeting.png'), uploader_name: 'Batch of 1998' },
    { id: '6', title: language === 'ta' ? 'முன்னாள் தலைமையாசிரியர்கள்' : 'Former Principals Honors', image_url: getAssetUrl('/school-images/old-pricipal.png'), uploader_name: 'School Management' },
    { id: '7', title: language === 'ta' ? 'பழைய மாணவர்கள் செல்ஃபி' : 'Alumni Reunion Group Selfie', image_url: getAssetUrl('/school-images/old-students-selfie.png'), uploader_name: 'Batch of 2005' },
    { id: '8', title: language === 'ta' ? 'பள்ளி மாணவர்கள் பேரணி' : 'School Students Assembly', image_url: getAssetUrl('/school-images/our-students.png'), uploader_name: 'Batch of 2018' },
    { id: '9', title: language === 'ta' ? 'ஆசிரியர்கள் சிறப்புரை' : 'Staff Speech & Annual Address', image_url: getAssetUrl('/school-images/staff-speech.png'), uploader_name: 'Alumni Desk' },
    { id: '10', title: language === 'ta' ? 'மாணவர் விருதுகள்' : 'Student Excellence Awards', image_url: getAssetUrl('/school-images/studentaward.png'), uploader_name: 'Sports Club' },
    { id: '11', title: language === 'ta' ? 'கலை நிகழ்ச்சிகள்' : 'Cultural Programs & Performances', image_url: getAssetUrl('/school-images/students-events.png'), uploader_name: 'Cultural Committee' },
    { id: '12', title: language === 'ta' ? 'பரிசு அளிப்பு விழா' : 'Annual Prize Distribution Ceremony', image_url: getAssetUrl('/school-images/sudentgetprize.png'), uploader_name: 'Batch of 2010' },
    { id: '13', title: language === 'ta' ? 'தேசியக் கொடியேற்று விழா' : 'Flag Hoisting Ceremony', image_url: getAssetUrl('/school-images/flag-inaguration.png'), uploader_name: 'School Scouts' },
  ];

  useEffect(() => {
    api.getPublicMemories()
      .then((m) => {
        if (m && m.length > 0) {
          setMemories(m);
        } else {
          setMemories(defaultRealMemories);
        }
      })
      .catch(() => setMemories(defaultRealMemories))
      .finally(() => setLoading(false));
  }, [language]);

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-4 py-1.5 rounded-full uppercase tracking-wider">
            {t('nav_memories')}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {t('memories_page_title')}
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
                  <span className="text-sm text-gray-300 font-normal">{t('uploaded_by')} {memory.uploader_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Memory Callout */}
        <div className="bg-white border-2 border-[#F4C542] rounded-3xl p-8 text-center space-y-4 shadow-xl max-w-2xl mx-auto relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#111111]">
              {language === 'ta' ? 'பள்ளி பருவ புகைப்படங்கள் உள்ளதா?' : 'Have photos from your school days?'}
            </h3>
            <p className="text-base text-gray-600 font-normal">
              {language === 'ta' ? 'உள்நுழைந்து உங்கள் நினைவுகளை பழைய வகுப்புத் தோழர்களுடன் பகிரவும்.' : 'Log in to your alumni account and share cherished memories with your batch cohort.'}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all border border-[#F4C542]/40 cursor-pointer"
            >
              <span>{t('share_memory_btn')}</span>
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
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            {/* Modal Info Bar */}
            <div className="p-6 bg-white space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#111111]">{activePhoto.title}</h3>
                <span className="text-sm text-gray-500 font-normal mt-1 block">
                  {t('uploaded_by')} {activePhoto.uploader_name}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  {language === 'ta' ? 'அனைத்து நினைவுகளையும் பகிரவும் பார்க்கவும் உள்நுழைக' : 'Log in to view all batch photos and post your memories'}
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
