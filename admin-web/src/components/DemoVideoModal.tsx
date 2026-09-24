import React, { useState, useEffect } from 'react';
import { Play, X, Video } from 'lucide-react';

export type VideoType = 'LOGIN' | 'REGISTRATION' | 'CREATE_PASSWORD';

export interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: VideoType;
  language?: 'ta' | 'en';
}

export const DEMO_VIDEOS: Record<VideoType, {
  id: VideoType;
  labelEn: string;
  labelTa: string;
  titleEn: string;
  titleTa: string;
  driveIdEn: string;
  driveIdTa?: string;
}> = {
  LOGIN: {
    id: 'LOGIN',
    labelEn: 'Login',
    labelTa: 'Login',
    titleEn: 'Portal Login Guide Video',
    titleTa: 'போர்டல் உள்நுழைவு வழிகாட்டி வீடியோ',
    driveIdEn: '1IYZbPRUn4hBM8brwQuWYjGQproDur8xr',
    driveIdTa: '18TDyhJtYMOUbb9IXzuny9ilxfiHnFppf',
  },
  REGISTRATION: {
    id: 'REGISTRATION',
    labelEn: 'Register',
    labelTa: 'Register',
    titleEn: 'Alumni Registration Guide Video',
    titleTa: 'முன்னாள் மாணவர்கள் பதிவு வழிகாட்டி வீடியோ',
    driveIdEn: '1_tWOwSDRipxs1EY14FJ7Y7iqVvgDe6rX',
    driveIdTa: '1VMN9-NlEtqNwBEkqlGz43iDz237GmUhc',
  },
  CREATE_PASSWORD: {
    id: 'CREATE_PASSWORD',
    labelEn: 'Verify',
    labelTa: 'Verify',
    titleEn: 'Create Account Password Guide Video',
    titleTa: 'கடவுச்சொல் உருவாக்கம் வழிகாட்டி வீடியோ',
    driveIdEn: '1bvZsqDK1Izplue96cJXXmeeov_i8jLBB',
    driveIdTa: undefined, // Single master video available
  },
};

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({
  isOpen,
  onClose,
  initialType = 'LOGIN',
  language = 'en',
}) => {
  const [activeType, setActiveType] = useState<VideoType>(initialType);
  const [activeLang, setActiveLang] = useState<'ta' | 'en'>(language);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    setActiveType(initialType);
  }, [initialType]);

  useEffect(() => {
    setActiveLang(language);
  }, [language]);

  useEffect(() => {
    setIframeLoading(true);
  }, [activeType, activeLang]);

  if (!isOpen) return null;

  const currentVideo = DEMO_VIDEOS[activeType];
  const hasTa = Boolean(currentVideo.driveIdTa);

  // Resolve effective Drive ID
  const effectiveLang = (activeLang === 'ta' && hasTa) ? 'ta' : 'en';
  const effectiveDriveId = effectiveLang === 'ta' ? currentVideo.driveIdTa : currentVideo.driveIdEn;
  const embedUrl = `https://drive.google.com/file/d/${effectiveDriveId}/preview`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#111111] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#111111] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F4C542] text-[#111111] flex items-center justify-center shrink-0 shadow-sm">
              <Video className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {activeLang === 'ta' ? currentVideo.titleTa : currentVideo.titleEn}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 ml-3"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Topic Selector (Login, Register, Verify) & Language Switcher Bar */}
        <div className="bg-[#1C1C1E] border-t border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* 3 Video Tabs: Login, Register, Verify */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
            {(Object.keys(DEMO_VIDEOS) as VideoType[]).map((vKey) => {
              const item = DEMO_VIDEOS[vKey];
              const isSelected = activeType === vKey;
              return (
                <button
                  key={vKey}
                  type="button"
                  onClick={() => setActiveType(vKey)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-[#F4C542] text-[#111111] shadow-xs'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Play className={`w-3 h-3 ${isSelected ? 'fill-[#111111] text-[#111111]' : 'text-gray-400'}`} />
                  <span>{item.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Language Switcher Pills */}
          <div className="flex items-center bg-white/10 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setActiveLang('ta')}
              disabled={!hasTa}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                effectiveLang === 'ta'
                  ? 'bg-[#F4C542] text-[#111111] shadow-xs'
                  : hasTa
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-500 opacity-50 cursor-not-allowed'
              }`}
              title={hasTa ? 'தமிழ்' : 'தமிழ் வீடியோ கிடைக்கவில்லை'}
            >
              <span>தமிழ்</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                effectiveLang === 'en'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>English</span>
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative flex-1 bg-black aspect-video w-full overflow-hidden flex items-center justify-center min-h-[320px] sm:min-h-[440px]">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 bg-[#111111] flex flex-col items-center justify-center text-white space-y-3">
              <div className="w-10 h-10 border-4 border-[#F4C542] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-gray-300">
                {activeLang === 'ta' ? 'வீடியோ ஏற்றப்படுகிறது...' : 'Loading video player...'}
              </p>
            </div>
          )}

          <iframe
            src={embedUrl}
            title={activeLang === 'ta' ? currentVideo.titleTa : currentVideo.titleEn}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            onLoad={() => setIframeLoading(false)}
          ></iframe>
        </div>
      </div>
    </div>
  );
};
