import React, { useEffect, useState } from 'react';
import { 
  Save, School, Shield, Users, UserPlus, Image as ImageIcon, Upload, 
  ToggleLeft, ToggleRight, Trash2, Edit, CheckCircle2, ChevronRight, Crown, Briefcase 
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { SchoolProfile, SchoolStaffMember, SchoolPositionType } from '../../types';

const STANDARD_POSITIONS = [
  'Principal',
  'Vice Principal',
  'Headmaster',
  'Headmistress',
  'Assistant Headmaster',
  'Assistant Headmistress',
  'Department Head',
  'Senior Teacher',
  'Teacher',
  'Administrative Staff'
];

const SCHOOL_POSITION_OPTIONS: { label: string; value: string; responsibility: string }[] = [
  { label: 'Principal', value: 'Principal', responsibility: 'Highest school authority; full school portal management' },
  { label: 'Vice Principal', value: 'Vice Principal', responsibility: 'Supports Principal and manages assigned school operations' },
  { label: 'Headmaster', value: 'Headmaster', responsibility: 'School administration and academic management' },
  { label: 'Headmistress', value: 'Headmistress', responsibility: 'School administration and academic management' },
  { label: 'Assistant Headmaster', value: 'Assistant Headmaster', responsibility: 'Supports Headmaster and manages delegated responsibilities' },
  { label: 'Assistant Headmistress', value: 'Assistant Headmistress', responsibility: 'Supports Headmaster and manages delegated responsibilities' },
  { label: 'Department Head', value: 'Department Head', responsibility: 'Manages department/class-related activities' },
  { label: 'Senior Teacher', value: 'Senior Teacher', responsibility: 'Manages department/class-related activities' },
  { label: 'Teacher', value: 'Teacher', responsibility: 'Student/alumni-related activities assigned by management' },
  { label: 'Administrative Staff', value: 'Administrative Staff', responsibility: 'Office and administrative operations' },
  { label: 'Other (Write Custom Position)', value: 'Other', responsibility: 'Custom school position or designation' },
];

export const SchoolSettings: React.FC = () => {
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

  // Staff Modal States
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffFullName, setStaffFullName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffMobile, setStaffMobile] = useState('');
  const [staffPositionSelect, setStaffPositionSelect] = useState<string>('Principal');
  const [customPositionTitle, setCustomPositionTitle] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('');
  const [staffDesignation, setStaffDesignation] = useState('');
  const [staffEmployeeId, setStaffEmployeeId] = useState('');
  const [staffPhotoUrl, setStaffPhotoUrl] = useState('');
  const [staffStatus, setStaffStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [staffNotes, setStaffNotes] = useState('');
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

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await api.uploadSchoolImage(file);
      setLogoUrl(res.url);
      alertService.showSuccess('Logo Uploaded', 'School logo image uploaded successfully.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Logo upload failed.');
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
      alertService.showSuccess('Cover Banner Uploaded', 'School banner image uploaded successfully.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Banner upload failed.');
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
      alertService.showSuccess('Photo Uploaded', 'Staff profile photo uploaded successfully.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Staff photo upload failed.');
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
      alertService.showSuccess('School Profile Updated', 'School profile, branding, and contact details saved successfully.');
      loadAllData();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to update school profile.');
    } finally {
      setSaving(false);
    }
  };

  const openAddStaffModal = () => {
    setEditingStaffId(null);
    setStaffFullName('');
    setStaffEmail('');
    setStaffMobile('');
    setStaffPositionSelect('Principal');
    setCustomPositionTitle('');
    setStaffDepartment('');
    setStaffDesignation('');
    setStaffEmployeeId('');
    setStaffPhotoUrl('');
    setStaffStatus('ACTIVE');
    setStaffNotes('');
    setIsStaffModalOpen(true);
  };

  const openEditStaffModal = (s: SchoolStaffMember) => {
    setEditingStaffId(s.id);
    setStaffFullName(s.full_name);
    setStaffEmail(s.email);
    setStaffMobile(s.mobile);

    if (STANDARD_POSITIONS.includes(s.school_position)) {
      setStaffPositionSelect(s.school_position);
      setCustomPositionTitle('');
    } else {
      setStaffPositionSelect('Other');
      setCustomPositionTitle(s.school_position);
    }

    setStaffDepartment(s.department || '');
    setStaffDesignation(s.designation || '');
    setStaffEmployeeId(s.staff_id || '');
    setStaffPhotoUrl(s.profile_photo_url || '');
    setStaffStatus(s.status);
    setStaffNotes(s.notes || '');
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFullName || !staffEmail || !staffMobile) {
      alertService.showWarning('Required Fields', 'Please complete all required fields (*).');
      return;
    }

    const finalPosition = staffPositionSelect === 'Other' 
      ? (customPositionTitle.trim() || 'Custom Position') 
      : staffPositionSelect;

    setSavingStaff(true);
    try {
      const payload: Partial<SchoolStaffMember> = {
        full_name: staffFullName,
        email: staffEmail,
        mobile: staffMobile,
        school_position: finalPosition as SchoolPositionType,
        department: staffDepartment,
        designation: staffDesignation,
        staff_id: staffEmployeeId,
        profile_photo_url: staffPhotoUrl,
        status: staffStatus,
        notes: staffNotes
      };

      if (editingStaffId) {
        await api.updateSchoolStaff(editingStaffId, payload);
        alertService.showSuccess('Staff Updated', `${staffFullName} profile details updated.`);
      } else {
        await api.createSchoolStaff(payload);
        alertService.showSuccess('School Person Added', `${staffFullName} added as ${finalPosition}.`);
      }

      setIsStaffModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to save school staff person.');
    } finally {
      setSavingStaff(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from school management staff?`)) return;
    try {
      await api.deleteSchoolStaff(id);
      alertService.showSuccess('Staff Removed', `${name} removed successfully.`);
      loadAllData();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to remove staff member.');
    }
  };

  if (loading) return <LoadingState />;

  const staffColumns = [
    {
      header: 'School Person / Staff Member',
      accessor: (row: SchoolStaffMember) => (
        <div className="flex items-center space-x-3">
          <img 
            src={row.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name)}&background=FFF7D6&color=854D0E`} 
            alt="" 
            className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]" 
          />
          <div>
            <div className="font-bold text-[#111111]">{row.full_name}</div>
            <div className="text-xs text-[#6B7280]">Staff ID: {row.staff_id || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Designation / Position',
      accessor: (row: SchoolStaffMember) => (
        <div>
          <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/60 px-3 py-1 rounded-full inline-block">
            {row.school_position}
          </span>
          {row.designation && <div className="text-xs text-[#6B7280] mt-1">{row.designation}</div>}
        </div>
      )
    },
    {
      header: 'Department',
      accessor: (row: SchoolStaffMember) => (
        <div className="text-xs font-semibold text-[#111111]">
          {row.department || 'General Administration'}
        </div>
      )
    },
    {
      header: 'Contact Information',
      accessor: (row: SchoolStaffMember) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-[#111111]">{row.email}</div>
          <div className="text-[#6B7280]">{row.mobile}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row: SchoolStaffMember) => (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          row.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: (row: SchoolStaffMember) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditStaffModal(row)}
            className="p-1.5 text-gray-600 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Person Details"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteStaff(row.id, row.full_name)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Staff Person"
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
          <h2 className="text-2xl font-bold text-[#111111]">School Settings &amp; Hierarchy</h2>
          <p className="text-xs text-[#6B7280]">Configure institutional profile, portal controls, and management staff hierarchy</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E5E7EB] space-x-2 sm:space-x-4 bg-white p-2 rounded-2xl border shadow-xs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#F4C542] text-[#111111] shadow-xs'
              : 'text-[#6B7280] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <School className="w-4 h-4" />
          <span>School Profile &amp; Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('controls')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'controls'
              ? 'bg-[#F4C542] text-[#111111] shadow-xs'
              : 'text-[#6B7280] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Portal Controls &amp; Toggles</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-[#F4C542] text-[#111111] shadow-xs'
              : 'text-[#6B7280] hover:text-[#111111] hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Management &amp; Staff Hierarchy</span>
        </button>
      </div>

      {/* TAB 1: SCHOOL PROFILE & BRANDING */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#E5E7EB] pb-4">
            <h3 className="text-lg font-bold text-[#111111]">School Institutional Profile</h3>
            <p className="text-xs text-[#6B7280]">General information and institutional identification</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="School Official Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="School Code *"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Input
              label="School Type"
              placeholder="e.g. Higher Secondary School"
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value)}
            />
            <Input
              label="Established Year"
              type="number"
              value={establishedYear}
              onChange={(e) => setEstablishedYear(e.target.value ? Number(e.target.value) : '')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">School Motto &amp; Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542]"
              placeholder="Institutional overview, history, and motto..."
            />
          </div>

          <div className="border-b border-[#E5E7EB] pt-4 pb-4">
            <h3 className="text-lg font-bold text-[#111111]">Portal Branding &amp; Image Uploads</h3>
            <p className="text-xs text-[#6B7280]">Upload or enter URLs for school logo and cover banner</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* School Logo Upload & URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#111111]">School Logo Image</label>
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
                  <span>{uploadingLogo ? 'Uploading...' : 'Choose Logo File'}</span>
                </label>
                <span className="text-xs text-gray-400">or enter image URL</span>
              </div>
              <Input
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>

            {/* Cover Banner Upload & URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#111111]">Banner Cover Image</label>
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
                  <span>{uploadingCover ? 'Uploading...' : 'Choose Cover Banner File'}</span>
                </label>
                <span className="text-xs text-gray-400">or enter image URL</span>
              </div>
              <Input
                placeholder="https://example.com/cover.jpg"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
            </div>

            <Input
              label="Alumni Portal Name"
              placeholder="NHSS Alumni Portal"
              value={portalName}
              onChange={(e) => setPortalName(e.target.value)}
            />
            <Input
              label="Portal Tagline"
              placeholder="Connected Forever. Progressing Together."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          {/* Image Previews */}
          {(logoUrl || coverUrl) && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-wrap gap-6 items-center">
              {logoUrl && (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-gray-500">Logo Preview:</span>
                  <img src={logoUrl} alt="Logo preview" className="w-12 h-12 rounded-xl object-contain border bg-white p-1" />
                </div>
              )}
              {coverUrl && (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-gray-500">Cover Banner Preview:</span>
                  <img src={coverUrl} alt="Cover preview" className="w-36 h-12 rounded-xl object-cover border" />
                </div>
              )}
            </div>
          )}

          <div className="border-b border-[#E5E7EB] pt-4 pb-4">
            <h3 className="text-lg font-bold text-[#111111]">Official Contact &amp; Location</h3>
            <p className="text-xs text-[#6B7280]">Campus contact details displayed on public directory</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Official Email *"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Input
              label="Contact Phone *"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
            <Input
              label="Official Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <Input
            label="Campus Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
            <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
            <Input label="PIN Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} />
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
            <Button type="submit" isLoading={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              Save Profile Settings
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: PORTAL CONTROLS & FEATURE TOGGLES */}
      {activeTab === 'controls' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#E5E7EB] pb-4">
            <h3 className="text-lg font-bold text-[#111111]">Portal Feature Control Switches</h3>
            <p className="text-xs text-[#6B7280]">Enable or disable portal registration, approvals, directory access, and notifications</p>
          </div>

          <div className="space-y-4">
            {/* Switch 1: Alumni Registration */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[#111111]">Alumni Registration</div>
                <div className="text-xs text-[#6B7280]">Allow new alumni to register on the public portal</div>
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
                <div className="font-bold text-sm text-[#111111]">Manual Admin Verification / Approval</div>
                <div className="text-xs text-[#6B7280]">Require school admin verification before granting full portal access</div>
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
                <div className="font-bold text-sm text-[#111111]">Public Alumni Directory</div>
                <div className="text-xs text-[#6B7280]">Allow verified alumni to browse directory and batch rosters</div>
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
                <div className="font-bold text-sm text-[#111111]">Event RSVP &amp; Ticketing</div>
                <div className="text-xs text-[#6B7280]">Enable event RSVP registrations and QR ticket check-ins</div>
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
                <div className="font-bold text-sm text-[#111111]">Announcement Broadcast Notifications</div>
                <div className="text-xs text-[#6B7280]">Allow school management to send broadcast notices to alumni</div>
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
              Save Portal Switches
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: MANAGEMENT & STAFF HIERARCHY */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Organizational Hierarchy Overview */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-[#854D0E]" />
                  <h3 className="font-bold text-lg text-[#111111]">School Management Hierarchy</h3>
                </div>
                <p className="text-xs text-[#6B7280]">Institutional authority structure and delegated staff roles</p>
              </div>

              <Button onClick={openAddStaffModal}>
                <UserPlus className="w-4 h-4 mr-1.5" />
                Add School Person / Staff
              </Button>
            </div>

            {/* Hierarchy Tree Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SCHOOL_POSITION_OPTIONS.map((pos) => {
                const assigned = staffList.filter((s) => s.school_position === pos.value);
                return (
                  <div key={pos.value} className="p-4 bg-gray-50/70 border border-[#E5E7EB] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] px-2.5 py-0.5 rounded-full border border-[#F4C542]/60">
                        {pos.label}
                      </span>
                      <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                        {assigned.length} Appointed
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6B7280] line-clamp-2">{pos.responsibility}</p>

                    {assigned.length > 0 && (
                      <div className="pt-2 border-t border-gray-200 space-y-1">
                        {assigned.map((a) => (
                          <div key={a.id} className="text-xs font-bold text-[#111111] flex items-center justify-between">
                            <span className="truncate">{a.full_name}</span>
                            <span className="text-[10px] text-gray-400">{a.staff_id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staff Directory Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="font-bold text-lg text-[#111111]">School Staff Persons Directory ({staffList.length})</h3>
            </div>
            <Table columns={staffColumns} data={staffList} keyExtractor={(item) => item.id} defaultPageSize={10} />
          </div>
        </div>
      )}

      {/* Add / Edit School Person Modal */}
      <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title={editingStaffId ? "Edit School Person / Staff" : "Add School Current Person / Staff"}>
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs text-[#854D0E]">
            Add or update active school staff members and assign their designation position in the school management hierarchy.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Dr. S. Ramesh"
              value={staffFullName}
              onChange={(e) => setStaffFullName(e.target.value)}
              required
            />
            <Input
              label="Official Email *"
              type="email"
              placeholder="email@school.edu.in"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Number *"
              placeholder="+91 98765 43210"
              value={staffMobile}
              onChange={(e) => setStaffMobile(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">
                Designation / School Position *
              </label>
              <select
                value={staffPositionSelect}
                onChange={(e) => setStaffPositionSelect(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] font-semibold"
                required
              >
                {SCHOOL_POSITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Write-in Custom Position text box if Other is selected */}
          {staffPositionSelect === 'Other' && (
            <div>
              <Input
                label="Custom Designation / Position Title *"
                placeholder="e.g. Academic Coordinator, Examination Controller, Warden, IT Manager"
                value={customPositionTitle}
                onChange={(e) => setCustomPositionTitle(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department"
              placeholder="e.g. Science / Computer Science"
              value={staffDepartment}
              onChange={(e) => setStaffDepartment(e.target.value)}
            />
            <Input
              label="Designation Detail / Title"
              placeholder="e.g. P.G. Assistant Physics"
              value={staffDesignation}
              onChange={(e) => setStaffDesignation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Employee / Staff ID"
              placeholder="NHSS-STAFF-001"
              value={staffEmployeeId}
              onChange={(e) => setStaffEmployeeId(e.target.value)}
            />
            
            {/* Staff Profile Photo File Upload & URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#111111]">Profile Photo</label>
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
                  <span>{uploadingStaffPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                </label>
                <Input
                  placeholder="https://example.com/photo.jpg"
                  value={staffPhotoUrl}
                  onChange={(e) => setStaffPhotoUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">Status</label>
              <select
                value={staffStatus}
                onChange={(e) => setStaffStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] font-semibold"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <Input
              label="Notes / Remarks"
              placeholder="Role responsibilities..."
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={savingStaff}>
              {editingStaffId ? 'Save Changes' : 'Add School Person'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
