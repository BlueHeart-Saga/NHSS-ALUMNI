import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, Building2, UserPlus, Phone, Mail, CheckCircle2, UserCheck, Key,
  RefreshCw, Layers, GraduationCap, Settings, Trash2, Users, Search, Filter,
  FileText, Activity, AlertTriangle, Edit3, XCircle, Plus, Eye, Download, Check,
  Lock, Copy, MapPin, Briefcase, Calendar, ToggleLeft, ToggleRight, KeyRound
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { StatsGridSkeleton, TableSkeleton } from '../../components/EmptyState';
import { api } from '../../services/api';

export const DeveloperPortal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active Tab state synced with URL pathname
  const getTabFromPath = (path: string) => {
    if (path.includes('/schools')) return 'SCHOOLS';
    if (path.includes('/school-admins')) return 'SCHOOL_ADMINS';
    if (path.includes('/users')) return 'USERS';
    if (path.includes('/enquiries')) return 'ENQUIRIES';
    if (path.includes('/audit-logs')) return 'AUDIT_LOGS';
    return 'DASHBOARD';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  // Data States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [schoolAdminsList, setSchoolAdminsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // School Admin Enquiries State
  const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
  const [enquiryMetrics, setEnquiryMetrics] = useState({
    pending: 0,
    contacted: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('ALL');
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [enquirySelectedSchoolId, setEnquirySelectedSchoolId] = useState('');

  // User Directory Filters & Search State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSchoolFilter, setUserSchoolFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // School Admin Filters
  const [adminSchoolFilter, setAdminSchoolFilter] = useState('ALL');

  // Modals & Forms State
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  // School Form State
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolDescription, setSchoolDescription] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolCity, setSchoolCity] = useState('');
  const [schoolState, setSchoolState] = useState('');
  const [schoolCountry, setSchoolCountry] = useState('India');
  const [schoolWebsite, setSchoolWebsite] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolYear, setSchoolYear] = useState<number>(1985);
  const [schoolLogoUrl, setSchoolLogoUrl] = useState('');
  const [schoolCoverUrl, setSchoolCoverUrl] = useState('');
  const [schoolStatus, setSchoolStatus] = useState('ACTIVE');

  // Delete School State
  const [deleteSchoolModalOpen, setDeleteSchoolModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<{ id: string; name: string; code: string } | null>(null);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState('');

  // Provision Admin Form State
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Edit / Delete School Admin State
  const [editAdminModalOpen, setEditAdminModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [deleteAdminModalOpen, setDeleteAdminModalOpen] = useState(false);

  // User Directory Form & Modals State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userFullName, setUserFullName] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRoles, setUserRoles] = useState<string[]>(['ALUMNI']);
  const [userSchoolId, setUserSchoolId] = useState('');
  const [userIsActive, setUserIsActive] = useState(true);
  const [userPassword, setUserPassword] = useState('');
  const [userVerificationStatus, setUserVerificationStatus] = useState('APPROVED');
  const [userProfession, setUserProfession] = useState('');
  const [userCity, setUserCity] = useState('');
  const [userGender, setUserGender] = useState('');
  const [userPassingYear, setUserPassingYear] = useState<string | number>('');

  // View User Details Drawer/Modal State
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [viewUserTab, setViewUserTab] = useState<'OVERVIEW' | 'RAW_JSON'>('OVERVIEW');
  const [jsonCopied, setJsonCopied] = useState(false);

  // Direct Reset Password Modal State
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<any | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [showNewPasswordVal, setShowNewPasswordVal] = useState(false);

  // Single Delete User State
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);

  // User Multi-Select & Bulk Actions State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkDeleteUserModalOpen, setBulkDeleteUserModalOpen] = useState(false);
  const [bulkAssignSchoolModalOpen, setBulkAssignSchoolModalOpen] = useState(false);
  const [bulkTargetSchoolId, setBulkTargetSchoolId] = useState('');

  // Global Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAllDeveloperData();
  }, [enquiryStatusFilter, userRoleFilter, userSchoolFilter, adminSchoolFilter]);

  const fetchAllDeveloperData = async () => {
    try {
      setLoading(true);
      const [sData, aData, uData, eData, logData] = await Promise.allSettled([
        api.getAllSchools(),
        api.getDeveloperSchoolAdmins(adminSchoolFilter !== 'ALL' ? adminSchoolFilter : undefined),
        api.getDeveloperUsers({
          role: userRoleFilter !== 'ALL' ? userRoleFilter : undefined,
          school_id: userSchoolFilter !== 'ALL' ? userSchoolFilter : undefined,
          search: userSearch || undefined
        }),
        api.getAdminEnquiries(enquiryStatusFilter),
        api.getDeveloperAuditLogs()
      ]);

      if (sData.status === 'fulfilled') {
        setSchoolsList(sData.value);
        if (sData.value.length > 0 && !targetSchoolId) {
          setTargetSchoolId(sData.value[0].id);
        }
      }

      if (aData.status === 'fulfilled') {
        setSchoolAdminsList(aData.value);
      }

      if (uData.status === 'fulfilled') {
        setUsersList(uData.value);
      }

      if (eData.status === 'fulfilled') {
        setEnquiriesList(eData.value.enquiries || []);
        setEnquiryMetrics(eData.value.metrics || { pending: 0, contacted: 0, approved: 0, rejected: 0, total: 0 });
      }

      if (logData.status === 'fulfilled') {
        setAuditLogs(logData.value || []);
      }
    } catch (err) {
      console.error('Failed to fetch developer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: School Entity & Admin Provisioning ---
  const handleSaveSchoolStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload = {
      name: schoolName,
      code: schoolCode,
      description: schoolDescription || undefined,
      address: schoolAddress,
      city: schoolCity,
      state: schoolState,
      country: schoolCountry || 'India',
      website: schoolWebsite || undefined,
      contact_phone: schoolPhone,
      contact_email: schoolEmail,
      established_year: schoolYear,
      logo_url: schoolLogoUrl || undefined,
      cover_url: schoolCoverUrl || undefined,
      status: schoolStatus || 'ACTIVE'
    };

    try {
      if (editingSchoolId) {
        await api.updateSchool(editingSchoolId, payload);
        setSuccessMessage(`School entity "${schoolName}" updated successfully.`);
        setSchoolModalOpen(false);
        fetchAllDeveloperData();
      } else {
        const createdSchool = await api.createNewSchool(payload);
        setSuccessMessage(`School entity "${createdSchool.name}" created! Next, provision a School Admin.`);
        setTargetSchoolId(createdSchool.id);
        setWizardStep(2);
        fetchAllDeveloperData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save school entity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProvisionAdminStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSchoolId) {
      setErrorMessage('Please select a target school entity.');
      return;
    }
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.provisionAdminForSchool(targetSchoolId, {
        full_name: adminFullName,
        mobile: adminMobile,
        email: adminEmail || undefined
      });
      setSuccessMessage(`School Admin "${adminFullName}" provisioned successfully! Invitation email dispatched.`);
      setSchoolModalOpen(false);
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to provision school administrator.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditSchoolModal = (school: any) => {
    setEditingSchoolId(school.id);
    setSchoolName(school.name);
    setSchoolCode(school.code);
    setSchoolDescription(school.description || '');
    setSchoolAddress(school.address || '');
    setSchoolCity(school.city || '');
    setSchoolState(school.state || '');
    setSchoolCountry(school.country || 'India');
    setSchoolWebsite(school.website || '');
    setSchoolPhone(school.contact_phone || '');
    setSchoolEmail(school.contact_email || '');
    setSchoolYear(school.established_year || 1985);
    setSchoolLogoUrl(school.logo_url || '');
    setSchoolCoverUrl(school.cover_url || '');
    setSchoolStatus(school.status || 'ACTIVE');
    setWizardStep(1);
    setSchoolModalOpen(true);
  };

  const handleDeleteSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolToDelete) return;
    if (deleteConfirmCode !== schoolToDelete.code) {
      setErrorMessage(`Please type "${schoolToDelete.code}" to confirm deletion.`);
      return;
    }

    setSubmitting(true);
    try {
      await api.deleteSchool(schoolToDelete.id);
      setSuccessMessage(`School "${schoolToDelete.name}" and all associated data deleted permanently.`);
      setDeleteSchoolModalOpen(false);
      setSchoolToDelete(null);
      setDeleteConfirmCode('');
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete school entity.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: School Admin Management ---
  const openEditAdminModal = (admin: any) => {
    setSelectedAdmin(admin);
    setAdminFullName(admin.full_name || '');
    setAdminMobile(admin.mobile || '');
    setAdminEmail(admin.email || '');
    setTargetSchoolId(admin.school_id || '');
    setUserIsActive(admin.is_active !== false);
    setEditAdminModalOpen(true);
  };

  const handleSaveEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.updateDeveloperSchoolAdmin(selectedAdmin.id, {
        full_name: adminFullName,
        mobile: adminMobile,
        email: adminEmail || undefined,
        school_id: targetSchoolId,
        is_active: userIsActive
      });
      setSuccessMessage(`School Admin "${adminFullName}" profile updated successfully.`);
      setEditAdminModalOpen(false);
      setSelectedAdmin(null);
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update school admin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchoolAdmin = async () => {
    if (!selectedAdmin) return;
    setSubmitting(true);
    try {
      await api.deleteDeveloperSchoolAdmin(selectedAdmin.id);
      setSuccessMessage(`School Admin account "${selectedAdmin.full_name}" revoked.`);
      setDeleteAdminModalOpen(false);
      setSelectedAdmin(null);
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete school admin.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: User Directory CRUD ---
  const openAddUserModal = () => {
    setSelectedUser(null);
    setUserFullName('');
    setUserMobile('');
    setUserEmail('');
    setUserRoles(['ALUMNI']);
    setUserSchoolId(schoolsList.length > 0 ? schoolsList[0].id : '');
    setUserIsActive(true);
    setUserPassword('');
    setUserVerificationStatus('APPROVED');
    setUserProfession('');
    setUserCity('');
    setUserGender('');
    setUserPassingYear('');
    setUserModalOpen(true);
  };

  const openEditUserModal = (user: any) => {
    setSelectedUser(user);
    setUserFullName(user.full_name || '');
    setUserMobile(user.mobile || '');
    setUserEmail(user.email || '');
    setUserRoles(user.roles || ['ALUMNI']);
    setUserSchoolId(user.school_id || '');
    setUserIsActive(user.is_active !== false);
    setUserPassword('');
    setUserVerificationStatus(user.verification_status || 'APPROVED');
    setUserProfession(user.profession || '');
    setUserCity(user.current_city || '');
    setUserGender(user.gender || '');
    setUserPassingYear(user.passing_year || '');
    setUserModalOpen(true);
  };

  const openViewUserModal = (user: any) => {
    setViewingUser(user);
    setViewUserTab('OVERVIEW');
    setJsonCopied(false);
    setViewUserModalOpen(true);
  };

  const openResetPasswordModal = (user: any) => {
    setResetPasswordUser(user);
    setNewPasswordValue('');
    setShowNewPasswordVal(false);
    setResetPasswordModalOpen(true);
  };

  const handleToggleRoleInUserModal = (role: string) => {
    setUserRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: any = {
      full_name: userFullName,
      email: userEmail || undefined,
      mobile: userMobile,
      roles: userRoles.length > 0 ? userRoles : ['ALUMNI'],
      school_id: userSchoolId || undefined,
      is_active: userIsActive,
      verification_status: userVerificationStatus,
      profession: userProfession || undefined,
      current_city: userCity || undefined,
      gender: userGender || undefined,
      passing_year: userPassingYear ? Number(userPassingYear) : undefined,
    };

    if (userPassword && userPassword.trim()) {
      payload.password = userPassword.trim();
    }

    try {
      if (selectedUser) {
        await api.updateDeveloperUser(selectedUser.id, payload);
        setSuccessMessage(`User "${userFullName}" updated successfully.`);
      } else {
        await api.createDeveloperUser(payload);
        setSuccessMessage(`User "${userFullName}" created successfully.`);
      }
      setUserModalOpen(false);
      setSelectedUser(null);
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickToggleUserActive = async (user: any) => {
    setSubmitting(true);
    try {
      const newActive = user.is_active === false ? true : false;
      await api.updateDeveloperUser(user.id, { is_active: newActive });
      setSuccessMessage(`User "${user.full_name}" account is now ${newActive ? 'ACTIVE' : 'INACTIVE'}.`);
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to toggle user account status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newPasswordValue || newPasswordValue.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    setSubmitting(true);
    try {
      await api.resetDeveloperUserPassword(resetPasswordUser.id, newPasswordValue.trim());
      setSuccessMessage(`Password updated successfully for user "${resetPasswordUser.full_name}".`);
      setResetPasswordModalOpen(false);
      setResetPasswordUser(null);
      setNewPasswordValue('');
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset user password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await api.deleteDeveloperUser(selectedUser.id);
      setSuccessMessage(`User account "${selectedUser.full_name}" deleted.`);
      setDeleteUserModalOpen(false);
      setSelectedUser(null);
      setSelectedUserIds((prev) => prev.filter((id) => id !== selectedUser.id));
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete user.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    setSubmitting(true);
    try {
      const res = await api.bulkDeleteDeveloperUsers(selectedUserIds);
      setSuccessMessage(res.message || `Successfully deleted ${selectedUserIds.length} user accounts.`);
      setSelectedUserIds([]);
      setBulkDeleteUserModalOpen(false);
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to bulk delete user accounts.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkToggleActive = async (activeState: boolean) => {
    if (selectedUserIds.length === 0) return;
    setSubmitting(true);
    try {
      const res = await api.bulkUpdateDeveloperUsers(selectedUserIds, { is_active: activeState });
      setSuccessMessage(res.message || `Updated ${selectedUserIds.length} user accounts to ${activeState ? 'ACTIVE' : 'INACTIVE'}.`);
      setSelectedUserIds([]);
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update user statuses.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkAssignSchool = async () => {
    if (selectedUserIds.length === 0) return;
    setSubmitting(true);
    try {
      const res = await api.bulkUpdateDeveloperUsers(selectedUserIds, { school_id: bulkTargetSchoolId || '' });
      setSuccessMessage(res.message || `Assigned school to ${selectedUserIds.length} user accounts.`);
      setSelectedUserIds([]);
      setBulkAssignSchoolModalOpen(false);
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to assign school to selected users.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Filter Logic & CSV Export ---
  const filteredUsers = usersList.filter((u) => {
    if (userRoleFilter !== 'ALL' && !(u.roles || []).includes(userRoleFilter)) {
      return false;
    }
    if (userSchoolFilter !== 'ALL' && u.school_id !== userSchoolFilter) {
      return false;
    }
    if (userStatusFilter === 'ACTIVE' && u.is_active === false) {
      return false;
    }
    if (userStatusFilter === 'INACTIVE' && u.is_active !== false) {
      return false;
    }
    if (userStatusFilter === 'NO_PASSWORD' && u.has_password) {
      return false;
    }
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      const nameMatch = (u.full_name || '').toLowerCase().includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      const mobileMatch = (u.mobile || '').toLowerCase().includes(q);
      const idMatch = (u.id || '').toLowerCase().includes(q);
      const cityMatch = (u.current_city || '').toLowerCase().includes(q);
      const profMatch = (u.profession || '').toLowerCase().includes(q);
      return nameMatch || emailMatch || mobileMatch || idMatch || cityMatch || profMatch;
    }
    return true;
  });

  const exportUsersCSV = () => {
    if (filteredUsers.length === 0) return;
    const headers = ['User ID', 'Full Name', 'Mobile', 'Email', 'Roles', 'School Name', 'School Code', 'Active Status', 'Password Set', 'Verification Status', 'Profession', 'City', 'Created At'];
    const rows = filteredUsers.map((u) => [
      `"${u.id || ''}"`,
      `"${(u.full_name || '').replace(/"/g, '""')}"`,
      `"${u.mobile || ''}"`,
      `"${u.email || ''}"`,
      `"${(u.roles || []).join(', ')}"`,
      `"${(u.school_name || '').replace(/"/g, '""')}"`,
      `"${u.school_code || ''}"`,
      u.is_active !== false ? 'ACTIVE' : 'INACTIVE',
      u.has_password ? 'YES' : 'NO',
      `"${u.verification_status || 'APPROVED'}"`,
      `"${(u.profession || '').replace(/"/g, '""')}"`,
      `"${(u.current_city || '').replace(/"/g, '""')}"`,
      `"${u.created_at || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `user_directory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Handlers: School Admin Enquiries ---
  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      setSubmitting(true);
      await api.updateEnquiryStatus(id, newStatus, enquiryNotes, enquirySelectedSchoolId || undefined);
      setSuccessMessage(`Enquiry request status set to ${newStatus}!`);
      setEnquiryModalOpen(false);
      setSelectedEnquiry(null);
      setEnquirySelectedSchoolId('');
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating enquiry status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <StatsGridSkeleton count={4} />
        <TableSkeleton rows={8} />
      </div>
    );
  }

  const totalAdmins = schoolsList.reduce((acc, s) => acc + (s.admin_count || 0), 0);
  const totalAlumni = schoolsList.reduce((acc, s) => acc + (s.alumni_count || 0), 0);

  // User Stats Aggregation
  const userStats = {
    total: usersList.length,
    active: usersList.filter(u => u.is_active !== false).length,
    admins: usersList.filter(u => (u.roles || []).some((r: string) => ['SUPER_ADMIN', 'DEVELOPER', 'PLATFORM_DEVELOPER'].includes(r))).length,
    schoolAdmins: usersList.filter(u => (u.roles || []).some((r: string) => ['SCHOOL_ADMIN', 'BATCH_COORDINATOR'].includes(r))).length,
    alumni: usersList.filter(u => (u.roles || []).includes('ALUMNI')).length,
    noPassword: usersList.filter(u => !u.has_password).length,
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#111111]">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-[#111111] text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-[#111111]" />
            <span>Developer Portal</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#111111]">Platform Control Center</h2>
          <p className="text-xs text-[#6B7280] mt-1">Multi-tenant school entity management, user directory, and administrator provisioning</p>
        </div>
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <Button
            variant="secondary"
            onClick={() => {
              setWizardStep(1);
              setEditingSchoolId(null);
              setSchoolName('');
              setSchoolCode('');
              setSchoolModalOpen(true);
            }}
            className="border border-[#111111] text-[#111111] font-bold hover:bg-gray-50 text-xs"
          >
            <Building2 className="w-4 h-4 mr-1.5" />
            <span>Create School</span>
          </Button>
          <Button
            onClick={() => {
              setWizardStep(2);
              setAdminFullName('');
              setAdminMobile('');
              setAdminEmail('');
              setSchoolModalOpen(true);
            }}
            className="bg-[#111111] text-white font-bold hover:bg-black text-xs"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            <span>Provision School Admin</span>
          </Button>
          <Button
            onClick={openAddUserModal}
            className="bg-emerald-700 text-white font-bold hover:bg-emerald-800 text-xs"
          >
            <Users className="w-4 h-4 mr-1.5" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 font-bold hover:text-emerald-900 ml-4 cursor-pointer">Dismiss</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 font-bold hover:text-rose-900 ml-4 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Tab Navigation Menu Bar */}
      <div className="flex border-b border-[#E5E7EB] space-x-6 text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => handleTabChange('DASHBOARD', '/developer')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'DASHBOARD' ? 'border-[#111111] text-[#111111] font-bold' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => handleTabChange('SCHOOLS', '/developer/schools')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'SCHOOLS' ? 'border-[#111111] text-[#111111] font-bold' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Schools Roster ({schoolsList.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('SCHOOL_ADMINS', '/developer/school-admins')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'SCHOOL_ADMINS' ? 'border-[#111111] text-[#111111] font-bold' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>School Admins ({schoolAdminsList.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('USERS', '/developer/users')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'USERS' ? 'border-[#111111] text-[#111111] font-bold' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({usersList.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('ENQUIRIES', '/developer/enquiries')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'ENQUIRIES' ? 'border-[#111111] text-[#111111] font-bold' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Shield className="w-4 h-4 text-[#854D0E]" />
          <span>Admin Enquiries</span>
          {enquiryMetrics.pending > 0 && (
            <span className="px-2 py-0.5 bg-[#F4C542] text-[#111111] text-xs font-bold rounded-full">
              {enquiryMetrics.pending}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('AUDIT_LOGS', '/developer/audit-logs')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'AUDIT_LOGS' ? 'border-[#111111] text-[#111111] font-bold' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* 1. DASHBOARD OVERVIEW TAB */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Total Schools</span>
                <div className="p-2.5 bg-gray-100 rounded-xl text-[#111111]">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#111111] mt-2">{schoolsList.length}</div>
              <p className="text-xs text-[#6B7280] mt-1">Multi-tenant registered institutions</p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">School Admins</span>
                <div className="p-2.5 bg-amber-50 rounded-xl text-[#854D0E]">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#854D0E] mt-2">{schoolAdminsList.length || totalAdmins}</div>
              <p className="text-xs text-[#6B7280] mt-1">Provisioned school administrators</p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Total Alumni Members</span>
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#111111] mt-2">{totalAlumni}</div>
              <p className="text-xs text-[#6B7280] mt-1">Registered across all batches</p>
            </div>

            <div className="bg-[#111111] text-white p-5 rounded-2xl shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Total Platform Users</span>
                <div className="p-2.5 bg-gray-800 rounded-xl text-white">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mt-2">{usersList.length}</div>
              <p className="text-xs text-gray-400 mt-1">Global user account directory</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. SCHOOLS ROSTER TAB */}
      {activeTab === 'SCHOOLS' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="font-bold text-[#111111] text-base flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#111111]" />
                <span>Multi-Tenant Schools ({schoolsList.length})</span>
              </h3>
              <Button size="sm" onClick={() => { setWizardStep(1); setEditingSchoolId(null); setSchoolModalOpen(true); }} className="bg-[#111111] text-white font-bold hover:bg-black">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add School</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#111111]">
                <thead className="bg-gray-50 border-b border-[#E5E7EB] text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5">School Name</th>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">City / State</th>
                    <th className="p-3.5">Admins</th>
                    <th className="p-3.5">Alumni</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {schoolsList.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 font-bold flex items-center space-x-3">
                        <img src={school.logo_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&q=80'} alt="" className="w-8 h-8 rounded-lg object-cover border" />
                        <span>{school.name}</span>
                      </td>
                      <td className="p-3.5 font-mono text-gray-600 font-bold">{school.code}</td>
                      <td className="p-3.5 text-gray-600">{school.city}, {school.state}</td>
                      <td className="p-3.5 font-bold">{school.admin_count || 0}</td>
                      <td className="p-3.5 font-bold">{school.alumni_count || 0}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${school.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {school.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button onClick={() => openEditSchoolModal(school)} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-[#111111] font-semibold rounded-md transition-colors">Edit</button>
                        <button onClick={() => { setSchoolToDelete(school); setDeleteSchoolModalOpen(true); }} className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-md border border-rose-200 transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SCHOOL ADMINS TAB */}
      {activeTab === 'SCHOOL_ADMINS' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="font-bold text-[#111111] text-base flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-[#854D0E]" />
                <span>Provisioned School Administrators ({schoolAdminsList.length})</span>
              </h3>
              <Button size="sm" onClick={() => { setWizardStep(2); setSchoolModalOpen(true); }} className="bg-[#111111] text-white font-bold hover:bg-black">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Provision Admin</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#111111]">
                <thead className="bg-gray-50 border-b border-[#E5E7EB] text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5">Administrator Name</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Assigned School</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {schoolAdminsList.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 font-bold">{admin.full_name}</td>
                      <td className="p-3.5 font-mono text-gray-600">{admin.mobile}</td>
                      <td className="p-3.5 text-gray-600">{admin.email || 'N/A'}</td>
                      <td className="p-3.5 text-[#854D0E] font-semibold">{admin.school_name} ({admin.school_code})</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${admin.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {admin.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button onClick={() => openEditAdminModal(admin)} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-[#111111] font-semibold rounded-md transition-colors">Edit</button>
                        <button onClick={() => { setSelectedAdmin(admin); setDeleteAdminModalOpen(true); }} className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-md border border-rose-200 transition-colors">Revoke</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ENHANCED USER DIRECTORY MODULE */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          {/* User Directory Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Users</div>
              <div className="text-2xl font-extrabold text-[#111111] mt-1">{userStats.total}</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-xs">
              <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Active Users</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{userStats.active}</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-xs">
              <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Super & Devs</div>
              <div className="text-2xl font-extrabold text-purple-700 mt-1">{userStats.admins}</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-xs">
              <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">School Admins</div>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">{userStats.schoolAdmins}</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-xs col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Alumni Members</div>
              <div className="text-2xl font-extrabold text-blue-700 mt-1">{userStats.alumni}</div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            {/* User Directory Main Header & Toolbar */}
            <div className="p-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-[#111111] text-base flex items-center space-x-2">
                  <Users className="w-5 h-5 text-[#111111]" />
                  <span>Platform User Directory ({filteredUsers.length} / {usersList.length})</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">Comprehensive developer control center: edit profile, set passwords, toggle status, bulk operations, or export data</p>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name, mobile, email, city..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#111111] w-48 sm:w-56"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#111111]"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="PLATFORM_DEVELOPER">Platform Dev</option>
                  <option value="SCHOOL_ADMIN">School Admin</option>
                  <option value="BATCH_COORDINATOR">Batch Coordinator</option>
                  <option value="ALUMNI">Alumni</option>
                </select>

                <select
                  value={userSchoolFilter}
                  onChange={(e) => setUserSchoolFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#111111] max-w-[140px] truncate"
                >
                  <option value="ALL">All Schools</option>
                  {schoolsList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#111111]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                  <option value="NO_PASSWORD">No Password Set</option>
                </select>

                <button
                  onClick={exportUsersCSV}
                  title="Export Filtered Users to CSV"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-xs font-bold text-[#111111] inline-flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-gray-700" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <Button size="sm" onClick={openAddUserModal} className="bg-emerald-700 text-white font-bold hover:bg-emerald-800">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add User</span>
                </Button>
              </div>
            </div>

            {/* Multi-Select Bulk Action Toolbar */}
            {selectedUserIds.length > 0 && (
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center space-x-2 text-xs text-amber-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''} selected</span>
                </div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                  <button
                    onClick={() => handleBulkToggleActive(true)}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                  >
                    Activate Selected
                  </button>
                  <button
                    onClick={() => handleBulkToggleActive(false)}
                    className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                  >
                    Deactivate Selected
                  </button>
                  <button
                    onClick={() => setBulkAssignSchoolModalOpen(true)}
                    className="px-2.5 py-1 bg-[#111111] hover:bg-black text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                  >
                    Assign School
                  </button>
                  <button
                    onClick={() => setBulkDeleteUserModalOpen(true)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer inline-flex items-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Delete ({selectedUserIds.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedUserIds([])}
                    className="text-xs text-gray-600 hover:text-gray-900 font-semibold underline cursor-pointer ml-2"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}

            {/* Main User Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#111111]">
                <thead className="bg-gray-50 border-b border-[#E5E7EB] text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                        onChange={toggleSelectAllUsers}
                        className="w-4 h-4 rounded text-[#111111] border-gray-300 focus:ring-[#111111] cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">User Identity</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Roles</th>
                    <th className="p-3.5">Assigned School</th>
                    <th className="p-3.5">Status & Auth</th>
                    <th className="p-3.5">City / Profession</th>
                    <th className="p-3.5 text-right">Developer Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500">
                        No platform user accounts match the current search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelected = selectedUserIds.includes(u.id);
                      return (
                        <tr key={u.id} className={`transition-colors ${isSelected ? 'bg-amber-50/70 hover:bg-amber-50' : 'hover:bg-gray-50'}`}>
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectUser(u.id)}
                              className="w-4 h-4 rounded text-[#111111] border-gray-300 focus:ring-[#111111] cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'User')}&background=F3F4F6&color=111827`}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                              />
                              <div>
                                <div className="font-extrabold text-[#111111] text-xs flex items-center space-x-1.5">
                                  <span>{u.full_name}</span>
                                </div>
                                <div className="text-[10px] font-mono text-gray-400 mt-0.5 flex items-center space-x-1">
                                  <span>ID: {u.id?.slice(-6)}</span>
                                  {u.alumni_id && <span className="bg-gray-100 text-gray-600 px-1 rounded text-[9px]">Alumni Linked</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-gray-700 font-semibold">{u.mobile}</td>
                          <td className="p-3.5 text-gray-600">{u.email || 'N/A'}</td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {u.roles?.map((r: string) => (
                                <span key={r} className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                  r === 'SUPER_ADMIN' || r === 'DEVELOPER' || r === 'PLATFORM_DEVELOPER' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                                  r === 'SCHOOL_ADMIN' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                                  r === 'BATCH_COORDINATOR' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-gray-700 font-semibold text-xs">
                              {u.school_name || 'Unassigned'}
                            </div>
                            {u.school_code && u.school_code !== 'N/A' && (
                              <span className="text-[10px] font-mono text-gray-400 font-bold">[{u.school_code}]</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col items-start gap-1">
                              {/* Interactive Active Toggle Switch */}
                              <button
                                onClick={() => handleQuickToggleUserActive(u)}
                                title="Click to toggle Active/Inactive status"
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all flex items-center space-x-1 cursor-pointer ${
                                  u.is_active !== false
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                                }`}
                              >
                                <span>{u.is_active !== false ? '● ACTIVE' : '○ INACTIVE'}</span>
                              </button>

                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${u.has_password ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-300'}`}>
                                {u.has_password ? 'PASSWORD SET' : 'NO PASSWORD'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-gray-600">
                            <div>{u.current_city || '—'}</div>
                            {u.profession && <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{u.profession}</div>}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* 1. View Details */}
                              <button
                                onClick={() => openViewUserModal(u)}
                                title="View Complete User Details & JSON"
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* 2. Direct Reset Password */}
                              <button
                                onClick={() => openResetPasswordModal(u)}
                                title="Set / Reset User Password"
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* 3. Edit User */}
                              <button
                                onClick={() => openEditUserModal(u)}
                                title="Edit User Account Details"
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-[#111111] font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                Edit
                              </button>

                              {/* 4. Delete User */}
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setDeleteUserModalOpen(true);
                                }}
                                title="Delete User Account"
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SCHOOL ADMIN ENQUIRIES MODULE */}
      {activeTab === 'ENQUIRIES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl">
              <div className="text-xs text-gray-500 font-medium">Pending Requests</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{enquiryMetrics.pending}</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl">
              <div className="text-xs text-gray-500 font-medium">Contacted</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{enquiryMetrics.contacted}</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl">
              <div className="text-xs text-gray-500 font-medium">Approved</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{enquiryMetrics.approved}</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl">
              <div className="text-xs text-gray-500 font-medium">Rejected</div>
              <div className="text-2xl font-bold text-rose-600 mt-1">{enquiryMetrics.rejected}</div>
            </div>
            <div className="bg-[#111111] text-white p-4 rounded-xl col-span-2 sm:col-span-1">
              <div className="text-xs text-gray-400 font-medium">Total Received</div>
              <div className="text-2xl font-bold text-white mt-1">{enquiryMetrics.total}</div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-[#111111] text-base flex items-center space-x-2">
                <Shield className="w-4 h-4 text-[#854D0E]" />
                <span>School Admin Access Requests ({enquiriesList.length})</span>
              </h3>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-semibold uppercase">Filter:</span>
                <select
                  value={enquiryStatusFilter}
                  onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-[#111111]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <Button variant="secondary" size="sm" onClick={fetchAllDeveloperData} className="border border-gray-300">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#111111]">
                <thead className="bg-gray-50 border-b border-[#E5E7EB] text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5">Requester Name</th>
                    <th className="p-3.5">School Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Responsibility</th>
                    <th className="p-3.5">Submitted Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {enquiriesList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 font-normal">
                        No school admin enquiries match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    enquiriesList.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3.5 font-bold">{item.full_name}</td>
                        <td className="p-3.5 font-semibold text-[#854D0E]">{item.school_name}</td>
                        <td className="p-3.5 text-gray-600">{item.email}</td>
                        <td className="p-3.5 font-mono text-gray-600">{item.mobile}</td>
                        <td className="p-3.5 font-medium">{item.responsibility}</td>
                        <td className="p-3.5 text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                            item.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEnquiry(item);
                              setEnquiryNotes(item.notes || '');
                              setEnquirySelectedSchoolId('');
                              setEnquiryModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-[#111111] font-semibold rounded-md transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. AUDIT LOGS MODULE */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="font-bold text-[#111111] text-base flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Platform System Audit Trail ({auditLogs.length})</span>
              </h3>
              <Button variant="secondary" size="sm" onClick={fetchAllDeveloperData}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                <span>Refresh Logs</span>
              </Button>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No system audit events recorded yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#111111]">{log.action}</div>
                        <div className="text-gray-500 text-[11px] font-mono">
                          Target: {log.resource_type} ({log.resource_id})
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-gray-400 font-mono text-[11px]">
                      {log.timestamp}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* ALL DEVELOPER MODALS                                              */}
      {/* ================================================================= */}

      {/* 1. School Creation Wizard Modal */}
      <Modal isOpen={schoolModalOpen} onClose={() => setSchoolModalOpen(false)} title={editingSchoolId ? "Edit School Entity" : wizardStep === 1 ? "Step 1: Register School Entity" : "Step 2: Provision Primary School Admin"}>
        {wizardStep === 1 ? (
          <form onSubmit={handleSaveSchoolStep1} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input label="School Name *" placeholder="e.g. St. Joseph Higher Secondary School" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
            <Input label="Unique School Code *" placeholder="e.g. STJOSEPH" value={schoolCode} onChange={(e) => setSchoolCode(e.target.value.toUpperCase())} required />
            
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">School Description</label>
              <textarea value={schoolDescription} onChange={(e) => setSchoolDescription(e.target.value)} placeholder="Nurturing excellence and integrity..." className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-[#111111]" rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="City *" value={schoolCity} onChange={(e) => setSchoolCity(e.target.value)} required />
              <Input label="State *" value={schoolState} onChange={(e) => setSchoolState(e.target.value)} required />
            </div>

            <Input label="Address *" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} required />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Contact Phone *" value={schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} required />
              <Input label="Contact Email *" type="email" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Established Year" type="number" value={schoolYear} onChange={(e) => setSchoolYear(Number(e.target.value))} />
              <Input label="Website URL" value={schoolWebsite} onChange={(e) => setSchoolWebsite(e.target.value)} />
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-[#E5E7EB]">
              <Button type="button" variant="secondary" onClick={() => setSchoolModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={submitting} className="bg-[#111111] text-white hover:bg-black font-bold">
                <span>{editingSchoolId ? "Save Changes ✓" : "Next: Provision Admin →"}</span>
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleProvisionAdminStep2} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Select Target School *</label>
              <select value={targetSchoolId} onChange={(e) => setTargetSchoolId(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-xs font-bold focus:outline-none focus:border-[#111111] bg-white">
                {schoolsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <Input label="Admin Full Name *" placeholder="Administrator name" value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} required />
            <Input label="Admin Mobile *" placeholder="+91 XXXXX XXXXX" value={adminMobile} onChange={(e) => setAdminMobile(e.target.value)} required />
            <Input label="Admin Email *" type="email" placeholder="admin@school.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />

            <div className="pt-4 flex justify-between space-x-3 border-t border-[#E5E7EB]">
              <Button type="button" variant="secondary" onClick={() => setWizardStep(1)}>← Back to Step 1</Button>
              <Button type="submit" isLoading={submitting} className="bg-[#111111] text-white hover:bg-black font-bold">
                <span>Complete & Provision Admin ✓</span>
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 2. Edit School Admin Modal */}
      {selectedAdmin && (
        <Modal isOpen={editAdminModalOpen} onClose={() => setEditAdminModalOpen(false)} title="Edit School Administrator">
          <form onSubmit={handleSaveEditAdmin} className="space-y-4">
            <Input label="Admin Name *" value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} required />
            <Input label="Mobile *" value={adminMobile} onChange={(e) => setAdminMobile(e.target.value)} required />
            <Input label="Email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Assign School</label>
              <select value={targetSchoolId} onChange={(e) => setTargetSchoolId(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]">
                {schoolsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Account Status</label>
              <select value={userIsActive ? 'ACTIVE' : 'INACTIVE'} onChange={(e) => setUserIsActive(e.target.value === 'ACTIVE')} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive / Revoked</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-[#E5E7EB]">
              <Button type="button" variant="secondary" onClick={() => setEditAdminModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={submitting} className="bg-[#111111] text-white">Save Changes ✓</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Revoke School Admin Modal */}
      {selectedAdmin && (
        <Modal isOpen={deleteAdminModalOpen} onClose={() => setDeleteAdminModalOpen(false)} title="Revoke School Admin Access">
          <div className="space-y-4">
            <p className="text-xs text-gray-700">Are you sure you want to remove administrator <strong>{selectedAdmin.full_name}</strong> ({selectedAdmin.mobile})?</p>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => setDeleteAdminModalOpen(false)}>Cancel</Button>
              <Button type="button" isLoading={submitting} onClick={handleDeleteSchoolAdmin} className="bg-rose-600 text-white font-bold">Confirm Delete</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 4. COMPREHENSIVE ADD / EDIT USER MODAL */}
      <Modal isOpen={userModalOpen} onClose={() => setUserModalOpen(false)} title={selectedUser ? `Edit User: ${selectedUser.full_name}` : "Add New Platform User"}>
        <form onSubmit={handleSaveUser} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
          <Input label="Full Name *" value={userFullName} onChange={(e) => setUserFullName(e.target.value)} required />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Mobile Number *" value={userMobile} onChange={(e) => setUserMobile(e.target.value)} required />
            <Input label="Email Address" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
          </div>

          {/* Interactive Role Selector Badges */}
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">Assigned Roles (Click to Toggle)</label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              {[
                { id: 'SUPER_ADMIN', label: 'Super Admin', color: 'purple' },
                { id: 'DEVELOPER', label: 'Developer', color: 'purple' },
                { id: 'PLATFORM_DEVELOPER', label: 'Platform Dev', color: 'purple' },
                { id: 'SCHOOL_ADMIN', label: 'School Admin', color: 'amber' },
                { id: 'BATCH_COORDINATOR', label: 'Batch Coordinator', color: 'blue' },
                { id: 'ALUMNI', label: 'Alumni Member', color: 'gray' },
              ].map((r) => {
                const isChecked = userRoles.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleToggleRoleInUserModal(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                      isChecked
                        ? 'bg-[#111111] text-white shadow-xs'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{isChecked ? '✓' : '+'}</span>
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">School Assignment</label>
              <select value={userSchoolId} onChange={(e) => setUserSchoolId(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#111111] bg-white">
                <option value="">Unassigned (No School)</option>
                {schoolsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Account Active Status</label>
              <select value={userIsActive ? 'ACTIVE' : 'INACTIVE'} onChange={(e) => setUserIsActive(e.target.value === 'ACTIVE')} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#111111] bg-white">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive / Blocked</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="City" value={userCity} onChange={(e) => setUserCity(e.target.value)} placeholder="e.g. Chennai" />
            <Input label="Profession" value={userProfession} onChange={(e) => setUserProfession(e.target.value)} placeholder="e.g. Software Engineer" />
            <Input label="Passing Year" type="number" value={userPassingYear} onChange={(e) => setUserPassingYear(e.target.value)} placeholder="e.g. 2018" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">Set / Reset Password {selectedUser && '(Leave blank to keep existing password)'}</label>
            <input
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-[#E5E7EB]">
            <Button type="button" variant="secondary" onClick={() => setUserModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting} className="bg-[#111111] text-white font-bold">Save User Account ✓</Button>
          </div>
        </form>
      </Modal>

      {/* 5. VIEW COMPLETE USER DETAILS DRAWER / MODAL */}
      {viewingUser && (
        <Modal isOpen={viewUserModalOpen} onClose={() => { setViewUserModalOpen(false); setViewingUser(null); }} title={`User Profile Details: ${viewingUser.full_name}`}>
          <div className="space-y-4 text-xs text-[#111111] max-h-[75vh] overflow-y-auto pr-1">
            {/* User Header Summary Card */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex items-center space-x-4">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(viewingUser.full_name || 'User')}&background=111827&color=ffffff`}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover border border-gray-300"
              />
              <div className="space-y-1 flex-1">
                <div className="text-base font-extrabold text-[#111111]">{viewingUser.full_name}</div>
                <div className="flex flex-wrap gap-1">
                  {viewingUser.roles?.map((r: string) => (
                    <span key={r} className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full text-[10px] font-extrabold">{r}</span>
                  ))}
                </div>
                <div className="text-[11px] text-gray-500 font-mono">User ID: {viewingUser.id}</div>
              </div>
            </div>

            {/* View Sub-Tabs */}
            <div className="flex border-b border-gray-200 space-x-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewUserTab('OVERVIEW')}
                className={`pb-2 border-b-2 cursor-pointer ${viewUserTab === 'OVERVIEW' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
              >
                Profile Overview
              </button>
              <button
                type="button"
                onClick={() => setViewUserTab('RAW_JSON')}
                className={`pb-2 border-b-2 cursor-pointer ${viewUserTab === 'RAW_JSON' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
              >
                Developer JSON Inspector
              </button>
            </div>

            {viewUserTab === 'OVERVIEW' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border">
                    <div className="text-gray-500 font-medium">Mobile Number</div>
                    <div className="font-mono font-extrabold text-sm text-[#111111] mt-0.5">{viewingUser.mobile}</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border">
                    <div className="text-gray-500 font-medium">Email Address</div>
                    <div className="font-extrabold text-xs text-[#111111] truncate mt-0.5">{viewingUser.email || 'N/A'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border">
                    <div className="text-gray-500 font-medium">Assigned School</div>
                    <div className="font-bold text-xs text-[#111111] mt-0.5">{viewingUser.school_name || 'Unassigned'}</div>
                    {viewingUser.school_code && <div className="text-[10px] font-mono text-gray-400">[{viewingUser.school_code}]</div>}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border">
                    <div className="text-gray-500 font-medium">Account Status</div>
                    <div className="mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${viewingUser.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {viewingUser.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border">
                    <div className="text-gray-500 font-medium">City</div>
                    <div className="font-bold text-xs text-[#111111] mt-0.5">{viewingUser.current_city || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border">
                    <div className="text-gray-500 font-medium">Profession</div>
                    <div className="font-bold text-xs text-[#111111] mt-0.5 truncate">{viewingUser.profession || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border">
                    <div className="text-gray-500 font-medium">Passing Year</div>
                    <div className="font-bold text-xs text-[#111111] mt-0.5">{viewingUser.passing_year || 'N/A'}</div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border text-[11px] text-gray-500 flex justify-between">
                  <span>Created At: <strong>{viewingUser.created_at || 'N/A'}</strong></span>
                  {viewingUser.updated_at && <span>Updated: <strong>{viewingUser.updated_at}</strong></span>}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(viewingUser, null, 2));
                      setJsonCopied(true);
                      setTimeout(() => setJsonCopied(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{jsonCopied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed border border-gray-800">
                  {JSON.stringify(viewingUser, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-2 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => setViewUserModalOpen(false)}>Close</Button>
              <Button type="button" onClick={() => { setViewUserModalOpen(false); openEditUserModal(viewingUser); }} className="bg-[#111111] text-white">Edit User Profile</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. DIRECT RESET USER PASSWORD MODAL */}
      {resetPasswordUser && (
        <Modal isOpen={resetPasswordModalOpen} onClose={() => { setResetPasswordModalOpen(false); setResetPasswordUser(null); }} title={`Reset Password for: ${resetPasswordUser.full_name}`}>
          <form onSubmit={handleSaveResetPassword} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
              As a Developer, you can set a new account login password directly for <strong>{resetPasswordUser.full_name}</strong> ({resetPasswordUser.mobile}).
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">New Password *</label>
              <input
                type={showNewPasswordVal ? 'text' : 'password'}
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                placeholder="Enter new password (minimum 6 characters)"
                minLength={6}
                required
                className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="pt-3 flex justify-end space-x-3 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => setResetPasswordModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={submitting} disabled={newPasswordValue.length < 6} className="bg-amber-700 hover:bg-amber-800 text-white font-bold">Set New Password ✓</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. BULK ASSIGN SCHOOL MODAL */}
      <Modal isOpen={bulkAssignSchoolModalOpen} onClose={() => setBulkAssignSchoolModalOpen(false)} title={`Assign School to ${selectedUserIds.length} Selected Users`}>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#111111] mb-1.5">Select School Entity *</label>
            <select
              value={bulkTargetSchoolId}
              onChange={(e) => setBulkTargetSchoolId(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl font-bold bg-white text-xs"
            >
              <option value="">-- Unassigned (Remove School) --</option>
              {schoolsList.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setBulkAssignSchoolModalOpen(false)}>Cancel</Button>
            <Button type="button" isLoading={submitting} onClick={handleBulkAssignSchool} className="bg-[#111111] text-white font-bold">Confirm Bulk Assignment</Button>
          </div>
        </div>
      </Modal>

      {/* 8. Single Delete User Account Modal */}
      {selectedUser && (
        <Modal isOpen={deleteUserModalOpen} onClose={() => setDeleteUserModalOpen(false)} title="Delete User Account">
          <div className="space-y-4">
            <p className="text-xs text-gray-700">Are you sure you want to permanently delete user account <strong>{selectedUser.full_name}</strong> ({selectedUser.mobile})?</p>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => setDeleteUserModalOpen(false)}>Cancel</Button>
              <Button type="button" isLoading={submitting} onClick={handleDeleteUser} className="bg-rose-600 text-white font-bold">Confirm Delete</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 9. Bulk Delete User Accounts Modal */}
      <Modal isOpen={bulkDeleteUserModalOpen} onClose={() => setBulkDeleteUserModalOpen(false)} title="Bulk Delete User Accounts">
        <div className="space-y-4">
          <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200 text-xs">
            <strong>WARNING:</strong> You are about to permanently delete <strong>{selectedUserIds.length}</strong> selected user account{selectedUserIds.length > 1 ? 's' : ''} across the platform. This action cannot be undone.
          </div>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-1.5 bg-gray-50 text-xs">
            {usersList.filter((u) => selectedUserIds.includes(u.id)).map((u) => (
              <div key={u.id} className="flex items-center justify-between py-1 border-b border-gray-200 last:border-0">
                <span className="font-bold text-[#111111]">{u.full_name}</span>
                <span className="font-mono text-gray-500">{u.mobile}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={() => setBulkDeleteUserModalOpen(false)}>Cancel</Button>
            <Button type="button" isLoading={submitting} onClick={handleBulkDeleteUsers} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
              Confirm Bulk Delete ({selectedUserIds.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* 10. View School Admin Request Details Modal */}
      {selectedEnquiry && (
        <Modal isOpen={enquiryModalOpen} onClose={() => { setEnquiryModalOpen(false); setSelectedEnquiry(null); }} title="School Admin Request Details">
          <div className="space-y-4 text-xs text-[#111111]">
            <div className="bg-gray-50 border p-3 rounded-xl space-y-1">
              <div>Requester: <strong>{selectedEnquiry.full_name}</strong> ({selectedEnquiry.mobile})</div>
              <div>School: <strong>{selectedEnquiry.school_name}</strong></div>
              <div>Email: <strong>{selectedEnquiry.email}</strong></div>
            </div>
            {selectedEnquiry.message && <p className="italic text-gray-600">"{selectedEnquiry.message}"</p>}

            <div>
              <label className="block font-bold text-gray-700 text-[11px] mb-1">Select School to Assign</label>
              <select value={enquirySelectedSchoolId} onChange={(e) => setEnquirySelectedSchoolId(e.target.value)} className="w-full px-3 py-2 border rounded-xl font-bold bg-white">
                <option value="">-- Select School --</option>
                {schoolsList.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.code})</option>))}
              </select>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <Button size="sm" variant="secondary" onClick={() => handleUpdateEnquiryStatus(selectedEnquiry.id, 'REJECTED')} className="text-rose-700">Reject</Button>
              <Button size="sm" onClick={() => { if (!enquirySelectedSchoolId) { setErrorMessage('Select a school first'); return; } handleUpdateEnquiryStatus(selectedEnquiry.id, 'APPROVED'); }} className="bg-[#111111] text-[#F4C542]">Approve & Assign</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 11. Delete School Confirmation Modal */}
      {schoolToDelete && (
        <Modal isOpen={deleteSchoolModalOpen} onClose={() => { setDeleteSchoolModalOpen(false); setSchoolToDelete(null); setDeleteConfirmCode(''); }} title="Delete School Entity">
          <div className="space-y-4">
            <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200 text-xs">
              <strong>DANGER:</strong> Permanently delete <strong>{schoolToDelete.name}</strong> and all linked data.
            </div>
            <form onSubmit={handleDeleteSchool} className="space-y-4">
              <input type="text" value={deleteConfirmCode} onChange={(e) => setDeleteConfirmCode(e.target.value)} placeholder={`Type ${schoolToDelete.code} to confirm`} className="w-full px-3 py-2 border border-rose-300 rounded-xl text-xs" required />
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={() => setDeleteSchoolModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={submitting} disabled={deleteConfirmCode !== schoolToDelete.code} className="bg-rose-600 text-white font-bold">Confirm Delete</Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
