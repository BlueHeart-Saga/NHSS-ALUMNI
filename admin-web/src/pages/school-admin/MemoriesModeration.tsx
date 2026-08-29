import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Memory } from '../../types';

export const MemoriesModeration: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const data = await api.getMemories();
      setMemories(data);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await alertService.showConfirm(
      'Remove Photo Memory?',
      'Are you sure you want to moderate and remove this photo memory from the gallery?',
      'Delete Photo',
      'Keep Photo'
    );
    if (!confirmed) return;
    try {
      await api.deleteMemory(id);
      alertService.showSuccess('Memory Removed', 'The photo memory has been removed from the public gallery.');
      fetchMemories();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to remove photo memory.');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-[#111111]">Memories & Photo Moderation</h2>
        <p className="text-xs text-[#6B7280]">Review event photo gallery uploads submitted by alumni</p>
      </div>

      {memories.length === 0 ? (
        <EmptyState
          title="No Photos Uploaded Yet"
          description="Alumni uploaded reunion photos will appear here for admin gallery display & moderation."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {memories.map((photo) => (
            <div key={photo.id} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs group">
              <div className="h-48 overflow-hidden bg-gray-100 relative">
                <img
                  src={photo.image_url}
                  alt={photo.title || 'Memory'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-3 right-3 p-2 bg-rose-600/90 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
                  title="Moderate & Delete Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4">
                <h4 className="font-bold text-[#111111] text-sm">{photo.title || 'Reunion Photo'}</h4>
                <div className="text-xs text-[#6B7280] mt-1">
                  Uploaded by: <span className="font-semibold text-[#111111]">{photo.uploader_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
