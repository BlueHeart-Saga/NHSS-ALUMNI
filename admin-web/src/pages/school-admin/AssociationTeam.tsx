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
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { AssociationTeamMember, AlumniProfile } from '../../types';

const COMMON_POSITIONS = [
  'President',
  'Vice President',
  'Secretary',
  'Joint Secretary',
  'Treasurer',
  'Executive Committee Member',
  'Other'
];

const POSITION_TA_HINTS: Record<string, string> = {
  'President': 'President (தலைவர்)',
  'Vice President': 'Vice President (துணைத் தலைவர்)',
  'Secretary': 'Secretary (செயலாளர்)',
  'Joint Secretary': 'Joint Secretary (இணைச் செயலாளர்)',
  'Treasurer': 'Treasurer (பொருளாளர்)',
  'Executive Committee Member': 'Executive Committee Member (செயற்குழு உறுப்பினர்)',
  'Other': 'Other (உறுப்பினர் பொறுப்பு)'
};

const getPositionDisplayWithTa = (position: string) => {
  if (!position) return '';
  const lower = position.toLowerCase();
  if (lower.includes('president') || lower.includes('thalaivar')) return `${position} (தலைவர்)`;
  if (lower.includes('vice president')) return `${position} (துணைத் தலைவர்)`;
  if (lower.includes('secretary') || lower.includes('seyalalar')) return `${position} (செயலாளர்)`;
  if (lower.includes('joint secretary')) return `${position} (இணைச் செயலாளர்)`;
  if (lower.includes('treasurer') || lower.includes('porulalar')) return `${position} (பொருளாளர்)`;
  if (lower.includes('committee') || lower.includes('member')) return `${position} (செயற்குழு)`;
  return position;
};

