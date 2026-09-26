import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  Search, Download, Upload, UserX, CheckCircle2, Trash2, Plus, 
  Table as TableIcon, Edit3, Save, RefreshCw, X, ShieldCheck, Clock, AlertCircle,
  Users, HandHeart, Heart, Droplet, Layers, CheckSquare, Square, Filter,
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Send, FileSpreadsheet,
  ArrowDownUp
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { TableSkeleton } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { AlumniProfile, Batch } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

const ADD_FORM_TOTAL_STEPS = 5;

// ---------------------------------------------------------------------------
// Sort options for the Alumni Directory.
//
// IMPORTANT: the `value` (SortKey) drives the actual sort logic and must NEVER
// change based on language. Only the `labelKey` is translated, and the display
// label is resolved at render time via t(labelKey).
// ---------------------------------------------------------------------------
type SortKey = 'batch_asc' | 'batch_desc' | 'name_asc' | 'name_desc';

const SORT_OPTIONS: { value: SortKey; labelKey: string }[] = [
  { value: 'batch_asc',  labelKey: 'admin_sort_batch_asc' },
  { value: 'batch_desc', labelKey: 'admin_sort_batch_desc' },
  { value: 'name_asc',   labelKey: 'admin_sort_name_asc' },
  { value: 'name_desc',  labelKey: 'admin_sort_name_desc' },
];

// Safely coerce a `passing_year` value (number | string | null | undefined)
// to an integer year. Returns `null` when the value is missing or invalid so
// the caller can place it deterministically at the end of the sorted list.
const parseBatchYear = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/\d{4}/);
    if (match) {
      const n = Number(match[0]);
      if (Number.isFinite(n)) return n;
    }
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return null;
};
/**
 * Normalize a date-of-birth value from ANY source format into the
 * ISO "YYYY-MM-DD" string that HTML <input type="date"> requires.
 *
 * Handles:
 *   - "YYYY-MM-DD" (already correct)  → returned as-is
 *   - "DD-MM-YYYY"                    → converted
 *   - "DD/MM/YYYY"                    → converted
 *   - "MM/DD/YYYY" (if month > 12)    → converted
 *   - "YYYY/MM/DD"                    → converted
 *   - Date object / ISO datetime      → sliced
 *   - ""  / null / undefined          → returns ""
 */
const normalizeDobForInput = (raw: unknown): string => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';

  // Already ISO?
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  // DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmy = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const dd = d.padStart(2, '0');
    const mm = m.padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  // YYYY/MM/DD
  const ymd = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Fallback: try JS Date parsing (handles ISO strings with time)
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return ''; // unrecognizable → blank field
};

