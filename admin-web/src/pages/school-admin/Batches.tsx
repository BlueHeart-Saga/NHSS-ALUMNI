import React, { useEffect, useState } from 'react';
import { Plus, GraduationCap, Users, UserPlus } from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Batch } from '../../types';
import { useNavigate } from 'react-router-dom';

export const Batches: React.FC = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [passingYear, setPassingYear] = useState<number>(2026);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await api.getBatches();
      setBatches(data);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createBatch(name, passingYear, description);
      alertService.showSuccess('Batch Created Successfully', `Batch cohort for Class of ${passingYear} has been initialized.`);
      setIsCreateOpen(false);
      setName('');
      fetchBatches();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to create batch.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#111111]">Batches & Cohorts</h2>
          <p className="text-xs text-[#6B7280]">School passing year cohorts and assigned batch coordinators</p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {batches.map((batch) => (
          <div
            key={batch.id}
            onClick={() => navigate(`/school-admin/batches/${batch.id}`)}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs hover:border-[#F4C542] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FFF7D6] border border-[#F4C542]/60 flex items-center justify-center mb-4 text-[#111111] group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#111111] text-lg">{batch.name}</h3>
              <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{batch.description || `Class of ${batch.passing_year}`}</p>
            </div>

            <div className="pt-6 border-t border-[#E5E7EB] mt-6 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111111] flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-[#6B7280]" />
                {batch.total_members} Members
              </span>
              <span className="text-[#854D0E] font-semibold bg-[#FFF7D6] px-2 py-0.5 rounded-full text-[11px]">
                Year {batch.passing_year}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Batch Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Batch Cohort">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Batch Name"
            placeholder="Class of 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Passing Year"
            type="number"
            value={passingYear}
            onChange={(e) => setPassingYear(Number(e.target.value))}
            required
          />

          <Input
            label="Description / Motto"
            placeholder="The Golden Jubilee Batch..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creating}>
              Save Batch Cohort
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
