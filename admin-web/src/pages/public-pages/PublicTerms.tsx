import React from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  AlertCircle,
  UserCheck,
  Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const PublicTerms: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-white text-[#111111] animate-fadeIn">
      {/* Hero Header Section */}
      <section className="relative bg-gradient-to-br from-[#111111] via-[#1A1A1A] to-[#2D2A1E] text-white py-14 sm:py-20 border-b border-[#F4C542]/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4C542]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F4C542]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-[#F4C542]/15 border border-[#F4C542]/40 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <Scale className="w-4 h-4 text-[#F4C542]" />
            <span className="text-xs font-extrabold text-[#F4C542] tracking-wider uppercase">
              {language === 'ta' ? 'அதிகாரப்பூர்வ விதிகள் & வழிகாட்டுதல்கள்' : 'OFFICIAL ASSOCIATION TERMS & CODE OF CONDUCT'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {language === 'ta' ? 'விதிமுறைகள் & நிபந்தனைகள்' : 'Terms & Conditions'}
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-relaxed font-normal">
            {language === 'ta'
              ? 'நடராஜன் மேல்நிலைப் பள்ளி முன்னாள் மாணவர்கள் சங்கம் மற்றும் அதன் போர்டல் பயன்பாட்டிற்கான அதிகாரப்பூர்வ விதிமுறைகள், பாதுகாப்பு வழிகாட்டுதல்கள் மற்றும் சமூகப் பொறுப்புகள்.'
              : 'Official terms of association, community guidelines, registration policies, and digital portal usage rules for the Natarajan Higher Secondary School Alumni Network.'}
          </p>

          <div className="pt-2 text-xs text-gray-400 font-mono">
            {language === 'ta' ? 'கடைசியாகப் புதுப்பிக்கப்பட்டது: செப்டம்பர் 2026' : 'Last Updated: September 2026 • Version 2.4'}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#FFF7D6] border border-[#F4C542] space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#111111]">
              {language === 'ta' ? '1. தகுதியுள்ள முன்னாள் மாணவர்கள்' : '1. Verified Alumni Only'}
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              {language === 'ta'
                ? 'பள்ளியில் பயின்ற மாணவர்கள் மட்டுமே பதிவு செய்து சரிபார்க்கப்பட்டு சங்கத்தில் சேர முடியும்.'
                : 'Registration is exclusively open to verified past students and staff of Natarajan Higher Secondary School.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF7D6] border border-[#F4C542] space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#111111]">
              {language === 'ta' ? '2. தொடர்பு ரகசிய உரிமை' : '2. Contact Privacy First'}
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              {language === 'ta'
                ? 'தொலைபேசி எண் மற்றும் மின்னஞ்சல் உங்கள் அனுமதியின்றி மற்றவர்களுக்குக் காட்டப்படாது.'
                : 'Phone numbers & emails remain private unless explicitly set to visible in your privacy settings.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF7D6] border border-[#F4C542] space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#111111]">
              {language === 'ta' ? '3. வணிக நோக்கமற்ற பயன்பாடு' : '3. Non-Commercial Intent'}
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              {language === 'ta'
                ? 'முன்னாள் மாணவர் தகவல்களை வர்த்தக விளம்பரங்களுக்கோ ஸ்பேமிற்கோ பயன்படுத்தத் தடை செய்யப்பட்டுள்ளது.'
                : 'Member details cannot be harvested, scraped, or used for unsolicited marketing or sales emails.'}
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {/* 1. Membership & Verification */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                {language === 'ta' ? 'உறுப்பினர் தகுதி மற்றும் சரிபார்ப்பு' : '1. Alumni Membership Eligibility & Verification'}
              </h2>
            </div>
            <p>
              {language === 'ta'
                ? 'நடராஜன் மேல்நிலைப் பள்ளியில் (NHSS) குறைந்தபட்சம் ஒரு கல்வி ஆண்டையாவது வெற்றிகரமாக முடித்த அனைத்து முன்னாள் மாணவர்களும் சங்கத்தில் இணையத் தகுதியுடையவர்கள் ஆவார். பதிவு செய்யும் போது வழங்கப்படும் அனைத்துக் கல்வி மற்றும் தனிப்பட்ட விவரங்களும் துல்லியமாகவும் உண்மைக்கு மாறில்லாமலும் இருத்தல் வேண்டும்.'
                : 'Membership in the NHSS Alumni Association is open to all individuals who have attended or graduated from Natarajan Higher Secondary School. By creating an account, you affirm that all information provided during registration (including passing year, student name, and contact details) is truthful and complete.'}
            </p>
            <ul className="space-y-2 list-disc pl-5 text-gray-800 font-medium">
              <li>
                {language === 'ta'
                  ? 'பள்ளி நிர்வாகக் குழு உறுப்பினர்களின் விவரங்களைச் சரிபார்த்த பின்னரே முழு அணுகல் வழங்கப்படும்.'
                  : 'New registrations undergo identity verification against school records before full directory access is granted.'}
              </li>
              <li>
                {language === 'ta'
                  ? 'தவறான அல்லது போலியான விவரங்கள் அளிக்கப்பட்ட கணக்குகள் எச்சரிக்கையின்றி முடக்கப்படும்.'
                  : 'Accounts found to contain fraudulent claims or impersonations will be suspended immediately.'}
              </li>
            </ul>
          </div>

          {/* 2. Code of Conduct */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                {language === 'ta' ? 'சமூக நடத்தை விதிகள் மற்றும் நெறிமுறைகள்' : '2. Community Code of Conduct'}
              </h2>
            </div>
            <p>
              {language === 'ta'
                ? 'நமது முன்னாள் மாணவர்கள் சங்கம் பரஸ்பர மரியாதை, தோழமை மற்றும் பள்ளி வளர்ச்சியை நோக்கமாகக் கொண்டது. உறுப்பினர்கள் அனைவரும் கண்ணியமான முறையில் தொடர்புகொள்ள வேண்டும்.'
                : 'The platform is dedicated to fostering genuine batchmate reconnections, school heritage preservation, and academic support. All members are expected to maintain professional and respectful interactions.'}
            </p>
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-[#854D0E] text-xs uppercase tracking-wider">
                {language === 'ta' ? 'கண்டிப்பாகத் தடை செய்யப்பட்டவை:' : 'Strictly Prohibited Activities:'}
              </h4>
              <ul className="space-y-1.5 list-disc pl-5 text-xs text-gray-800 font-semibold">
                <li>{language === 'ta' ? 'அரசியல், வெறுப்புப் பேச்சு அல்லது தவறான கருத்துக்களைப் பரப்புதல்.' : 'Harassment, hate speech, political campaigning, or defamatory content.'}</li>
                <li>{language === 'ta' ? 'மற்ற முன்னாள் மாணவர்களுக்கு அனுமதி இன்றி வணிக விளம்பரங்கள் அல்லது ஸ்பேம் அனுப்புதல்.' : 'Sending unsolicited commercial advertisements, marketing pitches, or bulk spam messages.'}</li>
                <li>{language === 'ta' ? 'போலி படங்கள் அல்லது தவறான புகைப்படங்களை நினைவுகள் பக்கத்தில் பதிவேற்றுதல்.' : 'Uploading inappropriate, copyrighted, or offensive media to the school gallery.'}</li>
              </ul>
            </div>
          </div>

          {/* 3. Privacy & Contact Control */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                {language === 'ta' ? 'தனியுரிமை மற்றும் தொடர்புக் கட்டுப்பாடுகள்' : '3. Privacy & Contact Control Policy'}
              </h2>
            </div>
            <p>
              {language === 'ta'
                ? 'உங்கள் தனிப்பட்ட தொலைபேசி எண் மற்றும் மின்னஞ்சல் முகவரியை மற்றவர்கள் காண்பதை நீங்களே கட்டுப்படுத்தலாம். சுயவிவர அமைப்புகளில் (Profile Privacy Settings) இவற்றை மாற்றியமைக்கலாம்.'
                : 'We strictly empower members to control their profile visibility. Phone numbers and email addresses are subject to your personal privacy toggle settings.'}
            </p>
            <p>
              {language === 'ta'
                ? 'மேலும் விவரங்களுக்கு நமது '
                : 'For exhaustive details on how data is handled, please review our '}
              <Link to="/privacy" className="font-bold text-[#854D0E] underline hover:text-[#111111]">
                {language === 'ta' ? 'தனியுரிமைக் கொள்கைப் பக்கத்தைப் பார்வயிடுங்கள்.' : 'Privacy Policy page.'}
              </Link>
            </p>
          </div>

          {/* 4. Events & Financial Transparency */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                4
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                {language === 'ta' ? 'நிகழ்வுகள், மறுசந்திப்பு மற்றும் நிதியறிக்கைகள்' : '4. Events, Reunions & Financial Transparency'}
              </h2>
            </div>
            <p>
              {language === 'ta'
                ? 'பள்ளி மறுசந்திப்பு நிகழ்வுகள் மற்றும் சங்க நிதியறிக்கைகள் (Audited Financial Reports) அனைத்தும் போர்டலில் வெளிப்படையாக வெளியிடப்படும். முன்னாள் மாணவர்களின் பங்களிப்புகள் முற்றிலும் தன்னிச்சையானவை.'
                : 'Event RSVPs, reunion schedules, and audited financial statements are published transparently on the portal. Voluntary donations to school infrastructure or scholarships are non-refundable and managed strictly under audited accounts.'}
            </p>
          </div>

          {/* 5. Account Security */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                5
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                {language === 'ta' ? 'கணக்கு பாதுகாப்பு மற்றும் மாற்றங்கள்' : '5. Account Security & Modifications'}
              </h2>
            </div>
            <p>
              {language === 'ta'
                ? 'உங்கள் கடவுச்சொல் மற்றும் OTP ரகசியங்களைப் பாதுகாப்பாக வைப்பது உங்கள் பொறுப்பாகும். விதிமுறைகள் தேவைக்கேற்ப மாற்றப்படலாம்; புதுப்பிப்புகள் இப்பக்கத்தில் உடனுக்குடன் தெரிவிக்கப்படும்.'
                : 'Members are responsible for maintaining the confidentiality of their login OTPs and password credentials. The association reserves the right to update these terms to comply with regulatory changes or school policy updates.'}
            </p>
          </div>
        </div>

        {/* Footer Support Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white border-2 border-[#F4C542] flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white">
              {language === 'ta' ? 'விதிகள் பற்றிய சந்தேகங்கள் உள்ளதா?' : 'Questions About Association Terms?'}
            </h3>
            <p className="text-xs text-gray-300">
              {language === 'ta'
                ? 'எங்கள் நிர்வாகக் குழுவைத் தொடர்புகொண்டு விளக்கங்களைப் பெறலாம்.'
                : 'Contact our alumni advisory team for clarifications regarding association membership or governance.'}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/contact"
              className="px-5 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
            >
              <span>{language === 'ta' ? 'நிர்வாகத்தைத் தொடர்பு கொள்க' : 'Contact Support'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
