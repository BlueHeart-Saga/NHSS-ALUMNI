import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { FAQSection } from './components/FAQSection';

export const PublicContact: React.FC = () => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.submitContactEnquiry({
        full_name: name,
        email: email,
        mobile: mobile || undefined,
        message: message
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-10 sm:py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {t('contact_title')}
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 font-normal max-w-2xl mx-auto">
            {t('contact_subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-start">
          {/* Contact Details Column */}
          <div className="space-y-6 sm:space-y-8 bg-gray-50/90 border-2 border-[#E5E7EB] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-md relative overflow-hidden group">
            <div className="relative z-10 space-y-5 sm:space-y-6">
              <h2 className="text-xl sm:text-3xl font-semibold text-[#111111]">
                {language === 'ta' ? 'முன்னாள் மாணவர்கள் செயலகம்' : 'Alumni Secretariat Desk'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
                {language === 'ta'
                  ? 'வகுப்புச் சரிபார்ப்பு, மறுசந்திப்புகளைத் திட்டமிடுதல் மற்றும் பிற தகவல்களுக்கு நமதுசங்கப் பிரதிநிதிகள் உதவி புரிவர்.'
                  : 'Our alumni relationship officers are available Monday to Saturday to assist graduates with batch verification, get-together organizing, and credential updates.'}
              </p>

              <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-[#111111]">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#854D0E]" />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('location')}</strong>
                    <span className="font-semibold text-sm sm:text-base">{language === 'ta' ? 'NHS பள்ளி கட்டிடம், காட்டு நாயக்கன்பட்டி, தூத்துக்குடி' : 'NHS School Building, Kaattunayakkanpatti,Thoothukudi Tamil Nadu'}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#854D0E]" />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('phone_label')}</strong>
                    <span className="font-semibold text-sm sm:text-base">+91 88259 05771</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#854D0E]" />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('email_contact_label')}</strong>
                    <span className="font-semibold text-sm sm:text-base">info@nhssalumni.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4 animate-fadeIn">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-bold text-[#111111]">
                  {language === 'ta' ? 'செய்தி வெற்றிகரமாக அனுப்பப்பட்டது!' : 'Message Sent Successfully!'}
                </h3>
                <p className="text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                  {language === 'ta'
                    ? `நன்றி ${name}! உங்கள் மின்னஞ்சலுக்கு (${email}) உறுதிப்படுத்தல் செய்தி அனுப்பப்பட்டுள்ளது. நமதுகுழு விரைவில் உங்களை தொடர்பு கொள்ளும்.`
                    : `Thank you ${name}! An automated confirmation email was sent to ${email}. Our admin team will review your inquiry and get back to you shortly.`}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setMobile('');
                    setMessage('');
                  }}
                  className="mt-4 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-gray-300 cursor-pointer"
                >
                  {language === 'ta' ? 'மற்றொரு செய்தி அனுப்ப' : 'Send Another Message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-bold text-[#111111] pb-2 border-b border-gray-100">
                  {language === 'ta' ? 'செய்தி படிவம்' : 'Send Us a Message'}
                </h3>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">{t('name_label')} *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
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
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-[#F4C542] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase">{t('mobile_label')}</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 9876543210"
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
                    placeholder="Enter your message or inquiry here..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 border border-[#F4C542]/40 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#F4C542] animate-spin" />
                      <span>{language === 'ta' ? 'அனுப்பப்படுகிறது...' : 'Sending Email...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#F4C542]" />
                      <span>{t('send_message_btn')}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* FAQ / Doubts Section */}
      <FAQSection />
    </div>
  );
};
