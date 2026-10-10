import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Programme } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Calendar, ArrowRight, UserCheck, Globe, Search, BookOpen, ShieldCheck } from 'lucide-react';

export const PublicProgrammesPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProgrammes();
  }, []);

  const loadProgrammes = async () => {
    setLoading(true);
    try {
      const data = await api.getPublicProgrammes();
      setProgrammes(data);
    } catch (err) {
      console.error('Failed to load public programmes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = programmes.filter((p) => {
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.title_ta && p.title_ta.toLowerCase().includes(q)) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs border border-white/30 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-amber-100">
            <Sparkles className="w-4 h-4 text-[#F4C542]" />
            <span>FEATURED NHSS ALUMNI PROGRAMMES</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'ta' ? 'உலகளாவிய கல்வி மற்றும் தொழில்நுட்ப வாய்ப்புகள்' : 'Special Alumni & Family Learning Programmes'}
          </h1>

          <p className="text-sm sm:text-base text-amber-100 leading-relaxed">
            {language === 'ta'
              ? 'நமது முன்னாள் மாணவர்கள் மற்றும் அவர்களது பிள்ளைகளுக்கான கல்வி மற்றும் தொழில்நுட்ப வாய்ப்புகளை அறிமுகப்படுத்தும் சிறப்பு முயற்சிகள்.'
              : 'Empowering NHSS alumni members, their children, and family relatives with orientation on Microsoft, Google, Zoho opportunities, career mentorship, and tech learning.'}
          </p>
        </div>
      </div>

      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E7EB]">
        <div>
          <h2 className="text-lg font-extrabold text-[#111111]">
            {language === 'ta' ? 'வெளியிடப்பட்ட சிறப்புத் திட்டங்கள்' : 'Published Special Programmes'}
          </h2>
          <p className="text-xs text-gray-500">Explore active career, tech, and family orientation initiatives.</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programme title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#F4C542]"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E5E7EB] text-xs text-gray-400">
          Loading programmes...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E5E7EB] space-y-3">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-extrabold text-gray-800">No Published Programmes Available</h3>
          <p className="text-xs text-gray-500">New programmes will be announced soon. Registered alumni can check their portal dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Header Image */}
                <div className="relative h-48 bg-gradient-to-r from-amber-600 to-amber-700 overflow-hidden">
                  {prog.image_url ? (
                    <img src={prog.image_url} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 text-center">
                      <h3 className="font-extrabold text-white text-lg drop-shadow-xs line-clamp-2">{prog.title}</h3>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-[#111111]/85 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {prog.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="bg-[#F4C542] text-[#111111] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                      {prog.mode}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-[#111111] line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {language === 'ta' ? (prog.title_ta || prog.title) : prog.title}
                    </h3>
                    {((language === 'ta' && prog.title_ta && prog.title) || (language !== 'ta' && prog.title_ta)) && (
                      <p className="text-xs font-semibold text-[#854D0E] line-clamp-1 mt-0.5">
                        {language === 'ta' ? prog.title : prog.title_ta}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {language === 'ta' ? (prog.description_ta || prog.description) : prog.description}
                  </p>

                  <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5 font-semibold text-[#111111]">
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{prog.schedule_text || 'Schedule To Be Announced'}</span>
                    </div>

                    {prog.allow_family && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md mt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Alumni & Family Members Eligible</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => navigate(`/programmes/${prog.slug || prog.id}`)}
                  className="w-full py-3 bg-[#111111] hover:bg-black text-white font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-xs"
                >
                  <span>View Details & Register</span>
                  <ArrowRight className="w-4 h-4 text-[#F4C542]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
