import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, Building2, UserPlus, Phone, Mail, CheckCircle2, UserCheck, Key,
  RefreshCw, Layers, GraduationCap, Settings, Trash2, Users, Search, Filter,
  FileText, Activity, AlertTriangle, Edit3, XCircle, Plus
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

  // User Edit / Add State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userFullName, setUserFullName] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRoles, setUserRoles] = useState<string[]>(['ALUMNI']);
  const [userSchoolId, setUserSchoolId] = useState('');
  const [userIsActive, setUserIsActive] = useState(true);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);

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
        setSuccessMessage(`School "${schoolName}" updated successfully!`);
        setSchoolModalOpen(false);
        await fetchAllDeveloperData();
      } else {
        const created = await api.createNewSchool(payload);
        await fetchAllDeveloperData();
        if (created && created.id) {
          setTargetSchoolId(created.id);
        }
        setWizardStep(2);
        setSuccessMessage(`School "${created.name || schoolName}" created successfully! Complete Step 2 to provision the primary administrator.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || (editingSchoolId ? 'Failed to update school.' : 'Failed to create school entity.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolToDelete) return;
    if (deleteConfirmCode !== schoolToDelete.code) {
      setErrorMessage('School code does not match. Deletion aborted.');
      return;
    }

    setSubmitting(true);
    try {
      await api.deleteSchool(schoolToDelete.id);
      setSuccessMessage(`School "${schoolToDelete.name}" deleted successfully.`);
      setDeleteSchoolModalOpen(false);
      setSchoolToDelete(null);
      setDeleteConfirmCode('');
      await fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete school.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditSchoolModal = (school: any) => {
    setEditingSchoolId(school.id);
    setSchoolName(school.name || '');
    setSchoolCode(school.code || '');
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

  const handleProvisionAdminStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSchoolId) return;
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const selectedSchool = schoolsList.find(s => s.id === targetSchoolId);
      await api.provisionAdminForSchool(targetSchoolId, {
        full_name: adminFullName,
        mobile: adminMobile,
        email: adminEmail
      });

      setSuccessMessage(`School Admin "${adminFullName}" (${adminMobile}) provisioned for ${selectedSchool?.name || 'School'}! Account setup email dispatched.`);
      setAdminFullName('');
      setAdminMobile('');
      setAdminEmail('');
      setSchoolModalOpen(false);
      setWizardStep(1);
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to provision school administrator.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: School Admin CRUD ---
  const handleSaveEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.updateDeveloperSchoolAdmin(selectedAdmin.id, {
        full_name: adminFullName,
        email: adminEmail,
        mobile: adminMobile,
        school_id: targetSchoolId,
        is_active: userIsActive
      });
      setSuccessMessage(`School Admin "${adminFullName}" profile updated successfully!`);
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
      setSuccessMessage(`School Admin "${selectedAdmin.full_name}" account removed.`);
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
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload = {
      full_name: userFullName,
      email: userEmail || undefined,
      mobile: userMobile,
      roles: userRoles,
      school_id: userSchoolId || undefined,
      is_active: userIsActive
    };

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

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await api.deleteDeveloperUser(selectedUser.id);
      setSuccessMessage(`User account "${selectedUser.full_name}" deleted.`);
      setDeleteUserModalOpen(false);
      setSelectedUser(null);
      fetchAllDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete user.');
    } finally {
      setSubmitting(false);
    }
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
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 font-bold hover:text-emerald-900 ml-4">Dismiss</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 font-bold hover:text-rose-900 ml-4">Dismiss</button>
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
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* 1. DASHBOARD OVERVIEW MODULE */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B7280]">Registered Schools</span>
                <div className="text-3xl font-extrabold text-[#111111] mt-1">{schoolsList.length}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 text-[#111111]">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B7280]">School Admins</span>
                <div className="text-3xl font-extrabold text-[#111111] mt-1">{schoolAdminsList.length}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 text-[#111111]">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B7280]">Registered Users</span>
                <div className="text-3xl font-extrabold text-[#111111] mt-1">{usersList.length}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 text-[#111111]">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B7280]">Total Alumni</span>
                <div className="text-3xl font-extrabold text-[#111111] mt-1">{totalAlumni}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 text-[#111111]">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#111111]">Multi-Tenant School & User Administration</h3>
              <p className="text-xs text-[#6B7280] mt-1">Manage school entities, provision multiple school administrators per school, and maintain user access controls across the platform.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button size="sm" onClick={() => handleTabChange('SCHOOLS', '/developer/schools')} className="bg-[#111111] text-white">
                View Schools Roster →
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleTabChange('USERS', '/developer/users')} className="border border-[#111111]">
                User Directory →
              </Button>
            </div>
          </div>

          {/* Recent Schools Preview */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="font-bold text-[#111111] text-base flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Recent Schools Registered</span>
              </h3>
              <Button variant="secondary" size="sm" onClick={() => handleTabChange('SCHOOLS', '/developer/schools')}>
                View All ({schoolsList.length})
              </Button>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {schoolsList.slice(0, 4).map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                  <div className="flex items-center space-x-3">
                    <img src={s.logo_url || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&q=80"} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                    <div>
                      <div className="font-bold text-sm text-[#111111]">{s.name} <span className="text-xs font-mono text-gray-500">({s.code})</span></div>
                      <div className="text-xs text-gray-500">📍 {s.city || 'N/A'}, {s.state || 'N/A'} • Admins: {s.admin_count} • Alumni: {s.alumni_count}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => openEditSchoolModal(s)} className="text-xs">
                    Configure
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SCHOOLS MANAGEMENT MODULE */}
      {activeTab === 'SCHOOLS' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-[#111111] text-base flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#111111]" />
                <span>Registered Schools Roster ({schoolsList.length})</span>
              </h3>
              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm" onClick={fetchAllDeveloperData} className="border border-gray-300">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  <span>Refresh</span>
                </Button>
                <Button size="sm" onClick={() => { setWizardStep(1); setEditingSchoolId(null); setSchoolName(''); setSchoolCode(''); setSchoolModalOpen(true); }} className="bg-[#111111] text-white">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add School</span>
                </Button>
              </div>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {schoolsList.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-sm">
                  No school entities registered yet. Click <strong>Add School</strong> to initialize your first school tenant.
                </div>
              ) : (
                schoolsList.map((school) => (
                  <div key={school.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <img src={school.logo_url || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&q=80"} alt="" className="w-14 h-14 rounded-2xl border border-gray-200 object-cover flex-shrink-0" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h4 className="font-bold text-[#111111] text-lg">{school.name}</h4>
                          <span className="px-2.5 py-0.5 bg-[#111111] text-white font-mono text-xs font-bold rounded-md uppercase">{school.code}</span>
                          <span className={`px-2 py-0.5 font-semibold text-[11px] rounded-md border ${school.status === 'INACTIVE' ? 'bg-rose-100 text-rose-900 border-rose-200' : 'bg-emerald-100 text-emerald-900 border-emerald-200'}`}>
                            {school.status || 'ACTIVE'}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold text-[11px] rounded-md border border-amber-200">
                            Est. {school.established_year || 1985}
                          </span>
                        </div>
                        {school.description && (
                          <p className="text-xs text-gray-600 italic">{school.description}</p>
                        )}
                        <div className="text-xs text-[#6B7280] space-y-0.5 pt-1">
                          <div>📍 {school.address ? `${school.address}${school.city ? `, ${school.city}` : ''}${school.state ? `, ${school.state}` : ''}${school.country ? `, ${school.country}` : ''}` : 'Address not specified'}</div>
                          <div className="flex items-center space-x-4 flex-wrap">
                            <span>📞 {school.contact_phone || 'N/A'}</span>
                            <span>✉️ {school.contact_email || 'N/A'}</span>
                            {school.website && (
                              <a href={school.website} target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">
                                🌐 {school.website}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 pt-2 text-xs text-[#6B7280]">
                          <div>Admins: <strong className="text-[#111111]">{school.admin_count}</strong></div>
                          <div>Alumni: <strong className="text-[#111111]">{school.alumni_count}</strong></div>
                          <div>Batches: <strong className="text-[#111111]">{school.batches_count}</strong></div>
                          <div>Events: <strong className="text-[#111111]">{school.events_count}</strong></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditSchoolModal(school)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
                      >
                        <Settings className="w-3.5 h-3.5 mr-1" />
                        <span>Edit Details</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSchoolToDelete({ id: school.id, name: school.name, code: school.code });
                          setDeleteConfirmCode('');
                          setDeleteSchoolModalOpen(true);
                        }}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Delete</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setTargetSchoolId(school.id);
                          setWizardStep(2);
                          setAdminFullName('');
                          setAdminMobile('');
                          setAdminEmail('');
                          setSchoolModalOpen(true);
                        }}
                        className="bg-[#111111] text-white hover:bg-black font-semibold text-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        <span>Provision Admin</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SCHOOL ADMINS MANAGEMENT MODULE */}
      {activeTab === 'SCHOOL_ADMINS' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-[#111111] text-base flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-[#111111]" />
                  <span>Provisioned School Administrators ({schoolAdminsList.length})</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">Manage administrator credentials, school assignments, and active permissions</p>
              </div>

              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <select
                  value={adminSchoolFilter}
                  onChange={(e) => setAdminSchoolFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#111111]"
                >
                  <option value="ALL">All Schools</option>
                  {schoolsList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>

                <Button size="sm" onClick={() => { setWizardStep(2); setAdminFullName(''); setAdminMobile(''); setAdminEmail(''); setSchoolModalOpen(true); }} className="bg-[#111111] text-white">
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  <span>Provision New Admin</span>
                </Button>
              </div>
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
                    <th className="p-3.5">Provisioned Date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {schoolAdminsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No school administrators provisioned matching the filter.
                      </td>
                    </tr>
                  ) : (
                    schoolAdminsList.map((adm) => (
                      <tr key={adm.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3.5 font-bold flex items-center space-x-2">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adm.full_name || 'Admin')}&background=111111&color=ffffff`}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span>{adm.full_name}</span>
                        </td>
                        <td className="p-3.5 font-mono text-gray-600">{adm.mobile}</td>
                        <td className="p-3.5 text-gray-600">{adm.email || 'N/A'}</td>
                        <td className="p-3.5 font-semibold text-[#854D0E]">
                          {adm.school_name} <span className="text-[10px] font-mono text-gray-500">({adm.school_code})</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${adm.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {adm.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-500">{adm.created_at ? new Date(adm.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedAdmin(adm);
                              setAdminFullName(adm.full_name);
                              setAdminMobile(adm.mobile);
                              setAdminEmail(adm.email || '');
                              setTargetSchoolId(adm.school_id);
                              setUserIsActive(adm.is_active);
                              setEditAdminModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-[#111111] font-semibold rounded-md transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAdmin(adm);
                              setDeleteAdminModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-md border border-rose-200 transition-colors"
                          >
                            Remove
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

      {/* 4. USER DIRECTORY MODULE */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-[#111111] text-base flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#111111]" />
                  <span>Platform User Directory ({usersList.length})</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">Filter, update roles, toggle active status, or delete accounts across all roles</p>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, mobile..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#111111]"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="SCHOOL_ADMIN">School Admin</option>
                  <option value="BATCH_COORDINATOR">Batch Coordinator</option>
                  <option value="ALUMNI">Alumni</option>
                </select>

                <select
                  value={userSchoolFilter}
                  onChange={(e) => setUserSchoolFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#111111]"
                >
                  <option value="ALL">All Schools</option>
                  {schoolsList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>

                <Button size="sm" onClick={openAddUserModal} className="bg-emerald-700 text-white font-bold hover:bg-emerald-800">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add User</span>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#111111]">
                <thead className="bg-gray-50 border-b border-[#E5E7EB] text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Roles</th>
                    <th className="p-3.5">Assigned School</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No users found matching the search criteria.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3.5 font-bold flex items-center space-x-2">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'User')}&background=F3F4F6&color=111827`}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span>{u.full_name}</span>
                        </td>
                        <td className="p-3.5 font-mono text-gray-600">{u.mobile}</td>
                        <td className="p-3.5 text-gray-600">{u.email || 'N/A'}</td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {u.roles?.map((r: string) => (
                              <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                r === 'SUPER_ADMIN' || r === 'DEVELOPER' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                                r === 'SCHOOL_ADMIN' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                                r === 'BATCH_COORDINATOR' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 text-gray-600">{u.school_name || 'Unassigned'}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {u.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => openEditUserModal(u)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-[#111111] font-semibold rounded-md transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setDeleteUserModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-md border border-rose-200 transition-colors"
                          >
                            Delete
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
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#111111]">{log.action}</div>
                        <div className="text-gray-500 text-[11px]">
                          User ID: {log.user_id || 'System'} • School ID: {log.school_id || 'Platform'} • Type: {log.resource_type || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-gray-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 2-Step School Wizard / Edit School Modal */}
      <Modal
        isOpen={schoolModalOpen}
        onClose={() => setSchoolModalOpen(false)}
        title={wizardStep === 1 ? (editingSchoolId ? "Edit School Entity" : "Step 1: School Information") : "Step 2: Provision School Admin"}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setWizardStep(1)}
            className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${wizardStep === 1 ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] leading-4">1</span>
            <span>{editingSchoolId ? "Edit School Details" : "School Entity Details"}</span>
          </button>

          {!editingSchoolId && (
            <>
              <div className="h-0.5 flex-1 bg-gray-200 mx-3"></div>
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${wizardStep === 2 ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] leading-4">2</span>
                <span>Provision Administrator</span>
              </button>
            </>
          )}
        </div>

        {wizardStep === 1 ? (
          <form onSubmit={handleSaveSchoolStep1} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input label="School Name *" placeholder="Enter school name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
            <Input label="Short Code *" placeholder="e.g. ABC School" value={schoolCode} onChange={(e) => setSchoolCode(e.target.value.toUpperCase())} required />
            <Input label="School Email *" type="email" placeholder="admin@school.com" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} required />
            <Input label="Phone Number" placeholder="+91 XXXXX XXXXX" value={schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} />
            <Input label="Website" placeholder="https://www.school.com" value={schoolWebsite} onChange={(e) => setSchoolWebsite(e.target.value)} />

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Established Year</label>
              <input type="number" value={schoolYear} onChange={(e) => setSchoolYear(parseInt(e.target.value) || 1985)} placeholder="1985" className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Description</label>
              <textarea value={schoolDescription} onChange={(e) => setSchoolDescription(e.target.value)} placeholder="Providing holistic education..." rows={2} className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]" />
            </div>

            <Input label="Address" placeholder="Address" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} />
            <Input label="City *" placeholder="City" value={schoolCity} onChange={(e) => setSchoolCity(e.target.value)} required />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">State</label>
                <input type="text" value={schoolState} onChange={(e) => setSchoolState(e.target.value)} placeholder="State" className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">Country</label>
                <input type="text" value={schoolCountry} onChange={(e) => setSchoolCountry(e.target.value)} placeholder="India" className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">School Logo URL</label>
              <input type="text" placeholder="https://..." value={schoolLogoUrl} onChange={(e) => setSchoolLogoUrl(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">School Status</label>
              <select value={schoolStatus} onChange={(e) => setSchoolStatus(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
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

      {/* Edit School Admin Modal */}
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

      {/* Delete School Admin Modal */}
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

      {/* Add / Edit User Modal */}
      <Modal isOpen={userModalOpen} onClose={() => setUserModalOpen(false)} title={selectedUser ? "Edit User Account" : "Add Platform User"}>
        <form onSubmit={handleSaveUser} className="space-y-4">
          <Input label="Full Name *" value={userFullName} onChange={(e) => setUserFullName(e.target.value)} required />
          <Input label="Mobile *" value={userMobile} onChange={(e) => setUserMobile(e.target.value)} required />
          <Input label="Email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">Roles (Comma Separated)</label>
            <input type="text" value={userRoles.join(', ')} onChange={(e) => setUserRoles(e.target.value.split(',').map(r => r.trim()))} placeholder="SCHOOL_ADMIN, ALUMNI" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">School Assignment</label>
            <select value={userSchoolId} onChange={(e) => setUserSchoolId(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]">
              <option value="">Unassigned</option>
              {schoolsList.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">Status</label>
            <select value={userIsActive ? 'ACTIVE' : 'INACTIVE'} onChange={(e) => setUserIsActive(e.target.value === 'ACTIVE')} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive / Blocked</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-[#E5E7EB]">
            <Button type="button" variant="secondary" onClick={() => setUserModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting} className="bg-[#111111] text-white">Save Account ✓</Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal */}
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

      {/* View Enquiry Modal */}
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

      {/* Delete School Confirmation Modal */}
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
