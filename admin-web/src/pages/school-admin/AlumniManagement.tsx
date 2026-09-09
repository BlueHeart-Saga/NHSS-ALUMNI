import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, Download, Upload, UserX, CheckCircle2, Trash2, Plus, 
  Table as TableIcon, Edit3, Save, RefreshCw, X, ShieldCheck, Clock, AlertCircle,
  Users, HandHeart, Heart, Droplet, Layers, CheckSquare, Square, Filter
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { TableSkeleton } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { AlumniProfile } from '../../types';

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

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Add Single/Bulk Alumnus Form State
  const [newAlumnus, setNewAlumnus] = useState<Partial<AlumniProfile>>({
    full_name: '',
    passing_year: new Date().getFullYear(),
    section: 'A',
    admission_number: '',
    mobile: '',
    email: '',
    blood_group: '',
    is_volunteer: 'NO',
    willing_to_donate: 'NO',
    verification_status: 'APPROVED'
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
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

  // Inline Sheet Cell Change Handler
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

    // Optimistically update UI state
    setAlumniList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );

    // Track in unsaved editedRows
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
      fetchAlumni();
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
      fetchAlumni();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to update alumni status.');
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
      fetchAlumni();
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
      fetchAlumni();
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
      fetchAlumni();
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
      fetchAlumni();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to delete selected alumni.');
    }
  };

  // Add Single Alumnus Submission
  const handleCreateAlumnus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlumnus.full_name || !newAlumnus.passing_year) {
      alertService.showError('Required Fields Missing', 'Please enter Full Name and Batch Year.');
      return;
    }

    setIsAdding(true);
    try {
      await api.register({
        ...newAlumnus,
        passing_year: Number(newAlumnus.passing_year)
      });
      alertService.showSuccess('Alumni Profile Created', `New alumni profile for ${newAlumnus.full_name} added.`);
      setIsAddModalOpen(false);
      setNewAlumnus({
        full_name: '',
        passing_year: new Date().getFullYear(),
        section: 'A',
        admission_number: '',
        mobile: '',
        email: '',
        blood_group: '',
        is_volunteer: 'NO',
        willing_to_donate: 'NO',
        verification_status: 'APPROVED'
      });
      fetchAlumni();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to create alumni record.');
    } finally {
      setIsAdding(false);
    }
  };

  // CSV Roster Upload Submission
  const handleCSVUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploading(true);
    try {
      const res = await api.importCSV(csvFile);
      alertService.showSuccess(
        'CSV Roster Import Complete',
        `Successfully processed ${res.total_rows} roster records (${res.imported + res.matched_and_approved} approved/matched).`
      );
      setIsImportModalOpen(false);
      fetchAlumni();
    } catch (err: any) {
      alertService.handleApiError(err, 'CSV roster upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Complete Batch List (1962–2026)
  const currentYear = new Date().getFullYear();
  const availableBatches = Array.from({ length: currentYear - 1962 + 1 }, (_, i) => currentYear - i);
  const editedCount = Object.keys(editedRows).length;

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
            onClick={fetchAlumni}
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

          <Button variant="secondary" onClick={() => setIsAddModalOpen(true)} className="text-xs font-bold">
            <Plus className="w-4 h-4 mr-1" />
            Add Alumnus
          </Button>

          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="text-xs font-bold">
            <Upload className="w-4 h-4 mr-1" />
            Import CSV
          </Button>

          <a
            href={api.getAlumniCSVExportUrl()}
            download
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold text-xs rounded-xl transition-all border border-[#E0B030] shadow-2xs"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </a>
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
          {/* Search text */}
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

          {/* Filter Batch */}
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

          {/* Filter Status */}
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

          {/* Filter Blood Group */}
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

          {/* Filter Volunteer */}
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
                    <th className="py-3.5 px-4">Alumnus Profile</th>
                    <th className="py-3.5 px-4">Batch & Section</th>
                    <th className="py-3.5 px-4">Contact Information</th>
                    <th className="py-3.5 px-4">Blood Group</th>
                    <th className="py-3.5 px-4">Volunteer</th>
                    <th className="py-3.5 px-4">Willing Donor</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 font-medium">
                  {displayedAlumni.length > 0 ? (
                    displayedAlumni.map((a) => {
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
                            {a.verification_status === 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleSingleSuspend(a.id)}
                                className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}

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
                      <td colSpan={9} className="py-10 text-center text-gray-500 font-bold">
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
              <span>Full Spreadsheet Editor — All 39 Fields Editable Directly Below</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-amber-300 font-mono">{displayedAlumni.length} Rows Rendered</span>
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

          <div className="overflow-x-auto max-h-[75vh]">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead className="sticky top-0 bg-gray-100 border-b border-gray-300 text-[11px] font-extrabold uppercase text-gray-700 z-10 shadow-sm">
                <tr>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[170px]">Full Name</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[150px]">Name in Tamil</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">Mobile Number</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[90px]">Country Code</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[100px]">Gender</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">Date of Birth</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[100px]">Blood Group</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[150px]">Father Name</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[150px]">Mother Name</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">Current City</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">Current State</th>
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
                {displayedAlumni.map((a) => {
                  const draft = editedRows[a.id] || {};
                  
                  const getValue = (field: keyof AlumniProfile, defaultVal: any = '') => {
                    return draft[field] !== undefined ? draft[field] : (a[field] !== undefined && a[field] !== null ? a[field] : defaultVal);
                  };

                  const isRowEdited = Boolean(editedRows[a.id]);

                  return (
                    <tr key={a.id} className={isRowEdited ? 'bg-amber-50/80 hover:bg-amber-100/80 transition-colors' : 'hover:bg-gray-50 transition-colors'}>
                      {/* 1. Full Name */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('full_name')}
                          onChange={(e) => handleCellEdit(a.id, 'full_name', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-bold text-[#111111]"
                        />
                      </td>

                      {/* 2. Name in Tamil */}
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

                      {/* 3. Mobile Number */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('mobile')}
                          onChange={(e) => handleCellEdit(a.id, 'mobile', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono"
                        />
                      </td>

                      {/* 4. Country Code */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('country_code', '91')}
                          onChange={(e) => handleCellEdit(a.id, 'country_code', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center font-semibold"
                        />
                      </td>

                      {/* 5. Gender */}
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

                      {/* 6. Date of Birth */}
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

                      {/* 7. Blood Group */}
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

                      {/* 8. Father Name */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('father_name')}
                          onChange={(e) => handleCellEdit(a.id, 'father_name', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      {/* 9. Mother Name */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('mother_name')}
                          onChange={(e) => handleCellEdit(a.id, 'mother_name', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      {/* 10. Current City */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('current_city')}
                          onChange={(e) => handleCellEdit(a.id, 'current_city', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-medium"
                        />
                      </td>

                      {/* 12. Current State */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('current_state') || getValue('state', 'Tamil Nadu')}
                          onChange={(e) => handleCellEdit(a.id, 'current_state', e.target.value, 'state')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      {/* 13. Country */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('country', 'India')}
                          onChange={(e) => handleCellEdit(a.id, 'country', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      {/* 14. School Name */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('school_name', 'Natarajan Higher Secondary School')}
                          onChange={(e) => handleCellEdit(a.id, 'school_name', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      {/* 15. Joining Year */}
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

                      {/* 16. Passing Year */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={getValue('passing_year')}
                          onChange={(e) => handleCellEdit(a.id, 'passing_year', Number(e.target.value))}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-extrabold text-[#854D0E] text-center"
                        />
                      </td>

                      {/* 17. Leaving Class */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('leaving_class')}
                          onChange={(e) => handleCellEdit(a.id, 'leaving_class', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center font-bold"
                        />
                      </td>

                      {/* 18. Admission/Roll No */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('admission_number') || getValue('roll_no')}
                          onChange={(e) => handleCellEdit(a.id, 'admission_number', e.target.value, 'roll_no')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono"
                        />
                      </td>

                      {/* 19. Section */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('section')}
                          onChange={(e) => handleCellEdit(a.id, 'section', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center font-semibold uppercase"
                        />
                      </td>

                      {/* 20. No Higher Education */}
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

                      {/* 21. College Name */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('college_name') || getValue('institution_name')}
                          onChange={(e) => handleCellEdit(a.id, 'college_name', e.target.value, 'institution_name')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      {/* 22. Degree/Course */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('degree')}
                          onChange={(e) => handleCellEdit(a.id, 'degree', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-semibold"
                        />
                      </td>

                      {/* 23. Custom Degree */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('custom_degree')}
                          onChange={(e) => handleCellEdit(a.id, 'custom_degree', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      {/* 24. Department/Stream */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('department') || getValue('stream')}
                          onChange={(e) => handleCellEdit(a.id, 'department', e.target.value, 'stream')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      {/* 25. College Register No */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('college_register_no')}
                          onChange={(e) => handleCellEdit(a.id, 'college_register_no', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono"
                        />
                      </td>

                      {/* 26. College Joining Year */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={getValue('college_joining_year')}
                          onChange={(e) => handleCellEdit(a.id, 'college_joining_year', e.target.value ? Number(e.target.value) : undefined)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center"
                        />
                      </td>

                      {/* 27. College Passing Year */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={getValue('college_passing_year')}
                          onChange={(e) => handleCellEdit(a.id, 'college_passing_year', e.target.value ? Number(e.target.value) : undefined)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center"
                        />
                      </td>

                      {/* 28. Employment Status */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('employment_status')}
                          onChange={(e) => handleCellEdit(a.id, 'employment_status', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      {/* 29. Company Name */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('company_name') || getValue('company')}
                          onChange={(e) => handleCellEdit(a.id, 'company_name', e.target.value, 'company')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-medium"
                        />
                      </td>

                      {/* 30. Designation / Position */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('profession') || getValue('designation')}
                          onChange={(e) => handleCellEdit(a.id, 'profession', e.target.value, 'designation')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-bold"
                        />
                      </td>

                      {/* 31. Industry */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('industry')}
                          onChange={(e) => handleCellEdit(a.id, 'industry', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white"
                        />
                      </td>

                      {/* 32. Total Experience */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('total_experience') || getValue('experience_years')}
                          onChange={(e) => handleCellEdit(a.id, 'total_experience', e.target.value, 'experience_years')}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-center"
                        />
                      </td>

                      {/* 33. Skills & Expertise */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={Array.isArray(getValue('skills')) ? (getValue('skills') as string[]).join(', ') : (getValue('skills') || '')}
                          onChange={(e) => handleCellEdit(a.id, 'skills', e.target.value.split(',').map(s => s.trim()))}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white text-xs"
                        />
                      </td>

                      {/* 34. LinkedIn Profile URL */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="url"
                          value={getValue('linkedin_url')}
                          onChange={(e) => handleCellEdit(a.id, 'linkedin_url', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-[11px] text-blue-700"
                        />
                      </td>

                      {/* 35. Instagram Profile URL */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="url"
                          value={getValue('instagram_url')}
                          onChange={(e) => handleCellEdit(a.id, 'instagram_url', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-[11px] text-pink-700"
                        />
                      </td>

                      {/* 36. WhatsApp Number */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('whatsapp_number') || getValue('mobile')}
                          onChange={(e) => handleCellEdit(a.id, 'whatsapp_number', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-emerald-800"
                        />
                      </td>

                      {/* 37. Personal/Company Website */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="url"
                          value={getValue('website_url')}
                          onChange={(e) => handleCellEdit(a.id, 'website_url', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-[11px]"
                        />
                      </td>

                      {/* 38. Profile Photo URL */}
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('profile_photo_url')}
                          onChange={(e) => handleCellEdit(a.id, 'profile_photo_url', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-[11px]"
                        />
                      </td>

                      {/* 39. Verification Status */}
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

                      {/* Sticky Action Cell */}
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
        </div>
      )}

      {/* ADD ALUMNUS MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Alumni Profile">
        <form onSubmit={handleCreateAlumnus} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-[#111111] mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newAlumnus.full_name}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, full_name: e.target.value })}
                placeholder="e.g. S. Ramanathan"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1">Passing Batch Year *</label>
              <select
                value={newAlumnus.passing_year}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, passing_year: Number(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none font-bold"
              >
                {availableBatches.map((y) => (
                  <option key={y} value={y}>Batch of {y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1">Section</label>
              <input
                type="text"
                value={newAlumnus.section}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, section: e.target.value })}
                placeholder="e.g. A"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1">Admission Number</label>
              <input
                type="text"
                value={newAlumnus.admission_number}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, admission_number: e.target.value })}
                placeholder="e.g. ADM-2010-045"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1">Mobile Number</label>
              <input
                type="text"
                value={newAlumnus.mobile}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, mobile: e.target.value })}
                placeholder="e.g. +91 9876543210"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#111111] mb-1">Email Address</label>
              <input
                type="email"
                value={newAlumnus.email}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, email: e.target.value })}
                placeholder="e.g. alumni@example.com"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1">Blood Group</label>
              <select
                value={newAlumnus.blood_group}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, blood_group: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none font-bold text-rose-700"
              >
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg} Blood Group</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1">Volunteer Willingness</label>
              <select
                value={newAlumnus.is_volunteer}
                onChange={(e) => setNewAlumnus({ ...newAlumnus, is_volunteer: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none font-bold"
              >
                <option value="NO">NO</option>
                <option value="YES">VOLUNTEER (YES)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isAdding}>
              Create Alumni Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV IMPORT MODAL */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Alumni School Roster via CSV">
        <form onSubmit={handleCSVUploadSubmit} className="space-y-4 text-xs font-medium">
          <div className="p-4 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-2xl text-[#854D0E] space-y-1">
            <div className="font-extrabold">CSV File Formatting Guidelines:</div>
            <div>Columns: <strong>Name, Batch, Admission Number, Section, Mobile, Email, Blood Group, Profession, City</strong></div>
            <div>Matching pending user registrations will be automatically auto-verified and granted portal access.</div>
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