export const AlumniManagement: React.FC = () => {
  const { t, language } = useLanguage();

  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [batchYear, setBatchYear] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [volunteerFilter, setVolunteerFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('batch_asc');

  // Mode: 'table' vs 'sheet'
  const [viewMode, setViewMode] = useState<'table' | 'sheet'>('table');

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sheet Edit Tracking State (map of id -> partial profile changes)
  const [editedRows, setEditedRows] = useState<Record<string, Partial<AlumniProfile>>>({});
  const [savingSheet, setSavingSheet] = useState(false);

  // Per-row photo-upload loading indicator (key = alumni id)
  const [photoUploadingIds, setPhotoUploadingIds] = useState<Set<string>>(new Set());

  // Table & Sheet horizontal scroll container refs & helpers
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollTable = (offset: number) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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

  // ✅ NEW: Edit-mode tracking. When null → Add mode. When set → Edit mode.
  const [editingAlumnusId, setEditingAlumnusId] = useState<string | null>(null);

  // Suspend modal state
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendTargetId, setSuspendTargetId] = useState<string>('');
  const [suspendTargetName, setSuspendTargetName] = useState<string>('');
  const [suspendReason, setSuspendReason] = useState<string>('');
  const [suspending, setSuspending] = useState(false);
  const [suspendValidationError, setSuspendValidationError] = useState<string>('');

  // Change Batch modal state
  const [isChangeBatchModalOpen, setIsChangeBatchModalOpen] = useState(false);
  const [changeBatchTargets, setChangeBatchTargets] = useState<AlumniProfile[]>([]);
  const [fetchedBatchesList, setFetchedBatchesList] = useState<Batch[]>([]);
  const [batchMigrateYear, setBatchMigrateYear] = useState<number>(2026);
  const [batchMigrateSection, setBatchMigrateSection] = useState<string>('A');
  const [batchMigrateReason, setBatchMigrateReason] = useState<string>('');
  const [batchMigrating, setBatchMigrating] = useState(false);

  const openChangeBatchForSingle = (alumni: AlumniProfile) => {
    setChangeBatchTargets([alumni]);
    const defaultYear = alumni.passing_year || (fetchedBatchesList[0]?.passing_year || 2026);
    setBatchMigrateYear(defaultYear);
    setBatchMigrateReason('');
    setIsChangeBatchModalOpen(true);
  };

  const openChangeBatchForSelected = () => {
    const targets = alumniList.filter((a) => selectedIds.has(a.id));
    if (targets.length === 0) return;
    setChangeBatchTargets(targets);
    const defaultYear = targets[0].passing_year || (fetchedBatchesList[0]?.passing_year || 2026);
    setBatchMigrateYear(defaultYear);
    setBatchMigrateSection('A');
    setBatchMigrateReason('');
    setIsChangeBatchModalOpen(true);
  };

  const handleChangeBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changeBatchTargets.length === 0) return;

    setBatchMigrating(true);
    try {
      const targetIds = changeBatchTargets.map((t) => t.id);
      await api.changeAlumniBatch(
        targetIds,
        batchMigrateYear,
        batchMigrateSection,
        batchMigrateReason
      );
      alertService.showSuccess(
        t('admin_change_batch_success_title'),
        t('admin_change_batch_success_msg')
          .replace('{count}', String(targetIds.length))
          .replace('{year}', String(batchMigrateYear))
      );
      setIsChangeBatchModalOpen(false);
      setChangeBatchTargets([]);
      setSelectedIds(new Set());
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_change_batch_error'));
    } finally {
      setBatchMigrating(false);
    }
  };

  // Add-form photo upload state (for the wizard's Step 1)
  const [addFormPhotoUploading, setAddFormPhotoUploading] = useState(false);

  // Paginated Add form step (1..5)
  const [addFormStep, setAddFormStep] = useState<number>(1);

  // Export CSV & Excel states
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [importSummaryModalOpen, setImportSummaryModalOpen] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<any | null>(null);

  // Add Single/Bulk Alumnus Form State — now includes ALL fields
  const [newAlumnus, setNewAlumnus] = useState<Partial<AlumniProfile>>({
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
    linkedin_url: '',
    instagram_url: '',
    whatsapp_number: '',
    is_volunteer: 'NO',
    willing_to_donate: 'NO',
    verification_status: 'APPROVED',
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchAlumni();
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const data = await api.getBatches();
      setFetchedBatchesList(data || []);
    } catch (err) {
      console.error('Failed to fetch batches list:', err);
    }
  };

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

  const displayedAlumni = useMemo(() => {
    const filtered = alumniList.filter((a) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        (a.full_name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.mobile || '').includes(q) ||
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

    const sorted = filtered.slice();

    switch (sortBy) {
      case 'batch_asc': {
        sorted.sort((a, b) => {
          const ya = parseBatchYear(a.passing_year);
          const yb = parseBatchYear(b.passing_year);
          if (ya === null && yb === null) return 0;
          if (ya === null) return 1;
          if (yb === null) return -1;
          if (ya !== yb) return ya - yb;
          return (a.full_name || '').localeCompare(b.full_name || '', undefined, { sensitivity: 'base' });
        });
        break;
      }
      case 'batch_desc': {
        sorted.sort((a, b) => {
          const ya = parseBatchYear(a.passing_year);
          const yb = parseBatchYear(b.passing_year);
          if (ya === null && yb === null) return 0;
          if (ya === null) return 1;
          if (yb === null) return -1;
          if (ya !== yb) return yb - ya;
          return (a.full_name || '').localeCompare(b.full_name || '', undefined, { sensitivity: 'base' });
        });
        break;
      }
      case 'name_asc': {
        sorted.sort((a, b) =>
          (a.full_name || '').localeCompare(b.full_name || '', undefined, { sensitivity: 'base' })
        );
        break;
      }
      case 'name_desc': {
        sorted.sort((a, b) =>
          (b.full_name || '').localeCompare(a.full_name || '', undefined, { sensitivity: 'base' })
        );
        break;
      }
      default:
        break;
    }

    return sorted;
  }, [alumniList, search, batchYear, statusFilter, bloodGroupFilter, volunteerFilter, sortBy]);

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

  const handleSheetPhotoUpload = async (
    alumniId: string,
    file: File
  ) => {
    if (!file.type.startsWith('image/')) {
      alertService.showWarning(
        'Invalid File Type',
        'Please select a valid image file (JPG, PNG, WEBP, etc.).'
      );
      return;
    }

    setPhotoUploadingIds((prev) => {
      const next = new Set(prev);
      next.add(alumniId);
      return next;
    });

    try {
      const res = await api.uploadSchoolImage(file);
      const newUrl = res.url || res.image_url || '';

      if (!newUrl) {
        throw new Error('Upload succeeded but no URL was returned.');
      }

      handleCellEdit(alumniId, 'profile_photo_url', newUrl);

      try {
        await api.updateAlumniAdmin(alumniId, { profile_photo_url: newUrl });
        setEditedRows((prev) => {
          const next = { ...prev };
          if (next[alumniId]) {
            const remaining = { ...next[alumniId] };
            delete (remaining as any).profile_photo_url;
            if (Object.keys(remaining).length === 0) {
              delete next[alumniId];
            } else {
              next[alumniId] = remaining;
            }
          }
          return next;
        });
      } catch (saveErr: any) {
        console.error('Photo uploaded but failed to persist to alumni record:', saveErr);
        alertService.showWarning(
          'Photo Uploaded, Not Yet Saved',
          'The image was uploaded but could not be linked to the alumni record. Click "Save Edited Row(s)" to retry.'
        );
      }

      alertService.showSuccess('Photo Updated', 'Profile photo uploaded successfully.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to upload profile photo.');
    } finally {
      setPhotoUploadingIds((prev) => {
        const next = new Set(prev);
        next.delete(alumniId);
        return next;
      });
    }
  };

  const handleAddFormPhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alertService.showWarning(
        'Invalid File Type',
        'Please select a valid image file (JPG, PNG, WEBP, etc.).'
      );
      return;
    }

    setAddFormPhotoUploading(true);
    try {
      const res = await api.uploadSchoolImage(file);
      const newUrl = res.url || res.image_url || '';
      if (!newUrl) throw new Error('Upload succeeded but no URL was returned.');

      setNewAlumnus((prev) => ({ ...prev, profile_photo_url: newUrl }));
      alertService.showSuccess('Photo Uploaded', 'Profile photo uploaded successfully.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to upload profile photo.');
    } finally {
      setAddFormPhotoUploading(false);
    }
  };

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

  const handleOpenSuspendModal = (id: string, name: string) => {
    setSuspendTargetId(id);
    setSuspendTargetName(name);
    setSuspendReason('');
    setSuspendValidationError('');
    setIsSuspendModalOpen(true);
  };

  const handleCloseSuspendModal = () => {
    if (suspending) return;
    setIsSuspendModalOpen(false);
    setSuspendTargetId('');
    setSuspendTargetName('');
    setSuspendReason('');
    setSuspendValidationError('');
  };

  const handleSubmitSuspend = async () => {
    const trimmedReason = suspendReason.trim();
    if (!trimmedReason) {
      setSuspendValidationError(t('admin_suspend_reason_required'));
      return;
    }
    if (suspending) return;
    setSuspendValidationError('');
    setSuspending(true);

    try {
      const res: any = await api.verifyAlumni(suspendTargetId, 'SUSPENDED', trimmedReason);

      const emailSent = Boolean(res?.email_sent);
      const emailMissing = Boolean(res?.email_missing);

      if (emailSent) {
        alertService.showSuccess(
          'Alumni Suspended',
          `"${suspendTargetName}" has been suspended. Notification email sent.`
        );
      } else if (emailMissing) {
        alertService.showWarning(
          'Suspended — Email Missing',
          `"${suspendTargetName}" has been suspended successfully, but notification email could not be sent because no email address is available.`
        );
      } else {
        alertService.showWarning(
          'Suspended — Email Failed',
          `"${suspendTargetName}" has been suspended successfully, but the notification email could not be sent.`
        );
      }

      setIsSuspendModalOpen(false);
      setSuspendTargetId('');
      setSuspendTargetName('');
      setSuspendReason('');
      setSuspendValidationError('');
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to suspend alumni.');
    } finally {
      setSuspending(false);
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

  // ✅ NEW: Opens the existing 5-step wizard pre-filled with the selected alumnus.
  //    Sets editingAlumnusId so the submit handler routes to updateAlumniAdmin.
  const handleOpenEditModal = (alumnus: AlumniProfile) => {
  setEditingAlumnusId(alumnus.id);
  // Pre-fill every field with the existing record.
  // ✅ Normalize DOB so <input type="date"> accepts it (HTML requires YYYY-MM-DD).
  setNewAlumnus({
    ...alumnus,
    date_of_birth: normalizeDobForInput(alumnus.date_of_birth || alumnus.dob),
  });
  setAddFormStep(1);
  setIsAddModalOpen(true);
};

  const handleSendInvitation = async (id: string, name: string, mobile: string) => {
    const confirmed = await alertService.showConfirm(
      'Send Account Invitation?',
      `Send an SMS invitation link to "${name}" (${mobile}) to activate their account and set their password?`,
      'Send Invitation',
      'Cancel'
    );
    if (!confirmed) return;

    try {
      const res = await api.sendAlumniInvitation(id);
      alertService.showSuccess('Invitation Sent', res.message || `SMS invitation sent to ${mobile}.`);
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to send account invitation.');
    }
  };

  const handleBulkSendInvitations = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const confirmed = await alertService.showConfirm(
      'Bulk Send Account Invitations?',
      `Send SMS invitation links to ${ids.length} selected alumni to verify their mobile numbers and create passwords?`,
      'Send Invitations',
      'Cancel'
    );
    if (!confirmed) return;

    try {
      const res = await api.bulkSendAlumniInvitations(ids);
      alertService.showSuccess('Invitations Dispatched', res.message || `Sent ${res.sent || ids.length} invitations.`);
      setSelectedIds(new Set());
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to dispatch bulk invitations.');
    }
  };

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
      linkedin_url: '',
      instagram_url: '',
      whatsapp_number: '',
      is_volunteer: 'NO',
      willing_to_donate: 'NO',
      verification_status: 'APPROVED',
    });
    setAddFormStep(1);
    // ✅ NEW: Clear edit mode when the wizard is reset.
    setEditingAlumnusId(null);
  };

  const validateAddStep = (step: number): string[] => {
    const missing: string[] = [];
    if (step === 1) {
      if (!newAlumnus.full_name || !String(newAlumnus.full_name).trim()) missing.push('Full Name');
      if (!newAlumnus.gender) missing.push('Gender');
      if (!newAlumnus.date_of_birth) missing.push('Date of Birth');
    }
    if (step === 2) {
      if (!newAlumnus.mobile || !String(newAlumnus.mobile).trim()) missing.push('Mobile Number');
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

  const handleCreateAlumnus = async (e: React.FormEvent) => {
    e.preventDefault();

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

      // ✅ NEW: Route to UPDATE when editing an existing record, otherwise CREATE.
      if (editingAlumnusId) {
        await api.updateAlumniAdmin(editingAlumnusId, payload);
        alertService.showSuccess(
          t('admin_edit_success_body'),
          `Changes for ${newAlumnus.full_name} have been saved.`
        );
      } else {
        await api.adminCreateAlumni(payload);
        alertService.showSuccess(
          'Alumni Profile Created',
          `New alumni profile for ${newAlumnus.full_name} added. You can now send them an account activation invitation.`
        );
      }

      setIsAddModalOpen(false);
      resetAddForm();
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, editingAlumnusId ? 'Failed to update alumni record.' : 'Failed to create alumni record.');
    } finally {
      setIsAdding(false);
    }
  };

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
      setLastImportResult(res);
      setImportSummaryModalOpen(true);
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'CSV roster upload failed.');
    } finally {
      setUploading(false);
    }
  };

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

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await api.exportAlumniExcel();
      alertService.showSuccess('Export Complete', 'Alumni roster Excel spreadsheet (.xlsx) has been downloaded.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to export alumni Excel spreadsheet.');
    } finally {
      setExportingExcel(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const availableBatches = Array.from({ length: currentYear - 1962 + 1 }, (_, i) => currentYear - i);
  const editedCount = Object.keys(editedRows).length;

  const addInputCls = "w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none text-xs font-medium";
  const addLabelCls = "block font-bold text-[#111111] mb-1 text-xs";

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-[#111111] pb-12">
      {/* Header Title & Top Controls */}
      <div className="space-y-4">
        <div className="w-full">
          <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            {t('admin_alumni_mgmt_title')}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {t('admin_alumni_mgmt_subtitle')}
          </p>
        </div>

        {/* Action Button Row — Two Groups */}
        <div className={`flex flex-wrap items-center gap-2 ${language === 'en' ? 'w-full justify-between' : ''}`}>
          {/* ============ LEFT GROUP ============ */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fetchAlumni(true)}
              disabled={loading}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-gray-300 flex items-center justify-center shadow-2xs"
              title={t('admin_refresh_roster')}
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
                <span>{t('admin_view_standard_table')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('sheet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === 'sheet' ? 'bg-[#111111] text-white shadow-2xs' : 'text-gray-600 hover:text-[#111111]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('admin_view_editable_sheet')}</span>
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
              {t('admin_btn_add_new_alumni')}
            </Button>
          </div>

          {/* ============ RIGHT GROUP ============ */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="text-xs font-bold" title={t('admin_btn_import_roster')}>
              <Upload className="w-4 h-4 mr-1" />
              {t('admin_btn_import_roster')}
            </Button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all border border-emerald-600 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title={t('admin_btn_export_excel')}
            >
              {exportingExcel ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  {t('admin_btn_exporting_excel')}
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  {t('admin_btn_export_excel')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (When Rows Selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-2 text-xs font-extrabold">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>{selectedIds.size} {t('admin_bulk_selected_count')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBulkSendInvitations}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
              title={t('admin_bulk_send_invitation')}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('admin_bulk_send_invitation')} ({selectedIds.size})</span>
            </button>

            <button
              type="button"
              onClick={openChangeBatchForSelected}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
              title={t('admin_change_batch_btn')}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('admin_change_batch_btn')} ({selectedIds.size})</span>
            </button>

            <button
              type="button"
              onClick={handleBulkApprove}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('admin_bulk_approve')}</span>
            </button>

            <button
              type="button"
              onClick={handleBulkSuspend}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>{t('admin_bulk_suspend')}</span>
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('admin_bulk_delete')}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {t('admin_bulk_deselect_all')}
            </button>
          </div>
        </div>
      )}

      {/* Search & Multi-Filter Control Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-xs">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin_filter_search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-all"
            />
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-[#111111] focus:bg-white focus:outline-none appearance-none cursor-pointer"
              title={t('admin_col_actions')}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-[#111111] focus:bg-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">{t('admin_filter_all_batches')}</option>
              {availableBatches.map((y) => (
                <option key={y} value={String(y)}>{t('admin_filter_class_of')} {y}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-[#111111] focus:bg-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">{t('admin_filter_all_statuses')}</option>
              <option value="APPROVED">{t('admin_filter_status_approved')}</option>
              <option value="PENDING">{t('admin_filter_status_pending')}</option>
              <option value="SUSPENDED">{t('admin_filter_status_suspended')}</option>
              <option value="REJECTED">{t('admin_filter_status_rejected')}</option>
            </select>
          </div>

          <div>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-rose-700 focus:bg-white focus:outline-none appearance-none cursor-pointer font-bold"
            >
              <option value="">{t('admin_filter_all_blood_groups')}</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                <option key={bg} value={bg}>{bg} {t('admin_filter_blood_suffix')}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={volunteerFilter}
              onChange={(e) => setVolunteerFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-[#111111] focus:bg-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">{t('admin_filter_all_volunteers')}</option>
              <option value="YES">{t('admin_filter_volunteers_yes')}</option>
              <option value="NO">{t('admin_filter_non_volunteers')}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 font-medium pt-2 border-t border-gray-100">
          <div>
            {t('admin_showing_count_prefix')} <strong className="text-[#111111]">{displayedAlumni.length}</strong> {t('admin_showing_count_middle')} {alumniList.length} {t('admin_showing_count_suffix')}
          </div>

          {viewMode === 'table' && (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-gray-500 hidden sm:inline">{t('admin_horizontal_scroll')}</span>
              <div className="flex items-center bg-gray-100 hover:bg-gray-200/70 border border-gray-300 rounded-xl p-0.5 text-gray-700 shadow-2xs transition-all">
                <button
                  type="button"
                  onClick={() => scrollTable(-300)}
                  title={t('admin_sheet_scroll_left')}
                  className="p-1 hover:text-[#111111] hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold px-2 text-gray-600 select-none tracking-tight">
                  {t('admin_pan_columns')}
                </span>
                <button
                  type="button"
                  onClick={() => scrollTable(300)}
                  title={t('admin_sheet_scroll_right')}
                  className="p-1 hover:text-[#111111] hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {viewMode === 'sheet' && (
            <span className="text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 text-[11px]">
              {t('admin_sheet_mode_active')}
            </span>
          )}
        </div>
      </div>

      {/* VIEW 1: STANDARD TABLE MODE */}
{viewMode === 'table' && (
  <div className="bg-white border-2 border-[#111111] rounded-3xl overflow-hidden shadow-lg">
    {/* Header bar — matches Editable Sheet's dark header style */}
    <div className="px-5 py-3 bg-[#111111] text-white flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
      <div className="flex items-center space-x-2">
        <TableIcon className="w-4 h-4 text-amber-400" />
        <span>{t('admin_view_standard_table')}</span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-[#222222] border border-gray-700 rounded-lg p-0.5 text-gray-300 shadow-xs">
          <button
            type="button"
            onClick={() => scrollTable(-400)}
            title={t('admin_sheet_scroll_left')}
            className="p-1 hover:text-amber-400 hover:bg-[#333333] rounded transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono px-2 text-gray-400 select-none tracking-tight">
            {t('admin_pan_columns')}
          </span>
          <button
            type="button"
            onClick={() => scrollTable(400)}
            title={t('admin_sheet_scroll_right')}
            className="p-1 hover:text-amber-400 hover:bg-[#333333] rounded transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <span className="text-amber-300 font-mono bg-amber-950/50 px-2.5 py-1 rounded border border-amber-500/30">
          {displayedAlumni.length} {t('admin_sheet_rows_rendered')}
        </span>
      </div>
    </div>

    {/* Scrollable table container — same behavior as Editable Sheet */}
    {loading ? (
      <TableSkeleton rows={8} />
    ) : (
      <div
        ref={tableContainerRef}
        className="overflow-auto max-h-[75vh] table-scrollbar relative scroll-smooth"
      >
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          <thead className="sticky top-0 bg-gray-100 border-b border-gray-300 text-[11px] font-extrabold uppercase tracking-wider text-gray-700 z-20 shadow-sm">
            <tr>
              <th className="py-3 px-4 w-10 sticky left-0 bg-gray-100 z-30 border-r border-gray-200/50 shadow-2xs">
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
              <th className="py-3.5 px-3 w-16 text-center">{t('admin_col_sno')}</th>
              <th className="py-3.5 px-4 min-w-[200px]">{t('admin_col_alumnus_profile')}</th>
              <th className="py-3.5 px-4 min-w-[140px]">{t('admin_col_batch_section')}</th>
              <th className="py-3.5 px-4 min-w-[160px]">{t('admin_col_contact_info')}</th>
              <th className="py-3.5 px-4 min-w-[190px]">{t('admin_col_address')}</th>
              <th className="py-3.5 px-4 min-w-[110px]">{t('admin_col_blood_group')}</th>
              <th className="py-3.5 px-4 min-w-[100px]">{t('admin_col_volunteer')}</th>
              <th className="py-3.5 px-4 min-w-[110px]">{t('admin_col_willing_donor')}</th>
              <th className="py-3.5 px-4 min-w-[140px]">{t('admin_col_status')}</th>
              <th className="py-3.5 px-4 text-right min-w-[190px] sticky right-0 bg-gray-100 z-30 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                {t('admin_col_actions')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 font-medium">
            {displayedAlumni.length > 0 ? (
              displayedAlumni.map((a, index) => {
                const isSelected = selectedIds.has(a.id);
                const photoSrc = a.profile_photo_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name)}&background=F3F4F6&color=111111`;

                return (
                  <tr key={a.id} className={`group hover:bg-amber-50/40 transition-colors ${isSelected ? 'bg-amber-50/70' : ''}`}>
                    <td className={`py-3 px-4 sticky left-0 z-10 border-r border-gray-200/40 ${isSelected ? 'bg-[#FFF2C6]' : 'bg-white group-hover:bg-amber-50/70'}`}>
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
                      <div className="flex items-start space-x-3">
                        <div className="relative shrink-0">
                          <img
                            src={photoSrc}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-gray-300 transition-all cursor-pointer hover:ring-2 hover:ring-amber-400 hover:scale-105"
                            onClick={async () => {
                              const choice = await alertService.showImagePreview(
                                a.profile_photo_url || undefined,
                                a.full_name,
                                {
                                  canRemove: Boolean(a.profile_photo_url),
                                  isPlaceholder: !a.profile_photo_url,
                                }
                              );

                              if (choice === 'upload') {
                                const input = document.getElementById(`photo-input-std-${a.id}`) as HTMLInputElement | null;
                                input?.click();
                              } else if (choice === 'remove') {
                                try {
                                  await api.updateAlumniAdmin(a.id, { profile_photo_url: '' });
                                  alertService.showSuccess('Photo Removed', `Profile photo for ${a.full_name} was removed.`);
                                  fetchAlumni(true);
                                } catch (err: any) {
                                  alertService.handleApiError(err, 'Failed to remove profile photo.');
                                }
                              }
                            }}
                            title={a.profile_photo_url ? 'Click to view / change photo' : 'Click to upload photo'}
                          />

                          <input
                            id={`photo-input-std-${a.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (!file) return;

                              if (!file.type.startsWith('image/')) {
                                alertService.showWarning('Invalid File Type', 'Please select a valid image file.');
                                return;
                              }

                              try {
                                const res = await api.uploadSchoolImage(file);
                                const newUrl = res.url || res.image_url || '';
                                if (!newUrl) throw new Error('Upload succeeded but no URL was returned.');

                                await api.updateAlumniAdmin(a.id, { profile_photo_url: newUrl });
                                alertService.showSuccess('Photo Updated', `Profile photo for ${a.full_name} was updated.`);
                                fetchAlumni(true);
                              } catch (err: any) {
                                alertService.handleApiError(err, 'Failed to upload profile photo.');
                              }
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[#111111] break-words whitespace-normal leading-snug">
                            {a.full_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/50 px-2.5 py-1 rounded-full text-[11px]">
                        {t('admin_label_batch_prefix')} {a.passing_year}
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
                          <span>{t('admin_label_yes')}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">{t('admin_label_no')}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {a.willing_to_donate === 'YES' ? (
                        <span className="inline-flex items-center space-x-1 font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-2 py-0.5 rounded-full text-[10px]">
                          <Heart className="w-3 h-3 fill-[#854D0E] text-[#854D0E]" />
                          <span>{t('admin_label_yes')}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">{t('admin_label_no')}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          a.verification_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          a.verification_status === 'PENDING' ? 'bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]' :
                          'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {a.verification_status || 'APPROVED'}
                        </span>
                        {a.account_status === 'PENDING_ACTIVATION' ? (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            a.invitation_status === 'SENT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {a.invitation_status === 'SENT' ? t('admin_status_invite_sent') : t('admin_status_pending_activation')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {t('admin_status_active')}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className={`py-3 px-4 text-right whitespace-nowrap space-x-2 sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] ${isSelected ? 'bg-[#FFF2C6]' : 'bg-white group-hover:bg-amber-50/70'}`}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(a)}
                        className="px-2.5 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        title={t('admin_action_edit')}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{t('admin_action_edit')}</span>
                      </button>

                      {(a.account_status === 'PENDING_ACTIVATION' || a.invitation_status === 'SENT') && a.mobile && (
                        <button
                          type="button"
                          onClick={() => handleSendInvitation(a.id, a.full_name, a.mobile)}
                          className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title={t('admin_action_send_invite')}
                        >
                          <Send className="w-3 h-3" />
                          <span>{a.invitation_status === 'SENT' ? t('admin_action_resend_invite') : t('admin_action_send_invite')}</span>
                        </button>
                      )}

                      {a.verification_status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleSingleApprove(a.id, a.full_name)}
                          className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {t('admin_action_approve')}
                        </button>
                      )}

                      {a.verification_status === 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => handleSingleApprove(a.id, a.full_name)}
                          className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {t('admin_action_approve')}
                        </button>
                      )}

                      {a.verification_status === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenSuspendModal(a.id, a.full_name)}
                          className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {t('admin_action_suspend')}
                        </button>
                      )}

                      {a.verification_status === 'SUSPENDED' && (
                        <button
                          type="button"
                          onClick={() => handleSingleActivate(a.id, a.full_name)}
                          className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {t('admin_action_activate')}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openChangeBatchForSingle(a)}
                        className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        title={t('admin_change_batch_btn')}
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{t('admin_change_batch_btn')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSingleDelete(a.id, a.full_name)}
                        className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        {t('admin_action_delete')}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="py-10 text-center text-gray-500 font-bold">
                  {t('admin_no_alumni_found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )}

    {/* Footer bar — mirrors Editable Sheet's footer */}
    <div className="px-5 py-2.5 bg-gray-100 border-t border-gray-300 flex flex-wrap items-center justify-between gap-2 text-gray-600 text-[11px] font-semibold">
      <div className="flex items-center space-x-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500"></span>
        <span>{t('admin_horizontal_scroll')} {t('admin_pan_columns')}</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => scrollTable(-500)}
          className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-700 font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
          title={t('admin_sheet_scroll_left')}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{t('admin_sheet_scroll_left')}</span>
        </button>
        <button
          type="button"
          onClick={() => scrollTable(500)}
          className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-700 font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
          title={t('admin_sheet_scroll_right')}
        >
          <span>{t('admin_sheet_scroll_right')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
)}

      {/* VIEW 2: INTERACTIVE EDITABLE SPREADSHEET GRID MODE */}
      {viewMode === 'sheet' && (
        <div className="bg-white border-2 border-[#111111] rounded-3xl overflow-hidden shadow-lg">
          <div className="px-5 py-3 bg-[#111111] text-white flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>{t('admin_sheet_editor_title')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-[#222222] border border-gray-700 rounded-lg p-0.5 text-gray-300 shadow-xs">
                <button
                  type="button"
                  onClick={() => scrollSheet(-400)}
                  title={t('admin_sheet_scroll_left')}
                  className="p-1 hover:text-amber-400 hover:bg-[#333333] rounded transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono px-2 text-gray-400 select-none tracking-tight">
                  {t('admin_pan_columns')}
                </span>
                <button
                  type="button"
                  onClick={() => scrollSheet(400)}
                  title={t('admin_sheet_scroll_right')}
                  className="p-1 hover:text-amber-400 hover:bg-[#333333] rounded transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-amber-300 font-mono bg-amber-950/50 px-2.5 py-1 rounded border border-amber-500/30">
                {displayedAlumni.length} {t('admin_sheet_rows_rendered')}
              </span>
              {Object.keys(editedRows).length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveSheetChanges}
                  disabled={savingSheet}
                  className="bg-amber-400 hover:bg-amber-300 text-[#111111] px-3.5 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1.5 shadow transition-all cursor-pointer"
                >
                  <Save className={`w-3.5 h-3.5 ${savingSheet ? 'animate-spin' : ''}`} />
                  <span>{savingSheet ? t('admin_sheet_saving') : `${t('admin_sheet_save_edited')} ${Object.keys(editedRows).length} ${t('admin_sheet_edited_rows_suffix')}`}</span>
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
                  <th className="py-2.5 px-3 border-r border-gray-300 w-16 text-center">{t('admin_col_sno')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[80px] w-[80px]">{t('admin_sheet_profile_photo')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[170px]">{t('admin_sheet_full_name')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[150px]">{t('admin_sheet_name_tamil')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">{t('admin_sheet_mobile')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[90px]">{t('admin_sheet_country_code')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[100px]">{t('admin_sheet_gender')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">{t('admin_sheet_dob')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[200px]">{t('admin_sheet_email')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[100px]">{t('admin_sheet_blood_group')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[150px]">{t('admin_sheet_father_name')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[150px]">{t('admin_sheet_mother_name')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">{t('admin_sheet_current_city')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">{t('admin_sheet_current_state')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[200px]">{t('admin_sheet_address')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[110px]">{t('admin_sheet_country')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[180px]">{t('admin_sheet_school_name')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[110px]">{t('admin_sheet_joining_year')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[110px]">{t('admin_sheet_passing_year')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[100px]">{t('admin_sheet_leaving_class')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">{t('admin_sheet_no_higher_ed')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[180px]">{t('admin_sheet_college_name')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">{t('admin_sheet_degree')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">{t('admin_sheet_custom_degree')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">{t('admin_sheet_department')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">{t('admin_sheet_college_reg_no')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">{t('admin_sheet_college_joining_yr')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">{t('admin_sheet_college_passing_yr')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">{t('admin_sheet_employment_status')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[170px]">{t('admin_sheet_company_name')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[160px]">{t('admin_sheet_designation')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">{t('admin_sheet_industry')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">{t('admin_sheet_total_experience')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[160px]">{t('admin_sheet_linkedin')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[160px]">{t('admin_sheet_instagram')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">{t('admin_sheet_whatsapp')}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">{t('admin_sheet_status')}</th>
                  <th className="py-2.5 px-3 text-center min-w-[80px] sticky right-0 bg-gray-100 shadow-left z-20">{t('admin_sheet_action')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-300">
                {displayedAlumni.map((a, index) => {
                  const draft = editedRows[a.id] || {};
                  
                  const getValue = (field: keyof AlumniProfile, defaultVal: any = '') => {
                    return draft[field] !== undefined ? draft[field] : (a[field] !== undefined && a[field] !== null ? a[field] : defaultVal);
                  };

                  const isRowEdited = Boolean(editedRows[a.id]);
                  const isPhotoUploading = photoUploadingIds.has(a.id);
                  const currentPhoto = getValue('profile_photo_url') as string;
                  const photoPreviewSrc = currentPhoto ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(String(getValue('full_name') || a.full_name || 'A'))}&background=F3F4F6&color=111111`;

                  return (
                    <tr key={a.id} className={isRowEdited ? 'bg-amber-50/80 hover:bg-amber-100/80 transition-colors' : 'hover:bg-gray-50 transition-colors'}>
                      <td className="p-1 border-r border-gray-200 text-center font-mono font-semibold text-gray-600 text-xs align-middle">
                        {index + 1}
                      </td>

                      <td className="p-1 border-r border-gray-200 w-[80px] text-center">
  <div className="flex items-center justify-center">
    {/* ✅ Avatar is now the ONLY visible control in the row.
        Upload / Replace / Remove all live inside the lightbox popup. */}
    <div className="relative">
      <div
        className={`w-9 h-9 rounded-full overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center shrink-0 transition-all ${
          isPhotoUploading ? '' : 'cursor-pointer hover:ring-2 hover:ring-amber-400 hover:scale-105'
        }`}
        onClick={async () => {
          if (isPhotoUploading) return;

          const choice = await alertService.showImagePreview(
            currentPhoto || undefined,
            String(getValue('full_name') || a.full_name || 'Profile Photo'),
            {
              canRemove: Boolean(currentPhoto),
              isPlaceholder: !currentPhoto,
            }
          );

          if (choice === 'upload') {
            // Trigger the hidden file input below
            const input = document.getElementById(`photo-input-${a.id}`) as HTMLInputElement | null;
            input?.click();
          } else if (choice === 'remove') {
            handleCellEdit(a.id, 'profile_photo_url', '');
          }
        }}
        title={currentPhoto ? 'Click to view / change photo' : 'Click to upload photo'}
      >
        {isPhotoUploading ? (
          <RefreshCw className="w-3.5 h-3.5 text-gray-500 animate-spin" />
        ) : (
          <img
            src={photoPreviewSrc}
            alt=""
            className="w-full h-full object-contain p-0.5"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(String(a.full_name || 'A'))}&background=F3F4F6&color=111111`;
            }}
          />
        )}
      </div>

      {/* Hidden file input — triggered from the lightbox's Upload/Replace button */}
      <input
        id={`photo-input-${a.id}`}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={isPhotoUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleSheetPhotoUpload(a.id, file);
          }
          e.target.value = '';
        }}
      />
    </div>
  </div>
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
                          <option value="">-</option>
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
                        <select
                          value={getValue('no_higher_education', 'NO')}
                          onChange={(e) => handleCellEdit(a.id, 'no_higher_education', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-1.5 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-bold cursor-pointer text-center"
                        >
                          <option value="YES">{t('admin_label_yes')}</option>
                          <option value="NO">{t('admin_label_no')}</option>
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
                          title={t('admin_action_delete')}
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

          <div className="px-5 py-2.5 bg-gray-100 border-t border-gray-300 flex flex-wrap items-center justify-between gap-2 text-gray-600 text-[11px] font-semibold">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <span>{t('admin_sheet_footer_tip')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => scrollSheet(-500)}
                className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-700 font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                title={t('admin_sheet_scroll_left')}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{t('admin_sheet_scroll_left')}</span>
              </button>
              <button
                type="button"
                onClick={() => scrollSheet(500)}
                className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-700 font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                title={t('admin_sheet_scroll_right')}
              >
                <span>{t('admin_sheet_scroll_right')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ADD / EDIT ALUMNI MODAL — PAGINATED 5-STEP WIZARD
          ✅ Reused for BOTH create and edit. Title & submit label switch
             dynamically based on `editingAlumnusId`.
          ============================================================ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetAddForm(); }}
        title={editingAlumnusId ? t('admin_edit_modal_title') : t('admin_add_modal_title')}
      >
        <div className="text-xs font-medium">

          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">
              <span>{t('admin_add_step_label')} {addFormStep} {t('admin_add_step_of')} {ADD_FORM_TOTAL_STEPS}</span>
              <span className="text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/60 px-2 py-0.5 rounded-full">
                {addFormStep === 1 && t('admin_add_step_personal')}
                {addFormStep === 2 && t('admin_add_step_contact')}
                {addFormStep === 3 && t('admin_add_step_school')}
                {addFormStep === 4 && t('admin_add_step_higher')}
                {addFormStep === 5 && t('admin_add_step_professional')}
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

            {addFormStep === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className={addLabelCls}>{t('admin_sheet_full_name')} *</label>
                  <input
                    type="text"
                    value={newAlumnus.full_name || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, full_name: e.target.value })}
                    placeholder="e.g. S. Ramanathan"
                    className={addInputCls}
                  />
                </div>

                <div>
                  <label className={addLabelCls}>{t('admin_sheet_name_tamil')}</label>
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
                    <label className={addLabelCls}>{t('admin_sheet_gender')} *</label>
                    <select
                      value={newAlumnus.gender || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, gender: e.target.value })}
                      className={addInputCls}
                    >
                      <option value="">--</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_dob')} *</label>
                    <input
                      type="date"
                      value={newAlumnus.date_of_birth || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, date_of_birth: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={addLabelCls}>{t('admin_sheet_blood_group')}</label>
                  <select
                    value={newAlumnus.blood_group || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, blood_group: e.target.value })}
                    className={addInputCls + ' font-bold text-rose-700'}
                  >
                    <option value="">--</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_father_name')}</label>
                    <input
                      type="text"
                      value={newAlumnus.father_name || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, father_name: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_mother_name')}</label>
                    <input
                      type="text"
                      value={newAlumnus.mother_name || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, mother_name: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div>
  <label className={addLabelCls}>{t('admin_sheet_profile_photo')}</label>

  <div className="flex items-center gap-3 mb-2">
    {/* ✅ Thumbnail — now clickable. Opens the shared lightbox preview. */}
    <div
      className={`w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 transition-all ${
        addFormPhotoUploading
          ? ''
          : 'cursor-pointer hover:ring-2 hover:ring-amber-400 hover:scale-105'
      }`}
      onClick={async () => {
        if (addFormPhotoUploading) return;

        const choice = await alertService.showImagePreview(
          newAlumnus.profile_photo_url || undefined,
          newAlumnus.full_name || 'Profile Photo',
          {
            canRemove: Boolean(newAlumnus.profile_photo_url),
            isPlaceholder: !newAlumnus.profile_photo_url,
          }
        );

        if (choice === 'upload') {
          const input = document.getElementById('wizard-photo-input') as HTMLInputElement | null;
          input?.click();
        } else if (choice === 'remove') {
          setNewAlumnus((prev) => ({ ...prev, profile_photo_url: '' }));
        }
      }}
      title={
        newAlumnus.profile_photo_url
          ? 'Click to view / change photo'
          : 'Click to upload photo'
      }
    >
      {addFormPhotoUploading ? (
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
      ) : newAlumnus.profile_photo_url ? (
        <img
          src={newAlumnus.profile_photo_url}
          alt="Profile preview"
          className="w-full h-full object-contain p-0.5"
        />
      ) : (
        <Users className="w-6 h-6 text-gray-400" />
      )}
    </div>

    {/* Upload / Remove buttons remain visible as a fallback for discoverability */}
    <div className="flex flex-col gap-2">
      <label className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all border ${
        addFormPhotoUploading
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          : 'bg-gray-100 hover:bg-gray-200 text-[#111111] border-gray-200 cursor-pointer'
      }`}>
        <Upload className="w-3.5 h-3.5" />
        <span>{addFormPhotoUploading ? t('admin_sheet_uploading') : t('admin_sheet_upload')}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={addFormPhotoUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleAddFormPhotoUpload(file);
            }
            e.target.value = '';
          }}
        />
      </label>

      {newAlumnus.profile_photo_url && !addFormPhotoUploading && (
        <button
          type="button"
          onClick={() =>
            setNewAlumnus((prev) => ({ ...prev, profile_photo_url: '' }))
          }
          className="text-[11px] font-bold text-rose-600 hover:underline text-left cursor-pointer"
        >
          {t('admin_sheet_remove')}
        </button>
      )}
    </div>
  </div>

  {/* ✅ Hidden file input used by the lightbox's Upload/Replace action */}
  <input
    id="wizard-photo-input"
    type="file"
    accept="image/*"
    className="hidden"
    disabled={addFormPhotoUploading}
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleAddFormPhotoUpload(file);
      }
      e.target.value = '';
    }}
  />

  {/* URL input stays visible so admin can paste a direct URL manually */}
  <input
    type="text"
    value={newAlumnus.profile_photo_url || ''}
    onChange={(e) =>
      setNewAlumnus({ ...newAlumnus, profile_photo_url: e.target.value })
    }
    placeholder="https://..."
    className={addInputCls + ' font-mono'}
  />
</div>
              </div>
            )}

            {addFormStep === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_country_code')} *</label>
                    <input
                      type="text"
                      value={newAlumnus.country_code || '91'}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, country_code: e.target.value })}
                      className={addInputCls + ' text-center font-semibold'}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={addLabelCls}>{t('admin_sheet_mobile')} *</label>
                    <input
                      type="text"
                      value={newAlumnus.mobile || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, mobile: e.target.value })}
                      className={addInputCls + ' font-mono'}
                    />
                  </div>
                </div>

                <div>
                  <label className={addLabelCls}>{t('admin_sheet_email')}</label>
                  <input
                    type="email"
                    value={newAlumnus.email || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, email: e.target.value })}
                    className={addInputCls + ' font-mono'}
                  />
                </div>

                <div>
                  <label className={addLabelCls}>{t('admin_sheet_address')}</label>
                  <textarea
                    rows={2}
                    value={newAlumnus.address || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, address: e.target.value })}
                    className={addInputCls + ' resize-none font-normal'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_current_city')} *</label>
                    <input
                      type="text"
                      value={newAlumnus.current_city || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, current_city: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_current_state')}</label>
                    <input
                      type="text"
                      value={newAlumnus.current_state || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, current_state: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={addLabelCls}>{t('admin_sheet_country')}</label>
                  <input
                    type="text"
                    value={newAlumnus.country || 'India'}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, country: e.target.value })}
                    className={addInputCls}
                  />
                </div>
              </div>
            )}

            {addFormStep === 3 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className={addLabelCls}>{t('admin_sheet_school_name')}</label>
                  <input
                    type="text"
                    value={newAlumnus.school_name || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, school_name: e.target.value })}
                    className={addInputCls}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_joining_year')}</label>
                    <select
                      value={newAlumnus.joining_year ?? ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, joining_year: e.target.value ? Number(e.target.value) : undefined })}
                      className={addInputCls}
                    >
                      <option value="">--</option>
                      {availableBatches.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_passing_year')} *</label>
                    <select
                      value={newAlumnus.passing_year ?? ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, passing_year: e.target.value ? Number(e.target.value) : undefined })}
                      className={addInputCls + ' font-bold text-[#854D0E]'}
                    >
                      <option value="">--</option>
                      {availableBatches.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_leaving_class')}</label>
                    <input
                      type="text"
                      value={newAlumnus.leaving_class || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, leaving_class: e.target.value })}
                      className={addInputCls + ' text-center'}
                    />
                  </div>
                </div>

                <div>
                  <label className={addLabelCls}>{t('admin_sheet_no_higher_ed')}</label>
                  <select
                    value={newAlumnus.no_higher_education || 'NO'}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, no_higher_education: e.target.value })}
                    className={addInputCls + ' font-bold'}
                  >
                    <option value="NO">{t('admin_label_no')}</option>
                    <option value="YES">{t('admin_label_yes')}</option>
                  </select>
                </div>
              </div>
            )}

            {addFormStep === 4 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className={addLabelCls}>{t('admin_sheet_college_name')}</label>
                  <input
                    type="text"
                    value={newAlumnus.college_name || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, college_name: e.target.value })}
                    className={addInputCls}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_degree')}</label>
                    <input
                      type="text"
                      value={newAlumnus.degree || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, degree: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_custom_degree')}</label>
                    <input
                      type="text"
                      value={newAlumnus.custom_degree || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, custom_degree: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_department')}</label>
                    <input
                      type="text"
                      value={newAlumnus.department || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, department: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_college_reg_no')}</label>
                    <input
                      type="text"
                      value={newAlumnus.college_register_no || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, college_register_no: e.target.value })}
                      className={addInputCls + ' font-mono'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_college_joining_yr')}</label>
                    <select
                      value={newAlumnus.college_joining_year ?? ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, college_joining_year: e.target.value ? Number(e.target.value) : undefined })}
                      className={addInputCls}
                    >
                      <option value="">--</option>
                      {availableBatches.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_college_passing_yr')}</label>
                    <select
                      value={newAlumnus.college_passing_year ?? ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, college_passing_year: e.target.value ? Number(e.target.value) : undefined })}
                      className={addInputCls}
                    >
                      <option value="">--</option>
                      {availableBatches.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {addFormStep === 5 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_employment_status')}</label>
                    <input
                      type="text"
                      value={newAlumnus.employment_status || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, employment_status: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_company_name')}</label>
                    <input
                      type="text"
                      value={newAlumnus.company_name || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, company_name: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_designation')}</label>
                    <input
                      type="text"
                      value={newAlumnus.profession || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, profession: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_industry')}</label>
                    <input
                      type="text"
                      value={newAlumnus.industry || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, industry: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_total_experience')}</label>
                    <input
                      type="text"
                      value={newAlumnus.total_experience || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, total_experience: e.target.value })}
                      className={addInputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_linkedin')}</label>
                    <input
                      type="url"
                      value={newAlumnus.linkedin_url || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, linkedin_url: e.target.value })}
                      className={addInputCls + ' font-mono text-blue-700'}
                    />
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_instagram')}</label>
                    <input
                      type="url"
                      value={newAlumnus.instagram_url || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, instagram_url: e.target.value })}
                      className={addInputCls + ' font-mono text-pink-700'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={addLabelCls}>{t('admin_sheet_whatsapp')}</label>
                    <input
                      type="text"
                      value={newAlumnus.whatsapp_number || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, whatsapp_number: e.target.value })}
                      className={addInputCls + ' font-mono text-emerald-800'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className={addLabelCls}>{t('admin_col_volunteer')}</label>
                    <select
                      value={newAlumnus.is_volunteer || 'NO'}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, is_volunteer: e.target.value })}
                      className={addInputCls + ' font-bold'}
                    >
                      <option value="NO">{t('admin_label_no')}</option>
                      <option value="YES">{t('admin_label_yes')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_col_willing_donor')}</label>
                    <select
                      value={newAlumnus.willing_to_donate || 'NO'}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, willing_to_donate: e.target.value })}
                      className={addInputCls + ' font-bold'}
                    >
                      <option value="NO">{t('admin_label_no')}</option>
                      <option value="YES">{t('admin_label_yes')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={addLabelCls}>{t('admin_col_status')}</label>
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

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}
                >
                  {t('admin_add_cancel')}
                </Button>
                {addFormStep > 1 && (
                  <Button type="button" variant="secondary" onClick={goToPrevAddStep}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> {t('admin_add_back')}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {addFormStep < ADD_FORM_TOTAL_STEPS ? (
                  <Button type="button" onClick={goToNextAddStep} className="font-bold">
                    {t('admin_add_next')} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" isLoading={isAdding} className="font-bold">
                    {/* ✅ Dynamic submit label: "Save Changes" in edit, "Create Alumni Profile" in add */}
                    {editingAlumnusId ? t('admin_edit_submit') : t('admin_add_submit')}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* SPREADSHEET (EXCEL / CSV) IMPORT MODAL */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title={t('admin_import_modal_title')}>
        <form onSubmit={handleCSVUploadSubmit} className="space-y-4 text-xs font-medium">
          <div className="p-4 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-2xl text-[#854D0E] space-y-1.5">
            <div className="font-extrabold text-sm">{t('admin_import_modal_note_title')}</div>
            <div className="space-y-1">
              <div>• {t('admin_import_modal_note_1')}</div>
              <div>• {t('admin_import_modal_note_2')}</div>
              <div>• {t('admin_import_modal_note_3')}</div>
              <div>• {t('admin_import_modal_note_4')}</div>
              <div>• {t('admin_import_modal_note_5')}</div>
            </div>
          </div>

          <input
            type="file"
            accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            required
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl cursor-pointer"
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsImportModalOpen(false)}>
              {t('admin_add_cancel')}
            </Button>
            <Button type="submit" isLoading={uploading}>
              {t('admin_import_modal_start')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV IMPORT RESULTS BREAKDOWN MODAL */}
      {lastImportResult && (
        <Modal 
          isOpen={importSummaryModalOpen} 
          onClose={() => setImportSummaryModalOpen(false)} 
          title={t('admin_import_result_title')}
        >
          <div className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">{t('admin_import_result_total_rows')}</div>
                <div className="text-lg font-black text-gray-900 mt-0.5">{lastImportResult.total_rows || 0}</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">{t('admin_import_result_valid')}</div>
                <div className="text-lg font-black text-emerald-800 mt-0.5">
                  {(lastImportResult.created || 0) + (lastImportResult.updated || 0) + (lastImportResult.unchanged || 0) + (lastImportResult.matched_and_approved || 0)}
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-blue-700 font-bold uppercase tracking-wider text-[10px]">{t('admin_import_result_updated')}</div>
                <div className="text-lg font-black text-blue-800 mt-0.5">{lastImportResult.updated || 0}</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-green-700 font-bold uppercase tracking-wider text-[10px]">{t('admin_import_result_created')}</div>
                <div className="text-lg font-black text-green-800 mt-0.5">{lastImportResult.created || 0}</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-amber-700 font-bold uppercase tracking-wider text-[10px]">{t('admin_import_result_unchanged')}</div>
                <div className="text-lg font-black text-amber-800 mt-0.5">{lastImportResult.unchanged || 0}</div>
              </div>
              <div className={`p-3 rounded-xl border ${lastImportResult.failed > 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                <div className="font-bold uppercase tracking-wider text-[10px]">{t('admin_import_result_failed')}</div>
                <div className="text-lg font-black mt-0.5">{lastImportResult.failed || 0}</div>
              </div>
            </div>

            {lastImportResult.errors && lastImportResult.errors.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t('admin_import_result_errors_label')} ({lastImportResult.errors.length})</span>
                </div>
                <div className="max-h-40 overflow-y-auto p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-1 font-mono text-[11px] text-red-900">
                  {lastImportResult.errors.map((err: string, idx: number) => (
                    <div key={idx} className="border-b border-red-100 last:border-b-0 pb-1">{err}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" onClick={() => setImportSummaryModalOpen(false)}>
                {t('admin_import_result_close')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================
          SUSPEND ALUMNI ACCOUNT MODAL — Reason required
          ============================================================ */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={handleCloseSuspendModal}
        title={t('admin_suspend_modal_title')}
      >
        <div className="space-y-4 text-xs font-medium">
          <p className="text-gray-600 leading-relaxed">
            {t('admin_suspend_modal_body')}
            {suspendTargetName && (
              <>
                {' '}<strong className="text-[#111111]">{suspendTargetName}</strong> {t('admin_suspend_modal_body_suffix')}
              </>
            )}
          </p>

          <div>
            <label className="block font-bold text-[#111111] mb-1 text-xs">
              {t('admin_suspend_reason_label')} <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              value={suspendReason}
              onChange={(e) => {
                setSuspendReason(e.target.value);
                if (suspendValidationError) setSuspendValidationError('');
              }}
              disabled={suspending}
              placeholder={t('admin_suspend_reason_placeholder')}
              className={`w-full p-3 bg-gray-50 border rounded-xl focus:bg-white focus:outline-none text-xs font-medium resize-none transition-colors ${
                suspendValidationError
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-gray-300 focus:border-[#111111]'
              }`}
            />
            {suspendValidationError && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                {suspendValidationError}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseSuspendModal}
              disabled={suspending}
            >
              {t('admin_suspend_cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleSubmitSuspend}
              isLoading={suspending}
              disabled={suspending || !suspendReason.trim()}
            >
              {suspending ? t('admin_suspend_in_progress') : t('admin_suspend_confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Batch Modal */}
      <Modal
        isOpen={isChangeBatchModalOpen}
        onClose={() => !batchMigrating && setIsChangeBatchModalOpen(false)}
        title={t('admin_change_batch_modal_title')}
      >
        <form onSubmit={handleChangeBatchSubmit} className="space-y-4">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            <div className="font-bold text-sm text-[#111111] mb-1">
              {changeBatchTargets.length === 1
                ? t('admin_change_batch_single_heading').replace('{name}', changeBatchTargets[0].full_name)
                : t('admin_change_batch_heading').replace('{count}', String(changeBatchTargets.length))}
            </div>
            {changeBatchTargets.length === 1 && (
              <div>
                {t('admin_change_batch_current_label')} <strong>Batch {changeBatchTargets[0].passing_year}</strong>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">
              {t('admin_change_batch_target_label')}
            </label>
            <select
              value={batchMigrateYear}
              onChange={(e) => setBatchMigrateYear(Number(e.target.value))}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none text-xs font-semibold text-[#111111]"
              required
            >
              {fetchedBatchesList.length > 0 ? (
                fetchedBatchesList
                  .slice()
                  .sort((a, b) => b.passing_year - a.passing_year)
                  .map((b) => (
                    <option key={b.id} value={b.passing_year}>
                      {b.name || `Batch of ${b.passing_year}`} ({b.passing_year}) — {b.total_members || 0} members
                    </option>
                  ))
              ) : (
                <option value={batchMigrateYear}>Batch {batchMigrateYear}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">
              {t('admin_change_batch_section_label')}
            </label>
            <select
              value={batchMigrateSection}
              onChange={(e) => setBatchMigrateSection(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none text-xs font-medium"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
              <option value="E">Section E</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">
              {t('admin_change_batch_reason_label')}
            </label>
            <input
              type="text"
              placeholder={t('admin_change_batch_reason_placeholder')}
              value={batchMigrateReason}
              onChange={(e) => setBatchMigrateReason(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none text-xs font-medium"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              disabled={batchMigrating}
              onClick={() => setIsChangeBatchModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {t('admin_change_batch_cancel')}
            </button>
            <button
              type="submit"
              disabled={batchMigrating}
              className="px-4 py-2 bg-[#111111] hover:bg-[#854D0E] text-[#F4C542] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${batchMigrating ? 'animate-spin' : ''}`} />
              <span>{t('admin_change_batch_submit')}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};