import React, { useState } from 'react';
import { Smartphone, Sparkles, Bell, Clock, ShieldCheck, Send, CheckCircle2, Download, Zap, Users, Award } from 'lucide-react';
import { Modal } from './Modal';
import { useLanguage } from '../context/LanguageContext';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setNotified(true);
      setTimeout(() => {
        setNotified(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ta' ? 'மொபைல் செயலி - விரைவில்' : 'NHSS Alumni Mobile App'}
    >
      <div className="space-y-6 text-[#111111] animate-fadeIn">
        {/* Coming Soon Hero Banner */}
        <div className="relative bg-gradient-to-br from-[#111111] via-[#1A1A1A] to-[#2D2A1E] rounded-3xl p-6 sm:p-7 text-center text-white overflow-hidden shadow-xl border border-[#F4C542]/30">
          {/* Subtle Glowing Background Accents */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#F4C542]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#F4C542]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Floating Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#F4C542]/15 border border-[#F4C542]/40 px-3.5 py-1.5 rounded-full mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#F4C542] animate-pulse" />
            <span className="text-[11px] font-extrabold text-[#F4C542] tracking-wider uppercase">
              {language === 'ta' ? 'விரைவில் வெளியீடு' : 'LAUNCHING SOON • OFFICIAL APP'}
            </span>
          </div>

          {/* Hero Smartphone Icon */}
          <div className="relative w-16 h-16 bg-gradient-to-tr from-[#F4C542] to-[#FFE899] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#F4C542]/20 transform hover:scale-105 transition-transform">
            <Smartphone className="w-9 h-9 text-[#111111]" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4C542] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F4C542]"></span>
            </span>
          </div>

          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            NHSS Alumni Mobile App
          </h3>
          <p className="text-xs text-gray-300 mt-2 max-w-md mx-auto leading-relaxed font-normal">
            {language === 'ta'
              ? 'உங்கள் பள்ளி தோழர்களுடன் இணைந்திருக்க, நிகழ்வு தகவல்கள் மற்றும் புதுப்பிப்புகளை உடனுக்குடன் பெற புதிய மொபைல் செயலி தயாராகி வருகிறது!'
              : 'We are building a seamless iOS & Android app for instant reunion alerts, batchmate networking, digital alumni IDs, and photo memories.'}
          </p>

          {/* App Store / Play Store Teasers */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {/* Apple App Store */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-xl text-xs text-gray-200">
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-92.1-61.7-92.1zM273 99.3c18.7-22.3 32-53.5 27.6-84.3-25.2 1.3-56.9 17.4-74.1 37.8-15.6 18.2-29.8 48.8-24.8 78.8 28.1 1.7 57.2-14.7 71.3-32.3z" />
              </svg>
              <div className="text-left leading-tight">
                <div className="text-[9px] uppercase tracking-wider text-gray-400">App Store</div>
                <div className="font-semibold text-white text-[11px]">{language === 'ta' ? 'விரைவில்' : 'Coming Soon'}</div>
              </div>
            </div>

            {/* Google Play Store */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-xl text-xs text-gray-200">
              <svg className="w-4 h-4 fill-current text-[#F4C542]" viewBox="0 0 512 512">
                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
              </svg>
              <div className="text-left leading-tight">
                <div className="text-[9px] uppercase tracking-wider text-gray-400">Google Play</div>
                <div className="font-semibold text-white text-[11px]">{language === 'ta' ? 'விரைவில்' : 'Coming Soon'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#854D0E] mb-3 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-[#F4C542]" />
            <span>{language === 'ta' ? 'எதிர்பார்க்கப்படும் சிறப்பம்சங்கள்' : 'Upcoming App Features'}</span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FAF9F5] border border-[#E5E7EB] rounded-2xl p-3 flex items-start space-x-2.5">
              <div className="p-2 bg-[#FFF7D6] text-[#854D0E] rounded-xl flex-shrink-0">
                <Bell className="w-4 h-4 text-[#854D0E]" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#111111]">
                  {language === 'ta' ? 'நிகழ்நேர அறிவிப்புகள்' : 'Instant Alerts'}
                </h5>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                  {language === 'ta' ? 'நிகழ்வுகள் மற்றும் செய்திகள்' : 'Reunions & announcements'}
                </p>
              </div>
            </div>

            <div className="bg-[#FAF9F5] border border-[#E5E7EB] rounded-2xl p-3 flex items-start space-x-2.5">
              <div className="p-2 bg-[#FFF7D6] text-[#854D0E] rounded-xl flex-shrink-0">
                <Users className="w-4 h-4 text-[#854D0E]" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#111111]">
                  {language === 'ta' ? 'வகுப்பு தோழர்கள்' : 'Batch Directory'}
                </h5>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                  {language === 'ta' ? 'தோழர்களுடன் தொடர்பு' : 'Connect with batchmates'}
                </p>
              </div>
            </div>

            <div className="bg-[#FAF9F5] border border-[#E5E7EB] rounded-2xl p-3 flex items-start space-x-2.5">
              <div className="p-2 bg-[#FFF7D6] text-[#854D0E] rounded-xl flex-shrink-0">
                <Award className="w-4 h-4 text-[#854D0E]" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#111111]">
                  {language === 'ta' ? 'டிஜிட்டல் அடையாள அட்டை' : 'Digital Alumni Pass'}
                </h5>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                  {language === 'ta' ? 'சரிபார்க்கப்பட்ட அட்டை' : 'Verified alumni badge'}
                </p>
              </div>
            </div>

            <div className="bg-[#FAF9F5] border border-[#E5E7EB] rounded-2xl p-3 flex items-start space-x-2.5">
              <div className="p-2 bg-[#FFF7D6] text-[#854D0E] rounded-xl flex-shrink-0">
                <Clock className="w-4 h-4 text-[#854D0E]" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#111111]">
                  {language === 'ta' ? 'நினைவு ஆல்பம்' : 'Photo Gallery'}
                </h5>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                  {language === 'ta' ? 'பள்ளி புகைப்படங்கள்' : 'Event photo albums'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notify Me Form */}
        <div className="bg-[#FFF7D6]/60 border-2 border-[#F4C542]/40 rounded-2xl p-4">
          {notified ? (
            <div className="flex items-center justify-center space-x-2 text-emerald-800 font-semibold text-xs py-1 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                {language === 'ta'
                  ? 'நன்றி! செயலி வெளியாகும் போது உங்களுக்கு அறிவிப்போம்.'
                  : 'Thank you! We will notify you as soon as the app goes live.'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleNotifyMe} className="space-y-2">
              <label className="block text-xs font-bold text-[#854D0E]">
                {language === 'ta' ? 'வெளியீட்டு அறிவிப்பைப் பெற உங்கள் மின்னஞ்சலை அளிக்கவும்:' : 'Get notified first when the app is launched:'}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  required
                  placeholder={language === 'ta' ? 'உங்கள் மின்னஞ்சல் முகவரி...' : 'Enter your email address...'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#F4C542]/60 rounded-xl text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F4C542] placeholder-gray-400 shadow-sm"
                />
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 border border-[#F4C542]/40 cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-[#F4C542]" />
                  <span>{language === 'ta' ? 'அனுப்பு' : 'Notify Me'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Direct APK Download Teaser */}
        <div className="pt-2 text-center border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{language === 'ta' ? 'பாதுகாப்பான செயலி' : 'Official NHSS App'}</span>
          </div>

          <a
            href="/assets/apk/NHSS.apk"
            download
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#854D0E] hover:text-[#111111] underline transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'முன்னோட்ட APK பதிவிறக்கம்' : 'Download Preview APK'}</span>
          </a>
        </div>
      </div>
    </Modal>
  );
};
