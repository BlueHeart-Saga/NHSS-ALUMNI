import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, Smartphone, QrCode } from 'lucide-react';
import { api } from '../services/api';
import { alertService } from '../services/alertService';
import { SchoolProfile } from '../types';
import { MobileAppModal } from '../components/MobileAppModal';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);

  useEffect(() => {
    api.getPublicStats()
      .then((s) => setSchool({
        id: 'school',
        name: s.school_name,
        code: s.school_code,
        logo_url: s.logo_url,
        description: s.description
      }))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (api.getToken()) {
      api.getProfile()
        .then((p: any) => {
          if (p) setUser(p);
        })
        .catch(() => {
          api.clearToken();
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    alertService.showInfo('Logged Out', 'You have been logged out of your session.');
  };

  const navLinks = [
    { label: t('nav_home'), path: '/' },
    { label: t('nav_about'), path: '/about' },
    { label: t('nav_school_profile'), path: '/school' },
    { label: t('nav_batches'), path: '/batches' },
    { label: t('nav_events'), path: '/events' },
    { label: t('nav_memories'), path: '/memories' },
    { label: t('nav_contact'), path: '/contact' }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col font-sans selection:bg-[#F4C542] selection:text-[#111111]">
      {/* Brand Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 sm:space-x-4">
            <img
              src="/assets/logo/image.png"
              alt={school?.name || "School Logo"}
              className="h-12 sm:h-16 w-auto object-contain flex-shrink-0"
            />
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#111111] leading-tight">
                {school?.name || t('app_title')}
              </h1>
              <span className="text-xs sm:text-base text-[#854D0E] font-semibold tracking-wide block mt-0.5">
                {t('tagline')}
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Language Selector Dropdown */}
            <LanguageSelector />

            {user ? (
              <div className="flex items-center space-x-2 text-sm sm:text-lg font-medium tracking-widest text-gray-700 uppercase">
                <span className="text-[#111111] font-semibold py-1 lowercase hidden md:inline">
                  {user.email || user.full_name}
                </span>
                <span className="text-[#F4C542] font-semibold px-1 hidden md:inline">||</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hover:text-[#111111] transition-colors py-1 cursor-pointer uppercase font-medium"
                >
                  {t('nav_logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm sm:text-lg font-medium tracking-widest text-gray-700 uppercase">
                <Link
                  to="/register"
                  className="hover:text-[#111111] transition-colors py-1"
                >
                  {t('nav_register')}
                </Link>
                <span className="text-[#F4C542] font-semibold px-1">||</span>
                <Link
                  to="/login"
                  className="hover:text-[#111111] transition-colors py-1"
                >
                  {t('nav_login')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Navigation Bar: Full Height Links and GET MOBILE APP Button */}
        <div className="bg-[#F4C542] text-[#111111] shadow-sm h-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <nav className="flex items-center h-full overflow-x-auto scrollbar-none text-sm sm:text-base font-semibold uppercase tracking-wider space-x-0.5 sm:space-x-1">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative h-full flex items-center px-2.5 sm:px-3 overflow-hidden whitespace-nowrap group transition-colors focus:outline-none"
                  >
                    {/* Dark Yellow Bottom-to-Top Slide Fill Hover Overlay */}
                    <div
                      className={`absolute inset-0 bg-[#D9A31E] transition-transform duration-300 ease-out pointer-events-none ${
                        isActive ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
                      }`}
                    />

                    {/* Active Bottom Dark Line Indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#111111] z-20" />
                    )}

                    {/* Link Text */}
                    <span className={`relative z-10 text-base transition-colors ${isActive ? 'font-bold text-[#111111]' : 'font-semibold text-[#111111]/90 group-hover:text-[#111111]'}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* GET MOBILE APP Action Button */}
            <button
              type="button"
              onClick={() => setIsAppModalOpen(true)}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md border border-[#F4C542]/40 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex-shrink-0 ml-2"
            >
              <Smartphone className="w-4 h-4 text-[#F4C542]" />
              <span>{t('nav_get_mobile_app')}</span>
              <QrCode className="w-4 h-4 text-[#F4C542]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-10 text-sm text-gray-600 font-normal mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="font-semibold text-[#111111] text-base sm:text-lg">{school?.name || t('app_title')}</div>
            <div className="mt-1.5 text-sm text-gray-500 font-medium flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span>{t('copyright')}</span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <Link
                to="/admin/login"
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-normal inline-flex items-center space-x-1"
                title="School Admin Management Login"
              >
                <Shield className="w-3 h-3 text-gray-400 opacity-60" />
                <span>{t('school_admin_login')}</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-6 sm:gap-x-8 gap-y-2 text-sm sm:text-base font-semibold text-[#111111] py-1">
            <Link to="/about" className="hover:text-[#854D0E] transition-colors whitespace-nowrap">{t('nav_about')}</Link>
            <Link to="/school" className="hover:text-[#854D0E] transition-colors whitespace-nowrap">{t('nav_school_profile')}</Link>
            <Link to="/batches" className="hover:text-[#854D0E] transition-colors whitespace-nowrap">{t('nav_batches')}</Link>
            <Link to="/events" className="hover:text-[#854D0E] transition-colors whitespace-nowrap">{t('nav_events')}</Link>
            <Link to="/memories" className="hover:text-[#854D0E] transition-colors whitespace-nowrap">{t('nav_memories')}</Link>
            <Link to="/contact" className="hover:text-[#854D0E] transition-colors whitespace-nowrap">{t('nav_contact')}</Link>
            <button
              onClick={() => setIsAppModalOpen(true)}
              className="text-[#854D0E] hover:underline font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer whitespace-nowrap"
            >
              <Smartphone className="w-4 h-4" />
              <span>{t('nav_get_mobile_app')}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile App QR & PlayStore Modal */}
      <MobileAppModal isOpen={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} />
    </div>
  );
};
