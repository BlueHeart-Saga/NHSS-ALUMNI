import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface FAQItem {
  id: string;
  category: 'REGISTRATION' | 'NETWORK' | 'CONTRIBUTION' | 'GENERAL';
  category_ta: string;
  category_en: string;
  question_ta: string;
  question_en: string;
  answer_ta: string;
  answer_en: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'REGISTRATION',
    category_ta: 'பதிவு & கணக்கு',
    category_en: 'Registration & Account',
    question_ta: 'நான் எவ்வாறு முன்னாள் மாணவராக பதிவு செய்வது?',
    question_en: 'How do I register as an alumnus on the portal?',
    answer_ta: 'இணையதளத்தின் மேல்பகுதியில் உள்ள "பதிவு செய்க" (Register) பொத்தானை கிளிக் செய்து, உங்கள் பெயர், படித்த ஆண்டு (Batch Year), மின்னஞ்சல் மற்றும் தொலைபேசி எண்ணைப் பூர்த்தி செய்து உடனடியாக கணக்கு உருவாக்கலாம்.',
    answer_en: 'Click the "Register" button in the top navigation, select your batch passing year, enter your name and contact details to create your account instantly.'
  },
  {
    id: 'faq-2',
    category: 'NETWORK',
    category_ta: 'உறுப்பினர் சேர்க்கை',
    category_en: 'Membership & Eligibility',
    question_ta: 'யார் இந்த முன்னாள் மாணவர் சங்கத்தில் இணையலாம்?',
    question_en: 'Who is eligible to join the NHSS Alumni Network?',
    answer_ta: 'NHS பள்ளியில் பயின்ற அனைத்து முன்னாள் மாணவர்களும், முன்னாள் தலைமை ஆசிரியர்கள், ஆசிரியர்கள் மற்றும் அமைப்பின் ஆதரவாளர்களும் இந்த இணைய அமைப்பில் இணையத் தகுதியானவர்கள்.',
    answer_en: 'All former students who studied at NHS school, current and retired teachers, and institutional well-wishers are welcome to join.'
  },
  {
    id: 'faq-3',
    category: 'REGISTRATION',
    category_ta: 'பதிவு கட்டணம்',
    category_en: 'Registration Fees',
    question_ta: 'முன்னாள் மாணவர் பதிவு முற்றிலும் இலவசமா?',
    question_en: 'Is alumni registration completely free?',
    answer_ta: 'ஆம், முன்னாள் மாணவர் சங்க இணையதளப் பதிவு மற்றும் உறுப்பினர் சேர்க்கை முற்றிலும் இலவசம். எந்தவித மறைமுகக் கட்டணமும் இல்லை.',
    answer_en: 'Yes, registration and membership on the official NHSS alumni network portal are 100% free with no hidden charges.'
  },
  {
    id: 'faq-4',
    category: 'CONTRIBUTION',
    category_ta: 'பள்ளி வளர்ச்சி',
    category_en: 'School Development',
    question_ta: 'பள்ளியின் வளர்ச்சிக்கு முன்னாள் மாணவர்கள் எவ்வாறு பங்காற்றலாம்?',
    question_en: 'How can alumni contribute to school development?',
    answer_ta: 'தற்போதைய மாணவர்களுக்கு உயர்கல்வி வழிகாட்டுதல் (Mentorship), கல்வி உதவித்தொகை, பள்ளி கணினி மற்றும் அறிவியல் ஆய்வக மேம்பாடு, நூலக நூல்கள் மற்றும் விளையாட்டுப் பயிற்சிப் பணிகளில் இணைந்து பங்காற்றலாம்.',
    answer_en: 'Alumni can contribute through student career mentorship, academic scholarships, computer & science lab upgrades, library books, and sports coaching support.'
  },
  {
    id: 'faq-5',
    category: 'GENERAL',
    category_ta: 'மறுசந்திப்பு உதவி',
    category_en: 'Batch Reunions',
    question_ta: 'வகுப்பு மறுசந்திப்பு (Batch Reunion) நடத்த எவ்வாறு உதவி பெறலாம்?',
    question_en: 'How can our batch get support for organizing reunions?',
    answer_ta: 'எங்களது செயலகத் தொடர்புகளின் மூலம் (+91 88259 05771) அல்லது தொடர்பு படிவம் மூலம் எங்களை அணுகினால், பள்ளி வளாகத்தில் சந்திப்பு ஏற்பாடுகளைச் செய்யவும் வகுப்பினரை ஒருங்கிணைக்கவும் சங்கம் முழு உதவி வழங்கும்.',
    answer_en: 'Reach out to our Secretariat Desk (+91 88259 05771) or submit an inquiry, and our association team will help coordinate campus venue and batch outreach.'
  },
  {
    id: 'faq-6',
    category: 'NETWORK',
    category_ta: 'சான்றிதழ் சரிபார்ப்பு',
    category_en: 'Record Verification',
    question_ta: 'எனது படித்த ஆண்டு விவரங்கள் எவ்வாறு சரிபார்க்கப்படும்?',
    question_en: 'How are alumni batch records verified?',
    answer_ta: 'பதிவு செய்தவுடன் உங்கள் தகவல்கள் பள்ளி சேர்க்கை ஆவணங்களுடன் ஒப்பிடப்பட்டு, சங்க நிர்வாகிகளால் சரிபார்க்கப்பட்டு உங்கள் சுயவிவரத்தில் (Profile) அங்கீகரிக்கப்படும்.',
    answer_en: 'Upon registration, your batch details are cross-referenced with school archives by alumni administrators for verified alumni status.'
  },
  {
    id: 'faq-7',
    category: 'GENERAL',
    category_ta: 'நிர்வாகத் தொடர்பு',
    category_en: 'Admin Contact',
    question_ta: 'பள்ளி நிர்வாகம் அல்லது சங்க அதிகாரிகளை எவ்வாறு தொடர்பு கொள்வது?',
    question_en: 'How can I contact the school or alumni office directly?',
    answer_ta: 'தொலைபேசி எண் +91 88259 05771 அல்லது info@nhssalumni.com என்ற மின்னஞ்சல் முகவரி மூலம் நேரடியாக தொடர்பு கொள்ளலாம். மேலும் இங்குள்ள படிவத்தின் மூலமும் செய்தி அனுப்பலாம்.',
    answer_en: 'You can call us directly at +91 88259 05771, email info@nhssalumni.com, or send a message using the contact form on this page.'
  }
];

