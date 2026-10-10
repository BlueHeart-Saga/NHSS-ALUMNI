import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Programme, FamilyMember, ProgrammeRegistration } from '../../types';
import { Button } from '../../components/Button';
import { ArrowLeft, Calendar, MapPin, Globe, Users, Plus, Trash2, CheckCircle2, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';

export const AlumniProgrammeDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token') || undefined;

  const navigate = useNavigate();

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Registration Form State
  const [notes, setNotes] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Temp input for adding a family member
  const [famName, setFamName] = useState('');
  const [famRel, setFamRel] = useState<'SPOUSE' | 'SON' | 'DAUGHTER' | 'PARENT' | 'SIBLING' | 'OTHER'>('SON');
  const [famAge, setFamAge] = useState('');
  const [famGender, setFamGender] = useState('Male');

  useEffect(() => {
    if (slug) {
      loadProgramme(slug);
    }
  }, [slug]);

  const loadProgramme = async (paramSlug: string) => {
    setLoading(true);
    try {
      const data = await api.getAlumniProgrammeDetail(paramSlug);
      setProgramme(data);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to load programme details.');
      navigate('/alumni/programmes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMember = () => {
    if (!famName.trim()) {
      alertService.showError('Name Required', 'Please enter the family member\'s full name.');
      return;
    }

    const newMember: FamilyMember = {
      name: famName.trim(),
      relationship: famRel,
      age: famAge.trim() ? parseInt(famAge, 10) : undefined,
      gender: famGender
    };

    setFamilyMembers((prev) => [...prev, newMember]);
    setFamName('');
    setFamAge('');
  };

  const handleRemoveFamilyMember = (index: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programme?.id) return;

    setSubmitting(true);
    try {
      await api.registerForProgramme(programme.id, {
        notes: notes.trim() || undefined,
        family_members: familyMembers
      }, inviteToken);

      alertService.showSuccess('Registration Successful!', 'You and your family members have been registered for this programme.');
      loadProgramme(programme.slug || programme.id);
    } catch (err: any) {
      alertService.handleApiError(err, 'Programme registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB] text-xs text-gray-400">
        Loading programme details...
      </div>
    );
  }

  if (!programme) return null;

  const isRegistered = programme.is_registered;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/alumni/programmes')}
          className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-[#E5E7EB] text-gray-700 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Programme Overview</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111]">{programme.title}</h1>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-6 sm:p-8 shadow-md">
        {programme.image_url && (
          <img src={programme.image_url} alt={programme.title} className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#111111] text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {programme.category}
            </span>
            <span className="bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
              {programme.mode}
            </span>
            {inviteToken && (
              <span className="bg-[#F4C542] text-[#111111] text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Special Invited Access
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{programme.title}</h1>
          {programme.title_ta && (
            <p className="text-sm font-semibold text-amber-100">{programme.title_ta}</p>
          )}

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-amber-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#F4C542]" />
              <span>{programme.schedule_text || 'Schedule To Be Announced'}</span>
            </span>

            {programme.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F4C542]" />
                <span>{programme.venue}</span>
              </span>
            )}

            {programme.online_link && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#F4C542]" />
                <span>Online Link Available upon registration</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-[#111111] uppercase tracking-wider border-b border-gray-100 pb-2">
          Programme Description & Agenda
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {programme.description}
        </p>

        {programme.description_ta && (
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 mt-3">
            <h4 className="font-bold text-xs text-[#854D0E] mb-1">விளக்கம் (தமிழில்):</h4>
            <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-line">
              {programme.description_ta}
            </p>
          </div>
        )}
      </div>

      {/* Registration Section */}
      {isRegistered ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-extrabold text-emerald-900">You are Registered for this Programme!</h3>
          <p className="text-xs text-emerald-700 max-w-md mx-auto">
            Your registration is confirmed. You can view your family participant details in your registration history.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => navigate('/alumni/my-programmes')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-xs"
            >
              View My Registrations
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-600" />
              Programme Registration Form
            </h3>
            <span className="text-xs text-gray-500 font-bold">Step 1 of 1</span>
          </div>

          {/* Primary Participant Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-700">
            <p className="font-bold text-[#111111] mb-0.5">Primary Alumni Participant:</p>
            <p>Your authenticated alumni account details (Name, Mobile, Email, Graduation Year) will automatically be assigned as the primary participant.</p>
          </div>

          {/* Family Member Registration */}
          {programme.allow_family && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Register Family Members & Children
                  </h4>
                  <p className="text-[11px] text-gray-500">Register sons, daughters, spouse or relatives for this session.</p>
                </div>
              </div>

              {/* Add Family Input Row */}
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ananya"
                      value={famName}
                      onChange={(e) => setFamName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Relationship</label>
                    <select
                      value={famRel}
                      onChange={(e) => setFamRel(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
                    >
                      <option value="SON">Son (மகன்)</option>
                      <option value="DAUGHTER">Daughter (மகள்)</option>
                      <option value="SPOUSE">Spouse (மனைவி/கணவர்)</option>
                      <option value="PARENT">Parent (பெற்றோர்)</option>
                      <option value="SIBLING">Sibling (சகோதரி/சகோதரன்)</option>
                      <option value="OTHER">Other Relative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Age (Years)</label>
                    <input
                      type="number"
                      placeholder="e.g. 14"
                      value={famAge}
                      onChange={(e) => setFamAge(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Gender</label>
                    <select
                      value={famGender}
                      onChange={(e) => setFamGender(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAddFamilyMember}
                  className="w-full py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#F4C542]" />
                  <span>Add Family Member</span>
                </Button>
              </div>

              {/* Family Members Added Roster */}
              {familyMembers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-700">Family Participants Added ({familyMembers.length}):</p>
                  <div className="space-y-2">
                    {familyMembers.map((fam, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs">
                        <div>
                          <span className="font-extrabold text-blue-950">{fam.name}</span>
                          <span className="ml-2 text-[10px] font-bold uppercase bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                            {fam.relationship}
                          </span>
                          {fam.age && <span className="ml-2 text-gray-600">• {fam.age} yrs</span>}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFamilyMember(idx)}
                          className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Additional Notes / Questions for Organisers (Optional)</label>
            <textarea
              rows={2}
              placeholder="Any specific domain topics, career questions or accessibility requests..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-3 text-xs focus:outline-none focus:border-[#F4C542]"
            />
          </div>

          <Button
            type="submit"
            isLoading={submitting}
            className="w-full py-3.5 bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold text-sm rounded-xl shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Confirm Registration ({1 + familyMembers.length} Participant(s))</span>
          </Button>
        </form>
      )}
    </div>
  );
};
