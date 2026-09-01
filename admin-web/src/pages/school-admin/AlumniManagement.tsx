import React, { useEffect, useState, useMemo } from 'react';
import { Search, Download, Upload, UserX } from 'lucide-react';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { LoadingState, TableSkeleton } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { AlumniProfile } from '../../types';

export const AlumniManagement: React.FC = () => {
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [batchYear, setBatchYear] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('APPROVED');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 250ms Debounce to prevent flooding API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchAlumni();
  }, [debouncedSearch, batchYear, statusFilter]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const data = await api.searchAlumni(debouncedSearch, batchYear, statusFilter);
      setAlumniList(data);
    } catch (err) {
      console.error('Failed to fetch alumni:', err);
    } finally {
      setLoading(false);
    }
  };

  // Instant in-memory filtering for zero-latency UI response
  const displayedAlumni = useMemo(() => {
    return alumniList.filter(a => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (a.full_name && a.full_name.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.mobile && a.mobile.includes(q)) ||
        (a.admission_number && a.admission_number.toLowerCase().includes(q)) ||
        (a.current_city && a.current_city.toLowerCase().includes(q)) ||
        (a.profession && a.profession.toLowerCase().includes(q))
      );
    });
  }, [alumniList, search]);

  const handleSuspend = async (id: string) => {
    const confirmed = await alertService.showConfirm(
      'Suspend Alumni Profile?',
      'Are you sure you want to suspend this alumni profile? The user will be barred from access until reactivated.',
      'Suspend Profile',
      'Cancel'
    );
    if (!confirmed) return;
    try {
      await api.verifyAlumni(id, 'SUSPENDED', 'Suspended by admin');
      alertService.showSuccess('Alumni Suspended', 'The alumni profile status has been set to suspended.');
      fetchAlumni();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to update alumni status.');
    }
  };

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

  const batchOptions = [
    { label: 'All Batches', value: '' },
    ...Array.from({ length: 42 }, (_, i) => 1985 + i).reverse().map((y) => ({ label: `Class of ${y}`, value: y }))
  ];

  const statusOptions = [
    { label: 'Verified (APPROVED)', value: 'APPROVED' },
    { label: 'Pending Review', value: 'PENDING' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'All Statuses', value: 'ALL' }
  ];

  const columns = [
    {
      header: 'Alumnus',
      accessor: (row: AlumniProfile) => (
        <div className="flex items-center space-x-3">
          <img src={row.profile_photo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB]" />
          <div>
            <div className="font-bold text-[#111111]">{row.full_name}</div>
            <div className="text-xs text-[#6B7280]">Adm: {row.admission_number}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Batch Cohort',
      accessor: (row: AlumniProfile) => <span className="font-semibold text-xs bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-1 rounded-lg">Batch {row.passing_year}</span>
    },
    {
      header: 'Contact Info',
      accessor: (row: AlumniProfile) => (
        <div className="text-xs">
          <div className="text-[#111111]">{row.mobile}</div>
          <div className="text-[#6B7280]">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Location / Profession',
      accessor: (row: AlumniProfile) => (
        <div className="text-xs">
          <div className="font-semibold text-[#111111]">{row.profession || 'N/A'}</div>
          <div className="text-[#6B7280]">{row.current_city || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row: AlumniProfile) => <Badge status={row.verification_status} />
    },
    {
      header: 'Actions',
      accessor: (row: AlumniProfile) => (
        <div className="flex items-center space-x-2">
          {row.verification_status === 'APPROVED' && (
            <button
              onClick={() => handleSuspend(row.id)}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center space-x-1"
              title="Suspend Alumni"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Suspend</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111111]">Alumni Directory</h2>
          <p className="text-xs text-[#6B7280]">Browse verified school graduates and roster data</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="w-4 h-4 mr-1.5" />
            Import CSV Roster
          </Button>
          <a
            href={api.getAlumniCSVExportUrl()}
            download
            className="inline-flex items-center px-4 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-sm rounded-xl transition-all border border-[#F4C542]"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, admission no, city, profession..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#F4C542] focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Select
            options={batchOptions}
            value={batchYear || ''}
            onChange={(e) => setBatchYear(e.target.value ? Number(e.target.value) : undefined)}
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <Table columns={columns} data={displayedAlumni} keyExtractor={(item) => item.id} defaultPageSize={15} />
      )}

      {/* CSV Import Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Alumni School Roster via CSV">
        <form onSubmit={handleCSVUploadSubmit} className="space-y-5">
          <div className="p-4 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs text-[#854D0E]">
            CSV should contain columns: <strong>Name, Batch, Admission Number, Mobile, Email</strong>. Matching pending applications will be automatically auto-verified.
          </div>

          <Input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            required
          />

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={uploading}>
              Start Upload & Match
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
