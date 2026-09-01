import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface HeaderProps {
  schoolName: string;
  schoolCode: string;
  logoUrl?: string;
  onOpenLoginModal: () => void;
  onOpenRegisterModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  schoolName,
  schoolCode,
  logoUrl: propLogoUrl,
  onOpenLoginModal,
  onOpenRegisterModal
}) => {
  const { language, setLanguage, logoUrl: contextLogoUrl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeLogoUrl = propLogoUrl || contextLogoUrl;

  const navLinks = [
    { label: 'Alumni', href: '#alumni-highlights' },
    { label: 'Events', href: '#upcoming-events' },
    { label: 'Batches', href: '#find-your-batch' },
    { label: 'Memories', href: '#memories-gallery' },
    { label: 'About', href: '#community-stats' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 lg:h-24 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <a href="/" className="flex items-center space-x-2.5 sm:space-x-3.5 group min-w-0">
          <img src={contextLogoUrl} alt={schoolName} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-[#E5E7EB] object-contain shadow-xs group-hover:scale-105 transition-transform flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-sm sm:text-base md:text-lg text-[#111111] tracking-tight group-hover:text-[#854D0E] transition-colors leading-snug truncate max-w-[150px] xs:max-w-[210px] sm:max-w-xs md:max-w-none">
              {schoolName}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-[#854D0E] tracking-wide uppercase flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#F4C542] inline-block animate-pulse shrink-0"></span>
              <span className="truncate">Official Alumni Network</span>
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-9">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-[#4B5563] hover:text-[#111111] transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions & Language Toggle */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 lg:space-x-4">
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <button
              onClick={onOpenLoginModal}
              className="text-sm font-semibold text-[#111111] hover:text-[#854D0E] px-4 lg:px-5 py-2.5 lg:py-3 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#F4C542] hover:bg-[#FFF7D6]/50 transition-all cursor-pointer"
            >
              Alumni Login
            </button>

            <button
              onClick={onOpenRegisterModal}
              className="text-sm font-semibold text-[#111111] bg-[#F4C542] hover:bg-[#E0B030] px-5 lg:px-6 py-2.5 lg:py-3 rounded-2xl shadow-sm transition-all flex items-center space-x-2 active:scale-95 border border-[#E0B030] cursor-pointer"
            >
              <span>Join Alumni Network</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* DIRECT INLINE LANGUAGE TOGGLE SWITCH */}
          <div className="inline-flex items-center bg-gray-100 p-1 rounded-2xl border-2 border-[#E5E7EB] shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'ta'
                  ? 'bg-[#111111] text-[#F4C542] shadow-sm border border-[#F4C542]/50 scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              தமிழ்
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#111111] text-[#F4C542] shadow-sm border border-[#F4C542]/50 scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              ENG
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl text-[#111111] hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5E7EB] px-5 py-5 space-y-4 animate-fadeIn shadow-lg">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#111111] hover:text-[#854D0E] py-2.5 border-b border-gray-100 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </a>
            ))}
          </nav>

          <div className="pt-2 flex flex-col space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLoginModal();
              }}
              className="w-full text-center text-sm font-semibold text-[#111111] py-3 rounded-2xl border-2 border-[#E5E7EB] hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Alumni Login
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegisterModal();
              }}
              className="w-full text-center text-sm font-semibold text-[#111111] bg-[#F4C542] hover:bg-[#E0B030] py-3 rounded-2xl shadow-sm border border-[#E0B030] active:scale-[0.99] transition-all"
            >
              Join Alumni Network
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
