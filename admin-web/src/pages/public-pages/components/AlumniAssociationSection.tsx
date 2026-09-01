import React, { useEffect, useState } from 'react';
import { Award, X, MapPin, Briefcase, Calendar, ChevronRight, UserCheck, ShieldCheck } from 'lucide-react';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { AssociationTeamMember } from '../../../types';

const POSITION_TA_MAP: Record<string, string> = {
  'President': 'தலைவர்',
  'Vice President': 'துணைத் தலைவர்',
  'Secretary': 'செயலாளர்',
  'Joint Secretary': 'இணைச் செயலாளர்',
  'Treasurer': 'பொருளாளர்',
  'Executive Committee Member': 'செயற்குழு உறுப்பினர்',
  'Committee Member': 'செயற்குழு உறுப்பினர்',
  'Patron': 'காப்பாளர்',
  'Chief Advisor': 'முதன்மை ஆலோசகர்'
};

const NAME_TA_MAP: Record<string, string> = {
  'Thiru V. Subbiah Nadar': 'திரு V. சுப்பையா நாடார்',
  'Er. S. Marimuthu': 'பொறியாளர் S. மாரிமுத்து',
  'Dr. K. Arumugam': 'டாக்டர் K. ஆறுமுகம்',
  'Mrs. P. Revathi': 'திருமதி P. ரேவதி',
  'Mr. T. Karthikeyan': 'திரு T. கார்த்திகேயன்',
  'Er. S. Balasubramanian': 'பொறியாளர் S. பாலசுப்பிரமணியன்',
  'Mrs. M. Shenbagam': 'திருமதி M. செண்பகம்',
  'Er. V. Gurusamy': 'பொறியாளர் V. குருசாமி',
  'Mr. R. Vignesh': 'திரு R. விக்னேஷ்',
  'Mrs. S. Deepa': 'திருமதி S. தீபா',
  'Er. P. Sundaram': 'பொறியாளர் P. சுந்தரம்',
  'Mr. K. Velmurugan': 'திரு K. வேல்முருகன்'
};

const OCCUPATION_TA_MAP: Record<string, string> = {
  'School Correspondent & Industrialist': 'பள்ளி தாளாளர் & தொழிலதிபர்',
  'Managing Director, Sri Ram Textiles': 'நிர்வாக இயக்குனர், ஸ்ரீ ராம் டெக்ஸ்டைல்ஸ்',
  'Senior Orthopedic Surgeon': 'மூத்த எலும்பு சிகிச்சை மருத்துவர்',
  'Associate Professor, Physics': 'இணைப் பேராசிரியர், இயற்பியல்',
  'High Court Advocate': 'உயர்நீதிமன்ற வழக்கறிஞர்',
  'Principal Software Engineer': 'முதன்மை மென்பொருள் பொறியாளர்',
  'Senior Auditor & CPA': 'மூத்த தணிக்கையாளர்',
  'Chartered Engineer & Builder': 'சார்ட்டர்ட் பொறியாளர் & கட்டடக் கலைஞர்',
  'Entrepreneur & Merchant': 'தொழிலதிபர் & வணிகர்',
  'High School Teacher': 'உயர்நிலைப் பள்ளி ஆசிரியர்',
  'Civil Engineer': 'சிவில் பொறியாளர்',
  'Government Revenue Inspector': 'அரசு வருவாய் ஆய்வாளர்'
};

const RESPONSIBILITY_TA_MAP: Record<string, string> = {
  'Chief Advisor & Institutional Guidance Board': 'முதன்மை ஆலோசகர் & நிறுவன வழிகாட்டுதல்',
  'Overall Executive Leadership & Strategic Initiatives': 'ஒட்டுமொத்த தலைமைத்துவம் & வழிகாட்டுதல்',
  'Alumni Medical Camps & Emergency Welfare Fund': 'மருத்துவ முகாம்கள் & அவசர நல நிதி',
  'Women Alumni Network & Academic Career Mentorship': 'பெண்கள் பிரிவு & கல்வி வழிகாட்டுதல்',
  'General Administration & Legal Compliance': 'பொது நிர்வாகம் & சட்ட ஆவணங்கள்',
  'Digital Portal & Global Overseas Alumni Chapters': 'டிஜிட்டல் தளம் & உலகளாவிய கிளைகள்',
  'Event Coordination & Registration Desk': 'நிகழ்ச்சி ஒருங்கிணைப்பு & பதிவு',
  'Financial Audit, Corpus Fund & Scholarship Disbursement': 'நிதி தணிக்கை & கல்வி உதவித்தொகை',
  'Sports & Cultural Event Committee': 'விளையாட்டு & கலை நிகழ்ச்சிகள்',
  'Student Career Guidance & Library Project': 'மாணவர் வழிகாட்டுதல் & நூலகத் திட்டம்',
  'Campus Infrastructure & Campus Greenery': 'வளாக உள்கட்டமைப்பு & பசுமைத் திட்டம்',
  'Batch Representative Network & Public Relations': 'வகுப்பு பிரதிநிதிகள் தொடர்பு & மக்கள் தொடர்பு'
};

