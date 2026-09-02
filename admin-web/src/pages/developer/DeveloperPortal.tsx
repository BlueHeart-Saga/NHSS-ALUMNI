import React, { useEffect, useState } from 'react';
import { Shield, Building2, UserPlus, Phone, Mail, CheckCircle2, UserCheck, Key, RefreshCw, Layers, GraduationCap, Settings, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { AlumniProfile } from '../../types';

export const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SCHOOLS' | 'ENQUIRIES'>('SCHOOLS');
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [enquirySelectedSchoolId, setEnquirySelectedSchoolId] = useState('');

  // Modals
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Wizard Stepper State (1: School Entity, 2: Admin Provisioning)
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  // School Form State
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

  // Admin Provisioning Form State
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Edit / Delete School State
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [deleteSchoolModalOpen, setDeleteSchoolModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<{ id: string, name: string, code: string } | null>(null);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDeveloperData();
    fetchEnquiriesData();
  }, [statusFilter]);

  const fetchDeveloperData = async () => {
    try {
      setLoading(true);
      const data = await api.getAllSchools();
      setSchoolsList(data);
      if (data.length > 0 && !targetSchoolId) {
        setTargetSchoolId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch developer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiriesData = async () => {
    try {
      const res = await fetch(`/api/v1/developer/enquiries?status_filter=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${api.getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnquiriesList(data.enquiries || []);
        setEnquiryMetrics(data.metrics || { pending: 0, contacted: 0, approved: 0, rejected: 0, total: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch admin enquiries:', err);
    }
  };

  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/developer/enquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: JSON.stringify({ status: newStatus, notes: enquiryNotes, school_id: enquirySelectedSchoolId || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update status');

      setSuccessMessage(`Enquiry request status set to ${newStatus}!`);
      setEnquiryModalOpen(false);
      setSelectedEnquiry(null);
      setEnquirySelectedSchoolId('');
      fetchEnquiriesData();
      fetchDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating status');
    } finally {
      setSubmitting(false);
    }
  };

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
        await fetchDeveloperData();
      } else {
        const created = await api.createNewSchool(payload);

        // Refresh list & Pre-select created school for Step 2 Provisioning
        await fetchDeveloperData();
        if (created && created.id) {
          setTargetSchoolId(created.id);
        }

        // Automatically advance wizard to Step 2
        setWizardStep(2);
        setSuccessMessage(`School "${created.name || schoolName}" created successfully! Complete Step 2 below to provision the primary administrator.`);
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
      await fetchDeveloperData();
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

      setSuccessMessage(`School Admin "${adminFullName}" (${adminMobile}) provisioned for ${selectedSchool?.name || 'School'}! Initial Setup Complete.`);
      
      // Reset form states
      setSchoolName('');
      setSchoolCode('');
      setSchoolDescription('');
      setSchoolAddress('');
      setSchoolCity('');
      setSchoolState('');
      setSchoolCountry('India');
      setSchoolWebsite('');
      setSchoolPhone('');
      setSchoolEmail('');
      setSchoolYear(1985);
      setSchoolLogoUrl('');
      setSchoolCoverUrl('');
      setSchoolStatus('ACTIVE');
      setAdminFullName('');
      setAdminMobile('');
      setAdminEmail('');
      
      // Close modal and reset wizard step
      setSchoolModalOpen(false);
      setWizardStep(1);
      fetchDeveloperData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to provision school administrator.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

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
          <p className="text-xs text-[#6B7280] mt-1">Multi-tenant school entity management and administrator provisioning platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => {
              setWizardStep(1);
              setSchoolModalOpen(true);
            }}
            className="border border-[#111111] text-[#111111] font-bold hover:bg-gray-50"
          >
            <Building2 className="w-4 h-4 mr-2" />
            <span>Create New School</span>
          </Button>
          <Button
            onClick={() => {
              setWizardStep(2);
              setSchoolModalOpen(true);
            }}
            className="bg-[#111111] text-white font-bold hover:bg-black"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            <span>Provision School Admin</span>
          </Button>
        </div>
      </div>

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
            <Shield className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 font-bold hover:text-rose-900 ml-4">Dismiss</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E5E7EB] space-x-8 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('SCHOOLS')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'SCHOOLS'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Registered Schools Roster ({schoolsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ENQUIRIES')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'ENQUIRIES'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Shield className="w-4 h-4 text-[#854D0E]" />
          <span>School Admin Enquiries</span>
          {enquiryMetrics.pending > 0 && (
            <span className="px-2 py-0.5 bg-[#F4C542] text-[#111111] text-xs font-bold rounded-full">
              {enquiryMetrics.pending}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'SCHOOLS' ? (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B7280]">Total Registered Schools</span>
                <div className="text-3xl font-extrabold text-[#111111] mt-1">{schoolsList.length}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 text-[#111111]">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B7280]">Total Provisioned Admins</span>
                <div className="text-3xl font-extrabold text-[#111111] mt-1">{totalAdmins}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 text-[#111111]">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B7280]">Total Platform Alumni</span>
                <div className="text-3xl font-extrabold text-[#111111] mt-1">{totalAlumni}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 text-[#111111]">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Multi-Tenant Schools Roster */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="font-bold text-[#111111] text-base flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#111111]" />
                <span>Registered Schools Roster ({schoolsList.length})</span>
              </h3>
              <Button variant="secondary" size="sm" onClick={fetchDeveloperData} className="border border-gray-300">
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                <span>Refresh Roster</span>
              </Button>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {schoolsList.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-sm">
                  No school entities registered yet. Click <strong>Create New School</strong> to initialize your first school tenant.
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
                          <p className="text-xs text-gray-600 font-normal italic">{school.description}</p>
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
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                        title="Edit School"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSchoolToDelete({ id: school.id, name: school.name, code: school.code });
                          setDeleteConfirmCode('');
                          setDeleteSchoolModalOpen(true);
                        }}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                        title="Delete School"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setTargetSchoolId(school.id);
                          setWizardStep(2);
                          setSchoolModalOpen(true);
                        }}
                        className="bg-[#111111] text-white hover:bg-black font-semibold"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                        <span>Provision Admin</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SCHOOL ADMIN ENQUIRIES MODULE */
        <div className="space-y-6">
          {/* Dashboard Metrics */}
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
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl col-span-2 sm:col-span-1">
              <div className="text-xs text-gray-500 font-medium">Total Received</div>
              <div className="text-2xl font-bold text-[#111111] mt-1">{enquiryMetrics.total}</div>
            </div>
          </div>

          {/* Enquiries Table Roster */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-[#111111] text-base flex items-center space-x-2">
                <Shield className="w-4 h-4 text-[#854D0E]" />
                <span>School Admin Requests ({enquiriesList.length})</span>
              </h3>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-semibold uppercase">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-[#111111]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <Button variant="secondary" size="sm" onClick={fetchEnquiriesData} className="border border-gray-300">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Table */}
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
                          {item.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                setSelectedEnquiry(item);
                                setEnquiryNotes(item.notes || '');
                                setEnquirySelectedSchoolId('');
                                setEnquiryModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-[#111111] hover:bg-black text-[#F4C542] font-semibold rounded-md transition-colors"
                            >
                              Approve
                            </button>
                          )}
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

      {/* 2-Step School Setup Wizard Modal */}
      <Modal
        isOpen={schoolModalOpen}
        onClose={() => setSchoolModalOpen(false)}
        title={wizardStep === 1 ? (editingSchoolId ? "Edit School Entity" : "Step 1: School Information") : "Step 2: Provision School Admin"}
      >
        {/* Step Indicator Header */}
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
          /* STEP 1: School Entity Details Form (Single-Column Row Layout) */
          <form onSubmit={handleSaveSchoolStep1} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label="School Name *"
              placeholder="Enter school name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />

            <Input
              label="Short Name (Unique Code) *"
              placeholder="e.g. ABC School"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
              required
            />

            <Input
              label="School Email *"
              type="email"
              placeholder="admin@school.com"
              value={schoolEmail}
              onChange={(e) => setSchoolEmail(e.target.value)}
              required
            />

            <Input
              label="Phone Number"
              placeholder="+91 XXXXX XXXXX"
              value={schoolPhone}
              onChange={(e) => setSchoolPhone(e.target.value)}
            />

            <Input
              label="Website"
              placeholder="https://www.school.com"
              value={schoolWebsite}
              onChange={(e) => setSchoolWebsite(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Established Year</label>
              <input
                type="number"
                value={schoolYear}
                onChange={(e) => setSchoolYear(parseInt(e.target.value) || 1985)}
                placeholder="1985"
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">School Motto / Description</label>
              <textarea
                value={schoolDescription}
                onChange={(e) => setSchoolDescription(e.target.value)}
                placeholder="Providing holistic education and academic excellence..."
                rows={2}
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]"
              />
            </div>

            <Input
              label="Address"
              placeholder="Enter school address"
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
            />

            <Input
              label="City *"
              placeholder="Enter city"
              value={schoolCity}
              onChange={(e) => setSchoolCity(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">State</label>
              <input
                type="text"
                value={schoolState}
                onChange={(e) => setSchoolState(e.target.value)}
                placeholder="Select state"
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Country</label>
              <input
                type="text"
                value={schoolCountry}
                onChange={(e) => setSchoolCountry(e.target.value)}
                placeholder="India"
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]"
              />
            </div>

            {/* Dual Input: School Logo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#111111]">School Logo (Upload Local File or Paste URL Link)</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setSchoolLogoUrl(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#111111] file:text-white hover:file:bg-black cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="Or paste external image URL link (https://...)"
                  value={schoolLogoUrl}
                  onChange={(e) => setSchoolLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]"
                />
                {schoolLogoUrl && (
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <img src={schoolLogoUrl} alt="Logo Preview" className="w-10 h-10 object-cover rounded-lg border border-gray-300" />
                    <span className="text-[11px] text-gray-600 font-medium truncate">Logo Preview Selected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dual Input: Cover Image */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#111111]">Cover Image (Upload Local File or Paste URL Link)</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setSchoolCoverUrl(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#111111] file:text-white hover:file:bg-black cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="Or paste external banner image URL link (https://...)"
                  value={schoolCoverUrl}
                  onChange={(e) => setSchoolCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]"
                />
                {schoolCoverUrl && (
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <img src={schoolCoverUrl} alt="Cover Banner Preview" className="w-full h-20 object-cover rounded-lg border border-gray-300" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">School Status</label>
              <select
                value={schoolStatus}
                onChange={(e) => setSchoolStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-[#111111]"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-[#E5E7EB]">
              <Button type="button" variant="secondary" onClick={() => setSchoolModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting} className="bg-[#111111] text-white hover:bg-black font-bold">
                <span>{editingSchoolId ? "Save Changes ✓" : "Next: Provision Admin →"}</span>
              </Button>
            </div>
          </form>
        ) : (
          /* STEP 2: Provision School Admin Form (Single-Column Row Layout) */
          <form onSubmit={handleProvisionAdminStep2} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Select Target School *</label>
              <select
                value={targetSchoolId}
                onChange={(e) => setTargetSchoolId(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-xs font-bold focus:outline-none focus:border-[#111111] bg-white"
              >
                {schoolsList.length === 0 ? (
                  <option value="">No schools available (Complete Step 1 first)</option>
                ) : (
                  schoolsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))
                )}
              </select>
            </div>

            <Input
              label="Admin Name *"
              placeholder="Enter school administrator name"
              value={adminFullName}
              onChange={(e) => setAdminFullName(e.target.value)}
              required
            />

            <Input
              label="Admin Email *"
              type="email"
              placeholder="admin email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />

            <Input
              label="Admin Mobile *"
              placeholder="+91 XXXXX XXXXX"
              value={adminMobile}
              onChange={(e) => setAdminMobile(e.target.value)}
              required
            />

            <div className="pt-4 flex justify-between space-x-3 border-t border-[#E5E7EB]">
              <Button type="button" variant="secondary" onClick={() => setWizardStep(1)}>
                ← Back to Step 1
              </Button>
              <Button type="submit" isLoading={submitting} className="bg-[#111111] text-white hover:bg-black font-bold">
                <span>Complete &amp; Initialize School ✓</span>
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Enquiry & Decision Modal */}
      {selectedEnquiry && (
        <Modal
          isOpen={enquiryModalOpen}
          onClose={() => {
            setEnquiryModalOpen(false);
            setSelectedEnquiry(null);
          }}
          title="School Admin Access Enquiry Details"
        >
          <div className="space-y-6 text-xs text-[#111111]">
            {/* Requester Details */}
            <div className="bg-gray-50 border border-[#E5E7EB] p-4 rounded-xl space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-[#854D0E] text-[11px]">
                Requester Details
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>Name: <strong className="text-[#111111]">{selectedEnquiry.full_name}</strong></div>
                <div>Email: <strong className="text-[#111111]">{selectedEnquiry.email}</strong></div>
                <div>Mobile: <strong className="text-[#111111]">{selectedEnquiry.mobile}</strong></div>
                <div>Responsibility: <strong className="text-[#111111]">{selectedEnquiry.responsibility}</strong></div>
              </div>
            </div>

            {/* School Details */}
            <div className="bg-gray-50 border border-[#E5E7EB] p-4 rounded-xl space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-[#854D0E] text-[11px]">
                School Details
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>School Name: <strong className="text-[#111111]">{selectedEnquiry.school_name}</strong></div>
                <div>City: <strong className="text-[#111111]">{selectedEnquiry.city || 'N/A'}</strong></div>
                <div>State: <strong className="text-[#111111]">{selectedEnquiry.state || 'N/A'}</strong></div>
                <div>Country: <strong className="text-[#111111]">{selectedEnquiry.country || 'India'}</strong></div>
              </div>
            </div>

            {/* Message */}
            {selectedEnquiry.message && (
              <div className="bg-gray-50 border border-[#E5E7EB] p-4 rounded-xl space-y-1">
                <h4 className="font-bold uppercase tracking-wider text-[#854D0E] text-[11px]">
                  Enquiry Message / Requirements
                </h4>
                <p className="text-gray-700 italic leading-relaxed pt-1">"{selectedEnquiry.message}"</p>
              </div>
            )}

            {/* Internal Developer Notes */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                Developer Notes / Action Logs
              </label>
              <textarea
                rows={2}
                value={enquiryNotes}
                onChange={(e) => setEnquiryNotes(e.target.value)}
                placeholder="Add developer notes or contact log history..."
                className="w-full p-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-xs text-[#111111]"
              />
            </div>

            {/* Target School Selection (Required for Approval) */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                Assign to School (Required for Approval)
              </label>
              <select
                value={enquirySelectedSchoolId}
                onChange={(e) => setEnquirySelectedSchoolId(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-xs font-bold focus:outline-none focus:border-[#111111] bg-white"
              >
                <option value="">-- Select an Existing School --</option>
                {schoolsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Decision Action Buttons */}
            <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdateEnquiryStatus(selectedEnquiry.id, 'CONTACTED')}
                  className="border border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100 font-semibold"
                >
                  Mark Contacted
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdateEnquiryStatus(selectedEnquiry.id, 'REJECTED')}
                  className="border border-rose-300 text-rose-800 bg-rose-50 hover:bg-rose-100 font-semibold"
                >
                  Reject
                </Button>
              </div>

              <Button
                type="button"
                size="sm"
                isLoading={submitting}
                onClick={() => {
                  if (!enquirySelectedSchoolId) {
                    setErrorMessage('Please select a school to approve and assign this admin.');
                    return;
                  }
                  handleUpdateEnquiryStatus(selectedEnquiry.id, 'APPROVED');
                }}
                className="bg-[#111111] text-[#F4C542] hover:bg-black font-bold border border-[#111111]"
              >
                ✓ Approve Access &amp; Assign to School
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete School Confirmation Modal */}
      {schoolToDelete && (
        <Modal
          isOpen={deleteSchoolModalOpen}
          onClose={() => {
            setDeleteSchoolModalOpen(false);
            setSchoolToDelete(null);
            setDeleteConfirmCode('');
          }}
          title="Delete School Entity"
        >
          <div className="space-y-4">
            <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200">
              <h4 className="font-bold text-sm mb-1 flex items-center">
                <Shield className="w-4 h-4 mr-1.5" />
                DANGER: Destructive Action
              </h4>
              <p className="text-xs">
                You are about to permanently delete <strong>{schoolToDelete.name}</strong>.
                This action will <strong className="underline">CASCADE DELETE</strong> all associated data, including:
                batches, users (admins and alumni), events, memories, rank holders, and announcements.
                <br /><br />
                This action CANNOT be undone.
              </p>
            </div>
            
            <form onSubmit={handleDeleteSchool} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#111111]">
                  Type the school code <strong>{schoolToDelete.code}</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmCode}
                  onChange={(e) => setDeleteConfirmCode(e.target.value)}
                  placeholder={schoolToDelete.code}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setDeleteSchoolModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={submitting} 
                  disabled={deleteConfirmCode !== schoolToDelete.code}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-50"
                >
                  Confirm Delete
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

    </div>
  );
};
