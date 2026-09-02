import React, { useEffect, useState } from 'react';
import { Trophy, Award, Star, Medal, Sparkles, X, GraduationCap, User } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { api } from '../../../../services/api';
import { RankHolder } from '../../../../types';
import { getAssetUrl } from '../../../../utils/asset';

export const SchoolAchieversSection: React.FC = () => {
  const { language } = useLanguage();
  const [rankHolders, setRankHolders] = useState<RankHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHolder, setSelectedHolder] = useState<RankHolder | null>(null);

  useEffect(() => {
    api.getPublicRankHolders()
      .then(data => {
        setRankHolders(data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRankBadgeColor = (rankStr: string) => {
    const lower = rankStr.toLowerCase();
    if (lower.includes('1st') || lower.includes('first')) {
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-300';
    }
    if (lower.includes('2nd') || lower.includes('second')) {
      return 'bg-gradient-to-r from-slate-300 to-gray-400 text-black border-slate-200';
    }
    if (lower.includes('3rd') || lower.includes('third')) {
      return 'bg-gradient-to-r from-amber-700 to-yellow-800 text-white border-amber-600';
    }
    return 'bg-[#111111] text-[#F4C542] border-[#F4C542]/60';
  };

  return (
    <section id="school-achievers" className="py-12 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
          <span className="inline-flex items-center space-x-2 text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
            <Trophy className="w-4 h-4 text-[#854D0E]" />
            <span>{language === 'ta' ? 'நமது பள்ளி சாதனையாளர்கள்' : 'Our School Achievers'}</span>
          </span>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#111111] tracking-tight leading-tight">
            {language === 'ta' ? 'கல்விச் சிறப்பும் சாதனைகளும்' : 'Celebrating Excellence & Success'}
          </h2>

          <p className="text-xs sm:text-base text-gray-600 font-normal leading-relaxed">
            {language === 'ta'
              ? 'பள்ளி மற்றும் மாநில அளவில் அதிக மதிப்பெண்கள் பெற்று முதலிடம் பிடித்த சிறந்த மாணவர்களின் பட்டியல்.'
              : 'Honoring our academic rank holders and high achievers who made our school proud.'}
          </p>
        </div>

        {/* Achievers Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-semibold text-sm">
            Loading Achievers...
          </div>
        ) : rankHolders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300 max-w-xl mx-auto space-y-2 p-6">
            <Award className="w-10 h-10 text-[#854D0E] mx-auto opacity-70" />
            <h4 className="font-bold text-sm text-[#111111]">
              {language === 'ta' ? 'சாதனையாளர்கள் பட்டியல் எதுவும் பதிவேற்றப்படவில்லை' : 'No Rank Holders Added Yet'}
            </h4>
            <p className="text-xs text-gray-500 font-medium">
              Academic achievers will appear here once published by the school administration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {rankHolders.map((holder) => {
              const badgeColor = getRankBadgeColor(holder.rank);

              return (
                <div
                  key={holder.id}
                  onClick={() => setSelectedHolder(holder)}
                  className="bg-white border-2 border-[#111111] rounded-2xl sm:rounded-[32px] overflow-hidden shadow-[4px_4px_0px_0px_#111111] sm:shadow-[6px_6px_0px_0px_#111111] hover:shadow-[8px_8px_0px_0px_#F4C542] transition-all duration-300 transform hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group p-4 sm:p-6 relative"
                >
                  {/* Top Rank Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm border ${badgeColor} flex items-center space-x-1.5`}>
                      <Medal className="w-3.5 h-3.5" />
                      <span>{holder.rank}</span>
                    </span>

                    {(holder.total_marks || holder.marks_percentage) && (
                      <span className="text-xs font-extrabold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3 py-1 rounded-full">
                        {holder.marks_percentage || holder.total_marks}
                      </span>
                    )}
                  </div>

                  {/* Student Image & Info */}
                  <div className="text-center space-y-3">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden border-2 border-[#111111] shadow-md bg-[#FFF7D6] flex items-center justify-center text-[#854D0E] relative">
                      {holder.photograph ? (
                        <img
                          src={getAssetUrl(holder.photograph)}
                          alt={holder.student_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <User className="w-12 h-12 stroke-[2.2] text-[#854D0E]" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-base sm:text-xl text-[#111111] group-hover:text-[#854D0E] transition-colors line-clamp-1">
                        {holder.student_name}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-gray-500">
                        Class {holder.class_standard || '10th'} Standard • <span className="text-[#854D0E] font-bold">{holder.academic_year}</span>
                      </p>
                    </div>

                    {holder.achievement_title && (
                      <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                        {holder.achievement_title}
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#111111]">
                    <span className="text-gray-500 group-hover:text-[#111111] transition-colors">
                      {language === 'ta' ? 'விவரங்களை காண்க' : 'View Achiever Card'}
                    </span>
                    <span className="w-7 h-7 bg-gray-100 group-hover:bg-[#111111] group-hover:text-[#F4C542] rounded-full flex items-center justify-center transition-all">
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achiever Details Modal */}
      {selectedHolder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
            <button
              onClick={() => setSelectedHolder(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#111111] rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-[#F4C542] shadow-xl bg-[#FFF7D6] flex items-center justify-center text-[#854D0E]">
              {selectedHolder.photograph ? (
                <img
                  src={getAssetUrl(selectedHolder.photograph)}
                  alt={selectedHolder.student_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 stroke-[2.2] text-[#854D0E]" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold bg-[#111111] text-[#F4C542] px-4 py-1 rounded-full uppercase tracking-wider inline-block">
                {selectedHolder.rank}
              </span>
              <h3 className="text-2xl font-bold text-[#111111]">{selectedHolder.student_name}</h3>
              <p className="text-xs text-[#854D0E] font-semibold">{selectedHolder.achievement_title || 'School Academic Rank Holder'}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Academic Year:</span>
                <span className="font-bold text-[#111111]">{selectedHolder.academic_year}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Class / Standard:</span>
                <span className="font-bold text-[#111111]">{selectedHolder.class_standard || '10th Standard'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Exam / Achievement:</span>
                <span className="font-bold text-[#111111]">{selectedHolder.achievement_type || 'SSLC Public Examination'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Marks / Score:</span>
                <span className="font-bold text-emerald-700">{selectedHolder.marks_percentage || 'N/A'}</span>
              </div>
              {selectedHolder.description && (
                <div className="pt-1 text-gray-600 leading-relaxed">
                  {selectedHolder.description}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedHolder(null)}
              className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Close Achiever Card
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
