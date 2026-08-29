import React from 'react';
import { GraduationCap } from 'lucide-react';

interface FooterProps {
  schoolName: string;
  logoUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ schoolName, logoUrl }) => {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] text-[#111111] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-9">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-9 border-b border-[#E5E7EB]">
          {/* Logo & Name */}
          <div className="flex items-center space-x-3.5">
            {logoUrl ? (
              <img src={logoUrl} alt={schoolName} className="w-12 h-12 rounded-2xl border border-[#E5E7EB] object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#111111] font-semibold text-base flex items-center justify-center shadow-xs">
                <GraduationCap className="w-6 h-6 text-[#111111]" />
              </div>
            )}
            <div>
              <div className="font-semibold text-lg text-[#111111]">{schoolName}</div>
              <div className="text-xs font-semibold text-[#854D0E]">Official School Alumni Network</div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center gap-7 text-sm font-semibold text-gray-600">
            <a href="#community-stats" className="hover:text-[#111111] transition-colors">About</a>
            <a href="#upcoming-events" className="hover:text-[#111111] transition-colors">Events</a>
            <a href="#alumni-highlights" className="hover:text-[#111111] transition-colors">Alumni</a>
            <a href="#memories-gallery" className="hover:text-[#111111] transition-colors">Memories</a>
            <a href="#school-news" className="hover:text-[#111111] transition-colors">Contact</a>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 font-normal gap-4">
          <div>
            © 2026 {schoolName} Alumni Network. Built on JustGatherNow. All Rights Reserved.
          </div>

          <div className="flex items-center space-x-5 font-semibold text-[#111111]">
            <a href="#" className="hover:text-[#854D0E] transition-colors">Privacy Policy</a>
            <span className="text-gray-300">•</span>
            <a href="#" className="hover:text-[#854D0E] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
