import React from 'react';
import { Smartphone, Download, QrCode, ShieldCheck } from 'lucide-react';
import { Modal } from './Modal';
import { useLanguage } from '../context/LanguageContext';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ta' ? 'பழைய மாணவர்கள் மொபைல் செயலியைப் பதிவிறக்குக' : 'Download Alumni Mobile App'}
    >
      <div className="space-y-6 text-[#111111] animate-fadeIn">
        {/* App Header Banner */}
        <div className="bg-[#FFF7D6] border-2 border-[#F4C542] rounded-3xl p-6 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white border-2 border-[#F4C542] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Smartphone className="w-9 h-9 text-[#111111]" />
          </div>
          <span className="text-xs font-bold text-[#854D0E] bg-white px-3 py-1 rounded-full uppercase tracking-wider border border-[#F4C542]">
            {language === 'ta' ? 'மொபைல் செயலி' : 'OFFICIAL MOBILE APP'}
          </span>
          <h3 className="text-2xl font-bold text-[#111111] mt-2">JustGatherNow Alumni App</h3>
        </div>

        {/* QR Scanner & PlayStore Download Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* QR Code Container */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-6 text-center space-y-3 shadow-sm flex flex-col items-center justify-center">
            <div className="p-3 bg-white border-2 border-[#F4C542] rounded-2xl shadow-inner inline-block">
              {/* Styled Vector QR Code Display */}
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white" />
                {/* QR Finder Corners */}
                <rect x="5" y="5" width="28" height="28" fill="#111111" rx="4" />
                <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                <rect x="13" y="13" width="12" height="12" fill="#F4C542" rx="2" />

                <rect x="67" y="5" width="28" height="28" fill="#111111" rx="4" />
                <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                <rect x="75" y="13" width="12" height="12" fill="#F4C542" rx="2" />

                <rect x="5" y="67" width="28" height="28" fill="#111111" rx="4" />
                <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                <rect x="13" y="75" width="12" height="12" fill="#F4C542" rx="2" />

                {/* QR Data Matrix Elements */}
                <rect x="40" y="8" width="6" height="6" fill="#111111" />
                <rect x="52" y="8" width="6" height="6" fill="#111111" />
                <rect x="40" y="20" width="18" height="6" fill="#111111" />
                <rect x="40" y="32" width="6" height="18" fill="#111111" />
                <rect x="52" y="38" width="12" height="6" fill="#111111" />
                <rect x="8" y="40" width="18" height="6" fill="#111111" />
                <rect x="20" y="52" width="6" height="10" fill="#111111" />
                <rect x="40" y="55" width="12" height="12" fill="#F4C542" />
                <rect x="67" y="40" width="12" height="6" fill="#111111" />
                <rect x="82" y="40" width="12" height="12" fill="#111111" />
                <rect x="67" y="55" width="6" height="24" fill="#111111" />
                <rect x="78" y="58" width="16" height="6" fill="#111111" />
                <rect x="40" y="78" width="24" height="6" fill="#111111" />
                <rect x="52" y="86" width="12" height="6" fill="#111111" />
                <rect x="78" y="78" width="16" height="14" fill="#111111" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-[#854D0E]">
              {language === 'ta' ? 'பதிவிறக்க உங்கள் கேமராவால் ஸ்கேன் செய்யவும்' : 'Scan with your camera to download app'}
            </p>
          </div>

          {/* Download Direct APK */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-bold text-[#111111] text-lg">
                {language === 'ta' ? 'மொபைலில் எப்போதும் இணைந்திருங்கள்' : 'Stay Connected On The Go'}
              </h4>
              <p className="text-xs text-gray-600 font-normal leading-relaxed">
                {language === 'ta'
                  ? 'மறுசந்திப்புகள், புகைப்படங்கள் மற்றும் தகவல்களை நிகழ்நேரத்தில் உங்கள் மொபைலில் பெறலாம்.'
                  : 'Access real-time reunion events, batch rosters, announcements, and photo memories directly on your mobile device.'}
              </p>
            </div>

            <a
              href="/assets/apk/justgathernow-alumni-app.apk"
              download
              className="w-full py-4 px-5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 border border-[#F4C542]/40 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#F4C542]" />
              <span>{language === 'ta' ? 'APK செயலியைப் பதிவிறக்குக' : 'Download Android APK (Direct)'}</span>
            </a>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-2 text-xs text-emerald-700 bg-emerald-50 py-2.5 px-4 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">
            {language === 'ta' ? 'பாதுகாப்பான மற்றும் சரிபார்க்கப்பட்ட செயலி' : '100% Safe & Verified Official Android Release'}
          </span>
        </div>
      </div>
    </Modal>
  );
};