export const FAQSection: React.FC = () => {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default
  const [searchQuery, setSearchQuery] = useState('');

  const isTa = language === 'ta';

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = FAQ_LIST.filter((item) => {
    const q = isTa ? item.question_ta : item.question_en;
    const a = isTa ? item.answer_ta : item.answer_en;
    return (
      q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <section 
      id="faqs-doubts-section" 
      lang={isTa ? 'ta' : 'en'}
      className="py-12 sm:py-16 bg-gradient-to-b from-gray-50/60 to-white relative overflow-hidden font-sans leading-relaxed text-[#111111]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Section Title Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          {/* <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/60 px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            <HelpCircle className="w-4 h-4 text-[#854D0E]" />
            <span>{isTa ? 'சந்தேகங்கள் & தெளிவுகள்' : 'FAQs & Doubts Cleared'}</span>
          </div> */}

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
            {isTa
              ? 'ஏதேனும் சந்தேகங்கள் உள்ளதா? எங்களது குழுவிடம் கேளுங்கள்'
              : 'Have Any Doubts? Ask Our Team'}
          </h2>

          <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
            {isTa
              ? 'பள்ளி, முன்னாள் மாணவர் பதிவு, சங்கத்தின் செயல்பாடுகள் மற்றும் உதவிகள் தொடர்பான பொதுவான சந்தேகங்களுக்கான விளக்கங்கள்.'
              : 'Find quick answers to common doubts about registration, alumni network, batch reunions, and school support.'}
          </p>
        </div>

        {/* Live Search Filter Box */}
        <div className="max-w-xl mx-auto relative">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTa ? 'உங்கள் சந்தேகங்களைத் தேடுக... (எ.கா: பதிவு, சான்றிதழ்)' : 'Search your doubts... (e.g. registration, reunion)'}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 focus:border-[#F4C542] rounded-2xl shadow-sm text-sm text-[#111111] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Accordion FAQ Items List */}
        <div className="space-y-4 pt-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const question = isTa ? faq.question_ta : faq.question_en;
              const answer = isTa ? faq.answer_ta : faq.answer_en;

              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-[#F4C542] shadow-md ring-1 ring-[#F4C542]/40'
                      : 'bg-white/80 border-gray-200 hover:border-gray-300 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between space-x-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1 flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-[#111111] leading-snug">
                        {question}
                      </h3>
                    </div>

                    <div className={`p-2 rounded-full transition-transform duration-200 shrink-0 ${
                      isOpen ? 'bg-[#FFF7D6] text-[#854D0E] rotate-180' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 pt-1 text-sm sm:text-base text-gray-600 font-normal leading-relaxed border-t border-gray-100/80 animate-fadeIn">
                      <div className="flex items-start space-x-2 pt-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                        <p>{answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-white border border-gray-200 rounded-2xl p-6 text-gray-500 text-sm">
              {isTa
                ? 'உங்கள் தேடலுக்குரிய கேள்விகள் காணப்படவில்லை. கீழே உள்ள படிவம் மூலம் நேரடியாக செய்தி அனுப்பவும்.'
                : 'No matching doubts found for your search. Feel free to send us a direct message above!'}
            </div>
          )}
        </div>

        {/* Still Have Doubts Callout Card */}
        <div className="bg-[#111111] text-white border-2 border-[#F4C542] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl mt-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F4C542] text-[#111111] flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-lg text-[#F4C542]">
                {isTa ? 'மேலும் சந்தேகங்கள் உள்ளனவா?' : 'Still Have Questions or Doubts?'}
              </h4>
              <p className="text-xs sm:text-sm text-gray-300">
                {isTa
                  ? 'எங்கள் சங்கப் பிரதிநிதிகள் உங்களுக்கு உடனடியாக உதவ தயாராக உள்ளனர்.'
                  : 'Our Secretariat Desk is available to answer all your inquiries.'}
              </p>
            </div>
          </div>

          <a
            href="tel:+918825905771"
            className="w-full sm:w-auto px-6 py-3 bg-[#F4C542] hover:bg-[#e0b236] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all text-center shrink-0 shadow-md"
          >
            {isTa ? 'உடனே அழைக்க: +91 88259 05771' : 'Call Desk: +91 88259 05771'}
          </a>
        </div>
      </div>
    </section>
  );
};
