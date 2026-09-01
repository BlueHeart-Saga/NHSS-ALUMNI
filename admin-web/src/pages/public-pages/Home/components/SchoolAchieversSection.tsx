import React, { useEffect, useState } from 'react';
import { Trophy, Award, Star, Medal, Sparkles, X, GraduationCap } from 'lucide-react';
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
        if (data && data.length > 0) setRankHolders(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const defaultAchievers: RankHolder[] = [
    {
      id: '1',
      student_name: 'Arun Kumar',
      academic_year: '2025–26',
      class_standard: '10th',
      rank: '1st Rank',
      marks_percentage: '96%',
      achievement_title: 'School First Rank',
      photograph: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      description: 'Secured top position in SSLC Public Examinations with outstanding performance in Mathematics.',
      status: 'Active'
    },
    {
      id: '2',
      student_name: 'Priya S',
      academic_year: '2025–26',
      class_standard: '10th',
      rank: '2nd Rank',
      marks_percentage: '94%',
      achievement_title: 'School Second Rank',
      photograph: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
      description: 'Achieved high honors in Science and Social Studies.',
      status: 'Active'
    },
    {
      id: '3',
      student_name: 'Karthik R',
      academic_year: '2024–25',
      class_standard: '10th',
      rank: '3rd Rank',
      marks_percentage: '93%',
      achievement_title: 'School Third Rank',
      photograph: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      description: 'Secured top 3rd position in School Public Examinations.',
      status: 'Active'
    }
  ];

  const displayHolders = (rankHolders && rankHolders.length > 0) ? rankHolders : defaultAchievers;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {displayHolders.map((holder) => {
            const photoSrc = getAssetUrl(holder.photograph) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(holder.student_name)}&background=111111&color=ffffff`;

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
                    <span className="text-xs font-black text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3 py-1 rounded-full shadow-2xs">
                      {holder.total_marks ? `${holder.total_marks} / ${holder.max_marks || '500'}` : holder.marks_percentage}
                    </span>
                  )}
                </div>

                {/* Photo & Name */}
                <div className="text-center space-y-3 my-2">
                  <div className="relative w-28 h-28 mx-auto">
                    <img
                      src={photoSrc}
                      alt={holder.student_name}
                      className="w-full h-full object-cover rounded-full border-4 border-[#111111] shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#111111] text-[#F4C542] p-1.5 rounded-full shadow-md border border-[#F4C542]">
                      <Trophy className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#111111] leading-snug group-hover:text-[#854D0E] transition-colors">
                      {holder.student_name}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                      {holder.academic_year} • {holder.class_standard} Standard
                    </p>
                  </div>
                </div>

                {/* Achievement Label & Footer */}
                <div className="pt-4 border-t border-gray-100 mt-2 text-center space-y-2">
                  <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] px-3 py-1 rounded-xl border border-[#F4C542]/40 inline-block">
                    {holder.achievement_title || holder.achievement_type || 'Academic Excellence'}
                  </span>

                  <p className="text-xs text-gray-500 line-clamp-1 italic">
                    {holder.description || 'Top academic rank holder'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RANK HOLDER LIGHTBOX MODAL */}
      {selectedHolder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-[#F4C542] overflow-hidden p-6 text-center space-y-6">
            <button
              onClick={() => setSelectedHolder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="space-y-4 pt-2">
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={getAssetUrl(selectedHolder.photograph) || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedHolder.student_name)}&background=111111&color=ffffff`}
                  alt={selectedHolder.student_name}
                  className="w-full h-full object-cover rounded-full border-4 border-[#111111] shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-[#111111] text-[#F4C542] p-2 rounded-full shadow-lg border border-[#F4C542]">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>

              <div>
                <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border shadow-xs inline-flex items-center space-x-1.5 ${getRankBadgeColor(selectedHolder.rank)}`}>
                  <Medal className="w-4 h-4" />
                  <span>{selectedHolder.rank}</span>
                </span>

                <h3 className="text-2xl font-bold text-[#111111] mt-3">
                  {selectedHolder.student_name}
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1">
                  Academic Year: {selectedHolder.academic_year} • Class: {selectedHolder.class_standard} Standard
                </p>
              </div>

              {/* Details Box */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-left space-y-2">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-semibold">Exam / Achievement:</span>
                  <span className="font-bold text-[#111111]">{selectedHolder.achievement_type || 'SSLC / Public Examination'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-semibold">Marks / Score:</span>
                  <span className="font-bold text-emerald-700">{selectedHolder.marks_percentage || 'N/A'}</span>
                </div>
                {selectedHolder.subject_stream && (
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-semibold">Subject Stream:</span>
                    <span className="font-bold text-[#111111]">{selectedHolder.subject_stream}</span>
                  </div>
                )}
                {selectedHolder.description && (
                  <div className="pt-1 text-gray-600 leading-relaxed">
                    {selectedHolder.description}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedHolder(null)}
              className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
            >
              Close Achiever Card
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
