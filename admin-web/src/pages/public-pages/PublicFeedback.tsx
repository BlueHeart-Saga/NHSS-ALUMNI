import React from 'react';
import { PublicFeedbackShowcase } from './components/PublicFeedbackShowcase';
import { useLanguage } from '../../context/LanguageContext';
import { MessageSquareQuote, Heart, Sparkles } from 'lucide-react';

export const PublicFeedback: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-gray-50/50 py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-[#111111] p-8 sm:p-12 text-white shadow-2xl border border-[#F4C542]/40">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <MessageSquareQuote className="w-96 h-96 text-[#F4C542]" />
          </div>

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#F4C542]/20 border border-[#F4C542] rounded-full text-xs font-extrabold uppercase tracking-wider text-[#F4C542]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? ' கருத்துகள்' : 'Alumni Voices & Opinions'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {language === 'ta' ? (
                <>
                  பள்ளி நாட்களின் நினைவுகளும் <br />
                  <span className="text-[#F4C542]">உங்கள் கருத்துகளும்</span>
                </>
              ) : (
                <>
                  Cherished School Memories & <br />
                  <span className="text-[#F4C542]">Alumni Opinions (கருத்துகள்)</span>
                </>
              )}
            </h1>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {language === 'ta'
                ? 'நமது பள்ளி வளர்ச்சிக்கான பரிந்துரைகள், பழைய மாணவர்களின் நினைவுகள் மற்றும் பாராட்டுரைகளை இங்கே பகிருங்கள்.'
                : 'Explore feedback, appreciation, and constructive suggestions submitted by alumni across all generations. Share your own voice to inspire our growing community.'}
            </p>
          </div>
        </div>

        {/* Public Feedback Showcase Component */}
        <PublicFeedbackShowcase />

      </div>
    </div>
  );
};
