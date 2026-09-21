import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, ShieldCheck, Crown, Users, Award, Trash2, Edit } from 'lucide-react';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Select, Input } from '../../components/Input';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Batch, AlumniProfile, BatchCommitteeResponse, 
  CommitteeRoleType, CommitteeRoleConfig, CommitteeMember 
} from '../../types';

const COMMITTEE_ROLES_CONFIG: CommitteeRoleConfig[] = [
  { key: 'PRESIDENT', title: 'President / Chairman', max_quota: 1, badgeBg: 'bg-amber-100', badgeText: 'text-amber-900', badgeBorder: 'border-amber-300' },
  { key: 'VICE_PRESIDENT', title: 'Vice President / Vice Chairman', max_quota: 2, badgeBg: 'bg-blue-100', badgeText: 'text-blue-900', badgeBorder: 'border-blue-300' },
  { key: 'SECRETARY', title: 'Secretary', max_quota: 1, badgeBg: 'bg-purple-100', badgeText: 'text-purple-900', badgeBorder: 'border-purple-300' },
  { key: 'JOINT_SECRETARY', title: 'Joint / Assistant Secretary', max_quota: 2, badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-900', badgeBorder: 'border-emerald-300' },
  { key: 'TREASURER', title: 'Treasurer', max_quota: 1, badgeBg: 'bg-rose-100', badgeText: 'text-rose-900', badgeBorder: 'border-rose-300' },
  { key: 'EXECUTIVE_MEMBER', title: 'Executive / Committee Member', max_quota: 8, badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-900', badgeBorder: 'border-indigo-300' },
];

// Maps a committee role key to its translation key for localized rendering.
// Falls back to the raw key when unknown.
const ROLE_TRANSLATION_KEY: Record<string, string> = {
  PRESIDENT: 'admin_committee_role_president',
  VICE_PRESIDENT: 'admin_committee_role_vice_president',
  SECRETARY: 'admin_committee_role_secretary',
  JOINT_SECRETARY: 'admin_committee_role_joint_secretary',
  TREASURER: 'admin_committee_role_treasurer',
  EXECUTIVE_MEMBER: 'admin_committee_role_executive_member',
  NORMAL_MEMBER: 'admin_committee_role_normal_member',
};

export const BatchDetails: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [members, setMembers] = useState<AlumniProfile[]>([]);
  const [committee, setCommittee] = useState<BatchCommitteeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAlumniId, setSelectedAlumniId] = useState('');
  const [selectedRole, setSelectedRole] = useState<CommitteeRoleType>('PRESIDENT');
  const [assigning, setAssigning] = useState(false);

  // Edit Batch modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPassingYear, setEditPassingYear] = useState<number>(2026);
  const [editDescription, setEditDescription] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (batchId) loadBatch();
  }, [batchId]);

  const loadBatch = async () => {
    try {
      setLoading(true);
      const [mData, cData, batches] = await Promise.all([
        api.getBatchMembers(batchId!),
        api.getBatchCommittee(batchId!).catch(() => null),
        api.getBatches()
      ]);
      
      setMembers(mData);
      setCommittee(cData);

      const match = batches.find((b) => b.id === batchId);
      if (match) setBatch(match);
    } catch (err) {
      console.error('Failed to load batch detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Returns the localized display title for a committee role key.
  const getRoleTitle = (roleKey?: string): string => {
    if (!roleKey) return t('admin_committee_role_normal_member');
    const key = ROLE_TRANSLATION_KEY[roleKey];
    if (key) return t(key);
    // Fallback: use the raw config title if present
    const found = COMMITTEE_ROLES_CONFIG.find((r) => r.key === roleKey);
    return found ? found.title : roleKey;
  };
    // If the backend generated a default name like "Batch of 2027",
  // render a localized version. Otherwise, show the user-provided name as-is.
  const getBatchDisplayName = (b: Batch): string => {
    if (!b.name) {
      return t('admin_batch_default_name').replace('{year}', String(b.passing_year));
    }
    const match = b.name.match(/^Batch of (\d{4})$/i);
    if (match) {
      return t('admin_batch_default_name').replace('{year}', match[1]);
    }
    return b.name;
  };
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId || !selectedAlumniId) {
      alertService.showWarning(t('admin_batch_alert_select_alumni_title'), t('admin_batch_alert_select_alumni_body'));
      return;
    }

    setAssigning(true);
    try {
      const res = await api.assignCommitteeRole(batchId, selectedAlumniId, selectedRole);
      alertService.showSuccess(t('admin_batch_alert_role_appointed_title'), res.message);
      setIsAssignModalOpen(false);
      setSelectedAlumniId('');
      loadBatch();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_batch_alert_failed_assign'));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (alumniId: string, alumniName: string) => {
    if (!batchId) return;
    if (!window.confirm(t('admin_batch_confirm_remove').replace('{name}', alumniName))) return;

    try {
      await api.removeCommitteeRole(batchId, alumniId);
      alertService.showSuccess(
        t('admin_batch_alert_role_removed_title'),
        t('admin_batch_alert_role_removed_body').replace('{name}', alumniName)
      );
      loadBatch();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_batch_alert_failed_remove'));
    }
  };

  const openAssignModalForAlumni = (alumniId?: string, currentRole?: CommitteeRoleType) => {
    if (alumniId) setSelectedAlumniId(alumniId);
    if (currentRole) setSelectedRole(currentRole);
    else setSelectedRole('PRESIDENT');
    setIsAssignModalOpen(true);
  };

  const openEditModal = () => {
    if (!batch) return;
    setEditName(batch.name);
    setEditPassingYear(batch.passing_year);
    setEditDescription(batch.description || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId) return;
    setUpdating(true);
    try {
      await api.updateBatch(batchId, editName, editPassingYear, editDescription);
      alertService.showSuccess(
        t('admin_batches_edit_success_title'),
        t('admin_batches_edit_success_msg').replace('{year}', String(editPassingYear))
      );
      setIsEditModalOpen(false);
      loadBatch();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_batch_alert_failed_update'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!batch) return <div className="p-8">{t('admin_batch_not_found')}</div>;

  const alumniOptions = [
    { label: t('admin_batch_modal_select_placeholder'), value: '' },
    ...members.map((m) => ({ 
      label: `${m.full_name} (${m.admission_number}) ${m.committee_role ? `[${getRoleTitle(m.committee_role)}]` : ''}`, 
      value: m.id 
    }))
  ];

  const getRoleStyle = (roleKey?: string) => {
    const found = COMMITTEE_ROLES_CONFIG.find((r) => r.key === roleKey);
    if (found) return found;
    return { title: t('admin_committee_role_normal_member'), badgeBg: 'bg-gray-100', badgeText: 'text-gray-700', badgeBorder: 'border-gray-300' };
  };

  const totalFilled = committee?.total_filled || 0;
  const totalPositions = committee?.total_positions || 15;

  const columns = [
    {
      header: t('admin_batch_col_member_name'),
      accessor: (row: AlumniProfile) => (
        <div className="flex items-center space-x-3">
          <img src={row.profile_photo_url || '/assets/avatar-placeholder.png'} alt="" className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]" />
          <div>
            <div className="font-bold text-[#111111]">{row.full_name}</div>
            <div className="text-xs text-[#6B7280]">{t('admin_label_adm_prefix')} {row.admission_number}</div>
          </div>
        </div>
      )
    },
    {
      header: t('admin_batch_col_city_profession'),
      accessor: (row: AlumniProfile) => (
        <div className="text-xs">
          <div className="font-semibold text-[#111111]">{row.profession || 'N/A'}</div>
          <div className="text-[#6B7280]">{row.current_city || 'N/A'}</div>
        </div>
      )
    },
    {
      header: t('admin_batch_col_committee_role'),
      accessor: (row: AlumniProfile) => {
        const style = getRoleStyle(row.committee_role);
        return (
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder} flex items-center space-x-1`}>
              {row.committee_role && <Crown className="w-3.5 h-3.5 mr-1 inline" />}
              <span>{getRoleTitle(row.committee_role)}</span>
            </span>
          </div>
        );
      }
    },
    {
      header: t('admin_batch_col_action'),
      accessor: (row: AlumniProfile) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openAssignModalForAlumni(row.id, row.committee_role)}
            className="px-2.5 py-1.5 bg-[#FFF7D6] hover:bg-[#F4C542]/40 text-[#854D0E] font-semibold text-xs rounded-lg border border-[#F4C542]/60 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>{row.committee_role ? t('admin_batch_action_edit_role') : t('admin_batch_action_assign_role')}</span>
          </button>
          {row.committee_role && (
            <button
              onClick={() => handleRemoveRole(row.id, row.full_name)}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
              title={t('admin_batch_action_remove_position')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => navigate('/school-admin/batches')}
        className="inline-flex items-center text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('admin_batch_back_to_batches')}
      </button>

      {/* Batch Hero Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] px-3 py-1 rounded-full border border-[#F4C542]/60">
            {t('admin_batch_class_of_cohort').replace('{year}', String(batch.passing_year))}
          </span>
          <h2 className="text-2xl font-bold text-[#111111] mt-2">{getBatchDisplayName(batch)}</h2>
          <p className="text-xs text-[#6B7280] mt-1">{batch.description || t('admin_batch_verified_cohort')}</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" onClick={openEditModal} className="w-full sm:w-auto">
            <Edit className="w-4 h-4 mr-1.5" />
            {t('admin_batches_edit_btn')}
          </Button>
          <Button onClick={() => openAssignModalForAlumni()} className="w-full sm:w-auto">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            {t('admin_batch_assign_committee_btn')}
          </Button>
        </div>
      </div>

      {/* BATCH COMMITTEE STRUCTURE OVERVIEW (15 POSITIONS) */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-4 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-[#854D0E]" />
              <h3 className="font-bold text-lg text-[#111111]">{t('admin_batch_committee_section_title')}</h3>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {t('admin_batch_committee_section_subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] px-3.5 py-1.5 rounded-full border border-[#F4C542]">
              {t('admin_batch_appointed_count').replace('{filled}', String(totalFilled)).replace('{total}', String(totalPositions))}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
            <div 
              className="bg-[#F4C542] h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (totalFilled / totalPositions) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Roles Breakdown Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMMITTEE_ROLES_CONFIG.map((roleCfg) => {
            const summary = committee?.roles_summary.find((r) => r.role === roleCfg.key);
            const filledCount = summary?.filled_count || 0;
            const maxQuota = roleCfg.max_quota;
            const isFull = filledCount >= maxQuota;

            const appointedMembers = committee?.members.filter((m) => m.role === roleCfg.key) || [];

            return (
              <div 
                key={roleCfg.key} 
                className="border border-[#E5E7EB] rounded-2xl p-4 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleCfg.badgeBg} ${roleCfg.badgeText} ${roleCfg.badgeBorder}`}>
                    {getRoleTitle(roleCfg.key)}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isFull ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
                    {filledCount} / {maxQuota}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {appointedMembers.length > 0 ? (
                    appointedMembers.map((m) => (
                      <div key={m.alumni_id} className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-xl p-2.5 shadow-2xs">
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          <img src={m.profile_photo_url || '/assets/avatar-placeholder.png'} alt="" className="w-7 h-7 rounded-full object-cover border border-[#E5E7EB] shrink-0" />
                          <div className="truncate">
                            <div className="text-xs font-bold text-[#111111] truncate">{m.full_name}</div>
                            {m.mobile && <div className="text-[10px] text-[#6B7280]">{m.mobile}</div>}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveRole(m.alumni_id, m.full_name)}
                          className="p-1 text-gray-400 hover:text-rose-600 transition-colors shrink-0"
                          title={t('admin_batch_action_remove_position')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 italic py-2 text-center bg-white border border-dashed border-gray-200 rounded-xl">
                      {t('admin_batch_no_members_appointed')}
                    </div>
                  )}
                </div>

                {!isFull && (
                  <button
                    onClick={() => {
                      setSelectedRole(roleCfg.key);
                      setIsAssignModalOpen(true);
                    }}
                    className="w-full text-xs font-semibold text-[#854D0E] hover:text-[#111111] bg-[#FFF7D6] hover:bg-[#F4C542]/30 py-1.5 rounded-xl border border-[#F4C542]/60 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t('admin_batch_appoint_position_btn')}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Directory */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <h3 className="font-bold text-lg text-[#111111]">
            {t('admin_batch_verified_members_count').replace('{count}', String(members.length))}
          </h3>
        </div>
        <Table columns={columns} data={members} keyExtractor={(m) => m.id} />
      </div>

      {/* Assign Committee Position Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={t('admin_batch_assign_modal_title')}>
        <form onSubmit={handleAssignRole} className="space-y-4">
          <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs text-[#854D0E] space-y-1">
            <div className="font-bold">{t('admin_batch_modal_roles_info_title')}</div>
            <div>{t('admin_batch_modal_roles_info_body').replace('{batch_name}', batch.name)}</div>
          </div>

          <Select
            label={t('admin_batch_modal_select_alumnus_label')}
            options={alumniOptions}
            value={selectedAlumniId}
            onChange={(e) => setSelectedAlumniId(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
              {t('admin_batch_modal_select_role_label')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMITTEE_ROLES_CONFIG.map((r) => {
                const summary = committee?.roles_summary.find((item) => item.role === r.key);
                const filled = summary?.filled_count || 0;
                const max = r.max_quota;
                const isSelected = selectedRole === r.key;
                const isFull = filled >= max;

                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedRole(r.key)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#F4C542] bg-[#FFF7D6] shadow-xs'
                        : 'border-[#E5E7EB] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111111]">{getRoleTitle(r.key)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isFull ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'}`}>
                        {filled}/{max}
                      </span>
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setSelectedRole('NORMAL_MEMBER')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'NORMAL_MEMBER'
                    ? 'border-gray-400 bg-gray-100 shadow-xs'
                    : 'border-[#E5E7EB] bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">{t('admin_batch_modal_normal_member')}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                    {t('admin_batch_modal_default_badge')}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              {t('admin_batches_modal_cancel')}
            </Button>
            <Button type="submit" isLoading={assigning}>
              {t('admin_batch_modal_save_btn')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Batch Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('admin_batches_edit_modal_title')}
      >
        <form onSubmit={handleUpdateBatch} className="space-y-4">
          <Input
            label={t('admin_batches_modal_name_label')}
            placeholder={t('admin_batches_modal_name_placeholder')}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Input
            label={t('admin_batches_modal_year_label')}
            type="number"
            value={editPassingYear}
            onChange={(e) => setEditPassingYear(Number(e.target.value))}
            required
          />

          <Input
            label={t('admin_batches_modal_desc_label')}
            placeholder={t('admin_batches_modal_desc_placeholder')}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              {t('admin_batches_modal_cancel')}
            </Button>
            <Button type="submit" isLoading={updating}>
              {t('admin_batches_modal_save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};