const BIO_TA_MAP: Record<string, string> = {
  'Renowned community leader and benefactor guiding the alumni association\'s growth.': 'பள்ளியின் வளர்ச்சிக்கும் பழைய மாணவர் சங்கத்திற்கும் வழிகாட்டும் மரியாதைக்குரிய காப்பாளர்.',
  'Distinguished alumnus leading executive board operations and annual silver jubilee reunions.': 'சங்கத்தின் நிர்வாகக் குழுவையும் வருடாந்திர வெள்ளி விழா சந்திப்புகளையும் வழிநடத்தும் தலைவர்.',
  'Coordinates healthcare initiatives, medical camps, and student health checkups.': 'பழைய மாணவர்களுக்கான இலவச மருத்துவ முகாம்களையும் மாணவர்கள் நலன்களையும் ஒருங்கிணைப்பவர்.',
  'Drives academic mentoring programs and career counseling for outgoing students.': 'பள்ளி மாணவர்களின் மேற்படிப்பு மற்றும் வேலைவாய்ப்பு வழிகாட்டுதல்களை வழங்குபவர்.',
  'Manages official correspondence, general body meetings, and association documentation.': 'சங்கத்தின் அதிகாரப்பூர்வ கூட்டங்கள் மற்றும் நிர்வாகப் பதிவேடுகளை பராமரிப்பவர்.',
  'Leads digital portal development and international alumni chapter expansion.': 'பழைய மாணவர்கள் இணையதளம் மற்றும் சர்வதேச கிளைகளை ஒருங்கிணைப்பவர்.',
  'Coordinates annual general meetings, cultural events, and registration operations.': 'வருடாந்திர கூட்டங்கள் மற்றும் விழாக்களின் பதிவு நடவடிக்கைகளை கவனிப்பவர்.',
  'Manages association finances, annual audits, and merit scholarship fund disbursement.': 'சங்கத்தின் நிதி மேலாண்மை மற்றும் தகுதிவாய்ந்த மாணவர்களுக்கான கல்வி உதவித்தொகை வழங்குபவர்.',
  'Organizes annual alumni sports tournaments and cultural meets.': 'வருடாந்திர விளையாட்டுப் போட்டிகள் மற்றும் கலை நிகழ்ச்சிகளை நடத்துபவர்.',
  'Drives library expansion and student book bank initiatives.': 'பள்ளி நூலக விரிவாக்கம் மற்றும் மாணவர்களுக்கான புத்தக வங்கி திட்டங்களை நடத்துபவர்.',
  'Manages campus beautification and tree plantation drives.': 'பள்ளி வளாக அழகுபடுத்துதல் மற்றும் மரக்கன்றுகள் நடும் திட்டங்களை செயல்படுத்துபவர்.',
  'Coordinates batch coordinators and public outreach programs.': 'வகுப்பு பிரதிநிதிகளை ஒருங்கிணைத்து மக்கள் தொடர்பு பணிகளை மேற்கொள்பவர்.'
};

