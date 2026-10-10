import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Programme } from '../../types';
import { Button } from '../../components/Button';
import { ProgrammeInvitationsModal } from './ProgrammeInvitationsModal';
import { Plus, Search, Filter, Calendar, Users, Eye, Edit, Link2, Download, Trash2, Globe, Lock, Share2, CheckCircle2 } from 'lucide-react';

export const ProgrammesList: React.FC = () => {
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Invitation Modal State
  const [selectedProgrammeForInvites, setSelectedProgrammeForInvites] = useState<Programme | null>(null);

  useEffect(() => {
    loadProgrammes();
  }, [statusFilter]);

  const loadProgrammes = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminProgrammes(statusFilter === 'ALL' ? undefined : statusFilter);
      setProgrammes(data);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to load programmes.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    const confirmed = await alertService.showConfirm('Archive Programme', 'Are you sure you want to archive this programme?');
    if (confirmed) {
      try {
        await api.deleteAdminProgramme(id);
        alertService.showSuccess('Programme Archived', 'The programme has been archived.');
        loadProgrammes();
      } catch (err: any) {
        alertService.handleApiError(err, 'Failed to archive programme.');
      }
    }
  };

  const filtered = programmes.filter((p) => {
    const q = search.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(q) || (p.title_ta && p.title_ta.toLowerCase().includes(q));
    const catMatch = p.category.toLowerCase().includes(q);
    return titleMatch || catMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-[#854D0E] px-2.5 py-0.5 rounded-full border border-amber-300">
              Independent Module
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-gray-500">தமிழில்: சிறப்புத் திட்டங்கள்</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight mt-1">
            Programmes Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage tech orientations, career mentoring, workshops and family learning programmes.
          </p>
        </div>

        <Button
          onClick={() => navigate('/school-admin/programmes/create')}
          className="bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs shrink-0 flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Programme</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programme title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#F4C542]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PUBLISHED', 'REGISTRATION_OPEN', 'DRAFT', 'COMPLETED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#111111] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* List / Cards View */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB] text-xs text-gray-400">
          Loading programmes...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
          <p className="text-sm font-bold text-gray-700">No programmes found</p>
          <p className="text-xs text-gray-500">Try adjusting search filters or create a new programme.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Header Image or Banner */}
                <div className="relative h-40 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 overflow-hidden">
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
                    {prog.is_featured && (
                      <span className="bg-[#F4C542] text-[#111111] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border shadow-xs ${
                      prog.status === 'REGISTRATION_OPEN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      prog.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      prog.status === 'DRAFT' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                      'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {prog.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#111111] line-clamp-1 group-hover:text-amber-700 transition-colors">
                      {prog.title}
                    </h3>
                    {prog.title_ta && (
                      <p className="text-xs font-semibold text-[#854D0E] line-clamp-1">{prog.title_ta}</p>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#111111]">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>{prog.schedule_text || 'Schedule TBA'}</span>
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {prog.mode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Registrations: <b>{prog.total_registrations || 0}</b> {prog.capacity_limit ? `/ ${prog.capacity_limit}` : ''}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500">
                        {prog.visibility === 'PUBLIC' ? <Globe className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                        <span>{prog.visibility}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedProgrammeForInvites(prog)}
                  className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-[#854D0E] border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Invites</span>
                </button>

                <button
                  onClick={() => navigate(`/school-admin/programmes/${prog.id}/registrations`)}
                  className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Participants</span>
                </button>

                <button
                  onClick={() => navigate(`/school-admin/programmes/${prog.id}/edit`)}
                  className="py-2 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleArchive(prog.id)}
                  className="py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invitations Management Modal */}
      <ProgrammeInvitationsModal
        isOpen={Boolean(selectedProgrammeForInvites)}
        onClose={() => setSelectedProgrammeForInvites(null)}
        programme={selectedProgrammeForInvites}
      />
    </div>
  );
};
