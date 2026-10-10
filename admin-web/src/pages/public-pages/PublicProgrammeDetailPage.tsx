import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Programme } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/Button';
import { ArrowLeft, Calendar, MapPin, Globe, Users, Sparkles, UserCheck, ShieldCheck, Lock } from 'lucide-react';

export const PublicProgrammeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadProgramme(slug);
    }
  }, [slug]);

  const loadProgramme = async (paramSlug: string) => {
    setLoading(true);
    try {
      const data = await api.getPublicProgrammeDetail(paramSlug);
      setProgramme(data);
    } catch (err) {
      console.error('Failed to load programme:', err);
      navigate('/programmes');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (api.getToken()) {
      navigate(`/alumni/programmes/${programme?.slug || programme?.id}`);
    } else {
      navigate(`/login?redirect=/alumni/programmes/${programme?.slug || programme?.id}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-[#E5E7EB] text-xs text-gray-400">
        Loading programme details...
      </div>
    );
  }

  if (!programme) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/programmes')}
          className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-[#E5E7EB] text-gray-700 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Programme Detail</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111]">{programme.title}</h1>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-6 sm:p-10 shadow-lg">
        {programme.image_url && (
          <img src={programme.image_url} alt={programme.title} className="absolute inset-0 w-full h-full object-cover opacity-25" />
        )}
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#111111] text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {programme.category}
            </span>
            <span className="bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
              {programme.mode}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'ta' ? (programme.title_ta || programme.title) : programme.title}
          </h1>
          {((language === 'ta' && programme.title_ta && programme.title) || (language !== 'ta' && programme.title_ta)) && (
            <p className="text-sm sm:text-base font-semibold text-amber-100">
              {language === 'ta' ? programme.title : programme.title_ta}
            </p>
          )}

          <div className="pt-2 flex flex-wrap gap-4 text-xs sm:text-sm font-semibold text-amber-100">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#F4C542]" />
              <span>{programme.schedule_text || (language === 'ta' ? 'அட்டவணை பின்னர் அறிவிக்கப்படும்' : 'Schedule To Be Announced')}</span>
            </span>

            {programme.venue && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F4C542]" />
                <span>{programme.venue}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description & Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-2xs space-y-6">
        <div>
          <h3 className="font-extrabold text-sm text-[#111111] uppercase tracking-wider border-b border-gray-100 pb-3 mb-3">
            {language === 'ta' ? 'சிறப்புத் திட்ட விவரங்கள்' : 'About this Special Programme'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {language === 'ta' ? (programme.description_ta || programme.description) : programme.description}
          </p>
        </div>

        {language === 'ta' && programme.description_ta && programme.description && (
          <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/70 space-y-1">
            <h4 className="font-bold text-xs text-[#854D0E]">English Description:</h4>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed whitespace-pre-line">
              {programme.description}
            </p>
          </div>
        )}

        {language !== 'ta' && programme.description_ta && (
          <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/70 space-y-1">
            <h4 className="font-bold text-xs text-[#854D0E]">திட்ட விளக்கம் (தமிழில்):</h4>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed whitespace-pre-line">
              {programme.description_ta}
            </p>
          </div>
        )}

        {/* Eligibility Banner */}
        {programme.allow_family && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Family Participation Enabled:</p>
              <p>Registered alumni members can register themselves as well as sons, daughters, spouses and eligible relatives for this programme.</p>
            </div>
          </div>
        )}

        {/* Registration CTA Card */}
        <div className="bg-gradient-to-r from-gray-900 via-[#111111] to-black text-white p-6 rounded-2xl space-y-3 text-center">
          <Lock className="w-8 h-8 text-[#F4C542] mx-auto" />
          <h4 className="text-lg font-extrabold">Register Through NHSS Alumni Portal</h4>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Participation is exclusive to NHSS alumni and their family members. Please log in or register your alumni account to reserve seats.
          </p>
          <div className="pt-2">
            <Button
              onClick={handleRegisterClick}
              className="bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-xs"
            >
              Log In & Register Participants
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