export const AssociationTeam: React.FC = () => {
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
  const [photoUrl, setPhotoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [batchYear, setBatchYear] = useState<number | ''>('');
  const [positionSelect, setPositionSelect] = useState('President');
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
      alertService.showSuccess('Photo Uploaded', 'Profile photo uploaded successfully.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Photo upload failed.');
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
    setPhotoUrl('');
    setEmail('');
    setMobile('');
    setLocation('');
    setOccupation('');
    setBatchYear('');
    setPositionSelect('President');
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
    setPhotoUrl(member.photo_url || '');
    setEmail(member.email || '');
    setMobile(member.mobile || '');
    setLocation(member.location || '');
    setOccupation(member.occupation || '');
    setBatchYear(member.batch_year || '');

    if (COMMON_POSITIONS.includes(member.position)) {
      setPositionSelect(member.position);
      setCustomPosition('');
    } else {
      setPositionSelect('Other');
      setCustomPosition(member.position);
    }

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
      alertService.showWarning('Required Field', 'Please provide member full name.');
      return;
    }

    const finalPosition = positionSelect === 'Other' ? (customPosition.trim() || 'Committee Member') : positionSelect;

    setSaving(true);
    try {
      const payload: Partial<AssociationTeamMember> = {
        profile_type: creationMode,
        alumni_id: selectedAlumnus ? selectedAlumnus.id : undefined,
        full_name: fullName,
        photo_url: photoUrl,
        email,
        mobile,
        location,
        occupation,
        batch_year: batchYear ? Number(batchYear) : undefined,
        position: finalPosition,
        responsibility,
        term_start: termStart,
        term_end: termEnd,
        display_order: Number(displayOrder) || 1,
        bio,
        status
      };

      if (editingMemberId) {
        await api.updateAssociationTeamMember(editingMemberId, payload);
        alertService.showSuccess('Profile Updated', `${fullName} association profile updated.`);
      } else {
        await api.createAssociationTeamMember(payload);
        alertService.showSuccess('Team Member Added', `${fullName} added as ${finalPosition}.`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to save association team profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the Alumni Association Team?`)) return;
    try {
      await api.deleteAssociationTeamMember(id);
      alertService.showSuccess('Removed', `${name} removed from association team.`);
      loadData();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to remove team member.');
    }
  };

  const handleToggleStatus = async (member: AssociationTeamMember) => {
    const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.updateAssociationTeamMember(member.id, { status: newStatus });
      alertService.showSuccess('Status Updated', `${member.full_name} status set to ${newStatus}.`);
      loadData();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to update status.');
    }
  };

  if (loading) return <LoadingState />;

  const tableColumns = [
    {
      header: 'Team Leader / Member',
      accessor: (row: AssociationTeamMember) => (
        <div className="flex items-center space-x-3">
          <img 
            src={row.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name)}&background=FFF7D6&color=854D0E`} 
            alt="" 
            className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]" 
          />
          <div>
            <div className="font-bold text-[#111111] flex items-center space-x-1.5">
              <span>{row.full_name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                row.profile_type === 'alumni' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {row.profile_type === 'alumni' ? `Alumni ' ${row.batch_year || ''}` : 'Common Profile'}
              </span>
            </div>
            {row.occupation && <div className="text-xs text-[#6B7280]">{row.occupation}</div>}
          </div>
        </div>
      )
    },
    {
      header: 'Association Position',
      accessor: (row: AssociationTeamMember) => (
        <div>
          <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/60 px-3 py-1 rounded-full inline-block">
            {getPositionDisplayWithTa(row.position)}
          </span>
          {row.responsibility && <div className="text-xs text-[#6B7280] mt-1">{row.responsibility}</div>}
        </div>
      )
    },
    {
      header: 'Term Period',
      accessor: (row: AssociationTeamMember) => (
        <div className="text-xs font-semibold text-[#111111]">
          {row.term_start || '2024'} - {row.term_end || '2026'}
        </div>
      )
    },
    {
      header: 'Contact & Location',
      accessor: (row: AssociationTeamMember) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-[#111111]">{row.mobile || row.email || 'N/A'}</div>
          <div className="text-[#6B7280]">{row.location || 'Thoothukudi'}</div>
        </div>
      )
    },
    {
      header: 'Order',
      accessor: (row: AssociationTeamMember) => (
        <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
          #{row.display_order}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row: AssociationTeamMember) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
            row.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {row.status}
        </button>
      )
    },
    {
      header: 'Action',
      accessor: (row: AssociationTeamMember) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-gray-600 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Profile"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteMember(row.id, row.full_name)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Team Member"
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
            <h2 className="text-2xl font-bold text-[#111111]">Alumni Association Team</h2>
          </div>
          <p className="text-xs text-[#6B7280]">
            Manage Sangam central leadership committee &amp; common profiles (Independent of student records)
          </p>
        </div>

        <Button onClick={openAddModal} className="w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-1.5" />
          + Add Team Member
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
            <div className="text-xs text-[#6B7280]">Total Team Profiles</div>
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
            <div className="text-xs text-[#6B7280]">Active Leaders</div>
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
            <div className="text-xs text-[#6B7280]">Linked Alumni Leaders</div>
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
            <div className="text-xs text-[#6B7280]">Common Profiles</div>
          </div>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-4 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <h3 className="font-bold text-lg text-[#111111]">Association Leadership Directory ({filteredTeam.length})</h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search team member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
            />
          </div>
        </div>

        <Table columns={tableColumns} data={filteredTeam} keyExtractor={(item) => item.id} defaultPageSize={10} />
      </div>

      {/* ADD / EDIT TEAM MEMBER MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMemberId ? "Edit Association Team Member" : "Add Association Team Member"}>
        <form onSubmit={handleSaveMember} className="space-y-5">
          {/* Creation Mode Radio Selection (Only if adding new) */}
          {!editingMemberId && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#111111]">How do you want to add this team member?</label>
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
                    <div className="font-bold text-xs text-[#111111]">Select from Alumni</div>
                    <div className="text-[11px] text-[#6B7280]">Search alumni DB &amp; pre-fill info</div>
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
                    <div className="font-bold text-xs text-[#111111]">Create Common Profile</div>
                    <div className="text-[11px] text-[#6B7280]">Add independent leadership profile</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Option 1: Alumni Search Selector */}
          {!editingMemberId && creationMode === 'alumni' && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-[#111111]">Search Alumni Database</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type Name, Mobile, Email, or Admission ID..."
                  value={alumniSearchTerm}
                  onChange={(e) => setAlumniSearchTerm(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              {selectedAlumnus && (
                <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#854D0E]">Selected: {selectedAlumnus.full_name}</span>
                    <span className="text-[#6B7280] ml-2">(Class of {selectedAlumnus.passing_year})</span>
                  </div>
                  <span className="text-emerald-700 font-bold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Data Prefilled
                  </span>
                </div>
              )}

              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white">
                {filteredAlumni.length === 0 ? (
                  <div className="p-3 text-center text-xs text-gray-400">No matching alumni found</div>
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
                          <div className="text-[10px] text-gray-500">Batch {a.passing_year} • {a.current_city || 'Thoothukudi'}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectAlumnus(a)}
                        className="px-3 py-1 bg-[#F4C542] hover:bg-[#e0b236] text-[#111111] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Select
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Personal Details */}
          <div className="border-t border-gray-200 pt-3 space-y-4">
            <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider text-gray-500">1. Personal &amp; Contact Details</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="e.g. K. Ravi Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Number"
                placeholder="+91 98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <Input
                label="Current Location / City"
                placeholder="e.g. Thoothukudi / Chennai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Occupation / Profession"
                placeholder="e.g. Software Architect / Entrepreneur"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
              <Input
                label="Batch Year (If Alumni)"
                type="number"
                placeholder="e.g. 2002"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value ? Number(e.target.value) : '')}
              />
            </div>

            {/* Profile Photo Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#111111]">Profile Photo</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  id="assoc-photo-upload"
                  accept="image/*"
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="assoc-photo-upload"
                  className={`px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#111111] font-semibold text-xs rounded-xl border border-gray-300 transition-colors flex items-center space-x-1 cursor-pointer ${
                    uploadingPhoto ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                </label>
                <Input
                  placeholder="https://example.com/photo.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Association Position & Term Details */}
          <div className="border-t border-gray-200 pt-3 space-y-4">
            <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider text-gray-500">2. Association Position &amp; Term</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  Association Position *
                </label>
                <select
                  value={positionSelect}
                  onChange={(e) => setPositionSelect(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] font-semibold"
                  required
                >
                  {COMMON_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {POSITION_TA_HINTS[pos] || pos}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Responsibility / Role Overview"
                placeholder="e.g. Managing Executive Meetings & Events"
                value={responsibility}
                onChange={(e) => setResponsibility(e.target.value)}
              />
            </div>

            {positionSelect === 'Other' && (
              <Input
                label="Specify Custom Position *"
                placeholder="e.g. Academic Committee Head"
                value={customPosition}
                onChange={(e) => setCustomPosition(e.target.value)}
                required
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Term Start Year"
                placeholder="2024"
                value={termStart}
                onChange={(e) => setTermStart(e.target.value)}
              />
              <Input
                label="Term End Year"
                placeholder="2026"
                value={termEnd}
                onChange={(e) => setTermEnd(e.target.value)}
              />
              <Input
                label="Display Order #"
                type="number"
                placeholder="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] font-semibold"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <Input
                label="Profile Description / Bio"
                placeholder="Brief leadership overview..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingMemberId ? 'Save Changes' : 'Add Team Member'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
