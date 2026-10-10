import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Programme } from '../../types';
import { Button } from '../../components/Button';
import { Sparkles, Calendar, MapPin, Globe, CheckCircle2, UserCheck, ShieldAlert, ArrowRight, Lock } from 'lucide-react';

export const ProgrammeInviteLanding: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      resolveInvite(token);
    }
  }, [token]);

  const resolveInvite = async (invToken: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.resolveProgrammeInvite(invToken);
      setProgramme(data);
    } catch (err: any) {
      const detail = typeof err === 'string' ? err : err?.message || 'Invalid or expired invitation link.';
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToRegister = () => {
    if (!programme || !token) return;

    if (api.getToken()) {
      navigate(`/alumni/programmes/${programme.slug || programme.id}?token=${encodeURIComponent(token)}`);
    } else {
      alertService.showInfo('Authentication Required', 'Please log in or register your alumni account to accept this invitation and complete registration.');
      navigate(`/login?redirect=/alumni/programmes/${programme.slug || programme.id}?token=${encodeURIComponent(token)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-md text-center max-w-sm w-full space-y-3">
          <div className="w-8 h-8 border-2 border-[#F4C542] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-700">Verifying Invitation Token...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-md text-center max-w-md w-full space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-gray-900">Invitation Link Invalid</h2>
          <p className="text-xs text-gray-600 leading-relaxed">{errorMsg}</p>
          <Button onClick={() => navigate('/programmes')} className="bg-[#111111] text-white font-extrabold text-xs py-2.5 px-5 rounded-xl">
            Explore Public Programmes
          </Button>
        </div>
      </div>
    );
  }

  if (!programme) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xl max-w-xl w-full overflow-hidden space-y-6">
        {/* Special Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-6 sm:p-8 space-y-3 relative">
          <div className="inline-flex items-center gap-1.5 bg-[#F4C542] text-[#111111] font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Special Programme Invitation
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{programme.title}</h1>
          {programme.title_ta && (
            <p className="text-xs sm:text-sm font-semibold text-amber-100">{programme.title_ta}</p>
          )}
        </div>

        {/* Programme Body Preview */}
        <div className="px-6 sm:px-8 space-y-4 text-xs text-gray-700">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <p className="font-bold text-amber-950 text-sm">You have been invited to participate!</p>
            <p className="text-amber-900 leading-relaxed">
              This special programme is open for alumni members and their family. Click below to confirm registration under your alumni account.
            </p>
          </div>

          <div className="space-y-2 pt-1 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <span><b>Schedule:</b> {programme.schedule_text || 'Schedule To Be Announced'}</span>
            </div>

            {programme.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span><b>Venue:</b> {programme.venue}</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 sm:p-8 pt-0 space-y-3">
          <Button
            onClick={handleProceedToRegister}
            className="w-full py-3.5 bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold text-sm rounded-2xl flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
          >
            <span>Accept Invitation & Register Participants</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-[11px] text-center text-gray-400">
            Invitation token is encrypted and securely verified.
          </p>
        </div>
      </div>
    </div>
  );
};
