import React from 'react';
import { useLanguage } from '../../../../context/LanguageContext';

interface FooterProps {
  schoolName: string;
  logoUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ schoolName, logoUrl: propLogoUrl }) => {
  const { logoUrl: contextLogoUrl } = useLanguage();
  const activeLogoUrl = propLogoUrl || contextLogoUrl;

  return (
    <footer className="bg-white border-t border-[#E5E7EB] text-[#111111] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#E5E7EB]">
          {/* Logo & Name */}
          <div className="flex items-start space-x-3.5">
            <img src={contextLogoUrl} alt={schoolName} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-[#E5E7EB] object-contain shrink-0" />
            <div>
              <div className="font-semibold text-base sm:text-lg text-[#111111]">{schoolName}</div>
              <div className="text-xs font-semibold text-[#854D0E]">Official School Alumni Network</div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-7 text-xs sm:text-sm font-semibold text-gray-600">
            <a href="#community-stats" className="hover:text-[#111111] transition-colors py-1">About</a>
            <a href="#upcoming-events" className="hover:text-[#111111] transition-colors py-1">Events</a>
            <a href="#alumni-highlights" className="hover:text-[#111111] transition-colors py-1">Alumni</a>
            <a href="#memories-gallery" className="hover:text-[#111111] transition-colors py-1">Memories</a>
            <a href="#school-news" className="hover:text-[#111111] transition-colors py-1">Contact</a>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-500 font-normal gap-4 text-center sm:text-left">
          <div>
            © 2026 {schoolName} Alumni Network. Built on JustGatherNow. All Rights Reserved.
          </div>

          <div className="flex items-center space-x-4 font-semibold text-[#111111] text-xs sm:text-sm">
            <a href="#" className="hover:text-[#854D0E] transition-colors">Privacy Policy</a>
            <span className="text-gray-300">•</span>
            <a href="#" className="hover:text-[#854D0E] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
