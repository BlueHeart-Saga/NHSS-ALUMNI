import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Programme } from '../../types';
import { Button } from '../../components/Button';
import { Sparkles, Calendar, Users, MapPin, Globe, CheckCircle2, ArrowRight, UserPlus, Clock } from 'lucide-react';

export const AlumniProgrammesPage: React.FC = () => {
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgrammes();
  }, []);

  const loadProgrammes = async () => {
    setLoading(true);
    try {
      const data = await api.getAlumniProgrammes();
      setProgrammes(data);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to load programmes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs border border-white/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-amber-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NHSS Alumni Special Initiatives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Special Alumni Programmes
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            தமிழில்: நமது முன்னாள் மாணவர்கள் மற்றும் அவர்களது குடும்பத்திற்கான சிறப்பு கல்வி மற்றும் தொழில்நுட்ப வழிகாட்டுதல் திட்டங்கள்.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate('/alumni/my-programmes')}
              className="bg-white hover:bg-amber-50 text-[#111111] font-extrabold text-xs py-2 px-4 rounded-xl shadow-xs"
            >
              My Programme Registrations
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB] text-xs text-gray-400">
          Loading special programmes...
        </div>
      ) : programmes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
          <p className="text-sm font-bold text-gray-700">No active programmes available at the moment</p>
          <p className="text-xs text-gray-500">Check back soon for new career orientations, tech sessions, and family learning drives.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programmes.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Header Image or Gradient Banner */}
                <div className="relative h-44 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 overflow-hidden">
                  {prog.image_url ? (
                    <img src={prog.image_url} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 text-center">
                      <h3 className="font-extrabold text-white text-base drop-shadow-xs line-clamp-2">{prog.title}</h3>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-[#111111]/80 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {prog.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                      {prog.mode}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-[#111111] line-clamp-1 group-hover:text-amber-700 transition-colors">
                      {prog.title}
                    </h3>
                    {prog.title_ta && (
                      <p className="text-xs font-semibold text-[#854D0E] line-clamp-1">{prog.title_ta}</p>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between font-semibold text-[#111111]">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        <span>{prog.schedule_text || 'Schedule TBA'}</span>
                      </span>
                    </div>

                    {prog.allow_family && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                        <UserPlus className="w-3 h-3 text-blue-600" />
                        <span>Family Members & Relatives Eligible</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                {prog.is_registered ? (
                  <button
                    onClick={() => navigate(`/alumni/programmes/${prog.slug || prog.id}`)}
                    className="w-full py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Registered (View Details)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/alumni/programmes/${prog.slug || prog.id}`)}
                    className="w-full py-2.5 bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>View Programme & Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
