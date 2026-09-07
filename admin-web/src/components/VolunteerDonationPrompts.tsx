import React, { useState, useEffect } from 'react';
import { Heart, HandHeart, CheckCircle2, X, Sparkles, ShieldCheck } from 'lucide-react';
import { AlumniProfile } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from './Modal';

interface VolunteerDonationPromptsProps {
  user: AlumniProfile | null;
  onProfileUpdated?: (updated: AlumniProfile) => void;
}

export const VolunteerDonationPrompts: React.FC<VolunteerDonationPromptsProps> = ({
  user,
  onProfileUpdated
}) => {
  const { language } = useLanguage();
  
  // Local Banner & Modal states
  const [showDonationBanner, setShowDonationBanner] = useState<boolean>(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    
    // Check if donation preference is unset or pending
    const donationUnset = !user.willing_to_donate || user.willing_to_donate === 'PENDING';
    const bannerDismissed = localStorage.getItem(`donation_banner_dismissed_${user.id}`);
    if (donationUnset && !bannerDismissed) {
      setShowDonationBanner(true);
    }

    // Check if volunteer preference is unset
    const volunteerUnset = !user.is_volunteer || user.is_volunteer === 'PENDING';
    const modalPrompted = localStorage.getItem(`volunteer_modal_prompted_${user.id}`);
    if (volunteerUnset && !modalPrompted) {
      // Auto open modal once after 1.5 seconds delay
      const timer = setTimeout(() => {
        setShowVolunteerModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleUpdatePreference = async (field: 'willing_to_donate' | 'is_volunteer', value: 'YES' | 'NO') => {
    if (!user || saving) return;
    setSaving(true);

    try {
      const updated = await api.updateAlumniProfile({ [field]: value });
      if (onProfileUpdated && updated) {
        onProfileUpdated(updated);
      }
      if (field === 'willing_to_donate') {
        setShowDonationBanner(false);
      } else if (field === 'is_volunteer') {
        setShowVolunteerModal(false);
        localStorage.setItem(`volunteer_modal_prompted_${user.id}`, 'true');
      }
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    } finally {
      setSaving(false);
    }
  };

  const dismissDonationBanner = () => {
    setShowDonationBanner(false);
    if (user?.id) {
      localStorage.setItem(`donation_banner_dismissed_${user.id}`, 'true');
    }
  };

  const closeVolunteerModal = () => {
    setShowVolunteerModal(false);
    if (user?.id) {
      localStorage.setItem(`volunteer_modal_prompted_${user.id}`, 'true');
    }
  };

  return (
    <>
      {/* 1. TOP DONATION WILLINGNESS STICKY BANNER BAR */}
      {showDonationBanner && user && (
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-[#111111] via-[#1F2937] to-[#111111] border-2 border-[#F4C542] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 text-white shadow-lg relative overflow-hidden animate-fadeIn">
          {/* Subtle Ambient Accent Glow */}
          <div className="absolute top-0 right-0 w-48 h-full bg-[#F4C542]/10 blur-xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4C542] text-[#111111] flex items-center justify-center shrink-0 shadow-md">
                <Heart className="w-5 h-5 fill-[#111111]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-white tracking-wide">
                    {language === 'ta'
                      ? 'பள்ளி வளர்ச்சி & உதவித்தொகை நிதிப்பங்களிப்பு'
                      : 'School Development & Student Scholarship Support'}
                  </h4>
                  <span className="bg-[#F4C542] text-[#111111] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    {language === 'ta' ? 'விருப்பம்' : 'Willingness'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-300 font-normal mt-0.5">
                  {language === 'ta'
                    ? 'நமது பள்ளியின் வளர்ச்சிக்கும் ஏழை மாணவர் நலனுக்கும் நன்கொடை வழங்க விருப்பம் உள்ளதா?'
                    : 'Are you willing to contribute or donate for school infrastructure & student welfare?'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end pt-1 md:pt-0 border-t md:border-t-0 border-gray-700">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleUpdatePreference('willing_to_donate', 'YES')}
                className={`px-3.5 sm:px-4 py-2 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 ${
                  user.willing_to_donate === 'YES' ? 'ring-2 ring-white' : ''
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'ஆம், விருப்பம் உண்டு' : 'Yes, Willing to Donate'}</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleUpdatePreference('willing_to_donate', 'NO')}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-gray-600 disabled:opacity-50"
              >
                <span>{language === 'ta' ? 'இல்லை' : 'No'}</span>
              </button>

              <button
                type="button"
                onClick={dismissDonationBanner}
                className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-xl"
                title="Dismiss Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE VOLUNTEER POPUP MODAL */}
      <Modal
        isOpen={showVolunteerModal}
        onClose={closeVolunteerModal}
        title={language === 'ta' ? 'தன்னார்வலர் சேர்க்கை' : 'Join as an Alumni Volunteer'}
      >
        <div className="space-y-6 text-center p-2 sm:p-4">
          <div className="w-20 h-20 bg-[#FFF7D6] border-4 border-[#F4C542] rounded-3xl flex items-center justify-center text-[#854D0E] mx-auto shadow-md">
            <HandHeart className="w-10 h-10 text-[#854D0E]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111]">
              {language === 'ta' ? 'பள்ளித் தன்னார்வலராகச் சேர விருப்பமா?' : 'Would you like to be a Volunteer?'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-normal max-w-md mx-auto leading-relaxed">
              {language === 'ta'
                ? 'பள்ளி விழாக்கள், முன்னாள் மாணவர்கள் சந்திப்புகள் மற்றும் மாணவர் வழிகாட்டுதல் நிகழ்வுகளில் தன்னார்வலராகப் பங்கேற்க விருப்பமா?'
                : 'Join our active team of volunteers to help organize reunions, mentor current students, and support official school programs.'}
            </p>
          </div>

          {/* Decision Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleUpdatePreference('is_volunteer', 'YES')}
              className="p-4 bg-gradient-to-b from-[#FFF7D6] to-[#FEF08A] hover:from-[#FEF08A] hover:to-[#FDE047] border-2 border-[#F4C542] rounded-2xl shadow-md text-left transition-all transform hover:-translate-y-0.5 cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#854D0E] group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-sm text-[#111111]">
                  {language === 'ta' ? 'ஆம், தன்னார்வலராகச் சேர்கிறேன்' : 'Yes, Count Me In!'}
                </span>
              </div>
              <p className="text-[11px] text-[#854D0E] font-medium mt-1">
                {language === 'ta' ? 'நிகழ்வுகளில் சேவை செய்ய விருப்பம்' : 'Willing to support events & mentorship'}
              </p>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleUpdatePreference('is_volunteer', 'NO')}
              className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-2xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <X className="w-5 h-5 text-gray-500" />
                <span className="font-bold text-sm text-gray-700">
                  {language === 'ta' ? 'இப்போது வேண்டாம்' : 'Not Right Now'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium mt-1">
                {language === 'ta' ? 'பின்னர் முடிவு செய்கிறேன்' : 'Can update preference later in profile'}
              </p>
            </button>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-gray-400 font-medium inline-flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ta' ? 'உங்கள் தகவல்கள் பாதுகாப்பாகப் பராமரிக்கப்படும்' : 'Preferences can be changed anytime in Settings'}</span>
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
};
