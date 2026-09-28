import React from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Smartphone,
  Mail,
  FileCheck,
  Server,
  ArrowRight,
  Database,
  Key,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const PublicPrivacy: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-white text-[#111111] animate-fadeIn">
      {/* Hero Header Section */}
      <section className="relative bg-gradient-to-br from-[#111111] via-[#1A1A1A] to-[#2D2A1E] text-white py-14 sm:py-20 border-b border-[#F4C542]/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4C542]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F4C542]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-[#F4C542]/15 border border-[#F4C542]/40 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-[#F4C542]" />
            <span className="text-xs font-extrabold text-[#F4C542] tracking-wider uppercase">
              {language === 'ta' ? 'தரவு பாதுகாப்பு & தனியுரிமைக் கொள்கை' : 'DATA PRIVACY SHIELD & MEMBER CONTROL'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {language === 'ta' ? 'தனியுரிமைக் கொள்கை' : 'Privacy Policy'}
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-relaxed font-normal">
            {language === 'ta'
              ? 'உங்கள் தனிப்பட்ட விவரங்களைப் பாதுகாத்தல், தொலைபேசி எண் & மின்னஞ்சல் தெரிவுநிலையைக் கட்டுப்படுத்துதல் மற்றும் பாதுகாப்பான பயன்பாட்டிற்கான எங்களது கொள்கைகள்.'
              : 'How we collect, protect, and give you complete real-time control over your personal profiles, phone numbers, and contact visibility.'}
          </p>

          <div className="pt-2 text-xs text-gray-400 font-mono">
            {language === 'ta' ? 'கடைசியாகப் புதுப்பிக்கப்பட்டது: செப்டம்பர் 2026' : 'Last Updated: September 2026 • Security Certified'}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Core Privacy Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] flex items-center justify-center font-bold">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#111111]">
              {language === 'ta' ? 'தொடர்புத் தகவல்கள் மறைப்பு' : 'Private by Default'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'ta'
                ? 'உங்கள் தொலைபேசி எண் மற்றும் மின்னஞ்சல் இயல்பாகவே மறைக்கப்படும். நீங்கள் விரும்பினால் மட்டுமே காட்டப்படும்.'
                : 'Mobile numbers are kept hidden by default unless explicitly toggled to visible in your member settings.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#111111]">
              {language === 'ta' ? 'விளம்பர விற்பனை இல்லை' : 'Zero Commercial Selling'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'ta'
                ? 'முன்னாள் மாணவர்களின் தகவல்கள் எக்காரணம் கொண்டும் எந்த வெளி நிறுவனத்திற்கும் விற்பனை செய்யப்படாது.'
                : 'We never monetize, rent, or sell alumni databases to third-party marketing companies or brokers.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#111111]">
              {language === 'ta' ? 'பாதுகாப்பான OTP சரிபார்ப்பு' : 'Encrypted Authentication'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'ta'
                ? 'கணக்கு உள்நுழைவுகள் 6-இலக்க OTP மற்றும் ஹாஷ் செய்யப்பட்ட கடவுச்சொற்கள் மூலம் பாதுகாக்கப்படுகின்றன.'
                : 'Secure 6-digit OTP verification and salted password hashing guarantee your account protection.'}
            </p>
          </div>
        </div>

        {/* Detailed Content Cards */}
        <div className="space-y-10 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {/* Section 1: Data Collection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                {language === 'ta' ? 'சேகரிக்கப்படும் தகவல்கள்' : '1. Information We Collect'}
              </h2>
            </div>
            <p>
              {language === 'ta'
                ? 'நமது பள்ளி முன்னாள் மாணவர்கள் நெட்வொர்க்கில் பதிவு செய்யும் போது கீழ்க்கண்ட தகவல்கள் சேகரிக்கப்படுகின்றன:'
                : 'To maintain an authentic, verified alumni registry for Natarajan Higher Secondary School, we collect minimal necessary profile details:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <h4 className="font-bold text-[#111111] text-xs uppercase tracking-wider">
                  {language === 'ta' ? 'அடையாளம் & கல்வித் தகவல்கள்:' : 'Identity & Academic Records:'}
                </h4>
                <p className="text-xs text-gray-600">
                  {language === 'ta'
                    ? 'முழுப் பெயர், பிறந்த தேதி, பயின்ற ஆண்டு (Passing Year), வகுப்பு மற்றும் கல்விச் சாதனைகள்.'
                    : 'Full name, Date of birth, Passing year, Class standard, Section, Profile photo, Academic achievements.'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <h4 className="font-bold text-[#111111] text-xs uppercase tracking-wider">
                  {language === 'ta' ? 'தொடர்பு & தொழில் தகவல்கள்:' : 'Contact & Professional Info:'}
                </h4>
                <p className="text-xs text-gray-600">
                  {language === 'ta'
                    ? 'கைபேசி எண், வாட்ஸ்அப் எண், மின்னஞ்சல், தற்போதைய நகரம், தொழில் மற்றும் பணி விவரங்கள்.'
                    : 'Mobile number, WhatsApp number, Email address, Current city, Employment status, Company & Designation.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Privacy Controls */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                {language === 'ta' ? 'நிகழ்நேரத் தனியுரிமைக் கட்டுப்பாடுகள்' : '2. Real-Time Profile Privacy Controls'}
              </h2>
            </div>
            <p>
              {language === 'ta'
                ? 'உங்கள் சுயவிவரப் பக்கத்தில் (Profile Settings) உள்ள தனியுரிமைக் கட்டுப்பாடுகள் மூலம் உங்கள் தகவல்களை யார் பார்க்கலாம் என்பதை நீங்களே முடிவு செய்யலாம்:'
                : 'Every registered alumnus maintains complete control over their profile visibility via live toggle switches inside Profile Settings:'}
            </p>
            <div className="space-y-3 pt-1">
              <div className="flex items-start space-x-3 p-3.5 bg-[#FFF7D6]/50 border border-[#F4C542] rounded-2xl">
                <Smartphone className="w-5 h-5 text-[#854D0E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#111111]">
                    {language === 'ta' ? 'தொலைபேசி எண் தெரிவுநிலை (Phone Visibility Toggle)' : 'Phone Number Visibility Control'}
                  </h4>
                  <p className="text-xs text-gray-700">
                    {language === 'ta'
                      ? 'இதை முடக்கும் போது (OFF) உங்கள் கைபேசி எண் மற்ற உறுப்பினர்களுக்குக் காட்டப்படாது.'
                      : 'When disabled, your phone number is completely masked in the alumni directory.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 bg-[#FFF7D6]/50 border border-[#F4C542] rounded-2xl">
                <Mail className="w-5 h-5 text-[#854D0E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#111111]">
                    {language === 'ta' ? 'மின்னஞ்சல் தெரிவுநிலை (Email Visibility Toggle)' : 'Email Address Visibility Control'}
                  </h4>
                  <p className="text-xs text-gray-700">
                    {language === 'ta'
                      ? 'மின்னஞ்சல் முகவரியை மற்றவர்கள் காண்பதை முடக்கிக் கொள்ளும் வசதி உண்டு.'
                      : 'Optionally hide your email address from standard directory searches.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 bg-[#FFF7D6]/50 border border-[#F4C542] rounded-2xl">
                <Eye className="w-5 h-5 text-[#854D0E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#111111]">
                    {language === 'ta' ? 'டைரக்டரி பட்டியலிடல் (Directory Listing Toggle)' : 'Directory Search Inclusion'}
                  </h4>
                  <p className="text-xs text-gray-700">
                    {language === 'ta'
                      ? 'தேவையெனில் உங்களை டைரக்டரி பட்டியலில் இருந்து முழுமையாக விலக்கிக் கொள்ளலாம்.'
                      : 'Control whether your profile appears in public or general batch search queries.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Data Security */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                {language === 'ta' ? 'தரவு பாதுகாப்பு மற்றும் சேமிப்பு' : '3. Data Security Standards & Encryption'}
              </h2>
            </div>
            <p>
              {language === 'ta'
                ? 'அனைத்துத் தரவுகளும் SSL/TLS சைகை முறையால் குறியாக்கம் செய்யப்பட்டு பாதுகாப்பான சர்வர்களில் சேமிக்கப்படுகின்றன. பள்ளி நிர்வாகியால் மட்டுமே உறுப்பினர்களின் சரிபார்ப்புச் சான்றுகள் மதிப்பாய்வு செய்யப்படும்.'
                : 'All database transactions are transmitted over 256-bit SSL/TLS encrypted connections. Account authentication relies on multi-stage verification to prevent unauthorized access.'}
            </p>
          </div>

          {/* Section 4: Data Rights */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                4
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                {language === 'ta' ? 'உங்கள் தரவு உரிமைகள்' : '4. Your Member Data Rights'}
              </h2>
            </div>
            <p>
              {language === 'ta'
                ? 'உங்கள் தகவல்களை எந்த நேரத்திலும் புதுப்பிக்கவோ அல்லது கணக்கை நீக்கக் கோரவோ உங்களுக்கு முழு உரிமை உண்டு. உதவிக்கு எங்கள் தொடர்பைப் பயன்படுத்தலாம்.'
                : 'You retain full ownership of your personal data. You may update your profile details or request profile deletion by reaching out to our school admin team.'}
            </p>
          </div>
        </div>

        {/* Footer Action Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white border-2 border-[#F4C542] flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white">
              {language === 'ta' ? 'தனியுரிமை தொடர்புகளுக்கு' : 'Privacy Concerns or Queries?'}
            </h3>
            <p className="text-xs text-gray-300">
              {language === 'ta'
                ? 'உங்கள் தனியுரிமை தொடர்பான கேள்விகளுக்கு எங்களை அணுகவும்.'
                : 'Get in touch with our team for questions regarding your data privacy rights.'}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/contact"
              className="px-5 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
            >
              <span>{language === 'ta' ? 'தொடர்பு கொள்க' : 'Contact Privacy Officer'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
