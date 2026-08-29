import React from 'react';
import { Smartphone, Download, QrCode, ShieldCheck, Sparkles, X, ExternalLink } from 'lucide-react';
import { alertService } from '../services/alertService';
import { Modal } from './Modal';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Download Alumni Mobile App">
      <div className="space-y-6 text-[#111111] animate-fadeIn">
        {/* App Header Banner */}
        <div className="bg-[#FFF7D6] border-2 border-[#F4C542] rounded-3xl p-6 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white border-2 border-[#F4C542] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Smartphone className="w-9 h-9 text-[#111111]" />
          </div>
          <span className="text-xs font-bold text-[#854D0E] bg-white px-3 py-1 rounded-full uppercase tracking-wider border border-[#F4C542]">
            OFFICIAL MOBILE APP
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
                <rect x="40" y="75" width="18" height="6" fill="#111111" />
                <rect x="40" y="87" width="6" height="8" fill="#111111" />
                <rect x="52" y="84" width="16" height="10" fill="#111111" />
                <rect x="75" y="78" width="18" height="16" fill="#111111" />
              </svg>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center justify-center space-x-1">
                <QrCode className="w-3.5 h-3.5 text-[#854D0E]" />
                <span>Scan Camera QR</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Point your camera to scan &amp; download instantly</p>
            </div>
          </div>

          {/* Download App Store Badges */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Download Store Apps
            </div>

            {/* Google Play Store Badge Button */}
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#111111] hover:bg-black text-white p-3.5 rounded-2xl flex items-center space-x-3.5 transition-all shadow-md group border border-gray-800"
            >
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 fill-current text-[#F4C542]" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,13.96C20.4,13.05 20.4,10.95 18.81,10.04L16.81,8.88L14.81,12L16.81,15.12M4.5,1.22L15.3,12L4.5,22.78C4.5,22.78 4.5,22.78 4.5,1.22Z" />
                </svg>
              </div>
              <div className="text-left leading-tight">
                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">GET IT ON</div>
                <div className="text-base font-bold text-white tracking-wide">Google Play</div>
              </div>
            </a>

            {/* Apple App Store Badge Button */}
            <a
              href="https://apple.com/app-store"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#111111] hover:bg-black text-white p-3.5 rounded-2xl flex items-center space-x-3.5 transition-all shadow-md group border border-gray-800"
            >
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
              </div>
              <div className="text-left leading-tight">
                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Download on the</div>
                <div className="text-base font-bold text-white tracking-wide">App Store</div>
              </div>
            </a>

            {/* Direct APK Download Link */}
            <a
              href="#download-apk"
              onClick={(e) => {
                e.preventDefault();
                alertService.showInfo('APK Download Initiated', 'Direct Android APK build download initiated (JustGatherNow-v1.2.0.apk).');
              }}
              className="w-full py-2.5 bg-[#FFF7D6] hover:bg-[#F4C542] text-[#111111] text-xs font-bold rounded-xl border border-[#F4C542] flex items-center justify-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4 text-[#111111]" />
              <span>Direct Android APK (v1.2.0)</span>
            </a>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="pt-3 border-t border-[#E5E7EB] grid grid-cols-2 gap-3 text-left">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-[#854D0E] flex-shrink-0" />
            <span>Verified Alumni Roster</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700">
            <Sparkles className="w-4 h-4 text-[#854D0E] flex-shrink-0" />
            <span>QR Event Check-in</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
