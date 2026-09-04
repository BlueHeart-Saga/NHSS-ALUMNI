import React, { useEffect, useState } from 'react';
import { Award, X, MapPin, Briefcase, Calendar, ShieldCheck, User, Crown, Phone, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { AssociationTeamMember } from '../../../types';
import { useNavigate } from 'react-router-dom';

const POSITION_TA_MAP: Record<string, string> = {
  'President': 'தலைவர்',
  'Vice President': 'துணைத் தலைவர்',
  'Secretary': 'செயலாளர்',
  'General Secretary': 'பொதுச் செயலாளர்',
  'Joint Secretary': 'இணைச் செயலாளர்',
  'Treasurer': 'பொருளாளர்',
  'Executive Committee Member': 'செயற்குழு உறுப்பினர்',
  'Committee Member': 'செயற்குழு உறுப்பினர்',
  'Patron': 'காப்பாளர்',
  'Chief Advisor': 'முதன்மை ஆலோசகர்',
  'Advisor': 'ஆலோசகர்',
  'Other': 'செயற்குழு உறுப்பினர்'
};

const DEFAULT_FALLBACK_ROLES: AssociationTeamMember[] = [
  { id: 'def-1', school_id: 'default', profile_type: 'common', created_at: '2026-01-01', full_name: '', position: 'President', status: 'ACTIVE', display_order: 1 },
  { id: 'def-2', school_id: 'default', profile_type: 'common', created_at: '2026-01-01', full_name: '', position: 'Vice President', status: 'ACTIVE', display_order: 2 },
  { id: 'def-3', school_id: 'default', profile_type: 'common', created_at: '2026-01-01', full_name: '', position: 'Secretary', status: 'ACTIVE', display_order: 3 },
  { id: 'def-4', school_id: 'default', profile_type: 'common', created_at: '2026-01-01', full_name: '', position: 'Joint Secretary', status: 'ACTIVE', display_order: 4 },
  { id: 'def-5', school_id: 'default', profile_type: 'common', created_at: '2026-01-01', full_name: '', position: 'Treasurer', status: 'ACTIVE', display_order: 5 },
  { id: 'def-6', school_id: 'default', profile_type: 'common', created_at: '2026-01-01', full_name: '', position: 'Executive Committee Member', status: 'ACTIVE', display_order: 6 }
];

interface AlumniAssociationSectionProps {
  isHomePage?: boolean;
  pageSize?: number;
}

export const AlumniAssociationSection: React.FC<AlumniAssociationSectionProps> = ({
  isHomePage = false,
  pageSize = 8
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [team, setTeam] = useState<AssociationTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<AssociationTeamMember | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await api.getPublicAssociationTeam();
      setTeam(data || []);
    } catch (err) {
      console.error('Failed to load association team:', err);
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  // Determine which list to display: Real DB data if available, else default role cards
  const activeList = team.length > 0 ? team : DEFAULT_FALLBACK_ROLES;
  const sortedTeam = [...activeList].sort((a, b) => (a.display_order || 99) - (b.display_order || 99));

  // Determine displayed cards based on isHomePage mode
  let displayedCards: AssociationTeamMember[] = [];

  if (isHomePage) {
    // Show ONLY 3 cards: President (Thalaivar), Secretary (Seyalalar), Treasurer (Porulalar)
    const president = sortedTeam.find((t) => {
      const p = (t.position || '').toLowerCase();
      return (p.includes('president') || p.includes('thalaivar')) && !p.includes('vice');
    }) || DEFAULT_FALLBACK_ROLES[0];

    const secretary = sortedTeam.find((t) => {
      const p = (t.position || '').toLowerCase();
      return (p.includes('secretary') || p.includes('seyalalar')) && !p.includes('joint');
    }) || DEFAULT_FALLBACK_ROLES[2];

    const treasurer = sortedTeam.find((t) => {
      const p = (t.position || '').toLowerCase();
      return p.includes('treasurer') || p.includes('porulalar');
    }) || DEFAULT_FALLBACK_ROLES[4];

    displayedCards = [president, secretary, treasurer];
  } else {
    // Paginated list for About Us page / Full View
    const startIndex = (currentPage - 1) * pageSize;
    displayedCards = sortedTeam.slice(startIndex, startIndex + pageSize);
  }

  const totalPages = Math.ceil(sortedTeam.length / pageSize);

  const getMemberPosition = (positionStr: string) => {
    if (!positionStr) return '';
    const rawPos = positionStr.trim();

    if (language === 'ta') {
      if (POSITION_TA_MAP[rawPos]) {
        return POSITION_TA_MAP[rawPos];
      }
      const matchedKey = Object.keys(POSITION_TA_MAP).find(
        (k) => k.toLowerCase() === rawPos.toLowerCase()
      );
      if (matchedKey) {
        return POSITION_TA_MAP[matchedKey];
      }
      const lower = rawPos.toLowerCase();
      if (lower.includes('vice president') || lower.includes('vice-president')) return 'துணைத் தலைவர்';
      if (lower.includes('president') || lower.includes('thalaivar')) return 'தலைவர்';
      if (lower.includes('general secretary')) return 'பொதுச் செயலாளர்';
      if (lower.includes('joint secretary') || lower.includes('joint-secretary')) return 'இணைச் செயலாளர்';
      if (lower.includes('secretary') || lower.includes('seyalalar')) return 'செயலாளர்';
      if (lower.includes('treasurer') || lower.includes('porulalar')) return 'பொருளாளர்';
      if (lower.includes('patron')) return 'காப்பாளர்';
      if (lower.includes('advisor')) return 'ஆலோசகர்';
      if (lower.includes('committee') || lower.includes('member')) return 'செயற்குழு உறுப்பினர்';
    }

    return rawPos;
  };

  const getMemberName = (m: AssociationTeamMember) => {
    if (m.full_name && m.full_name.trim()) {
      return m.full_name;
    }
    return language === 'ta' ? 'நிர்வாகி பெயர்' : 'Office Bearer Name';
  };

  const getRoleBadgeStyle = (position: string) => {
    const lower = (position || '').toLowerCase();
    if (lower.includes('president') || lower.includes('thalaivar')) {
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        badgeColor: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
        icon: Crown
      };
    }
    if (lower.includes('secretary') || lower.includes('seyalalar')) {
      return {
        bg: 'bg-blue-100 text-blue-900 border-blue-300',
        badgeColor: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
        icon: Award
      };
    }
    if (lower.includes('treasurer') || lower.includes('porulalar')) {
      return {
        bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        badgeColor: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white',
        icon: ShieldCheck
      };
    }
    return {
      bg: 'bg-[#FFF7D6] text-[#854D0E] border-[#F4C542]/70',
      badgeColor: 'bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/70',
      icon: User
    };
  };

  const getMemberLocation = (m: AssociationTeamMember) => {
    if (!m.location) return '';
    if (language === 'ta') {
      if (m.location === 'Thoothukudi') return 'தூத்துக்குடி';
      if (m.location === 'Chennai') return 'சென்னை';
      if (m.location === 'Madurai') return 'மதுரை';
      if (m.location === 'Bengaluru') return 'பெங்களூரு';
      if (m.location === 'Coimbatore') return 'கோயம்புத்தூர்';
      if (m.location === 'Sattur') return 'சாத்தூர்';
      if (m.location === 'Ettayapuram') return 'எட்டயபுரம்';
      if (m.location === 'Kayathar') return 'கயத்தாறு';
      if (m.location === 'Sankarankovil') return 'சங்கரன்கோவில்';
    }
    return m.location;
  };

  const handleViewAllClick = () => {
    navigate('/about#association-team');
    setTimeout(() => {
      const el = document.getElementById('association-team');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const getCardTheme = (position: string, index: number) => {
    return {
      avatarBg: 'bg-slate-100',
      designationColor: 'text-[#111111]',
      accentCircle: 'bg-slate-300'
    };
  };

  const renderProfileIcon = (positionStr: string) => {
    const p = (positionStr || '').toLowerCase();
    if (p.includes('president') || p.includes('thalaivar')) {
      return (
        <div className="w-full h-full bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 flex items-center justify-center text-amber-700">
          <Crown className="w-16 h-16 sm:w-20 sm:h-20 stroke-[1.8]" />
        </div>
      );
    }
    if (p.includes('secretary') || p.includes('seyalalar')) {
      return (
        <div className="w-full h-full bg-gradient-to-b from-sky-50 via-sky-100 to-sky-200 flex items-center justify-center text-sky-700">
          <Award className="w-16 h-16 sm:w-20 sm:h-20 stroke-[1.8]" />
        </div>
      );
    }
    if (p.includes('treasurer') || p.includes('porulalar')) {
      return (
        <div className="w-full h-full bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700">
          <ShieldCheck className="w-16 h-16 sm:w-20 sm:h-20 stroke-[1.8]" />
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-gradient-to-b from-slate-100 via-slate-150 to-slate-200 flex items-center justify-center text-slate-500">
        <User className="w-16 h-16 sm:w-20 sm:h-20 stroke-[1.8]" />
      </div>
    );
  };

  return (
    <section 
      id="association-team"
      lang={language === 'ta' ? 'ta' : 'en'} 
      className="py-16 sm:py-24 bg-white border-t border-b border-[#E5E7EB] relative overflow-hidden font-sans leading-relaxed text-[#111111]"
    >
      {/* Background Ambient Decorative Waves (matching Hero section) */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-40 z-0">
        <svg viewBox="0 0 500 500" className="w-full h-full text-gray-200" fill="none">
          <path d="M0,100 C150,200 350,0 500,100 L500,500 L0,500 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0,180 C180,280 320,80 500,180" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0,260 C200,340 300,160 500,260" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0,340 C220,400 280,240 500,340" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#111111] tracking-tight whitespace-nowrap">
            {language === 'ta'
              ? 'நமது சங்கத் துளிகள்'
              : 'The Pillars of Our Association'}
          </h2>

          <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
            {language === 'ta'
              ? 'பள்ளியின் வளர்ச்சிக்கும், மாணவர்களின் உயர்வுக்கும், முன்னாள் மாணவர் சமூகத்தின் ஒற்றுமைக்கும் தூண்களாக நின்று சேவையாற்றும் நிர்வாகிகள்.'
              : 'Standing as the pillars of strength to empower our school, guide students, and unite our global alumni community.'}
          </p>
        </div>

        {/* SIMPLE PROFILE CARDS GRID (Role ON TOP & BIG, Name BELOW & NORMAL, Light Slate Avatar) */}
        <div className={
          isHomePage
            ? "grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto pt-2"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10 pt-2"
        }>
          {displayedCards.map((member, idx) => {
            const posTitle = getMemberPosition(member.position);
            const memberName = getMemberName(member);

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="cursor-pointer group flex flex-col items-center text-center transform hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Large Circular Photo Frame with Light Gray/Slate Neutral Styling */}
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200/80 mb-4 transition-transform duration-300 group-hover:scale-105 shadow-md flex items-center justify-center shrink-0 relative">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={memberName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    renderProfileIcon(member.position)
                  )}
                </div>

                {/* Name (TOP, BIG) & Role (BELOW, CLEAN TEXT) */}
                <div className="space-y-1 text-center w-full px-2">
                  <h3 className="font-extrabold text-base sm:text-lg md:text-xl text-[#111111] leading-snug whitespace-normal break-words">
                    {memberName}
                  </h3>
                  <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider leading-normal whitespace-normal break-words">
                    {posTitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* HOME PAGE CTA BUTTON (Matching Hero section golden action button) */}
        {isHomePage && (
          <div className="text-center pt-4">
            <button
              onClick={handleViewAllClick}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-2xl shadow-lg border border-[#E0B238] transition-all cursor-pointer transform hover:scale-105"
            >
              <span>{language === 'ta' ? 'அனைத்து நிர்வாகிகளையும் பார்க்க' : 'View All Office Bearers & Committee Members'}</span>
              <ArrowRight className="w-4 h-4 text-[#111111]" />
            </button>
          </div>
        )}

        {/* ABOUT PAGE PAGINATION CONTROLS */}
        {!isHomePage && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#F4C542] text-[#111111] shadow-md border-2 border-[#E0B238]'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL: Full Member Details */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-200 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-gray-700 hover:text-black p-2 rounded-full border border-gray-200 shadow-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto md:overflow-hidden">
              {/* LEFT SIDE: Image or Icon with warm ambient background */}
              <div className="md:col-span-5 bg-gradient-to-b from-[#FFF7D6] to-[#FEF08A] relative min-h-[320px] md:min-h-[460px] flex items-center justify-center text-[#854D0E]">
                {selectedMember.photo_url ? (
                  <img
                    src={selectedMember.photo_url}
                    alt={getMemberName(selectedMember)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border-2 border-[#F4C542] shadow-md flex items-center justify-center text-[#854D0E]">
                      <User className="w-14 h-14 stroke-[2]" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#854D0E] uppercase tracking-wider block">
                        {getMemberName(selectedMember)}
                      </span>
                      <p className="text-[11px] text-amber-900/80">
                        {getMemberPosition(selectedMember.position)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:hidden" />
              </div>

              {/* RIGHT SIDE: Details */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Position Badge & Name */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1 rounded-full uppercase tracking-wider inline-block">
                      {getMemberPosition(selectedMember.position)}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] leading-tight">
                      {getMemberName(selectedMember)}
                    </h2>
                    <div className="text-xs text-gray-500 font-semibold flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>
                        {selectedMember.batch_year 
                          ? (language === 'ta' ? `பள்ளி முன்னாள் மாணவர் (${selectedMember.batch_year} ஆம் ஆண்டு)` : `School Alumnus (Class of ${selectedMember.batch_year})`)
                          : (language === 'ta' ? 'நிர்வாகப் பொறுப்பாளர்' : 'Common Association Leader')}
                      </span>
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                    {selectedMember.occupation && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0.5">
                        <div className="text-gray-400 font-bold flex items-center space-x-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'தொழில் / பணி' : 'Profession'}</span>
                        </div>
                        <div className="font-bold text-[#111111]">{selectedMember.occupation}</div>
                      </div>
                    )}

                    {getMemberLocation(selectedMember) && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0.5">
                        <div className="text-gray-400 font-bold flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'இடம்' : 'Location'}</span>
                        </div>
                        <div className="font-bold text-[#111111]">{getMemberLocation(selectedMember)}</div>
                      </div>
                    )}

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0.5">
                      <div className="text-gray-400 font-bold flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{language === 'ta' ? 'பதவிக்காலம்' : 'Association Term'}</span>
                      </div>
                      <div className="font-bold text-[#111111]">{selectedMember.term_start || '2024'} - {selectedMember.term_end || '2026'}</div>
                    </div>

                    {selectedMember.responsibility && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0.5">
                        <div className="text-gray-400 font-bold flex items-center space-x-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'பொறுப்பு' : 'Responsibility'}</span>
                        </div>
                        <div className="font-bold text-[#111111]">{selectedMember.responsibility}</div>
                      </div>
                    )}
                  </div>

                  {/* Bio Paragraph */}
                  {selectedMember.bio && (
                    <div className="space-y-1 pt-1">
                      <div className="text-xs font-bold text-gray-500">
                        {language === 'ta' ? 'நிர்வாகி பற்றிய குறிப்பு' : 'Leadership Profile Bio'}
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed p-3.5 bg-[#FFF7D6]/50 border border-[#F4C542]/50 rounded-2xl">
                        {selectedMember.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {selectedMember.mobile && (
                      <span className="flex items-center space-x-1 font-medium">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{selectedMember.mobile}</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="px-6 py-2.5 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer border border-[#E0B238]"
                  >
                    {language === 'ta' ? 'மூடு' : 'Close Preview'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

