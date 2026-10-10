import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { ProgrammeRegistration } from '../../types';
import { Button } from '../../components/Button';
import { Calendar, MapPin, Users, CheckCircle2, ArrowLeft, Trash2, Clock, Sparkles } from 'lucide-react';

export const AlumniMyProgrammesPage: React.FC = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<ProgrammeRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyRegistrations();
  }, []);

  const loadMyRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.getMyProgrammeRegistrations();
      setRegistrations(data);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to load programme registrations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (id: string, programmeTitle: string) => {
    const confirmed = await alertService.showConfirm(
      'Cancel Registration',
      `Are you sure you want to cancel your registration for "${programmeTitle}"?`
    );
    if (confirmed) {
      try {
        await api.cancelProgrammeRegistration(id);
        alertService.showSuccess('Registration Cancelled', 'Your programme registration has been cancelled.');
        loadMyRegistrations();
      } catch (err: any) {
        alertService.handleApiError(err, 'Failed to cancel registration.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/alumni/programmes')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">My Registrations</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111]">My Programme Registrations</h1>
          </div>
        </div>

        <Button
          onClick={() => navigate('/alumni/programmes')}
          className="bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold text-xs py-2 px-3.5 rounded-xl shadow-xs"
        >
          Explore More Programmes
        </Button>
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB] text-xs text-gray-400">
          Loading your programme registrations...
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
          <p className="text-sm font-bold text-gray-700">No active programme registrations found</p>
          <p className="text-xs text-gray-500">You haven't registered for any special alumni programmes yet.</p>
          <div className="pt-2">
            <Button
              onClick={() => navigate('/alumni/programmes')}
              className="bg-[#111111] text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-xs"
            >
              Browse Available Programmes
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const prog = reg.programme;
            const isCancelled = reg.registration_status === 'CANCELLED';

            return (
              <div
                key={reg.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 transition-all ${
                  isCancelled ? 'border-gray-200 opacity-60' : 'border-[#E5E7EB] hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-[#854D0E] px-2.5 py-0.5 rounded-full">
                      {prog?.category || 'Special Programme'}
                    </span>
                    <h3 className="text-lg font-extrabold text-[#111111] mt-1">
                      {prog?.title || 'Programme Info'}
                    </h3>
                    {prog?.title_ta && (
                      <p className="text-xs font-semibold text-[#854D0E]">{prog.title_ta}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        isCancelled
                          ? 'bg-gray-100 text-gray-600 border-gray-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {reg.registration_status}
                    </span>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelRegistration(reg.id, prog?.title || 'Programme')}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Cancel Registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Schedule & Location Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><b>Schedule:</b> {prog?.schedule_text || 'TBA'}</span>
                  </div>

                  {prog?.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate"><b>Venue:</b> {prog.venue}</span>
                    </div>
                  )}
                </div>

                {/* Registered Participants Roster */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]">
                    Registered Attendees ({reg.total_participants_count || 1}):
                  </h4>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {/* Primary Alumni */}
                    <div className="bg-amber-100 border border-amber-300 text-[#854D0E] font-bold px-3 py-1 rounded-xl flex items-center space-x-1.5">
                      <span>{reg.primary_participant?.full_name || 'Primary Member'}</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-md uppercase">SELF</span>
                    </div>

                    {/* Family Members */}
                    {reg.family_members?.map((fam, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-200 text-blue-950 font-semibold px-3 py-1 rounded-xl flex items-center space-x-1.5">
                        <span>{fam.name}</span>
                        <span className="text-[10px] font-extrabold text-blue-800 uppercase bg-blue-200 px-1.5 py-0.2 rounded-md">
                          {fam.relationship}
                        </span>
                        {fam.age && <span className="text-gray-500 text-[10px]">• {fam.age} yrs</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
