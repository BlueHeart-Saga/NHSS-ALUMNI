import React, { useEffect, useState, useMemo } from 'react';
import { Plus, GraduationCap, Users, UserPlus } from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { LoadingState, CardGridSkeleton } from '../../components/EmptyState';
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
  const [search, setSearch] = useState('');

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

  const displayedBatches = useMemo(() => {
    return batches.filter((b) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        String(b.passing_year).includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
    });
  }, [batches, search]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111111]">Batches &amp; Cohorts ({batches.length})</h2>
          <p className="text-xs text-[#6B7280]">School passing year cohorts and assigned batch coordinators</p>
        </div>

        <div className="flex items-center space-x-3">
          <Input
            placeholder="🔍 Search batch year or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Create New Batch
          </Button>
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedBatches.map((batch) => {
          const coords = batch.coordinator_profiles || [];
          return (
            <div
              key={batch.id}
              onClick={() => navigate(`/school-admin/batches/${batch.id}`)}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#F4C542] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header Badge Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF7D6] to-[#FFEAA7] border border-[#F4C542]/70 flex items-center justify-center text-[#111111] group-hover:scale-110 transition-transform shadow-xs">
                    <GraduationCap className="w-5 h-5 text-[#854D0E]" />
                  </div>
                  <span className="text-[#854D0E] font-bold bg-[#FFF7D6] border border-[#F4C542]/40 px-2.5 py-1 rounded-full text-[11px] shadow-2xs">
                    Batch {batch.passing_year}
                  </span>
                </div>

                {/* Batch Name & Motto */}
                <h3 className="font-bold text-[#111111] text-lg leading-snug group-hover:text-[#854D0E] transition-colors">
                  {batch.name}
                </h3>
                <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                  {batch.description || `Class of ${batch.passing_year} Alumni Cohort`}
                </p>

                {/* Batch Coordinators Profile Photos Section */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Batch Coordinators</span>
                    {coords.length > 0 && (
                      <span className="text-[10px] text-[#854D0E] font-bold bg-[#FFF7D6] px-1.5 py-0.5 rounded">
                        {coords.length} Assigned
                      </span>
                    )}
                  </div>

                  {coords.length > 0 ? (
                    <div className="flex items-center space-x-3">
                      {/* Avatar Stack */}
                      <div className="flex -space-x-2.5 overflow-hidden">
                        {coords.slice(0, 3).map((coord, idx) => (
                          <img
                            key={coord.id || idx}
                            src={
                              coord.profile_photo_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(coord.full_name)}&background=F4C542&color=111111`
                            }
                            alt={coord.full_name}
                            title={coord.full_name}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs border border-amber-200"
                          />
                        ))}
                      </div>

                      {/* Names text summary */}
                      <div className="text-xs font-semibold text-[#111111] truncate max-w-[140px]">
                        {coords.map((c) => c.full_name.split(' ')[0]).join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-[#9CA3AF] bg-gray-50 border border-dashed border-gray-200 rounded-lg p-2 font-medium">
                      <UserPlus className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      No Coordinator Assigned
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-[#E5E7EB] mt-5 flex items-center justify-between text-xs">
                <span className="font-bold text-[#111111] flex items-center bg-gray-100/80 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-[#854D0E]" />
                  {batch.total_members} Members
                </span>

                <span className="text-[11px] font-bold text-[#854D0E] group-hover:translate-x-0.5 transition-transform flex items-center">
                  View Batch &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>
      )}

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
