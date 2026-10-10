import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../services/api';
import { Programme } from '../../../../types';
import { useLanguage } from '../../../../context/LanguageContext';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

export const FeaturedProgrammesSection: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublicProgrammes(true)
      .then((items) => {
        if (items && items.length > 0) {
          setProgrammes(items.slice(0, 3));
        } else {
          // Fallback to latest public programmes if no featured toggle enabled
          api.getPublicProgrammes().then((all) => setProgrammes((all || []).slice(0, 3))).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && programmes.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 border-y border-amber-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FEATURED NHSS PROGRAMMES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              {language === 'ta' ? 'உலகளாவிய கல்வி மற்றும் தொழில்நுட்ப வாய்ப்புகள்' : 'Special Alumni & Family Programmes'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
              {language === 'ta'
                ? 'நமது முன்னாள் மாணவர்கள் மற்றும் அவர்களது பிள்ளைகளுக்கான கல்வி மற்றும் தொழில்நுட்ப வாய்ப்புகளை அறிமுகப்படுத்தும் சிறப்பு முயற்சிகள்.'
                : 'Dedicated initiatives offering tech orientations (Microsoft, Google, Zoho), career guidance, and learning sessions for alumni and family members.'}
            </p>
          </div>

          <button
            onClick={() => navigate('/programmes')}
            className="inline-flex items-center space-x-2 text-xs font-extrabold text-[#854D0E] hover:text-[#111111] bg-white border border-amber-300 hover:border-[#111111] px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <span>{language === 'ta' ? 'அனைத்து திட்டங்களையும் காண்க' : 'View All Programmes'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-10 text-xs text-gray-400">Loading featured programmes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programmes.map((prog) => (
              <div
                key={prog.id}
                onClick={() => navigate(`/programmes/${prog.slug || prog.id}`)}
                className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative h-44 bg-gradient-to-r from-amber-600 to-amber-700 overflow-hidden">
                    {prog.image_url ? (
                      <img src={prog.image_url} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 text-center">
                        <h3 className="font-extrabold text-white text-base drop-shadow-xs line-clamp-2">{prog.title}</h3>
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="bg-[#111111] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        {prog.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="bg-[#F4C542] text-[#111111] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        {prog.mode}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-base text-[#111111] line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {prog.title}
                      </h3>
                      {prog.title_ta && (
                        <p className="text-xs font-semibold text-[#854D0E] line-clamp-1 mt-0.5">{prog.title_ta}</p>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {prog.description}
                    </p>

                    <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 font-semibold text-[#111111]">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>{prog.schedule_text || 'Schedule To Be Announced'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="w-full py-2.5 bg-[#FAFAFA] group-hover:bg-[#111111] group-hover:text-white text-[#111111] font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors border border-gray-200 group-hover:border-black">
                    <span>Explore & Register</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F4C542]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
