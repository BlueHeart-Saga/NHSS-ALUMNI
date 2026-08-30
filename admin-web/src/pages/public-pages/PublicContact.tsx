import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PublicContact: React.FC = () => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-4 py-1.5 rounded-full uppercase tracking-wider">
            {t('nav_contact')}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {t('contact_title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-normal max-w-2xl mx-auto">
            {t('contact_subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Contact Details Column */}
          <div className="space-y-8 bg-gray-50/90 border-2 border-[#E5E7EB] rounded-3xl p-8 shadow-md relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#111111]">
                {language === 'ta' ? 'பழைய மாணவர்கள் செயலகம்' : 'Alumni Secretariat Desk'}
              </h2>
              <p className="text-base text-gray-600 font-normal leading-relaxed">
                {language === 'ta'
                  ? 'வகுப்புச் சரிபார்ப்பு, மறுசந்திப்புகளைத் திட்டமிடுதல் மற்றும் பிற தகவல்களுக்கு எங்கள் சங்கப் பிரதிநிதிகள் உதவி புரிவர்.'
                  : 'Our alumni relationship officers are available Monday to Saturday to assist graduates with batch verification, get-together organizing, and credential updates.'}
              </p>

              <div className="space-y-5 text-base text-[#111111]">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <MapPin className="w-6 h-6 text-[#854D0E]" />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('location')}</strong>
                    <span className="font-semibold text-base">{language === 'ta' ? 'முதன்மை வளாகம், பள்ளி பழைய மாணவர்கள் கட்டிடம், தமிழ்நாடு' : 'Main Campus, School Alumni Building, Tamil Nadu'}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Phone className="w-6 h-6 text-[#854D0E]" />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</strong>
                    <span className="font-semibold text-base">+91 98765 43210</span>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Mail className="w-6 h-6 text-[#854D0E]" />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</strong>
                    <span className="font-semibold text-base">alumni@school.edu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-8 shadow-xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-bold text-[#111111]">
                  {language === 'ta' ? 'செய்தி வெற்றிகரமாக அனுப்பப்பட்டது!' : 'Message Sent Successfully!'}
                </h3>
                <p className="text-gray-600 font-medium max-w-md mx-auto">
                  {language === 'ta' ? 'எங்கள் குழு விரைவில் உங்களை தொடர்பு கொள்ளும்.' : 'Thank you for reaching out. Our team will review your query and get back to you shortly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-bold text-[#111111] pb-2 border-b border-gray-100">
                  {language === 'ta' ? 'செய்தி படிவம்' : 'Send Us a Message'}
                </h3>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">{t('name_label')} *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase">{t('email_label')} *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-[#F4C542] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase">{t('mobile_label')}</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-[#F4C542] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">{t('message_label')} *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 border border-[#F4C542]/40 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#F4C542]" />
                  <span>{t('send_message_btn')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
