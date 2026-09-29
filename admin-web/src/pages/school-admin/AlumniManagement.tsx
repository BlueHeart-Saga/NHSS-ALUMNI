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
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

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

interface CountryOption {
  name: string;
  code: string;
  dialCode: string;
}

const COUNTRIES: CountryOption[] = [
  { name: 'India', code: 'IN', dialCode: '+91' },
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971' },
  { name: 'Singapore', code: 'SG', dialCode: '+65' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966' },
  { name: 'Qatar', code: 'QA', dialCode: '+974' },
  { name: 'Oman', code: 'OM', dialCode: '+968' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973' },
  { name: 'Nepal', code: 'NP', dialCode: '+977' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'Japan', code: 'JP', dialCode: '+81' },
  { name: 'China', code: 'CN', dialCode: '+86' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41' },
  { name: 'Italy', code: 'IT', dialCode: '+39' },
  { name: 'Spain', code: 'ES', dialCode: '+34' },
  { name: 'Ireland', code: 'IE', dialCode: '+353' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92' },
];

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

  // NEW: Edit-mode tracking. When null → Add mode. When set → Edit mode.
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

  // Photo input ref for clean pencil icon trigger
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Auto-fetched school name
  const [schoolName, setSchoolName] = useState<string>('');

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
    country_code: '+91',
    email: '',
    address: '',
    current_city: '',
    current_state: '',
    country: 'India',
    school_name: '',
    joining_year: undefined,
    passing_year: new Date().getFullYear(),
    leaving_class: '10th',
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
    api.getPublicStats().then((stats) => {
      if (stats?.school_name) {
        setSchoolName(stats.school_name);
        setNewAlumnus((prev) => ({
          ...prev,
          school_name: prev.school_name || stats.school_name,
        }));
      }
    }).catch(() => {});
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
        (a.name_ta || '').toLowerCase().includes(q) ||
        (a.full_name_ta || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.mobile || '').includes(q) ||
        (a.current_city || '').toLowerCase().includes(q) ||
        (a.address || '').toLowerCase().includes(q) ||
        (a.profession || '').toLowerCase().includes(q) ||
        (a.designation || '').toLowerCase().includes(q) ||
        (a.company_name || '').toLowerCase().includes(q) ||
        (a.company || '').toLowerCase().includes(q) ||
        (a.college_name || '').toLowerCase().includes(q) ||
        (a.institution_name || '').toLowerCase().includes(q)
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

  // Single & Bulk Deleting states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handleSingleDelete = async (id: string, name: string) => {
    const confirmed = await alertService.showConfirm(
      'Delete Alumni & User Account?',
      `Are you sure you want to permanently delete "${name}"? This will permanently remove their alumni profile, portal login account, and all associated user data across the entire database. This action cannot be undone.`,
      'Delete All Data',
      'Cancel'
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await api.deleteAlumniAdmin(id);
      alertService.showSuccess('Alumni & Account Deleted', res.message || `Record and user account for ${name} have been completely removed.`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  // NEW: Opens the existing 5-step wizard pre-filled with the selected alumnus.
  //    Sets editingAlumnusId so the submit handler routes to updateAlumniAdmin.
  const handleOpenEditModal = (alumnus: AlumniProfile) => {
    setEditingAlumnusId(alumnus.id);
    setNewAlumnus({
      ...alumnus,
      full_name: alumnus.full_name || '',
      name_ta: alumnus.name_ta || alumnus.full_name_ta || '',
      gender: alumnus.gender || '',
      date_of_birth: normalizeDobForInput(alumnus.date_of_birth || alumnus.dob),
      blood_group: alumnus.blood_group || '',
      father_name: alumnus.father_name || '',
      mother_name: alumnus.mother_name || '',
      profile_photo_url: alumnus.profile_photo_url || '',
      mobile: alumnus.mobile ? alumnus.mobile.replace(/^\+91\s*/, '') : '',
      country_code: alumnus.country_code || '91',
      email: alumnus.email || '',
      address: alumnus.address || '',
      current_city: alumnus.current_city || '',
      current_state: alumnus.current_state || alumnus.state || '',
      country: alumnus.country || 'India',
      school_name: alumnus.school_name || '',
      joining_year: alumnus.joining_year || alumnus.admission_year,
      passing_year: alumnus.passing_year || new Date().getFullYear(),
      leaving_class: alumnus.leaving_class || '10th',
      no_higher_education: alumnus.no_higher_education || 'NO',
      college_name: alumnus.college_name || alumnus.institution_name || '',
      degree: alumnus.degree || '',
      custom_degree: alumnus.custom_degree || '',
      department: alumnus.department || alumnus.stream || '',
      college_register_no: alumnus.college_register_no || '',
      college_joining_year: alumnus.college_joining_year,
      college_passing_year: alumnus.college_passing_year,
      employment_status: alumnus.employment_status || '',
      company_name: alumnus.company_name || alumnus.company || '',
      profession: alumnus.profession || alumnus.designation || '',
      industry: alumnus.industry || '',
      total_experience: alumnus.total_experience || (alumnus.experience_years !== undefined && alumnus.experience_years !== null ? String(alumnus.experience_years) : ''),
      linkedin_url: alumnus.linkedin_url || '',
      instagram_url: alumnus.instagram_url || '',
      whatsapp_number: alumnus.whatsapp_number || '',
      is_volunteer: alumnus.is_volunteer || 'NO',
      willing_to_donate: alumnus.willing_to_donate || 'NO',
      verification_status: alumnus.verification_status || 'APPROVED',
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
      'Bulk Delete Alumni & User Accounts?',
      `Are you sure you want to PERMANENTLY delete ${ids.length} selected alumni profile(s)? This will permanently remove their alumni profiles, portal login accounts, and all associated user data across the entire database. This action cannot be undone.`,
      'Delete Selected',
      'Cancel'
    );
    if (!confirmed) return;

    setBulkDeleting(true);
    try {
      const res = await api.bulkDeleteAlumniAdmin(ids);
      alertService.showSuccess('Bulk Deleted', res.message || `Deleted ${ids.length} alumni profile(s) and linked user accounts.`);
      setSelectedIds(new Set());
      fetchAlumni(true);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to delete selected alumni.');
    } finally {
      setBulkDeleting(false);
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
      country_code: '+91',
      email: '',
      address: '',
      current_city: '',
      current_state: '',
      country: 'India',
      school_name: schoolName || 'Natarajan Higher Secondary School',
      passing_year: new Date().getFullYear(),
      leaving_class: '10th',
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
    setEditingAlumnusId(null);
    setAddFormErrors({});
  };

  const handleCloseAddModal = async () => {
    const isDirty = Boolean(
      (newAlumnus.full_name && newAlumnus.full_name.trim()) ||
      (newAlumnus.mobile && newAlumnus.mobile.trim()) ||
      (newAlumnus.email && newAlumnus.email.trim()) ||
      (newAlumnus.current_city && newAlumnus.current_city.trim()) ||
      (newAlumnus.address && newAlumnus.address.trim()) ||
      (newAlumnus.college_name && newAlumnus.college_name.trim()) ||
      (newAlumnus.company_name && newAlumnus.company_name.trim()) ||
      newAlumnus.profile_photo_url
    );

    if (isDirty) {
      const confirmed = await alertService.showConfirm(
        language === 'ta' ? 'வெளியேற விரும்புகிறீர்களா?' : 'Discard Changes and Close?',
        language === 'ta'
          ? 'படிவத்தில் உள்ளிட்ட தகவல்கள் சேமிக்கப்படாது. நீங்கள் நிச்சயமாக மூட விரும்புகிறீர்களா?'
          : 'You have entered details in this form. Are you sure you want to close and discard your progress?',
        language === 'ta' ? 'ஆம், வெளியேறு' : 'Yes, Discard & Close',
        language === 'ta' ? 'தொடர்ந்து நிரப்பு' : 'Keep Editing'
      );
      if (!confirmed) return;
    }

    setIsAddModalOpen(false);
    resetAddForm();
  };

  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});

  const validateAddStep = (step: number): string[] => {
    const missing: string[] = [];
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!newAlumnus.full_name || !String(newAlumnus.full_name).trim()) {
        missing.push(language === 'ta' ? 'முழுப் பெயர் (Full Name)' : 'Full Name');
        errors['full_name'] = language === 'ta' ? 'முழுப் பெயர் தேவை' : 'Full name is required';
      }
      if (!newAlumnus.gender || !String(newAlumnus.gender).trim()) {
        missing.push(language === 'ta' ? 'பாலினம் (Gender)' : 'Gender');
        errors['gender'] = language === 'ta' ? 'பாலினம் தேர்வு செய்யவும்' : 'Gender is required';
      }
      if (!newAlumnus.date_of_birth || !String(newAlumnus.date_of_birth).trim()) {
        missing.push(language === 'ta' ? 'பிறந்த தேதி (Date of Birth)' : 'Date of Birth');
        errors['date_of_birth'] = language === 'ta' ? 'பிறந்த தேதி தேவை' : 'Date of birth is required';
      }
    } else if (step === 2) {
      const rawMob = String(newAlumnus.mobile || '').replace(/\D/g, '');
      const cCode = String(newAlumnus.country_code || '+91').replace(/\s+/g, '');
      const isIndia = cCode === '+91' || cCode === '91';

      if (isIndia) {
        if (!rawMob || rawMob.length !== 10 || !['6', '7', '8', '9'].includes(rawMob[0])) {
          missing.push(language === 'ta' ? 'செல்லுபடியாகும் 10-இலக்க கைபேசி எண்' : 'Valid 10-digit Indian Mobile Number');
          errors['mobile'] = language === 'ta'
            ? '6, 7, 8 அல்லது 9 இல் தொடங்கும் 10-இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்'
            : 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9';
        }
      } else {
        if (!rawMob || rawMob.length < 7 || rawMob.length > 15) {
          missing.push(language === 'ta' ? 'செல்லுபடியாகும் கைபேசி எண்' : 'Valid Mobile Number');
          errors['mobile'] = language === 'ta'
            ? '7 முதல் 15 இலக்க கைபேசி எண்ணை உள்ளிடவும்'
            : 'Please enter a valid phone number (7-15 digits)';
        }
      }

      if (newAlumnus.email && String(newAlumnus.email).trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(newAlumnus.email).trim())) {
          missing.push(language === 'ta' ? 'சரியான மின்னஞ்சல் முகவரி' : 'Valid Email Address');
          errors['email'] = language === 'ta' ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Please enter a valid email address';
        }
      }

      if (!newAlumnus.current_city || !String(newAlumnus.current_city).trim()) {
        missing.push(language === 'ta' ? 'தற்போதைய நகரம் (Current City)' : 'Current City');
        errors['current_city'] = language === 'ta' ? 'தற்போதைய நகரம் தேவை' : 'Current city is required';
      }
    } else if (step === 3) {
      if (!newAlumnus.passing_year) {
        missing.push(language === 'ta' ? 'பள்ளி முடித்த ஆண்டு (Passing Year)' : 'Passing Year');
        errors['passing_year'] = language === 'ta' ? 'பள்ளி முடித்த ஆண்டு தேவை' : 'Passing year is required';
      }
      if (!newAlumnus.leaving_class) {
        missing.push(language === 'ta' ? 'படித்த வகுப்பு (Leaving Class)' : 'Leaving Class');
        errors['leaving_class'] = language === 'ta' ? 'படித்த வகுப்பு தேவை' : 'Leaving class is required';
      }
    }

    setAddFormErrors(errors);
    return missing;
  };

  const goToNextAddStep = async () => {
    const missing = validateAddStep(addFormStep);
    if (missing.length > 0) {
      alertService.showWarning(
        language === 'ta' ? 'தேவையான தகவல்கள் விடுபட்டுள்ளன' : 'Required Information Missing',
        `${language === 'ta' ? 'அடுத்த படிக்குச் செல்வதற்கு முன் பின்வரும் விவரங்களை பூர்த்தி செய்யவும்:' : 'Please complete the following required fields before proceeding:'} ${missing.join(', ')}`
      );
      return;
    }

    // Step 2 Extra Validation: Phone format & Duplicate checks for mobile & email
    if (addFormStep === 2) {
      const rawMob = String(newAlumnus.mobile || '').replace(/\D/g, '');
      const cleanEmail = String(newAlumnus.email || '').trim().toLowerCase();

      // 1. Fast local client list duplicate check
      const localMobileDup = alumniList.find((a) => {
        if (editingAlumnusId && (a.id === editingAlumnusId || (a as any)._id === editingAlumnusId)) return false;
        const existingMobDigits = String(a.mobile || '').replace(/\D/g, '');
        return existingMobDigits.length >= 10 && rawMob.length >= 10 && existingMobDigits.slice(-10) === rawMob.slice(-10);
      });

      if (localMobileDup) {
        alertService.showWarning(
          language === 'ta' ? 'கைபேசி எண் ஏற்கனவே உள்ளது' : 'Mobile Number Already Registered',
          language === 'ta'
            ? `இந்த கைபேசி எண் (${newAlumnus.mobile}) ஏற்கனவே "${localMobileDup.full_name}" பெயரில் பதிவு செய்யப்பட்டுள்ளது!`
            : `This mobile number (${newAlumnus.mobile}) is already registered for alumnus "${localMobileDup.full_name}"!`
        );
        return;
      }

      if (cleanEmail) {
        const localEmailDup = alumniList.find((a) => {
          if (editingAlumnusId && (a.id === editingAlumnusId || (a as any)._id === editingAlumnusId)) return false;
          return a.email && a.email.trim().toLowerCase() === cleanEmail;
        });

        if (localEmailDup) {
          alertService.showWarning(
            language === 'ta' ? 'மின்னஞ்சல் ஏற்கனவே உள்ளது' : 'Email Already Registered',
            language === 'ta'
              ? `இந்த மின்னஞ்சல் (${newAlumnus.email}) ஏற்கனவே "${localEmailDup.full_name}" பெயரில் பதிவு செய்யப்பட்டுள்ளது!`
              : `This email (${newAlumnus.email}) is already registered for alumnus "${localEmailDup.full_name}"!`
          );
          return;
        }
      }

      // 2. Real-time Backend Duplicate Check against Users & Alumni database
      try {
        const dupRes = await api.checkAlumniDuplicate(
          rawMob,
          cleanEmail || undefined,
          editingAlumnusId || undefined
        );
        if (dupRes.mobile_exists) {
          alertService.showWarning(
            language === 'ta' ? 'கைபேசி எண் ஏற்கனவே உள்ளது' : 'Mobile Number Already Registered',
            language === 'ta'
              ? `இந்த கைபேசி எண் (${newAlumnus.mobile}) ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (${dupRes.mobile_owner || 'முன்னாள் மாணவர் கணக்கு'}).`
              : `This mobile number (${newAlumnus.mobile}) is already registered in the system (${dupRes.mobile_owner || 'existing user'}).`
          );
          return;
        }
        if (dupRes.email_exists) {
          alertService.showWarning(
            language === 'ta' ? 'மின்னஞ்சல் ஏற்கனவே உள்ளது' : 'Email Already Registered',
            language === 'ta'
              ? `இந்த மின்னஞ்சல் (${newAlumnus.email}) ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (${dupRes.email_owner || 'முன்னாள் மாணவர் கணக்கு'}).`
              : `This email (${newAlumnus.email}) is already registered in the system (${dupRes.email_owner || 'existing user'}).`
          );
          return;
        }
      } catch (err) {
        console.warn('Backend duplicate check skipped or offline:', err);
      }
    }

    if (addFormStep === 3 && newAlumnus.no_higher_education === 'YES') {
      setAddFormStep(5);
    } else {
      setAddFormStep((s) => Math.min(s + 1, ADD_FORM_TOTAL_STEPS));
    }
  };

  const goToPrevAddStep = () => {
    if (addFormStep === 5 && newAlumnus.no_higher_education === 'YES') {
      setAddFormStep(3);
    } else {
      setAddFormStep((s) => Math.max(s - 1, 1));
    }
  };

  const handleCreateAlumnus = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Strictly ensure submission only executes when on the final step (Step 5)
    if (addFormStep !== ADD_FORM_TOTAL_STEPS) {
      return;
    }

    const step1Missing = validateAddStep(1);
    if (step1Missing.length > 0) {
      setAddFormStep(1);
      alertService.showWarning(
        language === 'ta' ? 'படி 1: அடிப்படை விவரங்கள் விடுபட்டுள்ளன' : 'Required Fields Missing (Step 1: Basic Info)',
        `${language === 'ta' ? 'தயவுசெய்து பூர்த்தி செய்யவும்:' : 'Please complete:'} ${step1Missing.join(', ')}`
      );
      return;
    }

    const step2Missing = validateAddStep(2);
    if (step2Missing.length > 0) {
      setAddFormStep(2);
      alertService.showWarning(
        language === 'ta' ? 'படி 2: தொடர்பு விவரங்கள் விடுபட்டுள்ளன' : 'Required Fields Missing (Step 2: Contact & Address)',
        `${language === 'ta' ? 'தயவுசெய்து பூர்த்தி செய்யவும்:' : 'Please complete:'} ${step2Missing.join(', ')}`
      );
      return;
    }

    const step3Missing = validateAddStep(3);
    if (step3Missing.length > 0) {
      setAddFormStep(3);
      alertService.showWarning(
        language === 'ta' ? 'படி 3: பள்ளி விவரங்கள் விடுபட்டுள்ளன' : 'Required Fields Missing (Step 3: School & Batch)',
        `${language === 'ta' ? 'தயவுசெய்து பூர்த்தி செய்யவும்:' : 'Please complete:'} ${step3Missing.join(', ')}`
      );
      return;
    }

    const name = (newAlumnus.full_name || '').trim();
    const rawMob = (newAlumnus.mobile || '').trim();
    const digitsOnly = rawMob.replace(/\D/g, '');
    const mob = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    // SweetAlert Confirmation Popup before creating/updating
    const confirmTitle = editingAlumnusId
      ? (language === 'ta' ? 'விவரங்களை மாற்றியமைக்கவா?' : 'Update Alumni Record?')
      : (language === 'ta' ? 'முன்னாள் மாணவர் சுயவிவரத்தை உருவாக்கவா?' : 'Confirm Create Alumni Profile?');

    const confirmText = editingAlumnusId
      ? (language === 'ta'
          ? `"${name}" அவர்களின் சுயவிவர மாற்றங்களைச் சேமிக்க உறுதி செய்கிறீர்களா?`
          : `Are you sure you want to save changes for "${name}"?`)
      : (language === 'ta'
          ? `"${name}" என்ற மாணவருக்கான புதிய சுயவிவரம் மற்றும் பயனர் கணக்கை உருவாக்க உறுதி செய்கிறீர்களா?`
          : `Are you sure you want to create a new alumni profile and user account for "${name}"?`);

    const confirmBtn = editingAlumnusId
      ? (language === 'ta' ? 'ஆம், மாற்றியமைக்கவும்' : 'Yes, Update')
      : (language === 'ta' ? 'ஆம், உருவாக்கவும்' : 'Yes, Create Profile');

    const cancelBtn = language === 'ta' ? 'ரத்துசெய்' : 'Cancel';

    const confirmed = await alertService.showConfirm(confirmTitle, confirmText, confirmBtn, cancelBtn);
    if (!confirmed) {
      return;
    }

    setIsAdding(true);
    try {
      const payload: any = {
        ...newAlumnus,
        full_name: name,
        mobile: mob,
        country_code: (newAlumnus.country_code || '91').replace(/\+/g, ''),
        school_name: newAlumnus.school_name || schoolName || 'Natarajan Higher Secondary School',
        passing_year: Number(newAlumnus.passing_year) || new Date().getFullYear(),
      };

      if (newAlumnus.joining_year !== undefined && newAlumnus.joining_year !== null && String(newAlumnus.joining_year) !== '') {
        payload.joining_year = Number(newAlumnus.joining_year);
      }
      if (newAlumnus.college_joining_year !== undefined && newAlumnus.college_joining_year !== null && String(newAlumnus.college_joining_year) !== '') {
        payload.college_joining_year = Number(newAlumnus.college_joining_year);
      }
      if (newAlumnus.college_passing_year !== undefined && newAlumnus.college_passing_year !== null && String(newAlumnus.college_passing_year) !== '') {
        payload.college_passing_year = Number(newAlumnus.college_passing_year);
      }

      // Treat blank email as undefined so pydantic Optional[EmailStr] validation passes
      if (!payload.email || !String(payload.email).trim()) {
        delete payload.email;
      }

      // Route to UPDATE when editing an existing record, otherwise CREATE.
      if (editingAlumnusId) {
        await api.updateAlumniAdmin(editingAlumnusId, payload);
        alertService.showSuccess(
          language === 'ta' ? 'விவரங்கள் புதுப்பிக்கப்பட்டன' : t('admin_edit_success_body'),
          language === 'ta'
            ? `"${name}" அவர்களின் சுயவிவர மாற்றங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன.`
            : `Changes for ${name} have been saved successfully.`
        );
      } else {
        await api.adminCreateAlumni(payload);
        alertService.showSuccess(
          language === 'ta' ? 'முன்னாள் மாணவர் சுயவிவரம் உருவாக்கப்பட்டது' : 'Alumni Profile Created',
          language === 'ta'
            ? `"${name}" மாணவருக்கான புதிய சுயவிவரம் மற்றும் பயனர் கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது. நீங்கள் இப்போது அவர்களுக்கு கணக்கு செயல்படுத்தும் அழைப்பை அனுப்பலாம்.`
            : `New alumni profile and user record for ${name} added successfully. You can now send them an account activation invitation.`
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
                          {(a.name_ta || a.full_name_ta) && (
                            <div className="text-gray-500 font-serif text-[11px] truncate max-w-[180px]">
                              {a.name_ta || a.full_name_ta}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/50 px-2.5 py-1 rounded-full text-[11px]">
                          {t('admin_label_batch_prefix')} {a.passing_year}
                        </span>
                        {a.leaving_class && (
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                            Class {a.leaving_class}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">{a.mobile || '-'}</div>
                      <div className="text-gray-500 text-[11px] truncate max-w-[160px]">{a.email || '-'}</div>
                      {a.whatsapp_number && a.whatsapp_number !== a.mobile && (
                        <div className="text-emerald-700 text-[10px] font-mono">WA: {a.whatsapp_number}</div>
                      )}
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
                        disabled={deletingId === a.id}
                        className={`px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 ${deletingId === a.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {deletingId === a.id && <RefreshCw className="w-3 h-3 animate-spin text-rose-600" />}
                        <span>{deletingId === a.id ? 'Deleting...' : t('admin_action_delete')}</span>
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
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">{t('admin_sheet_dob')} (DD-MM-YYYY)</th>
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
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px]">Roll / Adm No</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[80px]">Section</th>
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
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[100px]">{t('admin_col_volunteer') || 'Volunteer'}</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 min-w-[110px]">{t('admin_col_willing_donor') || 'Donor'}</th>
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
    {/* Avatar is now the ONLY visible control in the row.
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
                          placeholder="DD-MM-YYYY"
                          value={formatDateDDMMYYYY(getValue('date_of_birth') || getValue('dob'))}
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
                        <input
                          type="text"
                          value={getValue('roll_no') || getValue('college_register_no')}
                          onChange={(e) => handleCellEdit(a.id, 'roll_no', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-2 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white font-mono text-center"
                        />
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={getValue('section', 'A')}
                          onChange={(e) => handleCellEdit(a.id, 'section', e.target.value)}
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
                        <select
                          value={getValue('is_volunteer', 'NO')}
                          onChange={(e) => handleCellEdit(a.id, 'is_volunteer', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-1.5 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white cursor-pointer text-center font-bold"
                        >
                          <option value="YES">{t('admin_label_yes')}</option>
                          <option value="NO">{t('admin_label_no')}</option>
                        </select>
                      </td>

                      <td className="p-1 border-r border-gray-200">
                        <select
                          value={getValue('willing_to_donate', 'NO')}
                          onChange={(e) => handleCellEdit(a.id, 'willing_to_donate', e.target.value)}
                          onBlur={() => handleCellBlur(a.id)}
                          className="w-full px-1.5 py-1 bg-transparent rounded border border-transparent hover:border-gray-300 focus:border-[#111111] focus:bg-white cursor-pointer text-center font-bold"
                        >
                          <option value="YES">{t('admin_label_yes')}</option>
                          <option value="NO">{t('admin_label_no')}</option>
                        </select>
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
                          disabled={deletingId === a.id}
                          className={`p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors ${deletingId === a.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={t('admin_action_delete')}
                        >
                          {deletingId === a.id ? (
                            <RefreshCw className="w-3.5 h-3.5 mx-auto animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          )}
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
          Reused for BOTH create and edit. Title & submit label switch
             dynamically based on `editingAlumnusId`.
          ============================================================ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title={editingAlumnusId ? t('admin_edit_modal_title') : t('admin_add_modal_title')}
        maxWidth="max-w-4xl"
      >
        <div className="text-sm font-medium space-y-5">

          {/* Reusable Modern Wizard Progress Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-50/60 via-[#FFFDF5] to-white border border-[#F4C542]/40 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF7D6] border border-[#F4C542]/80 flex items-center justify-center text-[#854D0E] font-extrabold text-sm shadow-2xs shrink-0">
                  {newAlumnus.no_higher_education === 'YES' && addFormStep === 5 ? 4 : addFormStep}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[#F4C542]/25 text-[#854D0E] border border-[#F4C542]/50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span>
                        {newAlumnus.no_higher_education === 'YES'
                          ? (language === 'ta' ? `படி ${addFormStep === 5 ? 4 : addFormStep} / 4` : `Step ${addFormStep === 5 ? 4 : addFormStep} of 4`)
                          : (language === 'ta' ? `படி ${addFormStep} / 5` : `Step ${addFormStep} of 5`)}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-gray-400">•</span>
                    <span className="text-xs font-bold text-gray-600">
                      {newAlumnus.no_higher_education === 'YES'
                        ? (addFormStep === 5 ? 100 : addFormStep * 25)
                        : (addFormStep * 20)}% {language === 'ta' ? 'நிறைவு' : 'completed'}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#111111] mt-0.5">
                    {addFormStep === 1 && (language === 'ta' ? 'அடிப்படை தகவல்கள் (Basic Info)' : 'Basic Information')}
                    {addFormStep === 2 && (language === 'ta' ? 'தொடர்பு & முகவரி (Contact & Address)' : 'Contact & Address Details')}
                    {addFormStep === 3 && (language === 'ta' ? 'பள்ளி & பேட்ச் (School & Batch)' : 'School & Batch Details')}
                    {addFormStep === 4 && (language === 'ta' ? 'உயர் கல்வி (Higher Education)' : 'Higher Education Details')}
                    {addFormStep === 5 && (language === 'ta' ? 'பணி & விருப்பங்கள் (Work & Preferences)' : 'Work & Account Preferences')}
                  </h4>
                </div>
              </div>

              <div className="text-xs text-gray-500 font-medium text-right hidden sm:block">
                {editingAlumnusId
                  ? (language === 'ta' ? 'முன்னாள் மாணவர் விவரங்களை மாற்றவும்' : 'Update Alumni Record')
                  : (language === 'ta' ? 'புதிய முன்னாள் மாணவரை சேர்க்கவும்' : 'Add New Alumnus Record')}
              </div>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-[#111111] h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${
                    newAlumnus.no_higher_education === 'YES'
                      ? (addFormStep === 5 ? 100 : addFormStep * 25)
                      : (addFormStep * 20)
                  }%`
                }}
              />
            </div>
          </div>

          {/* Interactive Category Tab Navigation */}
          <div>
            <div className={`grid ${newAlumnus.no_higher_education === 'YES' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-5'} gap-1.5 bg-gray-100/90 p-1.5 rounded-2xl border border-gray-200`}>
              {[
                { step: 1, nameEn: '1. Basic Info *', nameTa: '1. அடிப்படை *' },
                { step: 2, nameEn: '2. Contact & Address *', nameTa: '2. தொடர்பு *' },
                { step: 3, nameEn: '3. School & Batch *', nameTa: '3. பள்ளி & பேட்ச் *' },
                ...(newAlumnus.no_higher_education !== 'YES'
                  ? [{ step: 4, nameEn: '4. Higher Ed', nameTa: '4. உயர் கல்வி' }]
                  : []),
                {
                  step: 5,
                  nameEn: `${newAlumnus.no_higher_education === 'YES' ? '4' : '5'}. Work & Status`,
                  nameTa: `${newAlumnus.no_higher_education === 'YES' ? '4' : '5'}. பணி & நிலை`
                },
              ].map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => {
                    if (item.step < addFormStep) {
                      setAddFormStep(item.step);
                    } else if (item.step > addFormStep) {
                      const missing = validateAddStep(addFormStep);
                      if (missing.length > 0) {
                        alertService.showWarning(
                          'Required Fields Missing',
                          `Please complete required fields before navigating forward: ${missing.join(', ')}`
                        );
                        return;
                      }
                      setAddFormStep(item.step);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer text-center truncate ${
                    addFormStep === item.step
                      ? 'bg-[#111111] text-white shadow-md scale-[1.02]'
                      : item.step < addFormStep
                      ? 'bg-amber-100/80 text-amber-900 hover:bg-amber-200/80'
                      : 'text-gray-600 hover:text-[#111111] hover:bg-white/80'
                  }`}
                >
                  {language === 'ta' ? item.nameTa : item.nameEn}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                e.preventDefault();
              }
            }}
            className="space-y-5"
          >

            {/* STEP 1: BASIC INFORMATION */}
            {addFormStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_full_name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.full_name || ''}
                      onChange={(e) => {
                        setNewAlumnus({ ...newAlumnus, full_name: e.target.value });
                        if (addFormErrors['full_name']) setAddFormErrors({ ...addFormErrors, full_name: '' });
                      }}
                      placeholder="e.g. S. Ramanathan"
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
                        addFormErrors['full_name'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#111111]'
                      } rounded-xl focus:ring-2 focus:border-transparent transition-all outline-none font-medium shadow-2xs`}
                    />
                    {addFormErrors['full_name'] && (
                      <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{addFormErrors['full_name']}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_name_tamil')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.name_ta || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, name_ta: e.target.value })}
                      placeholder="எ.கா. எஸ். ராமநாதன்"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs font-serif"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_gender')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newAlumnus.gender || ''}
                      onChange={(e) => {
                        setNewAlumnus({ ...newAlumnus, gender: e.target.value });
                        if (addFormErrors['gender']) setAddFormErrors({ ...addFormErrors, gender: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
                        addFormErrors['gender'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#111111]'
                      } rounded-xl focus:ring-2 focus:border-transparent transition-all outline-none font-semibold shadow-2xs`}
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="Male">Male / ஆண்</option>
                      <option value="Female">Female / பெண்</option>
                      <option value="Other">Other / இதர</option>
                    </select>
                    {addFormErrors['gender'] && (
                      <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{addFormErrors['gender']}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_dob')} (DD-MM-YYYY) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      max={new Date().toLocaleDateString('en-CA')}
                      value={newAlumnus.date_of_birth || ''}
                      onChange={(e) => {
                        setNewAlumnus({ ...newAlumnus, date_of_birth: e.target.value });
                        if (addFormErrors['date_of_birth']) setAddFormErrors({ ...addFormErrors, date_of_birth: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
                        addFormErrors['date_of_birth'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#111111]'
                      } rounded-xl focus:ring-2 focus:border-transparent transition-all outline-none font-semibold shadow-2xs`}
                    />
                    {newAlumnus.date_of_birth && (
                      <span className="text-xs text-[#854D0E] font-bold block mt-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 w-fit">
                        📅 {formatDateDDMMYYYY(newAlumnus.date_of_birth)}
                      </span>
                    )}
                    {addFormErrors['date_of_birth'] && (
                      <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{addFormErrors['date_of_birth']}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_blood_group')}
                    </label>
                    <select
                      value={newAlumnus.blood_group || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, blood_group: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-extrabold text-rose-700 shadow-2xs"
                    >
                      <option value="">-- Select --</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_father_name')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.father_name || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, father_name: e.target.value })}
                      placeholder="Father's Name"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_mother_name')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.mother_name || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, mother_name: e.target.value })}
                      placeholder="Mother's Name"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>
                </div>

                {/* Profile Photo Section - Clean Avatar with Pencil Edit Badge (Upload Only) */}
                <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-amber-50/40 via-white to-gray-50/50 rounded-2xl border border-amber-200/70 space-y-3 shadow-2xs">
                  <div className="text-center">
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                      {t('admin_sheet_profile_photo')}
                    </label>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      {language === 'ta' ? 'புகைப்படம் பதிவேற்ற பென்சில் குறியீட்டை அழுத்தவும்' : 'Click pencil icon to upload profile photo'}
                    </p>
                  </div>

                  <div className="relative group">
                    <div
                      onClick={() => {
                        if (addFormPhotoUploading) return;
                        photoInputRef.current?.click();
                      }}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white ring-2 ring-amber-400/80 shadow-md bg-white flex items-center justify-center overflow-hidden cursor-pointer relative hover:scale-105 transition-all"
                      title={language === 'ta' ? 'புகைப்படம் பதிவேற்றவும்' : 'Upload photo'}
                    >
                      {addFormPhotoUploading ? (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10">
                          <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
                          <span className="text-[10px] font-bold mt-1">Uploading...</span>
                        </div>
                      ) : newAlumnus.profile_photo_url ? (
                        <img
                          src={newAlumnus.profile_photo_url}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Users className="w-10 h-10 text-gray-300" />
                          <span className="text-[10px] font-bold text-gray-400 mt-1">No Photo</span>
                        </div>
                      )}
                    </div>

                    {/* Pencil Edit Icon Badge */}
                    <button
                      type="button"
                      disabled={addFormPhotoUploading}
                      onClick={() => photoInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#111111] hover:bg-amber-600 text-white flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transition-transform hover:scale-110"
                      title={language === 'ta' ? 'புகைப்படம் பதிவேற்ற / மாற்ற' : 'Upload / Change Photo'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={addFormPhotoUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAddFormPhotoUpload(file);
                      e.target.value = '';
                    }}
                  />

                  {newAlumnus.profile_photo_url && !addFormPhotoUploading && (
                    <button
                      type="button"
                      onClick={() => setNewAlumnus((prev) => ({ ...prev, profile_photo_url: '' }))}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer transition-colors"
                    >
                      🗑️ {language === 'ta' ? 'புகைப்படத்தை நீக்கு' : 'Remove Photo'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: CONTACT & ADDRESS */}
            {addFormStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_country_code')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newAlumnus.country_code || '+91'}
                      onChange={(e) => {
                        const dial = e.target.value;
                        const matched = COUNTRIES.find((c) => c.dialCode === dial);
                        setNewAlumnus({
                          ...newAlumnus,
                          country_code: dial,
                          country: matched ? matched.name : (newAlumnus.country || 'India'),
                        });
                      }}
                      className="w-full px-3 py-2.5 text-xs font-bold bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none shadow-2xs cursor-pointer truncate"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                          {c.dialCode} ({c.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_mobile')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={15}
                      value={newAlumnus.mobile || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setNewAlumnus({ ...newAlumnus, mobile: val });
                        if (addFormErrors['mobile']) setAddFormErrors({ ...addFormErrors, mobile: '' });
                      }}
                      placeholder={newAlumnus.country_code === '+91' || newAlumnus.country_code === '91' ? 'e.g. 9876543210' : 'Mobile number'}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
                        addFormErrors['mobile'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#111111]'
                      } rounded-xl focus:ring-2 focus:border-transparent transition-all outline-none font-mono font-bold tracking-wider shadow-2xs`}
                    />
                    {addFormErrors['mobile'] && (
                      <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{addFormErrors['mobile']}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t('admin_sheet_email')}
                  </label>
                  <input
                    type="email"
                    value={newAlumnus.email || ''}
                    onChange={(e) => {
                      setNewAlumnus({ ...newAlumnus, email: e.target.value });
                      if (addFormErrors['email']) setAddFormErrors({ ...addFormErrors, email: '' });
                    }}
                    placeholder="alumni@example.com"
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
                      addFormErrors['email'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#111111]'
                    } rounded-xl focus:ring-2 focus:border-transparent transition-all outline-none font-mono shadow-2xs`}
                  />
                  {addFormErrors['email'] && (
                    <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{addFormErrors['email']}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t('admin_sheet_address')}
                  </label>
                  <textarea
                    rows={2}
                    value={newAlumnus.address || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, address: e.target.value })}
                    placeholder="Residential address details..."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-normal resize-none shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_current_city')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.current_city || ''}
                      onChange={(e) => {
                        setNewAlumnus({ ...newAlumnus, current_city: e.target.value });
                        if (addFormErrors['current_city']) setAddFormErrors({ ...addFormErrors, current_city: '' });
                      }}
                      placeholder="e.g. Chennai / Tirunelveli"
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
                        addFormErrors['current_city'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#111111]'
                      } rounded-xl focus:ring-2 focus:border-transparent transition-all outline-none font-medium shadow-2xs`}
                    />
                    {addFormErrors['current_city'] && (
                      <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{addFormErrors['current_city']}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_current_state')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.current_state || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, current_state: e.target.value })}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t('admin_sheet_country')} ({language === 'ta' ? 'நாடு / இருப்பிடம்' : 'Location Country'})
                  </label>
                  <select
                    value={newAlumnus.country || 'India'}
                    onChange={(e) => {
                      const cName = e.target.value;
                      const matched = COUNTRIES.find((c) => c.name === cName);
                      setNewAlumnus({
                        ...newAlumnus,
                        country: cName,
                        country_code: matched ? matched.dialCode : (newAlumnus.country_code || '+91'),
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-semibold shadow-2xs cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: SCHOOL & BATCH */}
            {addFormStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      {t('admin_sheet_school_name')}
                    </label>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      🔒 {language === 'ta' ? 'தானாக பெறப்பட்டது (Read-only)' : 'Auto-fetched (Read-only)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={newAlumnus.school_name || schoolName || 'Natarajan Higher Secondary School'}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-100 text-gray-700 border border-gray-200 rounded-xl outline-none font-medium cursor-not-allowed select-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t('admin_sheet_passing_year')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newAlumnus.passing_year ?? ''}
                    onChange={(e) => {
                      setNewAlumnus({ ...newAlumnus, passing_year: e.target.value ? Number(e.target.value) : undefined });
                      if (addFormErrors['passing_year']) setAddFormErrors({ ...addFormErrors, passing_year: '' });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
                      addFormErrors['passing_year'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#111111]'
                    } rounded-xl focus:ring-2 focus:border-transparent transition-all outline-none font-extrabold text-[#854D0E] shadow-2xs`}
                  >
                    <option value="">-- Select School Leaving Year --</option>
                    {availableBatches.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {addFormErrors['passing_year'] && (
                    <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{addFormErrors['passing_year']}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t('admin_sheet_leaving_class')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'].map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setNewAlumnus({ ...newAlumnus, leaving_class: cls })}
                        className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                          (newAlumnus.leaving_class || '10th') === cls
                            ? 'bg-[#111111] text-white border-[#111111] shadow-md scale-[1.05]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 shadow-2xs'
                        }`}
                      >
                        {cls} Standard
                      </button>
                    ))}
                  </div>

                  {newAlumnus.passing_year && (
                    <div className="mt-3 p-3 bg-[#FFF7D6] border border-[#F4C542]/80 rounded-2xl text-xs text-[#854D0E] font-semibold flex items-center justify-between shadow-2xs">
                      <span>{language === 'ta' ? 'அலுமினி Batch (10-ஆம் வகுப்பு அடிப்படை):' : 'Calculated Alumni Batch (10th Std Basis):'}</span>
                      <span className="font-extrabold text-[#111111] text-sm bg-white px-3 py-1 rounded-xl border border-[#F4C542]">
                        Batch of {(() => {
                          const py = Number(newAlumnus.passing_year);
                          const match = (newAlumnus.leaving_class || '10th').match(/\d+/);
                          const num = match ? parseInt(match[0], 10) : 10;
                          return num < 10 ? py + (10 - num) : py;
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Higher Education Selector - Yes shows Step 4, No hides Step 4 */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                  <label className="block text-xs font-bold text-gray-800">
                    {language === 'ta' ? 'உயர் கல்வி பயின்றவரா? (Pursued Higher Studies?)' : 'Pursued Higher Education?'}
                  </label>
                  <p className="text-xs text-gray-500 font-medium">
                    {language === 'ta'
                      ? 'ஆம் எனில் உயர் கல்வி விவரங்கள் (படி 4) தோன்றும். இல்லை எனில் நேரடியாக பணி விவரங்களுக்கு செல்லும்.'
                      : 'Selecting "Yes" shows Step 4 (Higher Education). Selecting "No" skips directly to Step 5.'}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setNewAlumnus({ ...newAlumnus, no_higher_education: 'NO' })}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        newAlumnus.no_higher_education !== 'YES'
                          ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-2xs'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'ta' ? 'ஆம் / Yes (பயின்றார்)' : 'Yes (Pursued Higher Ed)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAlumnus({ ...newAlumnus, no_higher_education: 'YES' })}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        newAlumnus.no_higher_education === 'YES'
                          ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-2xs'
                      }`}
                    >
                      <X className="w-4 h-4 text-rose-400" />
                      <span>{language === 'ta' ? 'இல்லை / No (பயிலவில்லை)' : 'No (Direct to Work)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: HIGHER EDUCATION */}
            {addFormStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t('admin_sheet_college_name')}
                  </label>
                  <input
                    type="text"
                    value={newAlumnus.college_name || ''}
                    onChange={(e) => setNewAlumnus({ ...newAlumnus, college_name: e.target.value })}
                    placeholder="e.g. Anna University / Madras Medical College"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_degree')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.degree || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, degree: e.target.value })}
                      placeholder="e.g. B.E / B.Tech / B.Sc / MBBS"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_custom_degree')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.custom_degree || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, custom_degree: e.target.value })}
                      placeholder="Custom / Specialized Degree Name"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_department')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.department || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, department: e.target.value })}
                      placeholder="e.g. Computer Science / Mechanical"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_college_reg_no')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.college_register_no || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, college_register_no: e.target.value })}
                      placeholder="College Roll / Register No"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-mono shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_college_joining_yr')}
                    </label>
                    <select
                      value={newAlumnus.college_joining_year ?? ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, college_joining_year: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-semibold shadow-2xs"
                    >
                      <option value="">-- Select --</option>
                      {availableBatches.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_college_passing_yr')}
                    </label>
                    <select
                      value={newAlumnus.college_passing_year ?? ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, college_passing_year: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-semibold shadow-2xs"
                    >
                      <option value="">-- Select --</option>
                      {availableBatches.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: WORK & PREFERENCES */}
            {addFormStep === 5 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_employment_status')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.employment_status || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, employment_status: e.target.value })}
                      placeholder="e.g. Employed / Self-Employed / Entrepreneur"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_company_name')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.company_name || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, company_name: e.target.value })}
                      placeholder="Organization / Company Name"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_designation')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.profession || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, profession: e.target.value })}
                      placeholder="e.g. Senior Software Engineer / Manager"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_industry')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.industry || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, industry: e.target.value })}
                      placeholder="e.g. Information Technology / Healthcare"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_total_experience')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.total_experience || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, total_experience: e.target.value })}
                      placeholder="e.g. 5 Years"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-medium shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_whatsapp')}
                    </label>
                    <input
                      type="text"
                      value={newAlumnus.whatsapp_number || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, whatsapp_number: e.target.value })}
                      placeholder="WhatsApp Mobile Number"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-mono text-emerald-800 font-semibold shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_linkedin')}
                    </label>
                    <input
                      type="url"
                      value={newAlumnus.linkedin_url || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-mono text-blue-700 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_sheet_instagram')}
                    </label>
                    <input
                      type="url"
                      value={newAlumnus.instagram_url || ''}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-mono text-pink-700 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_col_volunteer')}
                    </label>
                    <select
                      value={newAlumnus.is_volunteer || 'NO'}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, is_volunteer: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-bold shadow-2xs"
                    >
                      <option value="NO">{t('admin_label_no')}</option>
                      <option value="YES">{t('admin_label_yes')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_col_willing_donor')}
                    </label>
                    <select
                      value={newAlumnus.willing_to_donate || 'NO'}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, willing_to_donate: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-bold shadow-2xs"
                    >
                      <option value="NO">{t('admin_label_no')}</option>
                      <option value="YES">{t('admin_label_yes')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {t('admin_col_status')}
                    </label>
                    <select
                      value={newAlumnus.verification_status || 'APPROVED'}
                      onChange={(e) => setNewAlumnus({ ...newAlumnus, verification_status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all outline-none font-extrabold uppercase shadow-2xs"
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

            {/* MODAL FOOTER BUTTONS — Submit button strictly rendered ONLY on Step 5 */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseAddModal}
                  className="rounded-xl px-4 py-2 text-xs font-bold"
                >
                  {t('admin_add_cancel')}
                </Button>
                {addFormStep > 1 && (
                  <Button type="button" variant="secondary" onClick={goToPrevAddStep} className="rounded-xl px-4 py-2 text-xs font-bold">
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> {t('admin_add_back')}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {addFormStep < ADD_FORM_TOTAL_STEPS ? (
                  <Button
                    key="modal-btn-next"
                    type="button"
                    onClick={goToNextAddStep}
                    className="font-extrabold text-xs px-5 py-2.5 bg-[#111111] hover:bg-slate-800 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t('admin_add_next')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    key="modal-btn-submit"
                    type="button"
                    onClick={handleCreateAlumnus}
                    isLoading={isAdding}
                    className="font-extrabold text-xs px-6 py-2.5 bg-gradient-to-r from-[#111111] via-slate-900 to-amber-900 hover:opacity-95 text-white rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>{editingAlumnusId ? t('admin_edit_submit') : t('admin_add_submit')}</span>
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