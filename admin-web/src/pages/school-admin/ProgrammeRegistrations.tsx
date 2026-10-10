import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Programme, ProgrammeRegistration } from '../../types';
import { Button } from '../../components/Button';
import { ArrowLeft, Download, Search, Users, Calendar, Mail, Phone, UserCheck, ShieldCheck, RefreshCw } from 'lucide-react';

export const ProgrammeRegistrations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [registrations, setRegistrations] = useState<ProgrammeRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (progId: string) => {
    setLoading(true);
    try {
      const [prog, regs] = await Promise.all([
        api.getAdminProgrammeDetail(progId),
        api.getAdminProgrammeRegistrations(progId)
      ]);
      setProgramme(prog);
      setRegistrations(regs);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!id) return;
    const url = api.getAdminProgrammeExportUrl(id);
    window.open(url, '_blank');
  };

  const filtered = registrations.filter((r) => {
    const q = search.toLowerCase();
    const pri = r.primary_participant || {};
    const priName = (pri.full_name || '').toLowerCase();
    const priEmail = (pri.email || '').toLowerCase();
    const priMobile = (pri.mobile || '').toLowerCase();
    const famMatch = (r.family_members || []).some((f) => f.name.toLowerCase().includes(q));
    return priName.includes(q) || priEmail.includes(q) || priMobile.includes(q) || famMatch;
  });

  const totalPrimaryCount = registrations.length;
  const totalFamilyCount = registrations.reduce((acc, r) => acc + (r.family_members?.length || 0), 0);
  const totalAttendeeCount = totalPrimaryCount + totalFamilyCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/school-admin/programmes')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                Participant Dashboard
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] mt-0.5">
              {programme?.title || 'Programme Registrations'}
            </h1>
            {programme?.title_ta && (
              <p className="text-xs font-semibold text-[#854D0E]">{programme.title_ta}</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleExportCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs shrink-0 flex items-center space-x-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Registration CSV</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-[#854D0E] shrink-0 font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Attendees</p>
            <h3 className="text-xl font-extrabold text-[#111111]">{totalAttendeeCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-900 shrink-0 font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Alumni Members</p>
            <h3 className="text-xl font-extrabold text-[#111111]">{totalPrimaryCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 shrink-0 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Family Members</p>
            <h3 className="text-xl font-extrabold text-[#111111]">{totalFamilyCount}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alumni or family member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#F4C542]"
          />
        </div>

        <button
          onClick={() => id && loadData(id)}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Registrations List / Table */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB] text-xs text-gray-400">
          Loading participant registrations...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB] text-xs text-gray-500">
          No participant registrations found for this programme yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[11px] uppercase tracking-wider font-extrabold text-gray-500">
                <tr>
                  <th className="py-3.5 px-4">Primary Alumni Member</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Family Participants</th>
                  <th className="py-3.5 px-4">Total Count</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map((r) => {
                  const pri = r.primary_participant || {};
                  return (
                    <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#111111]">
                        <div>{pri.full_name || 'Alumni Member'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <div className="space-y-0.5">
                          {pri.mobile && (
                            <div className="flex items-center gap-1 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-amber-600" />
                              <span>{pri.mobile}</span>
                            </div>
                          )}
                          {pri.email && (
                            <div className="flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="truncate">{pri.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-amber-100 text-[#854D0E] border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {pri.batch_year ? `Class of ${pri.batch_year}` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {r.family_members && r.family_members.length > 0 ? (
                          <div className="space-y-1">
                            {r.family_members.map((fam, idx) => (
                              <div key={idx} className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md text-[11px] font-medium mr-1 mb-1">
                                <span className="font-bold text-[#111111]">{fam.name}</span>
                                <span className="text-[10px] text-blue-800 font-extrabold uppercase">({fam.relationship})</span>
                                {fam.age && <span className="text-[10px] text-gray-500">• {fam.age} yrs</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-medium">Self only</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#111111]">
                        <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-full text-[11px]">
                          {r.total_participants_count || 1} Person(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                        {new Date(r.registered_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
