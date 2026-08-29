import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, ShieldCheck } from 'lucide-react';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Input';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Batch, AlumniProfile } from '../../types';

export const BatchDetails: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [members, setMembers] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAlumniId, setSelectedAlumniId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (batchId) loadBatch();
  }, [batchId]);

  const loadBatch = async () => {
    try {
      setLoading(true);
      const [bData, mData] = await Promise.all([
        api.getBatchMembers(batchId!).then(() => null),
        api.getBatchMembers(batchId!)
      ]);
      setMembers(mData);

      const batches = await api.getBatches();
      const match = batches.find((b) => b.id === batchId);
      if (match) setBatch(match);
    } catch (err) {
      console.error('Failed to load batch detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId || !selectedAlumniId) return;

    setAssigning(true);
    try {
      await api.assignCoordinator(batchId, selectedAlumniId);
      alertService.showSuccess('Coordinator Assigned', 'Batch Coordinator role assigned successfully.');
      setIsAssignModalOpen(false);
      loadBatch();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to assign coordinator.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!batch) return <div className="p-8">Batch cohort not found.</div>;

  const alumniOptions = [
    { label: 'Select Verified Member...', value: '' },
    ...members.map((m) => ({ label: `${m.full_name} (${m.admission_number})`, value: m.id }))
  ];

  const columns = [
    {
      header: 'Member Name',
      accessor: (row: AlumniProfile) => (
        <div className="flex items-center space-x-3">
          <img src={row.profile_photo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB]" />
          <div>
            <div className="font-bold text-[#111111]">{row.full_name}</div>
            <div className="text-xs text-[#6B7280]">Admission: {row.admission_number}</div>
          </div>
        </div>
      )
    },
    {
      header: 'City / Profession',
      accessor: (row: AlumniProfile) => (
        <div className="text-xs">
          <div className="font-semibold text-[#111111]">{row.profession || 'N/A'}</div>
          <div className="text-[#6B7280]">{row.current_city || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Roles',
      accessor: (row: AlumniProfile) => (
        <div className="flex items-center space-x-1">
          {row.roles.map((r) => (
            <span key={r} className="text-[11px] font-semibold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/60 px-2 py-0.5 rounded-full">
              {r}
            </span>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => navigate('/school-admin/batches')}
        className="inline-flex items-center text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Batches
      </button>

      {/* Batch Hero Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] px-3 py-1 rounded-full border border-[#F4C542]/60">
            CLASS OF {batch.passing_year} COHORT
          </span>
          <h2 className="text-2xl font-bold text-[#111111] mt-2">{batch.name}</h2>
          <p className="text-xs text-[#6B7280] mt-1">{batch.description || 'Verified Batch Cohort'}</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={() => setIsAssignModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-1.5" />
            Assign Coordinator
          </Button>
        </div>
      </div>

      {/* Member Directory */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-[#111111]">Verified Batch Members ({members.length})</h3>
        <Table columns={columns} data={members} keyExtractor={(m) => m.id} />
      </div>

      {/* Assign Coordinator Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Batch Coordinator">
        <form onSubmit={handleAssignCoordinator} className="space-y-4">
          <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs text-[#854D0E]">
            Batch Coordinators can create events, manage RSVPs, scan QR tickets, and broadcast announcements for <strong>{batch.name}</strong>.
          </div>

          <Select
            label="Select Alumnus from Batch"
            options={alumniOptions}
            value={selectedAlumniId}
            onChange={(e) => setSelectedAlumniId(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={assigning}>
              Grant Coordinator Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