export const AlumniAssociationSection: React.FC = () => {
  const { language } = useLanguage();
  const [team, setTeam] = useState<AssociationTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<AssociationTeamMember | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await api.getPublicAssociationTeam();
      setTeam(data);
    } catch (err) {
      console.error('Failed to load association team:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || team.length === 0) {
    return null;
  }

  const getMemberName = (m: AssociationTeamMember) => {
    if (language === 'ta' && NAME_TA_MAP[m.full_name]) {
      return NAME_TA_MAP[m.full_name];
    }
    return m.full_name;
  };

  const getMemberPosition = (m: AssociationTeamMember) => {
    if (language === 'ta' && POSITION_TA_MAP[m.position]) {
      return POSITION_TA_MAP[m.position];
    }
    return m.position;
  };

  const getMemberOccupation = (m: AssociationTeamMember) => {
    if (language === 'ta' && m.occupation && OCCUPATION_TA_MAP[m.occupation]) {
      return OCCUPATION_TA_MAP[m.occupation];
    }
    return m.occupation;
  };

  const getMemberResponsibility = (m: AssociationTeamMember) => {
    if (language === 'ta' && m.responsibility && RESPONSIBILITY_TA_MAP[m.responsibility]) {
      return RESPONSIBILITY_TA_MAP[m.responsibility];
    }
    return m.responsibility;
  };

  const getMemberBio = (m: AssociationTeamMember) => {
    if (language === 'ta' && m.bio && BIO_TA_MAP[m.bio]) {
      return BIO_TA_MAP[m.bio];
    }
    return m.bio;
  };

  const getMemberLocation = (m: AssociationTeamMember) => {
    if (language === 'ta' && m.location) {
      if (m.location === 'Kovilpatti') return 'கோவில்பட்டி';
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

  return (
    <section 
      lang={language === 'ta' ? 'ta' : 'en'} 
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-[#FFF7D6]/25 to-white border-t border-b border-[#E5E7EB] relative overflow-hidden font-sans leading-relaxed"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          {/* <span className="inline-flex items-center space-x-2 text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
            <Award className="w-4 h-4 text-[#854D0E]" />
            <span>
              {language === 'ta' ? 'பழைய மாணவர்கள் சங்கம்' : 'Alumni Association Leadership'}
            </span>
          </span> */}

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111] tracking-tight leading-tight">
            {language === 'ta' ? 'எங்கள் சங்கத்தின் செயற்குழு நிர்வாகிகள்' : 'Our Executive Board & Team Leaders'}
          </h2>

          <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
            {language === 'ta'
              ? 'பள்ளியின் வளர்ச்சிக்காகவும் பழைய மாணவர்களின் நலனுக்காகவும் சேவையாற்றும் செயற்குழு நிர்வாகிகள்.'
              : 'Dedicated alumni leaders directing the strategic growth, scholarships, and global network.'}
          </p>
        </div>

        {/* SIMPLE CARD GRID: Big Profile Image + Name + Position Badge (President #1 First) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {team
            .filter((t) => !t.position.toLowerCase().includes('patron'))
            .map((member) => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="bg-white border border-gray-200 hover:border-[#F4C542] rounded-3xl p-4 shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col items-center text-center space-y-3 transform hover:-translate-y-1"
            >
              {/* Big Profile Image */}
              <div className="w-full h-64 sm:h-72 overflow-hidden rounded-2xl bg-gray-100 relative">
                <img
                  src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=FFF7D6&color=854D0E`}
                  alt={getMemberName(member)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Name & Position Badge */}
              <div className="space-y-1 w-full pt-1">
                <h3 className="font-bold text-base sm:text-lg text-[#111111] group-hover:text-[#854D0E] transition-colors leading-tight line-clamp-1">
                  {getMemberName(member)}
                </h3>

                <div>
                  <span className="text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/70 px-3 py-0.5 rounded-full inline-block">
                    {getMemberPosition(member)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PREVIEW MODAL: Left Side Full Image + Right Side Full Details */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border-2 border-[#F4C542] overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto md:overflow-hidden">
              {/* LEFT SIDE: Full Image */}
              <div className="md:col-span-5 bg-gray-900 relative min-h-[320px] md:min-h-[460px] flex items-center justify-center">
                <img
                  src={selectedMember.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.full_name)}&background=FFF7D6&color=854D0E`}
                  alt={getMemberName(selectedMember)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />
              </div>

              {/* RIGHT SIDE: Full Details */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Position Badge & Name */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1 rounded-full uppercase tracking-wider inline-block">
                      {getMemberPosition(selectedMember)}
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
                    {getMemberOccupation(selectedMember) && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0.5">
                        <div className="text-gray-400 font-bold flex items-center space-x-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'தொழில் / பணி' : 'Profession'}</span>
                        </div>
                        <div className="font-bold text-[#111111]">{getMemberOccupation(selectedMember)}</div>
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

                    {getMemberResponsibility(selectedMember) && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0.5">
                        <div className="text-gray-400 font-bold flex items-center space-x-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'பொறுப்பு' : 'Responsibility'}</span>
                        </div>
                        <div className="font-bold text-[#111111]">{getMemberResponsibility(selectedMember)}</div>
                      </div>
                    )}
                  </div>

                  {/* Bio Paragraph */}
                  {getMemberBio(selectedMember) && (
                    <div className="space-y-1 pt-1">
                      <div className="text-xs font-bold text-gray-500">
                        {language === 'ta' ? 'நிர்வாகி பற்றிய குறிப்பு' : 'Leadership Profile Bio'}
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed p-3.5 bg-[#FFF7D6]/50 border border-[#F4C542]/50 rounded-2xl">
                        {getMemberBio(selectedMember)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-gray-100 text-right">
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="px-6 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
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
