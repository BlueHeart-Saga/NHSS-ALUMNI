import React, { useEffect, useState } from 'react';
import { Megaphone, Send, Plus } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Announcement, Batch } from '../../types';

export const AnnouncementsManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [target, setTarget] = useState<'SCHOOL' | 'BATCH'>('SCHOOL');
  const [batchId, setBatchId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [annData, bData] = await Promise.all([
        api.getAnnouncements(),
        api.getBatches()
      ]);
      setAnnouncements(annData);
      setBatches(bData);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.createAnnouncement(target, title, content, target === 'BATCH' ? batchId : undefined);
      alertService.showSuccess('Announcement Broadcast', 'The announcement update has been broadcasted successfully.');
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      loadData();
    } catch (err: any) {
      alertService.handleApiError(err, 'Announcement broadcast failed.');
    } finally {
      setSending(false);
    }
  };

  const batchOptions = [
    { label: 'Select Target Batch...', value: '' },
    ...batches.map((b) => ({ label: `${b.name} (Year ${b.passing_year})`, value: b.id }))
  ];

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#111111]">Announcements Manager</h2>
          <p className="text-xs text-[#6B7280]">Broadcast official school notices & batch-specific updates</p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Compose Broadcast
        </Button>
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <div key={item.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center flex-shrink-0 text-[#111111]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[11px] font-semibold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/60 px-2.5 py-0.5 rounded-full">
                  {item.target === 'SCHOOL' ? 'School-wide Broadcast' : 'Batch Targeted'}
                </span>
                <span className="text-xs text-[#6B7280]">
                  By {item.created_by_name} • {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#111111]">{item.title}</h3>
              <p className="text-xs text-[#6B7280] mt-1 whitespace-pre-wrap">{item.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Compose Announcement Broadcast">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <Select
            label="Notification Scope"
            options={[
              { label: 'School-wide (All Verified Alumni)', value: 'SCHOOL' },
              { label: 'Target Specific Batch Cohort', value: 'BATCH' }
            ]}
            value={target}
            onChange={(e) => setTarget(e.target.value as any)}
          />

          {target === 'BATCH' && (
            <Select
              label="Select Target Batch Cohort"
              options={batchOptions}
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              required
            />
          )}

          <Input
            label="Announcement Title"
            placeholder="Annual Alumni Reunion Registration Open"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">Announcement Content</label>
            <textarea
              rows={4}
              placeholder="Enter announcement details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542]"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={sending}>
              <Send className="w-4 h-4 mr-1.5" />
              Send Broadcast
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
