import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  Search, Download, Upload, UserX, CheckCircle2, Trash2, Plus, 
  Table as TableIcon, Edit3, Save, RefreshCw, X, ShieldCheck, Clock, AlertCircle,
  Users, HandHeart, Heart, Droplet, Layers, CheckSquare, Square, Filter,
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { TableSkeleton } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { AlumniProfile } from '../../types';

const ADD_FORM_TOTAL_STEPS = 5;

export const AlumniManagement: React.FC = () => {
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [batchYear, setBatchYear] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [volunteerFilter, setVolunteerFilter] = useState('');

  // Mode: 'table' vs 'sheet'
  const [viewMode, setViewMode] = useState<'table' | 'sheet'>('table');

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sheet Edit Tracking State (map of id -> partial profile changes)
  const [editedRows, setEditedRows] = useState<Record<string, Partial<AlumniProfile>>>({});
  const [savingSheet, setSavingSheet] = useState(false);

  // Sheet horizontal scroll container ref & helper
  const sheetContainerRef = useRef<HTMLDivElement>(null);
  const scrollSheet = (offset: number) => {
    if (sheetContainerRef.current) {
      sheetContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Paginated Add form step (1..5)
  const [addFormStep, setAddFormStep] = useState<number>(1);

  // Export CSV state
  const [exportingCSV, setExportingCSV] = useState(false);

  // Add Single/Bulk Alumnus Form State — now includes ALL fields
  const [newAlumnus, setNewAlumnus] = useState<Partial<AlumniProfile>>({
    // Page 1 — Personal Information
    full_name: '',
    name_ta: '',
    gender: '',
    date_of_birth: '',
    blood_group: '',
    father_name: '',
    mother_name: '',
    profile_photo_url: '',

    // Page 2 — Contact & Address
    mobile: '',
    country_code: '91',
    email: '',
    address: '',
    current_city: '',
    current_state: '',
    country: 'India',

    // Page 3 — School Education
    school_name: '',
    joining_year: undefined,
    passing_year: new Date().getFullYear(),
    leaving_class: '',
    admission_number: '',
    section: 'A',
    no_higher_education: 'NO',

    // Page 4 — Higher Education
    college_name: '',
    degree: '',
    custom_degree: '',
    department: '',
    college_register_no: '',
    college_joining_year: undefined,
    college_passing_year: undefined,

    // Page 5 — Professional & Social
    employment_status: '',
    company_name: '',
    profession: '',
    industry: '',
    total_experience: '',
    skills: [],
    linkedin_url: '',
    instagram_url: '',
    whatsapp_number: '',
    website_url: '',

    // Other
    is_volunteer: 'NO',
    willing_to_donate: 'NO',
    verification_status: 'APPROVED',
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchAlumni();
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch roster from backend.
  //
  // Pass forceFresh=true from any user-triggered refresh action (Refresh button,
  // after delete/suspend/bulk-update/add/import/save-sheet) so we always bypass
  // the ApiClient's 20-second GET cache. The initial mount uses forceFresh=false
  // because the cache is empty at that point anyway.
  // ---------------------------------------------------------------------------
  const fetchAlumni = async (forceFresh: boolean = false) => {
    try {
      if (forceFresh) {
        api.clearCache();
      }
      setLoading(true);
      const data = await api.getDirectory('', undefined, 'ALL');
      setAlumniList(data || []);
      setEditedRows({});
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to fetch alumni roster:', err);
      setAlumniList([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Roster Computation
  const displayedAlumni = useMemo(() => {
    return alumniList.filter((a) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        (a.full_name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.mobile || '').includes(q) ||
        (a.admission_number || '').toLowerCase().includes(q) ||
        (a.section || '').toLowerCase().includes(q) ||
        (a.current_city || '').toLowerCase().includes(q) ||
        (a.address || '').toLowerCase().includes(q) ||
        (a.profession || '').toLowerCase().includes(q)
      );

      const matchesBatch = !batchYear || String(a.passing_year) === batchYear;
      const matchesStatus = statusFilter === 'ALL' || (a.verification_status || 'APPROVED').toUpperCase() === statusFilter.toUpperCase();
      const matchesBlood = !bloodGroupFilter || (a.blood_group || '').toUpperCase() === bloodGroupFilter.toUpperCase();
      const matchesVol = !volunteerFilter || (
        volunteerFilter === 'YES' ? a.is_volunteer === 'YES' : a.is_volunteer !== 'YES'
      );

      return matchesSearch && matchesBatch && matchesStatus && matchesBlood && matchesVol;
    });
  }, [alumniList, search, batchYear, statusFilter, bloodGroupFilter, volunteerFilter]);

  // Selection Helper
  const toggleSelectAll = () => {
    if (selectedIds.size === displayedAlumni.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedAlumni.map((a) => a.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Inline Sheet Cell Change Handler (Immediate local UI update)
  const handleCellEdit = (
    id: string,
    field: keyof AlumniProfile,
    value: any,
    companionField?: keyof AlumniProfile
  ) => {
    const patch: Partial<AlumniProfile> = { [field]: value };
    if (companionField) {
      patch[companionField] = value;
    }

    setAlumniList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );

    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...patch,
      }
    }));
  };

  // Auto-save row updates seamlessly when user clicks away / tabs out
  const handleCellBlur = async (id: string) => {
    const rowUpdates = editedRows[id];
    if (!rowUpdates || Object.keys(rowUpdates).length === 0) return;

    try {
      await api.updateAlumniAdmin(id, rowUpdates);
      setEditedRows((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err: any) {
      console.error(`Failed to auto-save alumni row ${id}:`, err);
    }
  };

  // Save All Sheet Changes Action (Manual bulk save button)
  const handleSaveSheetChanges = async () => {
    const idsToUpdate = Object.keys(editedRows);
    if (idsToUpdate.length === 0) return;

    setSavingSheet(true);
    try {
      await Promise.all(
        idsToUpdate.map((id) => api.updateAlumniAdmin(id, editedRows[id]))
      );
      alertService.showSuccess(
        'Sheet Saved Successfully',
        `Successfully saved changes for ${idsToUpdate.length} alumni record(s) to the database.`
      );
      setEditedRows({});
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to save sheet updates.');
    } finally {
      setSavingSheet(false);
    }
  };

  // Single Actions
  const handleSingleSuspend = async (id: string) => {
    const confirmed = await alertService.showConfirm(
      'Suspend Alumni Profile?',
      'Are you sure you want to suspend this alumni profile? The user will be barred from portal access.',
      'Suspend Profile',
      'Cancel'
    );
    if (!confirmed) return;

    try {
      await api.verifyAlumni(id, 'SUSPENDED', 'Suspended by admin');
      alertService.showSuccess('Alumni Suspended', 'The profile has been suspended.');
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to update alumni status.');
    }
  };
    const handleSingleActivate = async (id: string, name: string) => {
    const confirmed = await alertService.showConfirm(
      'Activate Alumni Profile?',
      `Are you sure you want to reactivate "${name}"? The user will regain full portal access.`,
      'Activate Profile',
      'Cancel'
    );
    if (!confirmed) return;

    try {
      await api.verifyAlumni(id, 'APPROVED', 'Reactivated by admin');
      alertService.showSuccess('Alumni Activated', `Profile for ${name} has been reactivated.`);
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to activate alumni.');
    }
  };

      const handleSingleApprove = async (id: string, name: string) => {
    const confirmed = await alertService.showConfirm(
      'Approve Alumni Profile?',
      `Are you sure you want to approve "${name}"? The user will receive an approval email and gain full portal access.`,
      'Approve Profile',
      'Cancel'
    );
    if (!confirmed) return;

    try {
      await api.verifyAlumni(id, 'APPROVED', 'Approved by admin');
      alertService.showSuccess('Alumni Approved', `Profile for ${name} has been approved.`);
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to approve alumni.');
    }
  };

  const handleSingleDelete = async (id: string, name: string) => {
    const confirmed = await alertService.showConfirm(
      'Delete Alumni Record?',
      `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
      'Delete Record',
      'Cancel'
    );
    if (!confirmed) return;

    try {
      await api.deleteAlumniAdmin(id);
      alertService.showSuccess('Alumni Deleted', `Record for ${name} has been removed.`);
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to delete record.');
    }
  };

  // Bulk Actions
  const handleBulkApprove = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      await api.bulkUpdateAlumniAdmin(ids, { verification_status: 'APPROVED' });
      alertService.showSuccess('Bulk Approved', `Approved ${ids.length} selected alumni.`);
      setSelectedIds(new Set());
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to approve selected alumni.');
    }
  };

  const handleBulkSuspend = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      await api.bulkUpdateAlumniAdmin(ids, { verification_status: 'SUSPENDED' });
      alertService.showSuccess('Bulk Suspended', `Suspended ${ids.length} selected alumni.`);
      setSelectedIds(new Set());
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to suspend selected alumni.');
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const confirmed = await alertService.showConfirm(
      'Bulk Delete Selected Alumni?',
      `Are you sure you want to PERMANENTLY delete ${ids.length} selected alumni profile(s)?`,
      'Delete Selected',
      'Cancel'
    );
    if (!confirmed) return;

    try {
      await api.bulkDeleteAlumniAdmin(ids);
      alertService.showSuccess('Bulk Deleted', `Deleted ${ids.length} alumni profile(s).`);
      setSelectedIds(new Set());
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to delete selected alumni.');
    }
  };

  // Reset the Add form to its initial (empty) state
  const resetAddForm = () => {
    setNewAlumnus({
      full_name: '',
      name_ta: '',
      gender: '',
      date_of_birth: '',
      blood_group: '',
      father_name: '',
      mother_name: '',
      profile_photo_url: '',
      mobile: '',
      country_code: '91',
      email: '',
      address: '',
      current_city: '',
      current_state: '',
      country: 'India',
      school_name: '',
      joining_year: undefined,
      passing_year: new Date().getFullYear(),
      leaving_class: '',
      admission_number: '',
      section: 'A',
      no_higher_education: 'NO',
      college_name: '',
      degree: '',
      custom_degree: '',
      department: '',
      college_register_no: '',
      college_joining_year: undefined,
      college_passing_year: undefined,
      employment_status: '',
      company_name: '',
      profession: '',
      industry: '',
      total_experience: '',
      skills: [],
      linkedin_url: '',
      instagram_url: '',
      whatsapp_number: '',
      website_url: '',
      is_volunteer: 'NO',
      willing_to_donate: 'NO',
      verification_status: 'APPROVED',
    });
    setAddFormStep(1);
  };

  // Validate the current step of the Add form before advancing
  const validateAddStep = (step: number): string[] => {
    const missing: string[] = [];
    if (step === 1) {
      if (!newAlumnus.full_name || !String(newAlumnus.full_name).trim()) missing.push('Full Name');
      if (!newAlumnus.gender) missing.push('Gender');
      if (!newAlumnus.date_of_birth) missing.push('Date of Birth');
    }
    if (step === 2) {
      if (!newAlumnus.mobile || !String(newAlumnus.mobile).trim()) missing.push('Mobile Number');
      if (!newAlumnus.email || !String(newAlumnus.email).trim()) missing.push('Email Address');
      if (!newAlumnus.current_city || !String(newAlumnus.current_city).trim()) missing.push('Current City');
    }
    if (step === 3) {
      if (!newAlumnus.passing_year) missing.push('Passing Year');
    }
    if (step === 4) {
      // Nothing strictly required — college can be skipped
    }
    if (step === 5) {
      // Nothing strictly required
    }
    return missing;
  };

  // Advance to next step of Add form
  const goToNextAddStep = () => {
    const missing = validateAddStep(addFormStep);
    if (missing.length > 0) {
      alertService.showWarning(
        'Required Fields Missing',
        `Please complete the following required fields to continue:\n• ${missing.join('\n• ')}`
      );
      return;
    }
    setAddFormStep((s) => Math.min(s + 1, ADD_FORM_TOTAL_STEPS));
  };

  const goToPrevAddStep = () => setAddFormStep((s) => Math.max(s - 1, 1));

  // Add Single Alumnus Submission — runs at the final step
  const handleCreateAlumnus = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation across all steps
    const allMissing: string[] = [];
    for (let s = 1; s <= ADD_FORM_TOTAL_STEPS; s++) {
      allMissing.push(...validateAddStep(s));
    }
    if (allMissing.length > 0) {
      alertService.showWarning(
        'Required Fields Missing',
        `Please complete the following required fields to continue:\n• ${allMissing.join('\n• ')}`
      );
      return;
    }

    setIsAdding(true);
    try {
      const payload: any = {
        ...newAlumnus,
        passing_year: Number(newAlumnus.passing_year),
      };
      if (newAlumnus.joining_year !== undefined && newAlumnus.joining_year !== null) {
        payload.joining_year = Number(newAlumnus.joining_year);
      }
      if (newAlumnus.college_joining_year !== undefined && newAlumnus.college_joining_year !== null) {
        payload.college_joining_year = Number(newAlumnus.college_joining_year);
      }
      if (newAlumnus.college_passing_year !== undefined && newAlumnus.college_passing_year !== null) {
        payload.college_passing_year = Number(newAlumnus.college_passing_year);
      }

      await api.register(payload);
      alertService.showSuccess('Alumni Profile Created', `New alumni profile for ${newAlumnus.full_name} added.`);
      setIsAddModalOpen(false);
      resetAddForm();
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to create alumni record.');
    } finally {
      setIsAdding(false);
    }
  };

  // CSV Roster Upload Submission — UPSERT semantics
  const handleCSVUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploading(true);
    try {
      const res = await api.importCSV(csvFile);

      const parts: string[] = [];
      if (res.created > 0)   parts.push(`${res.created} created`);
      if (res.updated > 0)   parts.push(`${res.updated} updated`);
      if (res.unchanged > 0) parts.push(`${res.unchanged} unchanged`);
      if (res.matched_and_approved > 0) parts.push(`${res.matched_and_approved} matched/approved`);
      if (res.failed > 0)    parts.push(`${res.failed} failed`);

      const summary = parts.length > 0 ? parts.join(', ') : 'No rows processed';

      if (res.failed > 0 && (res.created + res.updated + res.unchanged + res.matched_and_approved) === 0) {
        alertService.showError(
          'CSV Import Failed',
          `Out of ${res.total_rows} row(s), nothing was imported. ${summary}.${res.errors.length > 0 ? ' First error: ' + res.errors[0] : ''}`
        );
      } else if (res.failed > 0) {
        alertService.showError(
          'CSV Import Partially Completed',
          `Processed ${res.total_rows} row(s): ${summary}.${res.errors.length > 0 ? ' First error: ' + res.errors[0] : ''}`
        );
      } else {
        alertService.showSuccess(
          'CSV Import Complete',
          `Processed ${res.total_rows} row(s): ${summary}.`
        );
      }

      setIsImportModalOpen(false);
      setCsvFile(null);
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'CSV roster upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Export CSV Handler (authenticated blob download)
  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      await api.exportAlumniCSV();
      alertService.showSuccess('Export Complete', 'Alumni roster CSV has been downloaded.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to export alumni CSV.');
    } finally {
      setExportingCSV(false);
    }
  };

  // Complete Batch List (1962–2026)
  const currentYear = new Date().getFullYear();
  const availableBatches = Array.from({ length: currentYear - 1962 + 1 }, (_, i) => currentYear - i);
  const editedCount = Object.keys(editedRows).length;

  // Common input styling for the Add wizard
  const addInputCls = "w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none text-xs font-medium";
  const addLabelCls = "block font-bold text-[#111111] mb-1 text-xs";

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-[#111111] pb-12">
      {/* Header Title & Top Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Alumni Management & Sheet Editor
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage alumni directory records, inline sheet editing, bulk updates, additions & roster exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchAlumni(true)}
            disabled={loading}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-gray-300 flex items-center justify-center shadow-2xs"
            title="Refresh Directory Roster"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-300">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#111111] shadow-2xs' : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Standard Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('sheet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'sheet' ? 'bg-[#111111] text-white shadow-2xs' : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editable Sheet</span>
              {editedCount > 0 && (
                <span className="ml-1 bg-amber-400 text-black px-1.5 py-0.2 rounded-full text-[10px]">
                  {editedCount}
                </span>
              )}
            </button>
          </div>

          <Button
            variant="secondary"
            onClick={() => { resetAddForm(); setIsAddModalOpen(true); }}
            className="text-xs font-bold"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add New Alumni
          </Button>

          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="text-xs font-bold">
            <Upload className="w-4 h-4 mr-1" />
            Import CSV
          </Button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exportingCSV}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold text-xs rounded-xl transition-all border border-[#E0B030] shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingCSV ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (When Rows Selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-2 text-xs font-extrabold">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>{selectedIds.size} Alumni Profile(s) Selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBulkApprove}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bulk Approve</span>
            </button>

            <button
              type="button"
              onClick={handleBulkSuspend}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Bulk Suspend</span>
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Search & Multi-Filter Control Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, admission no, mobile, email, city, profession..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-all"
            />
          </div>

          <div>
            <select
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-[#111111] focus:bg-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Batches (1962-2026)</option>
              {availableBatches.map((y) => (
                <option key={y} value={String(y)}>Class of {y}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-[#111111] focus:bg-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="APPROVED">APPROVED Only</option>
              <option value="PENDING">PENDING Only</option>
              <option value="SUSPENDED">SUSPENDED Only</option>
              <option value="REJECTED">REJECTED Only</option>
            </select>
          </div>

          <div>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-rose-700 focus:bg-white focus:outline-none appearance-none cursor-pointer font-bold"
            >
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                <option key={bg} value={bg}>{bg} Blood Group</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={volunteerFilter}
              onChange={(e) => setVolunteerFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-[#111111] focus:bg-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Volunteers</option>
              <option value="YES">Volunteers Only (YES)</option>
              <option value="NO">Non-Volunteers</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 font-medium pt-2 border-t border-gray-100">
          <div>
            Showing <strong className="text-[#111111]">{displayedAlumni.length}</strong> of {alumniList.length} total roster records
          </div>
          {viewMode === 'sheet' && (
            <span className="text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 text-[11px]">
              Sheet Mode Active: Edit any input directly below
            </span>
          )}
        </div>
      </div>

      {/* VIEW 1: STANDARD TABLE MODE */}
      {viewMode === 'table' && (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xs">
          {loading ? (
            <TableSkeleton rows={8} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100/80 border-b border-gray-200 text-[11px] font-extrabold uppercase tracking-wider text-gray-600">
                    <th className="py-3 px-4 w-10">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="cursor-pointer text-gray-600 hover:text-black"
                      >
                        {selectedIds.size === displayedAlumni.length && displayedAlumni.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-[#111111]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-3 w-16 text-center">S.No</th>
                    <th className="py-3.5 px-4">Alumnus Profile</th>
                    <th className="py-3.5 px-4">Batch & Section</th>
                    <th className="py-3.5 px-4">Contact Information</th>
                    <th className="py-3.5 px-4">Address</th>
                    <th className="py-3.5 px-4">Blood Group</th>
                    <th className="py-3.5 px-4">Volunteer</th>
                    <th className="py-3.5 px-4">Willing Donor</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 font-medium">
                  {displayedAlumni.length > 0 ? (
                    displayedAlumni.map((a, index) => {
                      const isSelected = selectedIds.has(a.id);
                      const photoSrc = a.profile_photo_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name)}&background=F3F4F6&color=111111`;

                      return (
                        <tr key={a.id} className={`hover:bg-amber-50/40 transition-colors ${isSelected ? 'bg-amber-50/70' : ''}`}>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => toggleSelectRow(a.id)}
                              className="cursor-pointer text-gray-600 hover:text-black"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#111111]" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-semibold text-gray-600 text-xs">
                            {index + 1}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img src={photoSrc} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-300 shrink-0" />
                              <div>
                                <div className="font-bold text-[#111111]">{a.full_name}</div>
                                {a.admission_number && (
                                  <div className="text-[10px] text-gray-500">Adm: {a.admission_number}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/50 px-2.5 py-1 rounded-full text-[11px]">
                              Batch {a.passing_year} {a.section ? `(${a.section})` : ''}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-800">{a.mobile || '-'}</div>
                            <div className="text-gray-500 text-[11px] truncate max-w-[160px]">{a.email || '-'}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div
                              className="text-gray-700 text-[11px] max-w-[200px] truncate"
                              title={a.address || ''}
                            >
                              {a.address || '-'}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {a.blood_group ? (
                              <span className="inline-flex items-center space-x-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[11px]">
                                <Droplet className="w-3 h-3 fill-rose-600 text-rose-600" />
                                <span>{a.blood_group}</span>
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {a.is_volunteer === 'YES' ? (
                              <span className="inline-flex items-center space-x-1 font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px]">
                                <HandHeart className="w-3 h-3 text-emerald-600" />
                                <span>YES</span>
                              </span>
                            ) : (
                              <span className="text-gray-400">NO</span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {a.willing_to_donate === 'YES' ? (
                              <span className="inline-flex items-center space-x-1 font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-2 py-0.5 rounded-full text-[10px]">
                                <Heart className="w-3 h-3 fill-[#854D0E] text-[#854D0E]" />
                                <span>YES</span>
                              </span>
                            ) : (
                              <span className="text-gray-400">NO</span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              a.verification_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              a.verification_status === 'PENDING' ? 'bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]' :
                              'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {a.verification_status || 'APPROVED'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
  {/* PENDING → allow Approve */}
  {a.verification_status === 'PENDING' && (
    <button
      type="button"
      onClick={() => handleSingleApprove(a.id, a.full_name)}
      className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
    >
      Approve
    </button>
  )}

  {/* REJECTED → allow Approve */}
  {a.verification_status === 'REJECTED' && (
    <button
      type="button"
      onClick={() => handleSingleApprove(a.id, a.full_name)}
      className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
    >
      Approve
    </button>
  )}

  {/* APPROVED → allow Suspend */}
  {a.verification_status === 'APPROVED' && (
    <button
      type="button"
      onClick={() => handleSingleSuspend(a.id)}
      className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
    >
      Suspend
    </button>
  )}

  {/* SUSPENDED → allow Activate */}
  {a.verification_status === 'SUSPENDED' && (
    <button
      type="button"
      onClick={() => handleSingleActivate(a.id, a.full_name)}
      className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
    >
      Activate
    </button>
  )}

  {/* Delete is always available */}
  <button
    type="button"
    onClick={() => handleSingleDelete(a.id, a.full_name)}
    className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
  >
    Delete
  </button>
</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-gray-500 font-bold">
                        No alumni records found matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: INTERACTIVE EDITABLE SPREADSHEET GRID MODE */}
      {viewMode === 'sheet' && (
        <div className="bg-white border-2 border-[#111111] rounded-3xl overflow-hidden shadow-lg">
          <div className="px-5 py-3 bg-[#111111] text-white flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Full Spreadsheet Editor — All 41 Fields Editable Directly Below</span>
            </div>
            <div className="flex items-center space-x-3">
              {/* Quick horizontal scroll controls */}
              <div className="flex items-center bg-[#222222] border border-gray-700 rounded-lg p-0.5 text-gray-300 shadow-xs">
                <button
                  type="button"
                  onClick={() => scrollSheet(-400)}
                  title="Scroll Left (or Shift + Mouse Wheel)"
                  className="p-1 hover:text-amber-400 hover:bg-[#333333] rounded transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono px-2 text-gray-400 select-none tracking-tight">
                  Pan Columns
                </span>
                <button
                  type="button"
                  onClick={() => scrollSheet(400)}
                  title="Scroll Right (or Shift + Mouse Wheel)"
                  className="p-1 hover:text-amber-400 hover:bg-[#333333] rounded transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-amber-300 font-mono bg-amber-950/50 px-2.5 py-1 rounded border border-amber-500/30">
                {displayedAlumni.length} Rows Rendered
              </span>
              {Object.keys(editedRows).length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveSheetChanges}
                  disabled={savingSheet}
                  className="bg-amber-400 hover:bg-amber-300 text-[#111111] px-3.5 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1.5 shadow transition-all cursor-pointer"
                >
                  <Save className={`w-3.5 h-3.5 ${savingSheet ? 'animate-spin' : ''}`} />
                  <span>{savingSheet ? 'Saving...' : `Save ${Object.keys(editedRows).length} Edited Row(s)`}</span>
                </button>
              )}
            </div>
          </div>

          <div 
            ref={sheetContainerRef}
            className="overflow-auto max-h-[75vh] sheet-scrollbar relative"
          >
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead className="sticky top-0 bg-gray-100 border-b border-gray-300 text-[11px] font-extrabold uppercase text-gray-700 z-10 shadow-sm">
                <tr>
                  <th className="py-2.5 px-3 border-r border-gray-300 w-16 text-center">S.No</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[170px]">Full Name</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[150px]">Name in Tamil</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">Mobile Number</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[90px]">Country Code</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[100px]">Gender</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">Date of Birth</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[200px]">Email</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[100px]">Blood Group</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[150px]">Father Name</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[150px]">Mother Name</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">Current City</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">Current State</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[200px]">Address</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[110px]">Country</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[180px]">School Name</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[110px]">Joining Year</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[110px]">Passing Year</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[100px]">Leaving Class</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">Admission/Roll No</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[80px]">Section</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">No Higher Ed</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[180px]">College Name</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">Degree / Course</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">Custom Degree</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">Department</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">College Reg No</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">College Joining Yr</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">College Passing Yr</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">Employment Status</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[170px]">Company Name</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[160px]">Designation / Position</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">Industry</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">Total Experience</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[160px]">Skills & Expertise</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[160px]">LinkedIn URL</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[160px]">Instagram URL</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">WhatsApp Number</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[160px]">Website URL</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[160px]">Profile Photo URL</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">Status</th>
                  <th className="py-2.5 px-3 text-center min-w-[80px] sticky right-0 bg-gray-100 shadow-left z-20">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-300">
                {displayedAlumni.map((a, index) => {
                  const draft = editedRows[a.id] || {};
                  
                  const getValue = (field: keyof AlumniProfile, defaultVal: any = '') => {
                    return draft[field] !== undefined ? draft[field] : (a[field] !== undefined && a[field] !== null ? a[field] : defaultVal);
                  };

                  const isRowEdited = Boolean(editedRows[a.id]);

                  return (
                    <tr key={a.id} className={isRowEdited ? 'bg-amber-50/80 hover:bg-amber-100/80 transition-colors' : 'hover:bg-gray-50 transition-colors'}>
                      <td className="p-1 border-r border-gray-200 text-center font-mono font-semibold text-gray-600 text-xs align-middle">
                        {index + 1}
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('full_name')}
                          onChange={(e) => handleCellEdit(a.id, 'full_name', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-bold text-[#111111]"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          placeholder="பெயர் (Tamil)"
                          value={getValue('name_ta') || getValue('full_name_ta')}
                          onChange={(e) => handleCellEdit(a.id, 'name_ta', e.target.value, 'full_name_ta')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-serif text-[#111111]"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('mobile')}
                          onChange={(e) => handleCellEdit(a.id, 'mobile', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('country_code', '91')}
                          onChange={(e) => handleCellEdit(a.id, 'country_code', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center font-semibold"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <select
                          value={getValue('gender') || 'Male'}
                          onChange={(e) => handleCellEdit(a.id, 'gender', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-1.5 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white cursor-pointer font-semibold"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          placeholder="DD-MM-YYYY"
                          value={getValue('date_of_birth') || getValue('dob')}
                          onChange={(e) => handleCellEdit(a.id, 'date_of_birth', e.target.value, 'dob')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center font-mono"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="email"
                          value={getValue('email')}
                          onChange={(e) => handleCellEdit(a.id, 'email', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-[11px] text-blue-700"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <select
                          value={getValue('blood_group')}
                          onChange={(e) => handleCellEdit(a.id, 'blood_group', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-1.5 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-bold text-rose-700 cursor-pointer"
                        >
                          <option value="">None</option>
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('father_name')}
                          onChange={(e) => handleCellEdit(a.id, 'father_name', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('mother_name')}
                          onChange={(e) => handleCellEdit(a.id, 'mother_name', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('current_city')}
                          onChange={(e) => handleCellEdit(a.id, 'current_city', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-medium"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('current_state') || getValue('state', 'Tamil Nadu')}
                          onChange={(e) => handleCellEdit(a.id, 'current_state', e.target.value, 'state')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('address')}
                          onChange={(e) => handleCellEdit(a.id, 'address', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-medium"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('country', 'India')}
                          onChange={(e) => handleCellEdit(a.id, 'country', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('school_name', 'Natarajan Higher Secondary School')}
                          onChange={(e) => handleCellEdit(a.id, 'school_name', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={getValue('joining_year') || getValue('admission_year')}
                          onChange={(e) => {
                            const num = e.target.value ? Number(e.target.value) : undefined;
                            handleCellEdit(a.id, 'joining_year', num, 'admission_year');
                          }}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center font-semibold"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={getValue('passing_year')}
                          onChange={(e) => handleCellEdit(a.id, 'passing_year', Number(e.target.value))}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-extrabold text-[#854D0E] text-center"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('leaving_class')}
                          onChange={(e) => handleCellEdit(a.id, 'leaving_class', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center font-bold"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('admission_number') || getValue('roll_no')}
                          onChange={(e) => handleCellEdit(a.id, 'admission_number', e.target.value, 'roll_no')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('section')}
                          onChange={(e) => handleCellEdit(a.id, 'section', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center font-semibold uppercase"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <select
                          value={getValue('no_higher_education', 'NO')}
                          onChange={(e) => handleCellEdit(a.id, 'no_higher_education', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-1.5 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-bold cursor-pointer text-center"
                        >
                          <option value="YES">YES</option>
                          <option value="NO">NO</option>
                        </select>
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('college_name') || getValue('institution_name')}
                          onChange={(e) => handleCellEdit(a.id, 'college_name', e.target.value, 'institution_name')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('degree')}
                          onChange={(e) => handleCellEdit(a.id, 'degree', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-semibold"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('custom_degree')}
                          onChange={(e) => handleCellEdit(a.id, 'custom_degree', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('department') || getValue('stream')}
                          onChange={(e) => handleCellEdit(a.id, 'department', e.target.value, 'stream')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('college_register_no')}
                          onChange={(e) => handleCellEdit(a.id, 'college_register_no', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={getValue('college_joining_year')}
                          onChange={(e) => handleCellEdit(a.id, 'college_joining_year', e.target.value ? Number(e.target.value) : undefined)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={getValue('college_passing_year')}
                          onChange={(e) => handleCellEdit(a.id, 'college_passing_year', e.target.value ? Number(e.target.value) : undefined)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('employment_status')}
                          onChange={(e) => handleCellEdit(a.id, 'employment_status', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('company_name') || getValue('company')}
                          onChange={(e) => handleCellEdit(a.id, 'company_name', e.target.value, 'company')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-medium"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('profession') || getValue('designation')}
                          onChange={(e) => handleCellEdit(a.id, 'profession', e.target.value, 'designation')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-bold"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('industry')}
                          onChange={(e) => handleCellEdit(a.id, 'industry', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('total_experience') || getValue('experience_years')}
                          onChange={(e) => handleCellEdit(a.id, 'total_experience', e.target.value, 'experience_years')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={Array.isArray(getValue('skills')) ? (getValue('skills') as string[]).join(', ') : (getValue('skills') || '')}
                          onChange={(e) => handleCellEdit(a.id, 'skills', e.target.value.split(',').map(s => s.trim()))}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-xs"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="url"
                          value={getValue('linkedin_url')}
                          onChange={(e) => handleCellEdit(a.id, 'linkedin_url', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-[11px] text-blue-700"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="url"
                          value={getValue('instagram_url')}
                          onChange={(e) => handleCellEdit(a.id, 'instagram_url', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-[11px] text-pink-700"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('whatsapp_number') || getValue('mobile')}
                          onChange={(e) => handleCellEdit(a.id, 'whatsapp_number', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-emerald-800"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="url"
                          value={getValue('website_url')}
                          onChange={(e) => handleCellEdit(a.id, 'website_url', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-[11px]"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('profile_photo_url')}
                          onChange={(e) => handleCellEdit(a.id, 'profile_photo_url', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-[11px]"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <select
                          value={getValue('verification_status', 'APPROVED')}
                          onChange={(e) => handleCellEdit(a.id, 'verification_status', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-1.5 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-bold cursor-pointer uppercase"
                        >
                          <option value="APPROVED">APPROVED</option>
                          <option value="PENDING">PENDING</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      <td className="p-1 text-center sticky right-0 bg-white shadow-left">
                        <button
                          type="button"
                          onClick={() => handleSingleDelete(a.id, a.full_name)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* SPREADSHEET FOOTER BAR — SCROLL & NAVIGATION HELPER */}
          <div className="px-5 py-2.5 bg-gray-100 border-t border-gray-300 flex flex-wrap items-center justify-between gap-2 text-gray-600 text-[11px] font-semibold">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <span>Enhanced high-contrast scrollbar active. Tip: Use <b>Shift + Mouse Wheel</b> or drag the scrollbar below to navigate columns.</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => scrollSheet(-500)}
                className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-700 font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                title="Pan Left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Scroll Left</span>
              </button>
              <button
                type="button"
                onClick={() => scrollSheet(500)}
                className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-700 font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                title="Pan Right"
              >
                <span>Scroll Right</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ADD NEW ALUMNI MODAL — PAGINATED 5-STEP WIZARD
          ============================================================ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetAddForm(); }}
        title="Add New Alumni Profile"
      >
        <div className="text-xs font-medium">

          {/* Progress bar / step indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">
              <span>Step {addFormStep} of {ADD_FORM_TOTAL_STEPS}</span>
              <span className="text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/60 px-2 py-0.5 rounded-full">
                {addFormStep === 1 && 'Personal Information'}
                {addFormStep === 2 && 'Contact & Address'}
                {addFormStep === 3 && 'School Education'}
                {addFormStep === 4 && 'Higher Education'}
                {addFormStep === 5 && 'Professional & Social'}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#F4C542] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(addFormStep / ADD_FORM_TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleCreateAlumnus} className="space-y-4">

            {/* ---------- Step 1: Personal Information ---------- */}
            {addFormStep === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className={addLabelCls}>Full Name *</label>
                  <input
                    type="text"
                    value={newAlumnus.full_name || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, full_name: e.target.value })}
                    placeholder="e.g. S. Ramanathan"
                    className={addInputCls}
                  />
                </div>

                <div>
                  <label className={addLabelCls}>Name in Tamil</label>
                  <input
                    type="text"
                    value={newAlumnus.name_ta || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, name_ta: e.target.value })}
                    placeholder="எ.கா. எஸ். ராமநாதன்"
                    className={addInputCls + ' font-serif'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>Gender *</label>
                    <select
                      value={newAlumnus.gender || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, gender: e.target.value })}
                      className={addInputCls}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={addLabelCls}>Date of Birth *</label>
                    <input
                      type="date"
                      value={newAlumnus.date_of_birth || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, date_of_birth: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={addLabelCls}>Blood Group</label>
                  <select
                    value={newAlumnus.blood_group || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, blood_group: e.target.value })}
                    className={addInputCls + ' font-bold text-rose-700'}
                  >
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>Father Name</label>
                    <input
                      type="text"
                      value={newAlumnus.father_name || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, father_name: e.target.value })}
                      placeholder="Father's full name"
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>Mother Name</label>
                    <input
                      type="text"
                      value={newAlumnus.mother_name || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, mother_name: e.target.value })}
                      placeholder="Mother's full name"
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div>
  <label className={addLabelCls}>Profile Photo</label>

  {/* Preview + Upload row */}
  <div className="flex items-center gap-3 mb-2">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
      {newAlumnus.profile_photo_url ? (
        <img
          src={newAlumnus.profile_photo_url}
          alt="Profile preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <Users className="w-6 h-6 text-gray-400" />
      )}
    </div>

    <div className="flex flex-col gap-2">
      <label className="inline-flex items-center space-x-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-[#111111] text-xs font-semibold rounded-xl cursor-pointer transition-all border border-gray-200">
        <Upload className="w-3.5 h-3.5" />
        <span>Upload Photo</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => {
              setNewAlumnus((prev) => ({
                ...prev,
                profile_photo_url: reader.result as string,
              }));
            };
            reader.readAsDataURL(file);
          }}
        />
      </label>

      {newAlumnus.profile_photo_url && (
        <button
          type="button"
          onClick={() =>
            setNewAlumnus((prev) => ({ ...prev, profile_photo_url: '' }))
          }
          className="text-[11px] font-bold text-rose-600 hover:underline text-left cursor-pointer"
        >
          Remove photo
        </button>
      )}
    </div>
  </div>

  {/* Optional: paste URL directly */}
  <input
    type="text"
    value={newAlumnus.profile_photo_url || ''}
    onChange={(e) =>
      setNewAlumnus({ ...newAlumnus, profile_photo_url: e.target.value })
    }
    placeholder="Or paste an image URL (https://...)"
    className={addInputCls + ' font-mono'}
  />
</div>
              </div>
            )}

            {/* ---------- Step 2: Contact & Address ---------- */}
            {addFormStep === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={addLabelCls}>Country Code *</label>
                    <input
                      type="text"
                      value={newAlumnus.country_code || '91'}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, country_code: e.target.value })}
                      placeholder="91"
                      className={addInputCls + ' text-center font-semibold'}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={addLabelCls}>Mobile Number *</label>
                    <input
                      type="text"
                      value={newAlumnus.mobile || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, mobile: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className={addInputCls + ' font-mono'}
                    />
                  </div>
                </div>

                <div>
                  <label className={addLabelCls}>Email Address *</label>
                  <input
                    type="email"
                    value={newAlumnus.email || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, email: e.target.value })}
                    placeholder="e.g. alumni@example.com"
                    className={addInputCls + ' font-mono'}
                  />
                </div>

                <div>
                  <label className={addLabelCls}>Address</label>
                  <textarea
                    rows={2}
                    value={newAlumnus.address || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, address: e.target.value })}
                    placeholder="e.g. 12, North Street, Tuticorin, Tamil Nadu"
                    className={addInputCls + ' resize-none font-normal'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>Current City *</label>
                    <input
                      type="text"
                      value={newAlumnus.current_city || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, current_city: e.target.value })}
                      placeholder="e.g. Chennai / Madurai"
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>Current State</label>
                    <input
                      type="text"
                      value={newAlumnus.current_state || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, current_state: e.target.value })}
                      placeholder="e.g. Tamil Nadu"
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={addLabelCls}>Country</label>
                  <input
                    type="text"
                    value={newAlumnus.country || 'India'}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, country: e.target.value })}
                    placeholder="India"
                    className={addInputCls}
                  />
                </div>
              </div>
            )}

            {/* ---------- Step 3: School Education ---------- */}
            {addFormStep === 3 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className={addLabelCls}>School Name</label>
                  <input
                    type="text"
                    value={newAlumnus.school_name || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, school_name: e.target.value })}
                    placeholder="e.g. Natarajan Higher Secondary School"
                    className={addInputCls}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>Joining Year</label>
                    <select
                      value={newAlumnus.joining_year ?? ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, joining_year: e.target.value ? Number(e.target.value) : undefined })}
                      className={addInputCls}
                    >
                      <option value="">Select Year</option>
                      {availableBatches.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={addLabelCls}>Passing Year *</label>
                    <select
                      value={newAlumnus.passing_year ?? ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, passing_year: e.target.value ? Number(e.target.value) : undefined })}
                      className={addInputCls + ' font-bold text-[#854D0E]'}
                    >
                      <option value="">Select Year</option>
                      {availableBatches.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={addLabelCls}>Leaving Class</label>
                    <input
                      type="text"
                      value={newAlumnus.leaving_class || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, leaving_class: e.target.value })}
                      placeholder="e.g. 10th / 12th"
                      className={addInputCls + ' text-center'}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>Admission / Roll No</label>
                    <input
                      type="text"
                      value={newAlumnus.admission_number || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, admission_number: e.target.value })}
                      placeholder="e.g. ADM-2010-045"
                      className={addInputCls + ' font-mono'}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>Section</label>
                    <input
                      type="text"
                      value={newAlumnus.section || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, section: e.target.value })}
                      placeholder="A"
                      className={addInputCls + ' text-center uppercase'}
                    />
                  </div>
                </div>

                <div>
                  <label className={addLabelCls}>No Higher Education</label>
                  <select
                    value={newAlumnus.no_higher_education || 'NO'}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, no_higher_education: e.target.value })}
                    className={addInputCls + ' font-bold'}
                  >
                    <option value="NO">NO — Has higher education</option>
                    <option value="YES">YES — No higher education</option>
                  </select>
                </div>
              </div>
            )}

            {/* ---------- Step 4: Higher Education ---------- */}
            {addFormStep === 4 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className={addLabelCls}>College Name</label>
                  <input
                    type="text"
                    value={newAlumnus.college_name || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, college_name: e.target.value })}
                    placeholder="e.g. Anna University"
                    className={addInputCls}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>Degree / Course</label>
                    <input
                      type="text"
                      value={newAlumnus.degree || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, degree: e.target.value })}
                      placeholder="e.g. B.E. / B.Sc. / MBA"
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>Custom Degree</label>
                    <input
                      type="text"
                      value={newAlumnus.custom_degree || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, custom_degree: e.target.value })}
                      placeholder="If degree is 'Other'"
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>Department / Stream</label>
                    <input
                      type="text"
                      value={newAlumnus.department || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, department: e.target.value })}
                      placeholder="e.g. Computer Science"
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>College Register No</label>
                    <input
                      type="text"
                      value={newAlumnus.college_register_no || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, college_register_no: e.target.value })}
                      placeholder="e.g. 710015104001"
                      className={addInputCls + ' font-mono'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>College Joining Year</label>
                    <select
                      value={newAlumnus.college_joining_year ?? ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, college_joining_year: e.target.value ? Number(e.target.value) : undefined })}
                      className={addInputCls}
                    >
                      <option value="">Select Year</option>
                      {availableBatches.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={addLabelCls}>College Passing Year</label>
                    <select
                      value={newAlumnus.college_passing_year ?? ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, college_passing_year: e.target.value ? Number(e.target.value) : undefined })}
                      className={addInputCls}
                    >
                      <option value="">Select Year</option>
                      {availableBatches.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- Step 5: Professional & Social ---------- */}
            {addFormStep === 5 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>Employment Status</label>
                    <input
                      type="text"
                      value={newAlumnus.employment_status || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, employment_status: e.target.value })}
                      placeholder="e.g. Employed / Business"
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>Company Name</label>
                    <input
                      type="text"
                      value={newAlumnus.company_name || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, company_name: e.target.value })}
                      placeholder="e.g. TCS / Google"
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>Designation / Position</label>
                    <input
                      type="text"
                      value={newAlumnus.profession || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, profession: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>Industry</label>
                    <input
                      type="text"
                      value={newAlumnus.industry || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, industry: e.target.value })}
                      placeholder="e.g. Information Technology"
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>Total Experience</label>
                    <input
                      type="text"
                      value={newAlumnus.total_experience || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, total_experience: e.target.value })}
                      placeholder="e.g. 5 years"
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>Skills & Expertise</label>
                    <input
                      type="text"
                      value={Array.isArray(newAlumnus.skills) ? (newAlumnus.skills as string[]).join(', ') : (newAlumnus.skills as any) || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="Comma-separated: Python, React, Sales"
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>LinkedIn URL</label>
                    <input
                      type="url"
                      value={newAlumnus.linkedin_url || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className={addInputCls + ' font-mono text-blue-700'}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>Instagram URL</label>
                    <input
                      type="url"
                      value={newAlumnus.instagram_url || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className={addInputCls + ' font-mono text-pink-700'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>WhatsApp Number</label>
                    <input
                      type="text"
                      value={newAlumnus.whatsapp_number || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, whatsapp_number: e.target.value })}
                      placeholder="+919876543210"
                      className={addInputCls + ' font-mono text-emerald-800'}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>Website URL</label>
                    <input
                      type="url"
                      value={newAlumnus.website_url || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, website_url: e.target.value })}
                      placeholder="https://yourwebsite.com"
                      className={addInputCls + ' font-mono'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className={addLabelCls}>Volunteer</label>
                    <select
                      value={newAlumnus.is_volunteer || 'NO'}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, is_volunteer: e.target.value })}
                      className={addInputCls + ' font-bold'}
                    >
                      <option value="NO">NO</option>
                      <option value="YES">YES</option>
                    </select>
                  </div>
                  <div>
                    <label className={addLabelCls}>Willing to Donate</label>
                    <select
                      value={newAlumnus.willing_to_donate || 'NO'}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, willing_to_donate: e.target.value })}
                      className={addInputCls + ' font-bold'}
                    >
                      <option value="NO">NO</option>
                      <option value="YES">YES</option>
                    </select>
                  </div>
                  <div>
                    <label className={addLabelCls}>Verification Status</label>
                    <select
                      value={newAlumnus.verification_status || 'APPROVED'}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, verification_status: e.target.value as any })}
                      className={addInputCls + ' font-bold uppercase'}
                    >
                      <option value="APPROVED">APPROVED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- Navigation Buttons ---------- */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}
                >
                  Cancel
                </Button>
                {addFormStep > 1 && (
                  <Button type="button" variant="secondary" onClick={goToPrevAddStep}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {addFormStep < ADD_FORM_TOTAL_STEPS ? (
                  <Button type="button" onClick={goToNextAddStep} className="font-bold">
                    Next <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" isLoading={isAdding} className="font-bold">
                    Create Alumni Profile
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* CSV IMPORT MODAL */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Alumni School Roster via CSV">
        <form onSubmit={handleCSVUploadSubmit} className="space-y-4 text-xs font-medium">
          <div className="p-4 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-2xl text-[#854D0E] space-y-1.5">
            <div className="font-extrabold text-sm">Full 44-Field Spreadsheet Bulk Edit & Import:</div>
            <div className="space-y-1">
              <div>• <strong>All 44 Fields Supported:</strong> Personal details, School details, Higher Education (College/Degree), Employment, and Social links can be edited in bulk.</div>
              <div>• <strong>Safe in Excel / Google Sheets:</strong> IDs and Mobile numbers are formatted to prevent scientific notation corruption.</div>
              <div>• <strong>Update Existing Records:</strong> Keep the <strong>Alumni ID</strong> column intact — the system will update only your modified cells.</div>
              <div>• <strong>Add New Records:</strong> Any row without an <strong>Alumni ID</strong> will be created as a new record (requires Full Name and Passing Year).</div>
              <div>• <strong>Partial Edits:</strong> Leave an existing cell unchanged or blank to retain its current database value. Enter <code>__CLEAR__</code> to explicitly clear a field.</div>
            </div>
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            required
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl cursor-pointer"
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={uploading}>
              Start Roster Import
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};