import React, { useEffect, useState, useMemo } from 'react';
import { 
  Award, Users, UserPlus, Search, Edit, Trash2, CheckCircle2, 
  XCircle, Crown, Shield, ArrowUpDown, Upload, UserCheck, Sparkles, Building 
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { LoadingState } from '../../components/EmptyState';
import { ImageUploadAndEdit } from '../../components/ImageUploadAndEdit';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { AssociationTeamMember, AlumniProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

// Common positions — the `key` is the English DB value; the `labelKey` is the
// translation key for display in the dropdown.
const COMMON_POSITIONS = [
  { key: 'President',                labelKey: 'admin_association_pos_president' },
  { key: 'Vice President',           labelKey: 'admin_association_pos_vice_president' },
  { key: 'Secretary',                labelKey: 'admin_association_pos_secretary' },
  { key: 'Joint Secretary',          labelKey: 'admin_association_pos_joint_secretary' },
  { key: 'Treasurer',                labelKey: 'admin_association_pos_treasurer' },
  { key: 'Executive Committee Member', labelKey: 'admin_association_pos_executive' },
  { key: 'Other',                    labelKey: 'admin_association_pos_other' },
];

// Maps an English position value to its translation key (used for display in the table)
const POSITION_KEY_MAP: Record<string, string> = {
  'President': 'admin_association_pos_president',
  'Vice President': 'admin_association_pos_vice_president',
  'Secretary': 'admin_association_pos_secretary',
  'Joint Secretary': 'admin_association_pos_joint_secretary',
  'Treasurer': 'admin_association_pos_treasurer',
  'Executive Committee Member': 'admin_association_pos_executive',
  'Other': 'admin_association_pos_other',
};

export const AssociationTeam: React.FC = () => {
  const { t } = useLanguage();
  const [teamList, setTeamList] = useState<AssociationTeamMember[]>([]);
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<'alumni' | 'common'>('alumni');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Search Alumni State in Modal
  const [alumniSearchTerm, setAlumniSearchTerm] = useState('');
  const [selectedAlumnus, setSelectedAlumnus] = useState<AlumniProfile | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [fullNameTa, setFullNameTa] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [batchYear, setBatchYear] = useState<number | ''>('');
  const [positionSelect, setPositionSelect] = useState('President');
  const [positionTa, setPositionTa] = useState('தலைவர்');
  const [customPosition, setCustomPosition] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [termStart, setTermStart] = useState('2024');
  const [termEnd, setTermEnd] = useState('2026');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Photo upload loading state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tData, aData] = await Promise.all([
        api.getAssociationTeam(),
        api.searchAlumni().catch(() => [])
      ]);
      setTeamList(tData);
      setAlumniList(aData);
    } catch (err) {
      console.error('Failed to load association team:', err);
    } finally {
      setLoading(false);
    }
  };

  // Returns localized display label for a position (English or Tamil value).
  const getPositionLabel = (position: string): string => {
    if (!position) return '';
    // Direct match against common positions
    const key = POSITION_KEY_MAP[position];
    if (key) return t(key);
    // Fuzzy fallback for custom positions
    const lower = position.toLowerCase();
    if (lower.includes('president') && lower.includes('vice')) return t('admin_association_pos_vice_president');
    if (lower.includes('president')) return t('admin_association_pos_president');
    if (lower.includes('joint') && lower.includes('secretary')) return t('admin_association_pos_joint_secretary');
    if (lower.includes('secretary')) return t('admin_association_pos_secretary');
    if (lower.includes('treasurer')) return t('admin_association_pos_treasurer');
    if (lower.includes('committee') || lower.includes('member')) return t('admin_association_pos_executive');
    return position;
  };

  // Filter alumni in search tab of modal
  const filteredAlumni = useMemo(() => {
    if (!alumniSearchTerm.trim()) return alumniList.slice(0, 10);
    const term = alumniSearchTerm.toLowerCase();
    return alumniList.filter(
      (a) =>
        a.full_name.toLowerCase().includes(term) ||
        a.mobile.includes(term) ||
        (a.email && a.email.toLowerCase().includes(term)) ||
        (a.admission_number && a.admission_number.toLowerCase().includes(term))
    ).slice(0, 15);
  }, [alumniList, alumniSearchTerm]);

  // Filter team members list on main page
  const filteredTeam = useMemo(() => {
    if (!searchQuery.trim()) return teamList;
    const q = searchQuery.toLowerCase();
    return teamList.filter(
      (t) =>
        t.full_name.toLowerCase().includes(q) ||
        t.position.toLowerCase().includes(q) ||
        (t.mobile && t.mobile.includes(q)) ||
        (t.location && t.location.toLowerCase().includes(q))
    );
  }, [teamList, searchQuery]);

  const handleSelectAlumnus = (alumnus: AlumniProfile) => {
    setSelectedAlumnus(alumnus);
    setFullName(alumnus.full_name);
    setFullNameTa(alumnus.name_ta || (alumnus as any).full_name_ta || '');
    setPhotoUrl(alumnus.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(alumnus.full_name)}&background=FFF7D6&color=854D0E`);
    setEmail(alumnus.email || '');
    setMobile(alumnus.mobile || '');
    setLocation(alumnus.current_city || '');
    setOccupation(alumnus.profession || '');
    setBatchYear(alumnus.passing_year || '');
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const res = await api.uploadSchoolImage(file);
      setPhotoUrl(res.url);
      alertService.showSuccess(
        t('admin_association_alert_photo_uploaded_title'),
        t('admin_association_alert_photo_uploaded_body')
      );
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_association_alert_photo_error'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const openAddModal = () => {
    setEditingMemberId(null);
    setCreationMode('alumni');
    setSelectedAlumnus(null);
    setAlumniSearchTerm('');
    setFullName('');
    setFullNameTa('');
    setPhotoUrl('');
    setEmail('');
    setMobile('');
    setLocation('');
    setOccupation('');
    setBatchYear('');
    setPositionSelect('President');
    setPositionTa('தலைவர்');
    setCustomPosition('');
    setResponsibility('');
    setTermStart('2024');
    setTermEnd('2026');
    setDisplayOrder(teamList.length + 1);
    setBio('');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (member: AssociationTeamMember) => {
    setEditingMemberId(member.id);
    setCreationMode(member.profile_type);
    setSelectedAlumnus(null);
    setFullName(member.full_name);
    setFullNameTa(member.full_name_ta || member.name_ta || '');
    setPhotoUrl(member.photo_url || '');
    setEmail(member.email || '');
    setMobile(member.mobile || '');
    setLocation(member.location || '');
    setOccupation(member.occupation || '');
    setBatchYear(member.batch_year || '');

    // Match against common positions by English key
    const isCommon = COMMON_POSITIONS.some(p => p.key === member.position);
    if (isCommon) {
      setPositionSelect(member.position);
      setCustomPosition('');
    } else {
      setPositionSelect('Other');
      setCustomPosition(member.position);
    }
    setPositionTa(member.position_ta || '');

    setResponsibility(member.responsibility || '');
    setTermStart(member.term_start || '2024');
    setTermEnd(member.term_end || '2026');
    setDisplayOrder(member.display_order || 1);
    setBio(member.bio || '');
    setStatus(member.status);
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alertService.showWarning(
        t('admin_association_alert_required_title'),
        t('admin_association_alert_required_body')
      );
      return;
    }

    const finalPosition = positionSelect === 'Other' ? (customPosition.trim() || 'Committee Member') : positionSelect;

    setSaving(true);
    try {
      const payload: Partial<AssociationTeamMember> = {
        profile_type: creationMode,
        alumni_id: selectedAlumnus ? selectedAlumnus.id : undefined,
        full_name: fullName.trim(),
        full_name_ta: fullNameTa.trim() || undefined,
        name_ta: fullNameTa.trim() || undefined,
        photo_url: photoUrl,
        email,
        mobile,
        location,
        occupation,
        batch_year: batchYear ? Number(batchYear) : undefined,
        position: finalPosition,
        position_ta: positionTa.trim() || undefined,
        responsibility,
        term_start: termStart,
        term_end: termEnd,
        display_order: Number(displayOrder) || 1,
        bio,
        status
      };

      if (editingMemberId) {
        await api.updateAssociationTeamMember(editingMemberId, payload);
        alertService.showSuccess(
          t('admin_association_alert_updated_title'),
          t('admin_association_alert_updated_body').replace('{name}', fullName)
        );
      } else {
        await api.createAssociationTeamMember(payload);
        alertService.showSuccess(
          t('admin_association_alert_created_title'),
          t('admin_association_alert_created_body')
            .replace('{name}', fullName)
            .replace('{position}', getPositionLabel(finalPosition))
        );
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_association_alert_save_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(t('admin_association_alert_confirm_delete').replace('{name}', name))) return;
    try {
      await api.deleteAssociationTeamMember(id);
      alertService.showSuccess(
        t('admin_association_alert_removed_title'),
        t('admin_association_alert_removed_body').replace('{name}', name)
      );
      loadData();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_association_alert_delete_error'));
    }
  };

  const handleToggleStatus = async (member: AssociationTeamMember) => {
    const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.updateAssociationTeamMember(member.id, { status: newStatus });
      alertService.showSuccess(
        t('admin_association_alert_status_updated_title'),
        t('admin_association_alert_status_updated_body')
          .replace('{name}', member.full_name)
          .replace('{status}', newStatus === 'ACTIVE' ? t('admin_association_status_active') : t('admin_association_status_inactive'))
      );
      loadData();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_association_alert_status_error'));
    }
  };

  if (loading) return <LoadingState />;

  const tableColumns = [
    {
      header: t('admin_association_col_member'),
      accessor: (row: AssociationTeamMember) => (
        <div className="flex items-center space-x-3">
          <img 
            src={row.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name)}&background=FFF7D6&color=854D0E`} 
            alt="" 
            className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]" 
          />
          <div>
            <div className="font-bold text-[#111111] flex items-center space-x-1.5 flex-wrap gap-y-1">
              <span>{row.full_name}</span>
              {(row.full_name_ta || row.name_ta) && (
                <span className="text-xs font-semibold text-gray-600">({row.full_name_ta || row.name_ta})</span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                row.profile_type === 'alumni' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {row.profile_type === 'alumni'
                  ? t('admin_association_badge_alumni').replace('{year}', String(row.batch_year || ''))
                  : t('admin_association_badge_common')}
              </span>
            </div>
            {row.occupation && <div className="text-xs text-[#6B7280]">{row.occupation}</div>}
          </div>
        </div>
      )
    },
    {
      header: t('admin_association_col_position'),
      accessor: (row: AssociationTeamMember) => (
        <div>
          <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/60 px-3 py-1 rounded-full inline-block">
            {getPositionLabel(row.position)}
          </span>
          {row.responsibility && <div className="text-xs text-[#6B7280] mt-1">{row.responsibility}</div>}
        </div>
      )
    },
    {
      header: t('admin_association_col_term'),
      accessor: (row: AssociationTeamMember) => (
        <div className="text-xs font-semibold text-[#111111]">
          {row.term_start || '2024'} - {row.term_end || '2026'}
        </div>
      )
    },
    {
      header: t('admin_association_col_contact'),
      accessor: (row: AssociationTeamMember) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-[#111111]">{row.mobile || row.email || 'N/A'}</div>
          <div className="text-[#6B7280]">{row.location || t('admin_association_default_location')}</div>
        </div>
      )
    },
    {
      header: t('admin_association_col_order'),
      accessor: (row: AssociationTeamMember) => (
        <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
          #{row.display_order}
        </span>
      )
    },
    {
      header: t('admin_association_col_status'),
      accessor: (row: AssociationTeamMember) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
            row.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {row.status === 'ACTIVE' ? t('admin_association_status_active') : t('admin_association_status_inactive')}
        </button>
      )
    },
    {
      header: t('admin_association_col_action'),
      accessor: (row: AssociationTeamMember) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-gray-600 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title={t('admin_association_action_edit')}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteMember(row.id, row.full_name)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title={t('admin_association_action_delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-[#854D0E]" />
            <h2 className="text-2xl font-bold text-[#111111]">{t('admin_association_page_title')}</h2>
          </div>
          <p className="text-xs text-[#6B7280]">
            {t('admin_association_page_subtitle')}
          </p>
        </div>

        <Button onClick={openAddModal} className="w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-1.5" />
          {t('admin_association_add_btn')}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-[#FFF7D6] rounded-xl text-[#854D0E]">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#111111]">{teamList.length}</div>
            <div className="text-xs text-[#6B7280]">{t('admin_association_stat_total')}</div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#111111]">
              {teamList.filter((t) => t.status === 'ACTIVE').length}
            </div>
            <div className="text-xs text-[#6B7280]">{t('admin_association_stat_active')}</div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#111111]">
              {teamList.filter((t) => t.profile_type === 'alumni').length}
            </div>
            <div className="text-xs text-[#6B7280]">{t('admin_association_stat_linked')}</div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#111111]">
              {teamList.filter((t) => t.profile_type === 'common').length}
            </div>
            <div className="text-xs text-[#6B7280]">{t('admin_association_stat_common')}</div>
          </div>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-4 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <h3 className="font-bold text-lg text-[#111111]">
            {t('admin_association_directory_title').replace('{count}', String(filteredTeam.length))}
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin_association_search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
            />
          </div>
        </div>

        <Table columns={tableColumns} data={filteredTeam} keyExtractor={(item) => item.id} defaultPageSize={10} />
      </div>

      {/* ADD / EDIT TEAM MEMBER MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMemberId ? t('admin_association_modal_title_edit') : t('admin_association_modal_title_add')}
      >
        <form onSubmit={handleSaveMember} className="space-y-5">
          {/* Creation Mode Radio Selection (Only if adding new) */}
          {!editingMemberId && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#111111]">{t('admin_association_mode_label')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setCreationMode('alumni')}
                  className={`p-3.5 border rounded-2xl cursor-pointer flex items-center space-x-3 transition-all ${
                    creationMode === 'alumni'
                      ? 'border-[#F4C542] bg-[#FFF7D6] shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="creation_mode"
                    checked={creationMode === 'alumni'}
                    onChange={() => setCreationMode('alumni')}
                    className="text-[#854D0E]"
                  />
                  <div>
                    <div className="font-bold text-xs text-[#111111]">{t('admin_association_mode_alumni_title')}</div>
                    <div className="text-[11px] text-[#6B7280]">{t('admin_association_mode_alumni_sub')}</div>
                  </div>
                </label>

                <label
                  onClick={() => setCreationMode('common')}
                  className={`p-3.5 border rounded-2xl cursor-pointer flex items-center space-x-3 transition-all ${
                    creationMode === 'common'
                      ? 'border-[#F4C542] bg-[#FFF7D6] shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="creation_mode"
                    checked={creationMode === 'common'}
                    onChange={() => setCreationMode('common')}
                    className="text-[#854D0E]"
                  />
                  <div>
                    <div className="font-bold text-xs text-[#111111]">{t('admin_association_mode_common_title')}</div>
                    <div className="text-[11px] text-[#6B7280]">{t('admin_association_mode_common_sub')}</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Option 1: Alumni Search Selector */}
          {!editingMemberId && creationMode === 'alumni' && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-[#111111]">{t('admin_association_alumni_search_label')}</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('admin_association_alumni_search_placeholder')}
                  value={alumniSearchTerm}
                  onChange={(e) => setAlumniSearchTerm(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              {selectedAlumnus && (
                <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#854D0E]">
                      {t('admin_association_alumni_selected_prefix')} {selectedAlumnus.full_name}
                    </span>
                    <span className="text-[#6B7280] ml-2">
                      {t('admin_association_alumni_class_of').replace('{year}', String(selectedAlumnus.passing_year))}
                    </span>
                  </div>
                  <span className="text-emerald-700 font-bold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {t('admin_association_alumni_prefilled')}
                  </span>
                </div>
              )}

              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white">
                {filteredAlumni.length === 0 ? (
                  <div className="p-3 text-center text-xs text-gray-400">{t('admin_association_alumni_empty')}</div>
                ) : (
                  filteredAlumni.map((a) => (
                    <div key={a.id} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={a.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name)}&background=FFF7D6&color=854D0E`} 
                          alt="" 
                          className="w-7 h-7 rounded-full object-cover" 
                        />
                        <div>
                          <div className="text-xs font-bold text-[#111111]">{a.full_name}</div>
                          <div className="text-[10px] text-gray-500">
                            {t('admin_association_alumni_batch_prefix').replace('{year}', String(a.passing_year))} • {a.current_city || t('admin_association_default_location')}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectAlumnus(a)}
                        className="px-3 py-1 bg-[#F4C542] hover:bg-[#e0b236] text-[#111111] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {t('admin_association_alumni_select_btn')}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Personal Details */}
          <div className="border-t border-gray-200 pt-3 space-y-4">
            <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider text-gray-500">
              {t('admin_association_form_section_personal')}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('admin_association_form_name_en_label')}
                placeholder={t('admin_association_form_name_en_placeholder')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label={t('admin_association_form_name_ta_label')}
                placeholder={t('admin_association_form_name_ta_placeholder')}
                value={fullNameTa}
                onChange={(e) => setFullNameTa(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('admin_association_form_email_label')}
                type="email"
                placeholder={t('admin_association_form_email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label={t('admin_association_form_mobile_label')}
                placeholder={t('admin_association_form_mobile_placeholder')}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('admin_association_form_location_label')}
                placeholder={t('admin_association_form_location_placeholder')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                label={t('admin_association_form_occupation_label')}
                placeholder={t('admin_association_form_occupation_placeholder')}
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('admin_association_form_batch_label')}
                type="number"
                placeholder={t('admin_association_form_batch_placeholder')}
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value ? Number(e.target.value) : '')}
              />
            </div>

            {/* Profile Photo Upload with Image Editor */}
            <div className="pt-2">
              <ImageUploadAndEdit
                label={t('admin_association_form_photo_label')}
                sublabel={t('admin_association_form_photo_sublabel')}
                value={photoUrl}
                onChange={setPhotoUrl}
                aspectRatioPreset="1:1"
              />
            </div>
          </div>

          {/* Association Position & Term Details */}
          <div className="border-t border-gray-200 pt-3 space-y-4">
            <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider text-gray-500">
              {t('admin_association_form_section_position')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  {t('admin_association_form_position_en_label')}
                </label>
                <select
                  value={positionSelect}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPositionSelect(val);
                    // Auto-fill Tamil position when a preset is chosen
                    const POSITION_TA_PRESET: Record<string, string> = {
                      'President': 'தலைவர்',
                      'Vice President': 'துணைத் தலைவர்',
                      'Secretary': 'செயலாளர்',
                      'Joint Secretary': 'இணைச் செயலாளர்',
                      'Treasurer': 'பொருளாளர்',
                      'Executive Committee Member': 'செயற்குழு உறுப்பினர்',
                    };
                    if (POSITION_TA_PRESET[val]) setPositionTa(POSITION_TA_PRESET[val]);
                  }}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] font-semibold"
                  required
                >
                  {COMMON_POSITIONS.map((pos) => (
                    <option key={pos.key} value={pos.key}>
                      {t(pos.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label={t('admin_association_form_position_ta_label')}
                placeholder={t('admin_association_form_position_ta_placeholder')}
                value={positionTa}
                onChange={(e) => setPositionTa(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('admin_association_form_responsibility_label')}
                placeholder={t('admin_association_form_responsibility_placeholder')}
                value={responsibility}
                onChange={(e) => setResponsibility(e.target.value)}
              />
              {positionSelect === 'Other' ? (
                <Input
                  label={t('admin_association_form_custom_position_label')}
                  placeholder={t('admin_association_form_custom_position_placeholder')}
                  value={customPosition}
                  onChange={(e) => setCustomPosition(e.target.value)}
                  required
                />
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label={t('admin_association_form_term_start_label')}
                placeholder={t('admin_association_form_term_start_placeholder')}
                value={termStart}
                onChange={(e) => setTermStart(e.target.value)}
              />
              <Input
                label={t('admin_association_form_term_end_label')}
                placeholder={t('admin_association_form_term_end_placeholder')}
                value={termEnd}
                onChange={(e) => setTermEnd(e.target.value)}
              />
              <Input
                label={t('admin_association_form_order_label')}
                type="number"
                placeholder={t('admin_association_form_order_placeholder')}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">{t('admin_association_form_status_label')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] font-semibold"
                >
                  <option value="ACTIVE">{t('admin_association_form_status_active')}</option>
                  <option value="INACTIVE">{t('admin_association_form_status_inactive')}</option>
                </select>
              </div>

              <Input
                label={t('admin_association_form_bio_label')}
                placeholder={t('admin_association_form_bio_placeholder')}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('admin_association_form_cancel')}
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingMemberId ? t('admin_association_form_save_changes') : t('admin_association_form_add_submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};