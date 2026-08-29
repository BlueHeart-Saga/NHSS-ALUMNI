import React, { useState } from 'react';
import { Menu, X, ArrowRight, GraduationCap } from 'lucide-react';

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
  logoUrl,
  onOpenLoginModal,
  onOpenRegisterModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Alumni', href: '#alumni-highlights' },
    { label: 'Events', href: '#upcoming-events' },
    { label: 'Batches', href: '#find-your-batch' },
    { label: 'Memories', href: '#memories-gallery' },
    { label: 'About', href: '#community-stats' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <a href="/" className="flex items-center space-x-3.5 group">
          {logoUrl ? (
            <img src={logoUrl} alt={schoolName} className="w-12 h-12 rounded-2xl border border-[#E5E7EB] object-cover shadow-xs group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#111111] font-semibold text-base flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7 text-[#111111]" />
            </div>
          )}
          <div>
            <div className="font-semibold text-lg text-[#111111] tracking-tight group-hover:text-[#854D0E] transition-colors leading-snug">
              {schoolName}
            </div>
            <div className="text-xs font-semibold text-[#854D0E] tracking-wide uppercase flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#F4C542] inline-block animate-pulse"></span>
              <span>Official Alumni Network</span>
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-9">
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

        {/* Right CTA Actions (Public Login & Join) */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={onOpenLoginModal}
            className="text-sm font-semibold text-[#111111] hover:text-[#854D0E] px-5 py-3 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#F4C542] hover:bg-[#FFF7D6]/50 transition-all"
          >
            Alumni Login
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="text-sm font-semibold text-[#111111] bg-[#F4C542] hover:bg-[#E0B030] px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center space-x-2 active:scale-95 border border-[#E0B030]"
          >
            <span>Join Alumni Network</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-3 rounded-2xl text-[#111111] hover:bg-gray-100 transition-colors border border-gray-200"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5E7EB] px-6 py-6 space-y-5 animate-fadeIn">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#111111] hover:text-[#854D0E] py-2 border-b border-gray-100"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-2 flex flex-col space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLoginModal();
              }}
              className="w-full text-center text-sm font-semibold text-[#111111] py-3.5 rounded-2xl border-2 border-[#E5E7EB]"
            >
              Alumni Login
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegisterModal();
              }}
              className="w-full text-center text-sm font-semibold text-[#111111] bg-[#F4C542] hover:bg-[#E0B030] py-3.5 rounded-2xl shadow-sm border border-[#E0B030]"
            >
              Join Alumni Network
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
