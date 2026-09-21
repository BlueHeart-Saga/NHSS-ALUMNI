import React, { useEffect, useState } from 'react';
import { 
  Save, School, Shield, Users, UserPlus, Image as ImageIcon, Upload, 
  ToggleLeft, ToggleRight, Trash2, Edit, CheckCircle2, ChevronRight, Crown, Briefcase,
  UserCheck, Award, History, UserX
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { SchoolProfile, SchoolStaffMember, SchoolPositionType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

// School positions — the `value` is the English DB value, `labelKey` and
// `responsibilityKey` are translation keys resolved at render time.
const SCHOOL_POSITION_OPTIONS: { value: string; labelKey: string; responsibilityKey: string }[] = [
  { value: 'Principal',              labelKey: 'admin_settings_pos_principal',            responsibilityKey: 'admin_settings_pos_principal_resp' },
  { value: 'Vice Principal',         labelKey: 'admin_settings_pos_vice_principal',       responsibilityKey: 'admin_settings_pos_vice_principal_resp' },
  { value: 'Headmaster',             labelKey: 'admin_settings_pos_headmaster',           responsibilityKey: 'admin_settings_pos_headmaster_resp' },
  { value: 'Headmistress',           labelKey: 'admin_settings_pos_headmistress',         responsibilityKey: 'admin_settings_pos_headmistress_resp' },
  { value: 'Assistant Headmaster',   labelKey: 'admin_settings_pos_asst_headmaster',      responsibilityKey: 'admin_settings_pos_asst_headmaster_resp' },
  { value: 'Assistant Headmistress', labelKey: 'admin_settings_pos_asst_headmistress',    responsibilityKey: 'admin_settings_pos_asst_headmistress_resp' },
  { value: 'Department Head',        labelKey: 'admin_settings_pos_dept_head',            responsibilityKey: 'admin_settings_pos_dept_head_resp' },
  { value: 'Senior Teacher',         labelKey: 'admin_settings_pos_senior_teacher',       responsibilityKey: 'admin_settings_pos_senior_teacher_resp' },
  { value: 'Teacher',                labelKey: 'admin_settings_pos_teacher',              responsibilityKey: 'admin_settings_pos_teacher_resp' },
  { value: 'Administrative Staff',   labelKey: 'admin_settings_pos_admin_staff',          responsibilityKey: 'admin_settings_pos_admin_staff_resp' },
  { value: 'Other',                  labelKey: 'admin_settings_pos_other',                responsibilityKey: 'admin_settings_pos_other_resp' },
];

// Standard positions used to detect if a position is "custom"
const STANDARD_POSITIONS = SCHOOL_POSITION_OPTIONS.map(o => o.value).filter(v => v !== 'Other');

// Maps an English school position to its translation key for display in the table
const POSITION_DISPLAY_KEY: Record<string, string> = {
  'Principal': 'admin_settings_pos_principal',
  'Vice Principal': 'admin_settings_pos_vice_principal',
  'Headmaster': 'admin_settings_pos_headmaster',
  'Headmistress': 'admin_settings_pos_headmistress',
  'Assistant Headmaster': 'admin_settings_pos_asst_headmaster',
  'Assistant Headmistress': 'admin_settings_pos_asst_headmistress',
  'Department Head': 'admin_settings_pos_dept_head',
  'Senior Teacher': 'admin_settings_pos_senior_teacher',
  'Teacher': 'admin_settings_pos_teacher',
  'Administrative Staff': 'admin_settings_pos_admin_staff',
  'Other': 'admin_settings_pos_other',
};

export const SchoolSettings: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'controls' | 'staff'>('profile');
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [staffList, setStaffList] = useState<SchoolStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form States
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [schoolType, setSchoolType] = useState('Higher Secondary School');
  const [establishedYear, setEstablishedYear] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [portalName, setPortalName] = useState('');
  const [tagline, setTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');

  // Upload Loading States
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingStaffPhoto, setUploadingStaffPhoto] = useState(false);

  // Feature Toggles States
  const [alumniReg, setAlumniReg] = useState(true);
  const [manualApproval, setManualApproval] = useState(true);
  const [publicDirectory, setPublicDirectory] = useState(true);
  const [eventReg, setEventReg] = useState(true);
  const [announcementNotif, setAnnouncementNotif] = useState(true);

  // Staff Modal & Filter States
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffTypeTab, setStaffTypeTab] = useState<'CURRENT' | 'PAST' | 'ALL'>('CURRENT');
  const [staffTypeSelect, setStaffTypeSelect] = useState<'CURRENT' | 'PAST'>('CURRENT');
  const [staffFullName, setStaffFullName] = useState('');
  const [staffFullNameTa, setStaffFullNameTa] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffMobile, setStaffMobile] = useState('');
  const [staffPositionSelect, setStaffPositionSelect] = useState<string>('Principal');
  const [staffPositionTa, setStaffPositionTa] = useState('');
  const [customPositionTitle, setCustomPositionTitle] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('');
  const [staffDepartmentTa, setStaffDepartmentTa] = useState('');
  const [staffDesignation, setStaffDesignation] = useState('');
  const [staffEmployeeId, setStaffEmployeeId] = useState('');
  const [staffPhotoUrl, setStaffPhotoUrl] = useState('');
  const [staffServiceStartYear, setStaffServiceStartYear] = useState<number | ''>('');
  const [staffServiceEndYear, setStaffServiceEndYear] = useState<number | ''>('');
  const [staffAchievements, setStaffAchievements] = useState('');
  const [staffAchievementsTa, setStaffAchievementsTa] = useState('');
  const [staffStatus, setStaffStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [staffNotes, setStaffNotes] = useState('');
  const [staffNotesTa, setStaffNotesTa] = useState('');
  const [savingStaff, setSavingStaff] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [pData, sData] = await Promise.all([
        api.getSchoolProfile(),
        api.getSchoolStaff().catch(() => [])
      ]);
      setProfile(pData);
      setStaffList(sData);

      // Populate profile state
      setName(pData.name || '');
      setCode(pData.code || '');
      setSchoolType(pData.school_type || 'Higher Secondary School');
      setEstablishedYear(pData.established_year || '');
      setDescription(pData.description || '');
      setLogoUrl(pData.logo_url || '');
      setCoverUrl(pData.cover_url || '');
      setPortalName(pData.portal_name || '');
      setTagline(pData.tagline || '');
      setContactEmail(pData.contact_email || '');
      setContactPhone(pData.contact_phone || '');
      setWebsite(pData.website || '');
      setAddress(pData.address || '');
      setCity(pData.city || '');
      setDistrict(pData.district || '');
      setState(pData.state || '');
      setPinCode(pData.pin_code || '');

      // Feature toggles
      setAlumniReg(pData.alumni_registration_enabled ?? true);
      setManualApproval(pData.manual_approval_enabled ?? true);
      setPublicDirectory(pData.public_directory_enabled ?? true);
      setEventReg(pData.event_registration_enabled ?? true);
      setAnnouncementNotif(pData.announcement_notifications_enabled ?? true);
    } catch (err) {
      console.error('Failed to load school settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPositionLabel = (position: string): string => {
    if (!position) return '';
    const key = POSITION_DISPLAY_KEY[position];
    return key ? t(key) : position;
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await api.uploadSchoolImage(file);
      setLogoUrl(res.url);
      alertService.showSuccess(
        t('admin_settings_alert_logo_uploaded_title'),
        t('admin_settings_alert_logo_uploaded_body')
      );
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_settings_alert_logo_error'));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const res = await api.uploadSchoolImage(file);
      setCoverUrl(res.url);
      alertService.showSuccess(
        t('admin_settings_alert_cover_uploaded_title'),
        t('admin_settings_alert_cover_uploaded_body')
      );
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_settings_alert_cover_error'));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleStaffPhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStaffPhoto(true);
    try {
      const res = await api.uploadSchoolImage(file);
      setStaffPhotoUrl(res.url);
      alertService.showSuccess(
        t('admin_settings_alert_staff_photo_uploaded_title'),
        t('admin_settings_alert_staff_photo_uploaded_body')
      );
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_settings_alert_staff_photo_error'));
    } finally {
      setUploadingStaffPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSchoolProfile({
        name,
        code,
        school_type: schoolType,
        established_year: establishedYear ? Number(establishedYear) : undefined,
        description,
        logo_url: logoUrl,
        cover_url: coverUrl,
        portal_name: portalName,
        tagline,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        website,
        address,
        city,
        district,
        state,
        pin_code: pinCode,
        alumni_registration_enabled: alumniReg,
        manual_approval_enabled: manualApproval,
        public_directory_enabled: publicDirectory,
        event_registration_enabled: eventReg,
        announcement_notifications_enabled: announcementNotif
      });
      alertService.showSuccess(
        t('admin_settings_alert_profile_updated_title'),
        t('admin_settings_alert_profile_updated_body')
      );
      loadAllData();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_settings_alert_profile_update_error'));
    } finally {
      setSaving(false);
    }
  };

  const openAddStaffModal = (defaultType: 'CURRENT' | 'PAST' = 'CURRENT') => {
    setEditingStaffId(null);
    setStaffTypeSelect(defaultType);
    setStaffFullName('');
    setStaffFullNameTa('');
    setStaffEmail('');
    setStaffMobile('');
    setStaffPositionSelect('Principal');
    setStaffPositionTa('');
    setCustomPositionTitle('');
    setStaffDepartment('');
    setStaffDepartmentTa('');
    setStaffDesignation('');
    setStaffEmployeeId('');
    setStaffPhotoUrl('');
    setStaffServiceStartYear('');
    setStaffServiceEndYear('');
    setStaffAchievements('');
    setStaffAchievementsTa('');
    setStaffStatus('ACTIVE');
    setStaffNotes('');
    setStaffNotesTa('');
    setIsStaffModalOpen(true);
  };

  const openEditStaffModal = (s: any) => {
    setEditingStaffId(s.id);
    setStaffTypeSelect((s.staff_type || (s.is_former ? 'PAST' : 'CURRENT')).toUpperCase() as 'CURRENT' | 'PAST');
    setStaffFullName(s.full_name || '');
    setStaffFullNameTa(s.full_name_ta || '');
    setStaffEmail(s.email || '');
    setStaffMobile(s.mobile || '');

    if (STANDARD_POSITIONS.includes(s.school_position)) {
      setStaffPositionSelect(s.school_position);
      setCustomPositionTitle('');
    } else {
      setStaffPositionSelect('Other');
      setCustomPositionTitle(s.school_position || '');
    }
    setStaffPositionTa(s.school_position_ta || '');

    setStaffDepartment(s.department || '');
    setStaffDepartmentTa(s.department_ta || '');
    setStaffDesignation(s.designation || '');
    setStaffEmployeeId(s.staff_id || '');
    setStaffPhotoUrl(s.profile_photo_url || '');
    setStaffServiceStartYear(s.service_start_year || '');
    setStaffServiceEndYear(s.service_end_year || '');
    setStaffAchievements(s.achievements || '');
    setStaffAchievementsTa(s.achievements_ta || '');
    setStaffStatus(s.status || 'ACTIVE');
    setStaffNotes(s.notes || '');
    setStaffNotesTa(s.notes_ta || '');
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFullName) {
      alertService.showWarning(
        t('admin_settings_alert_required_title'),
        t('admin_settings_alert_required_body')
      );
      return;
    }

    const finalPosition = staffPositionSelect === 'Other' 
      ? (customPositionTitle.trim() || 'Custom Position') 
      : staffPositionSelect;

    setSavingStaff(true);
    try {
      const payload: any = {
        full_name: staffFullName,
        full_name_ta: staffFullNameTa || undefined,
        email: staffEmail || undefined,
        mobile: staffMobile || undefined,
        school_position: finalPosition,
        school_position_ta: staffPositionTa || undefined,
        department: staffDepartment || undefined,
        department_ta: staffDepartmentTa || undefined,
        designation: staffDesignation || undefined,
        staff_id: staffEmployeeId || undefined,
        profile_photo_url: staffPhotoUrl || undefined,
        staff_type: staffTypeSelect,
        service_start_year: staffServiceStartYear ? Number(staffServiceStartYear) : undefined,
        service_end_year: staffServiceEndYear ? Number(staffServiceEndYear) : undefined,
        achievements: staffAchievements || undefined,
        achievements_ta: staffAchievementsTa || undefined,
        is_former: staffTypeSelect === 'PAST',
        status: staffStatus,
        notes: staffNotes || undefined,
        notes_ta: staffNotesTa || undefined
      };

      if (editingStaffId) {
        await api.updateSchoolStaff(editingStaffId, payload);
        alertService.showSuccess(
          t('admin_settings_alert_staff_updated_title'),
          t('admin_settings_alert_staff_updated_body').replace('{name}', staffFullName)
        );
      } else {
        await api.createSchoolStaff(payload);
        alertService.showSuccess(
          t('admin_settings_alert_staff_added_title'),
          t('admin_settings_alert_staff_added_body')
            .replace('{name}', staffFullName)
            .replace(
              '{target}',
              staffTypeSelect === 'PAST'
                ? t('admin_settings_alert_staff_added_target_past')
                : t('admin_settings_alert_staff_added_target_current')
            )
        );
      }

      setIsStaffModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_settings_alert_staff_save_error'));
    } finally {
      setSavingStaff(false);
    }
  };

  const handleToggleStaffType = async (s: any) => {
    const newType = (s.staff_type === 'PAST' || s.is_former) ? 'CURRENT' : 'PAST';
    const targetLabel = newType === 'PAST'
      ? t('admin_settings_alert_staff_move_target_past')
      : t('admin_settings_alert_staff_move_target_current');

    if (!window.confirm(
      t('admin_settings_alert_staff_confirm_move')
        .replace('{name}', s.full_name)
        .replace('{target}', targetLabel)
    )) return;

    try {
      await api.updateSchoolStaff(s.id, {
        staff_type: newType,
        is_former: newType === 'PAST'
      });
      alertService.showSuccess(
        t('admin_settings_alert_staff_moved_title'),
        t('admin_settings_alert_staff_moved_body')
          .replace('{name}', s.full_name)
          .replace('{target}', targetLabel)
      );
      loadAllData();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_settings_alert_staff_move_error'));
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(
      t('admin_settings_alert_staff_confirm_delete').replace('{name}', name)
    )) return;
    try {
      await api.deleteSchoolStaff(id);
      alertService.showSuccess(
        t('admin_settings_alert_staff_deleted_title'),
        t('admin_settings_alert_staff_deleted_body').replace('{name}', name)
      );
      loadAllData();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_settings_alert_staff_delete_error'));
    }
  };

  if (loading) return <LoadingState />;

  const staffColumns = [
    {
      header: t('admin_settings_col_member'),
      accessor: (row: any) => (
        <div className="flex items-center space-x-3">
          <img 
            src={row.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name)}&background=FFF7D6&color=854D0E`} 
            alt="" 
            className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]" 
          />
          <div>
            <div className="font-bold text-[#111111]">{row.full_name}</div>
            <div className="text-xs text-[#6B7280]">
              {row.staff_id
                ? t('admin_settings_staff_id_prefix').replace('{id}', String(row.staff_id))
                : t('admin_settings_staff_id_na')}
            </div>
          </div>
        </div>
      )
    },
    {
      header: t('admin_settings_col_designation'),
      accessor: (row: any) => (
        <div>
          <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/60 px-3 py-1 rounded-full inline-block">
            {getPositionLabel(row.school_position)}
          </span>
          {row.designation && <div className="text-xs text-[#6B7280] mt-1">{row.designation}</div>}
        </div>
      )
    },
    {
      header: t('admin_settings_col_category'),
      accessor: (row: any) => {
        const isPast = row.staff_type === 'PAST' || row.is_former;
        return (
          <div className="space-y-1">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border inline-block ${
              isPast 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-blue-100 text-blue-900 border-blue-300'
            }`}>
              {isPast ? t('admin_settings_staff_past_badge') : t('admin_settings_staff_current_badge')}
            </span>
            {(row.service_start_year || row.service_end_year) && (
              <div className="text-[11px] font-semibold text-gray-600">
                {t('admin_settings_staff_service')
                  .replace('{start}', String(row.service_start_year || '?'))
                  .replace(
                    '{end}',
                    String(row.service_end_year || (isPast ? t('admin_settings_staff_service_retired') : t('admin_settings_staff_service_present')))
                  )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: t('admin_settings_col_department'),
      accessor: (row: any) => (
        <div className="text-xs font-semibold text-[#111111]">
          {row.department || t('admin_settings_staff_department_default')}
        </div>
      )
    },
    {
      header: t('admin_settings_col_status'),
      accessor: (row: any) => (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          row.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
        }`}>
          {row.status === 'ACTIVE' ? t('admin_settings_staff_status_active') : t('admin_settings_staff_status_inactive')}
        </span>
      )
    },
    {
      header: t('admin_settings_col_action'),
      accessor: (row: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleStaffType(row)}
            className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
            title={(row.staff_type === 'PAST' || row.is_former) ? t('admin_settings_staff_action_move_to_current') : t('admin_settings_staff_action_move_to_past')}
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditStaffModal(row)}
            className="p-1.5 text-gray-600 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title={t('admin_settings_staff_action_edit')}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteStaff(row.id, row.full_name)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title={t('admin_settings_staff_action_delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111111]">{t('admin_settings_page_title')}</h2>
          <p className="text-xs text-[#6B7280]">{t('admin_settings_page_subtitle')}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 border-b border-[#E5E7EB] bg-white p-2 rounded-2xl border shadow-xs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer w-full sm:w-auto ${
            activeTab === 'profile'
              ? 'bg-[#F4C542] text-[#111111] shadow-xs'
              : 'text-[#6B7280] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <School className="w-4 h-4" />
          <span>{t('admin_settings_tab_profile')}</span>
        </button>

        <button
          onClick={() => setActiveTab('controls')}
          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer w-full sm:w-auto ${
            activeTab === 'controls'
              ? 'bg-[#F4C542] text-[#111111] shadow-xs'
              : 'text-[#6B7280] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{t('admin_settings_tab_controls')}</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer w-full sm:w-auto ${
            activeTab === 'staff'
              ? 'bg-[#F4C542] text-[#111111] shadow-xs'
              : 'text-[#6B7280] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('admin_settings_tab_staff')}</span>
        </button>
      </div>

      {/* TAB 1: SCHOOL PROFILE & BRANDING */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#E5E7EB] pb-4">
            <h3 className="text-lg font-bold text-[#111111]">{t('admin_settings_section_inst_profile')}</h3>
            <p className="text-xs text-[#6B7280]">{t('admin_settings_section_inst_profile_sub')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label={t('admin_settings_form_name_label')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label={t('admin_settings_form_code_label')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Input
              label={t('admin_settings_form_type_label')}
              placeholder={t('admin_settings_form_type_placeholder')}
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value)}
            />
            <Input
              label={t('admin_settings_form_established_label')}
              type="number"
              value={establishedYear}
              onChange={(e) => setEstablishedYear(e.target.value ? Number(e.target.value) : '')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">{t('admin_settings_form_motto_label')}</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542]"
              placeholder={t('admin_settings_form_motto_placeholder')}
            />
          </div>

          <div className="border-b border-[#E5E7EB] pt-4 pb-4">
            <h3 className="text-lg font-bold text-[#111111]">{t('admin_settings_section_branding')}</h3>
            <p className="text-xs text-[#6B7280]">{t('admin_settings_section_branding_sub')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* School Logo Upload & URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#111111]">{t('admin_settings_form_logo_label')}</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  id="logo-upload-input"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload-input"
                  className={`px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#111111] font-semibold text-xs rounded-xl border border-gray-300 transition-colors flex items-center space-x-1.5 cursor-pointer ${
                    uploadingLogo ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? t('admin_settings_form_logo_uploading') : t('admin_settings_form_logo_choose')}</span>
                </label>
                <span className="text-xs text-gray-400">{t('admin_settings_form_logo_or_url')}</span>
              </div>
              <Input
                placeholder={t('admin_settings_form_logo_url_placeholder')}
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>

            {/* Cover Banner Upload & URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#111111]">{t('admin_settings_form_cover_label')}</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  id="cover-upload-input"
                  accept="image/*"
                  onChange={handleCoverFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="cover-upload-input"
                  className={`px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#111111] font-semibold text-xs rounded-xl border border-gray-300 transition-colors flex items-center space-x-1.5 cursor-pointer ${
                    uploadingCover ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingCover ? t('admin_settings_form_logo_uploading') : t('admin_settings_form_cover_choose')}</span>
                </label>
                <span className="text-xs text-gray-400">{t('admin_settings_form_cover_or_url')}</span>
              </div>
              <Input
                placeholder={t('admin_settings_form_cover_url_placeholder')}
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
            </div>

            <Input
              label={t('admin_settings_form_portal_name_label')}
              placeholder={t('admin_settings_form_portal_name_placeholder')}
              value={portalName}
              onChange={(e) => setPortalName(e.target.value)}
            />
            <Input
              label={t('admin_settings_form_tagline_label')}
              placeholder={t('admin_settings_form_tagline_placeholder')}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          {/* Image Previews */}
          {(logoUrl || coverUrl) && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-wrap gap-6 items-center">
              {logoUrl && (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-gray-500">{t('admin_settings_preview_logo')}</span>
                  <img src={logoUrl} alt="Logo preview" className="w-12 h-12 rounded-xl object-contain border bg-white p-1" />
                </div>
              )}
              {coverUrl && (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-gray-500">{t('admin_settings_preview_cover')}</span>
                  <img src={coverUrl} alt="Cover preview" className="w-36 h-12 rounded-xl object-cover border" />
                </div>
              )}
            </div>
          )}

          <div className="border-b border-[#E5E7EB] pt-4 pb-4">
            <h3 className="text-lg font-bold text-[#111111]">{t('admin_settings_section_contact')}</h3>
            <p className="text-xs text-[#6B7280]">{t('admin_settings_section_contact_sub')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label={t('admin_settings_form_email_label')}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Input
              label={t('admin_settings_form_phone_label')}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
            <Input
              label={t('admin_settings_form_website_label')}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <Input
            label={t('admin_settings_form_address_label')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input label={t('admin_settings_form_city_label')} value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label={t('admin_settings_form_district_label')} value={district} onChange={(e) => setDistrict(e.target.value)} />
            <Input label={t('admin_settings_form_state_label')} value={state} onChange={(e) => setState(e.target.value)} />
            <Input label={t('admin_settings_form_pincode_label')} value={pinCode} onChange={(e) => setPinCode(e.target.value)} />
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
            <Button type="submit" isLoading={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              {t('admin_settings_btn_save_profile')}
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: PORTAL CONTROLS & FEATURE TOGGLES */}
      {activeTab === 'controls' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#E5E7EB] pb-4">
            <h3 className="text-lg font-bold text-[#111111]">{t('admin_settings_section_controls')}</h3>
            <p className="text-xs text-[#6B7280]">{t('admin_settings_section_controls_sub')}</p>
          </div>

          <div className="space-y-4">
            {/* Switch 1: Alumni Registration */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[#111111]">{t('admin_settings_toggle_reg_title')}</div>
                <div className="text-xs text-[#6B7280]">{t('admin_settings_toggle_reg_sub')}</div>
              </div>
              <button
                type="button"
                onClick={() => setAlumniReg(!alumniReg)}
                className="cursor-pointer"
              >
                {alumniReg ? (
                  <ToggleRight className="w-10 h-10 text-[#F4C542]" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>

            {/* Switch 2: Manual Approval */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[#111111]">{t('admin_settings_toggle_approval_title')}</div>
                <div className="text-xs text-[#6B7280]">{t('admin_settings_toggle_approval_sub')}</div>
              </div>
              <button
                type="button"
                onClick={() => setManualApproval(!manualApproval)}
                className="cursor-pointer"
              >
                {manualApproval ? (
                  <ToggleRight className="w-10 h-10 text-[#F4C542]" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>

            {/* Switch 3: Public Directory */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[#111111]">{t('admin_settings_toggle_directory_title')}</div>
                <div className="text-xs text-[#6B7280]">{t('admin_settings_toggle_directory_sub')}</div>
              </div>
              <button
                type="button"
                onClick={() => setPublicDirectory(!publicDirectory)}
                className="cursor-pointer"
              >
                {publicDirectory ? (
                  <ToggleRight className="w-10 h-10 text-[#F4C542]" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>

            {/* Switch 4: Event Registration */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[#111111]">{t('admin_settings_toggle_events_title')}</div>
                <div className="text-xs text-[#6B7280]">{t('admin_settings_toggle_events_sub')}</div>
              </div>
              <button
                type="button"
                onClick={() => setEventReg(!eventReg)}
                className="cursor-pointer"
              >
                {eventReg ? (
                  <ToggleRight className="w-10 h-10 text-[#F4C542]" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>

            {/* Switch 5: Announcement Notifications */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[#111111]">{t('admin_settings_toggle_announcements_title')}</div>
                <div className="text-xs text-[#6B7280]">{t('admin_settings_toggle_announcements_sub')}</div>
              </div>
              <button
                type="button"
                onClick={() => setAnnouncementNotif(!announcementNotif)}
                className="cursor-pointer"
              >
                {announcementNotif ? (
                  <ToggleRight className="w-10 h-10 text-[#F4C542]" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
            <Button type="submit" isLoading={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              {t('admin_settings_btn_save_controls')}
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: MANAGEMENT & STAFF HIERARCHY (CURRENT & FORMER STAFF) */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Sub-Filter Bar & Action Header */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-[#854D0E]" />
                  <h3 className="font-bold text-lg text-[#111111]">{t('admin_settings_section_staff')}</h3>
                </div>
                <p className="text-xs text-[#6B7280]">{t('admin_settings_section_staff_sub')}</p>
              </div>

              <div className="flex items-center space-x-3">
                <Button onClick={() => openAddStaffModal('CURRENT')}>
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  {t('admin_settings_btn_add_current')}
                </Button>
                <Button variant="secondary" onClick={() => openAddStaffModal('PAST')}>
                  <Award className="w-4 h-4 mr-1.5 text-amber-700" />
                  {t('admin_settings_btn_add_past')}
                </Button>
              </div>
            </div>

            {/* Sub-Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStaffTypeTab('CURRENT')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  staffTypeTab === 'CURRENT'
                    ? 'bg-[#111111] text-[#F4C542] shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('admin_settings_filter_current').replace(
                  '{count}',
                  String(staffList.filter(s => s.staff_type !== 'PAST' && !s.is_former).length)
                )}
              </button>

              <button
                type="button"
                onClick={() => setStaffTypeTab('PAST')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  staffTypeTab === 'PAST'
                    ? 'bg-[#111111] text-[#F4C542] shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('admin_settings_filter_past').replace(
                  '{count}',
                  String(staffList.filter(s => s.staff_type === 'PAST' || s.is_former).length)
                )}
              </button>

              <button
                type="button"
                onClick={() => setStaffTypeTab('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  staffTypeTab === 'ALL'
                    ? 'bg-[#111111] text-[#F4C542] shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('admin_settings_filter_all').replace('{count}', String(staffList.length))}
              </button>
            </div>

            {/* Hierarchy Tree Cards (Only shown on Current view or All) */}
            {staffTypeTab !== 'PAST' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {SCHOOL_POSITION_OPTIONS.map((pos) => {
                  const assigned = staffList.filter((s) => s.school_position === pos.value && s.staff_type !== 'PAST' && !s.is_former);
                  return (
                    <div key={pos.value} className="p-4 bg-gray-50/70 border border-[#E5E7EB] rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] px-2.5 py-0.5 rounded-full border border-[#F4C542]/60">
                          {t(pos.labelKey)}
                        </span>
                        <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                          {t('admin_settings_staff_appointed').replace('{count}', String(assigned.length))}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#6B7280] line-clamp-2">{t(pos.responsibilityKey)}</p>

                      {assigned.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 space-y-1">
                          {assigned.map((a) => (
                            <div key={a.id} className="text-xs font-bold text-[#111111] flex items-center justify-between">
                              <span className="truncate">{a.full_name}</span>
                              <span className="text-[10px] text-gray-400">{a.staff_id || 'Staff'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Staff Directory Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="font-bold text-lg text-[#111111]">
                {staffTypeTab === 'PAST' 
                  ? t('admin_settings_staff_directory_past')
                  : staffTypeTab === 'CURRENT' 
                    ? t('admin_settings_staff_directory_current')
                    : t('admin_settings_staff_directory_all')}
              </h3>
            </div>

            <Table 
              columns={staffColumns} 
              data={
                staffTypeTab === 'CURRENT'
                  ? staffList.filter(s => s.staff_type !== 'PAST' && !s.is_former)
                  : staffTypeTab === 'PAST'
                    ? staffList.filter(s => s.staff_type === 'PAST' || s.is_former)
                    : staffList
              } 
              keyExtractor={(item) => item.id} 
              defaultPageSize={10} 
            />
          </div>
        </div>
      )}

      {/* Add / Edit School Person Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title={
          editingStaffId
            ? t('admin_settings_staff_modal_edit_title')
            : (staffTypeSelect === 'PAST' ? t('admin_settings_staff_modal_add_past_title') : t('admin_settings_staff_modal_add_current_title'))
        }
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div className="p-3.5 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs text-[#854D0E] space-y-1">
            <div className="font-bold uppercase tracking-wider">
              {staffTypeSelect === 'PAST' ? t('admin_settings_staff_modal_info_past_title') : t('admin_settings_staff_modal_info_current_title')}
            </div>
            <div>
              {staffTypeSelect === 'PAST' 
                ? t('admin_settings_staff_modal_info_past_body')
                : t('admin_settings_staff_modal_info_current_body')}
            </div>
          </div>

          {/* Staff Record Type Radio Selection */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-around">
            <label className="flex items-center space-x-2 text-xs font-bold text-[#111111] cursor-pointer">
              <input
                type="radio"
                name="staff_type_select"
                value="CURRENT"
                checked={staffTypeSelect === 'CURRENT'}
                onChange={() => setStaffTypeSelect('CURRENT')}
                className="text-[#F4C542] focus:ring-[#F4C542]"
              />
              <span>{t('admin_settings_staff_radio_current')}</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-bold text-[#111111] cursor-pointer">
              <input
                type="radio"
                name="staff_type_select"
                value="PAST"
                checked={staffTypeSelect === 'PAST'}
                onChange={() => setStaffTypeSelect('PAST')}
                className="text-[#F4C542] focus:ring-[#F4C542]"
              />
              <span>{t('admin_settings_staff_radio_past')}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin_settings_form_staff_name_en_label')}
              placeholder={t('admin_settings_form_staff_name_en_placeholder')}
              value={staffFullName}
              onChange={(e) => setStaffFullName(e.target.value)}
              required
            />

            <Input
              label={t('admin_settings_form_staff_name_ta_label')}
              placeholder={t('admin_settings_form_staff_name_ta_placeholder')}
              value={staffFullNameTa}
              onChange={(e) => setStaffFullNameTa(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">
                {t('admin_settings_form_staff_position_label')}
              </label>
              <select
                value={staffPositionSelect}
                onChange={(e) => setStaffPositionSelect(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] font-semibold"
                required
              >
                {SCHOOL_POSITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={t('admin_settings_form_staff_position_ta_label')}
              placeholder={t('admin_settings_form_staff_position_ta_placeholder')}
              value={staffPositionTa}
              onChange={(e) => setStaffPositionTa(e.target.value)}
            />
          </div>

          {/* Write-in Custom Position text box if Other is selected */}
          {staffPositionSelect === 'Other' && (
            <div>
              <Input
                label={t('admin_settings_form_staff_custom_position_label')}
                placeholder={t('admin_settings_form_staff_custom_position_placeholder')}
                value={customPositionTitle}
                onChange={(e) => setCustomPositionTitle(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin_settings_form_staff_start_year_label')}
              type="number"
              placeholder={t('admin_settings_form_staff_start_year_placeholder')}
              value={staffServiceStartYear}
              onChange={(e) => setStaffServiceStartYear(e.target.value ? Number(e.target.value) : '')}
            />

            <Input
              label={staffTypeSelect === 'PAST' ? t('admin_settings_form_staff_end_year_past_label') : t('admin_settings_form_staff_end_year_label')}
              type="number"
              placeholder={t('admin_settings_form_staff_end_year_placeholder')}
              value={staffServiceEndYear}
              onChange={(e) => setStaffServiceEndYear(e.target.value ? Number(e.target.value) : '')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin_settings_form_staff_department_en_label')}
              placeholder={t('admin_settings_form_staff_department_en_placeholder')}
              value={staffDepartment}
              onChange={(e) => setStaffDepartment(e.target.value)}
            />
            <Input
              label={t('admin_settings_form_staff_department_ta_label')}
              placeholder={t('admin_settings_form_staff_department_ta_placeholder')}
              value={staffDepartmentTa}
              onChange={(e) => setStaffDepartmentTa(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin_settings_form_staff_email_label')}
              type="email"
              placeholder={t('admin_settings_form_staff_email_placeholder')}
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
            />

            <Input
              label={t('admin_settings_form_staff_mobile_label')}
              placeholder={t('admin_settings_form_staff_mobile_placeholder')}
              value={staffMobile}
              onChange={(e) => setStaffMobile(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin_settings_form_staff_employee_id_label')}
              placeholder={t('admin_settings_form_staff_employee_id_placeholder')}
              value={staffEmployeeId}
              onChange={(e) => setStaffEmployeeId(e.target.value)}
            />
            
            {/* Staff Profile Photo File Upload & URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#111111]">{t('admin_settings_form_staff_photo_label')}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="staff-photo-upload-input"
                  accept="image/*"
                  onChange={handleStaffPhotoFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="staff-photo-upload-input"
                  className={`px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#111111] font-semibold text-xs rounded-xl border border-gray-300 transition-colors flex items-center space-x-1 cursor-pointer ${
                    uploadingStaffPhoto ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingStaffPhoto ? t('admin_settings_form_staff_photo_uploading') : t('admin_settings_form_staff_photo_upload_btn')}</span>
                </label>
                <Input
                  placeholder={t('admin_settings_form_staff_photo_placeholder')}
                  value={staffPhotoUrl}
                  onChange={(e) => setStaffPhotoUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin_settings_form_staff_achievements_en_label')}
              placeholder={t('admin_settings_form_staff_achievements_en_placeholder')}
              value={staffAchievements}
              onChange={(e) => setStaffAchievements(e.target.value)}
            />
            <Input
              label={t('admin_settings_form_staff_achievements_ta_label')}
              placeholder={t('admin_settings_form_staff_achievements_ta_placeholder')}
              value={staffAchievementsTa}
              onChange={(e) => setStaffAchievementsTa(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">{t('admin_settings_form_staff_status_label')}</label>
              <select
                value={staffStatus}
                onChange={(e) => setStaffStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] font-semibold"
              >
                <option value="ACTIVE">{t('admin_settings_form_staff_status_active')}</option>
                <option value="INACTIVE">{t('admin_settings_form_staff_status_inactive')}</option>
              </select>
            </div>

            <Input
              label={t('admin_settings_form_staff_notes_en_label')}
              placeholder={t('admin_settings_form_staff_notes_en_placeholder')}
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
            />
            <Input
              label={t('admin_settings_form_staff_notes_ta_label')}
              placeholder={t('admin_settings_form_staff_notes_ta_placeholder')}
              value={staffNotesTa}
              onChange={(e) => setStaffNotesTa(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsStaffModalOpen(false)}>
              {t('admin_settings_staff_modal_cancel')}
            </Button>
            <Button type="submit" isLoading={savingStaff}>
              {editingStaffId
                ? t('admin_settings_staff_modal_save_changes')
                : (staffTypeSelect === 'PAST' ? t('admin_settings_staff_modal_add_past_submit') : t('admin_settings_staff_modal_add_current_submit'))}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};