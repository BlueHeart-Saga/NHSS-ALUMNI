import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Trash2, CheckCircle2, XCircle, AlertTriangle, Plus, Eye, Filter, Clock, ShieldCheck, X, Upload } from 'lucide-react';
import { Button } from '../../components/Button';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Memory } from '../../types';
import { getAssetUrl } from '../../utils/asset';

export const MemoriesModeration: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Moderation Review Modal State
  const [reviewingMemory, setReviewingMemory] = useState<Memory | null>(null);
  const [moderationChoice, setModerationChoice] = useState<'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'>('APPROVED');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [submittingModeration, setSubmittingModeration] = useState(false);

  // Admin Create Memory Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createImageUrl, setCreateImageUrl] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createBatchYear, setCreateBatchYear] = useState('');
  const [createUploaderName, setCreateUploaderName] = useState('School Admin');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  useEffect(() => {
    fetchMemories(activeTab);
  }, [activeTab]);

  const fetchMemories = async (tabStatus: string) => {
    try {
      setLoading(true);
      const data = await api.getMemories(tabStatus === 'ALL' ? undefined : tabStatus);
      setMemories(data);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (photo: Memory) => {
    setReviewingMemory(photo);
    setModerationChoice(photo.status === 'REJECTED' ? 'REJECTED' : photo.status === 'CHANGES_REQUESTED' ? 'CHANGES_REQUESTED' : 'APPROVED');
    setAdminRemarks(photo.admin_remarks || '');
  };

  const handleExecuteModeration = async (chosenStatus: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
    if (!reviewingMemory) return;

    setSubmittingModeration(true);
    try {
      await api.updateMemoryStatus(reviewingMemory.id, chosenStatus, adminRemarks);

      const statusLabels = {
        APPROVED: 'Memory Photo Approved & Published!',
        REJECTED: 'Memory Photo Rejected.',
        CHANGES_REQUESTED: 'Changes Requested from Alumni.'
      };

      await alertService.showSuccess('Moderation Complete', statusLabels[chosenStatus]);
      setReviewingMemory(null);
      fetchMemories(activeTab);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to update memory moderation status.');
    } finally {
      setSubmittingModeration(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await alertService.showConfirm(
      'Delete Photo Memory?',
      'Are you sure you want to permanently delete this photo memory from the system?',
      'Delete Memory',
      'Cancel'
    );
    if (!confirmed) return;
    try {
      await api.deleteMemory(id);
      alertService.showSuccess('Memory Deleted', 'The photo memory has been removed.');
      fetchMemories(activeTab);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to delete photo memory.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadSchoolImage(file);
      setCreateImageUrl(res.url);
      alertService.showSuccess('Image Uploaded', 'Photo memory image uploaded successfully.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to upload photo file.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateMemorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createImageUrl.trim()) {
      alertService.showWarning('Required Fields Missing', 'Please enter a Memory Title and provide a Photo Image.');
      return;
    }

    setSubmittingCreate(true);
    try {
      await api.createMemory({
        title: createTitle.trim(),
        image_url: createImageUrl.trim(),
        description: createDescription.trim(),
        batch_year: createBatchYear.trim() || '2024',
        uploader_name: createUploaderName.trim() || 'School Admin',
        status: 'APPROVED'
      });

      alertService.showSuccess('Memory Created', 'New photo memory created and published to public gallery!');
      setIsCreateModalOpen(false);
      setCreateTitle('');
      setCreateImageUrl('');
      setCreateDescription('');
      setCreateBatchYear('');
      fetchMemories(activeTab);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to create memory.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Memories' },
    { key: 'PENDING', label: 'Pending Review' },
    { key: 'APPROVED', label: 'Approved & Published' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'CHANGES_REQUESTED', label: 'Changes Requested' },
    { key: 'REPORTED', label: 'Reported' },
    { key: 'DELETED', label: 'Deleted' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full uppercase tracking-wider">Approved</span>;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full uppercase tracking-wider">Pending Review</span>;
      case 'REJECTED':
        return <span className="text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-full uppercase tracking-wider">Rejected</span>;
      case 'CHANGES_REQUESTED':
        return <span className="text-xs font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2.5 py-1 rounded-full uppercase tracking-wider">Changes Requested</span>;
      case 'REPORTED':
        return <span className="text-xs font-bold text-purple-800 bg-purple-100 border border-purple-300 px-2.5 py-1 rounded-full uppercase tracking-wider">Reported</span>;
      default:
        return <span className="text-xs font-bold text-gray-800 bg-gray-100 border border-gray-300 px-2.5 py-1 rounded-full uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111111]">Admin — Memories Management</h2>
          <p className="text-xs text-[#6B7280]">Memories & Photos • Moderate alumni photo gallery uploads & publish campus archives</p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create / Upload Memory
        </Button>
      </div>

      {/* Controlled Status Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#111111] text-[#F4C542] shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid List View */}
      {loading ? (
        <LoadingState />
      ) : memories.length === 0 ? (
        <EmptyState
          title="No Memories Found"
          description={`No photo memories match the status filter "${activeTab}".`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {memories.map((photo) => {
            const photoSrc = getAssetUrl(photo.image_url) || photo.image_url;

            return (
              <div key={photo.id} className="bg-white border-2 border-[#111111] rounded-2xl overflow-hidden shadow-xs group flex flex-col justify-between">
                <div className="h-48 overflow-hidden bg-gray-100 relative cursor-pointer" onClick={() => handleOpenReview(photo)}>
                  <img
                    src={photoSrc}
                    alt={photo.title || 'Memory'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(photo.status)}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-rose-600/90 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-[#111111] text-base leading-snug line-clamp-1">{photo.title || 'Reunion Photo'}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Submitted by: <span className="font-bold text-[#111111]">{photo.uploader_name}</span>
                    </p>
                    {photo.batch_year && (
                      <p className="text-xs text-gray-500 font-semibold">
                        Batch: <span className="font-bold text-[#854D0E] bg-[#FFF7D6] px-2 py-0.5 rounded-md border border-[#F4C542]/40">{photo.batch_year}</span>
                      </p>
                    )}
                  </div>

                  {photo.admin_remarks && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      <strong>Admin Remarks:</strong> {photo.admin_remarks}
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    className="w-full text-xs font-bold py-2 mt-2"
                    onClick={() => handleOpenReview(photo)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Review Photo Memory
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO REVIEW MODAL DIALOG (AS SPECIFIED) */}
      {/* ========================================================================= */}
      {reviewingMemory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#FFF7D6] border border-[#F4C542] rounded-2xl text-[#854D0E]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#111111]">Memory Review</h3>
                  <p className="text-xs text-gray-500 font-medium">Moderation & Quality Assurance</p>
                </div>
              </div>

              <button
                onClick={() => setReviewingMemory(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-[#111111] hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Gallery Preview */}
            <div className="w-full h-64 sm:h-80 bg-gray-100 rounded-2xl overflow-hidden border-2 border-[#111111] relative">
              <img
                src={getAssetUrl(reviewingMemory.image_url) || reviewingMemory.image_url}
                alt={reviewingMemory.title}
                className="w-full h-full object-contain bg-black/90"
              />
            </div>

            {/* Metadata Summary */}
            <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#111111] text-base">{reviewingMemory.title}</span>
                {getStatusBadge(reviewingMemory.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <div>Submitted by: <strong className="text-[#111111]">{reviewingMemory.uploader_name}</strong></div>
                <div>Batch Year: <strong className="text-[#854D0E]">{reviewingMemory.batch_year || 'N/A'}</strong></div>
              </div>

              {reviewingMemory.description && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-700 block mb-1">Description:</span>
                  <p className="text-gray-600 italic leading-relaxed">{reviewingMemory.description}</p>
                </div>
              )}
            </div>

            {/* Moderation Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                  Moderation Action
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`flex items-center space-x-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    moderationChoice === 'APPROVED' ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="moderationChoice"
                      value="APPROVED"
                      checked={moderationChoice === 'APPROVED'}
                      onChange={() => setModerationChoice('APPROVED')}
                      className="accent-emerald-600"
                    />
                    <span className="text-xs">Approve</span>
                  </label>

                  <label className={`flex items-center space-x-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    moderationChoice === 'CHANGES_REQUESTED' ? 'bg-amber-50 border-amber-600 text-amber-900 font-bold' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="moderationChoice"
                      value="CHANGES_REQUESTED"
                      checked={moderationChoice === 'CHANGES_REQUESTED'}
                      onChange={() => setModerationChoice('CHANGES_REQUESTED')}
                      className="accent-amber-600"
                    />
                    <span className="text-xs">Request Changes</span>
                  </label>

                  <label className={`flex items-center space-x-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    moderationChoice === 'REJECTED' ? 'bg-rose-50 border-rose-600 text-rose-900 font-bold' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="moderationChoice"
                      value="REJECTED"
                      checked={moderationChoice === 'REJECTED'}
                      onChange={() => setModerationChoice('REJECTED')}
                      className="accent-rose-600"
                    />
                    <span className="text-xs">Reject</span>
                  </label>
                </div>
              </div>

              {/* Admin Remarks Input */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                  Admin Remarks (Reason shown to alumni)
                </label>
                <textarea
                  rows={3}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Enter moderation feedback or reason for approval/rejection..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>
            </div>

            {/* Action Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                disabled={submittingModeration}
                onClick={() => handleExecuteModeration('REJECTED')}
                className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Reject
              </button>

              <button
                type="button"
                disabled={submittingModeration}
                onClick={() => handleExecuteModeration('CHANGES_REQUESTED')}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Request Changes
              </button>

              <button
                type="button"
                disabled={submittingModeration}
                onClick={() => handleExecuteModeration('APPROVED')}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer border border-[#F4C542]/50 flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#F4C542]" />
                <span>Approve &amp; Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN CREATE / UPLOAD MEMORY MODAL */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-[#111111]">Create / Upload Photo Memory</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMemorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Memory Title *
                </label>
                <input
                  type="text"
                  required
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="e.g. 1998 School Reunion"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Photo Image *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={createImageUrl}
                    onChange={(e) => setCreateImageUrl(e.target.value)}
                    placeholder="/school-images/Republic-Day.png or image URL"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                  <label className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#111111] rounded-xl cursor-pointer border border-gray-300">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Choose Local Photo File'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Batch / Academic Year
                  </label>
                  <input
                    type="text"
                    value={createBatchYear}
                    onChange={(e) => setCreateBatchYear(e.target.value)}
                    placeholder="2024"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Uploader Name
                  </label>
                  <input
                    type="text"
                    value={createUploaderName}
                    onChange={(e) => setCreateUploaderName(e.target.value)}
                    placeholder="School Admin"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Memories from our school reunion..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={submittingCreate}>
                  Save &amp; Publish Memory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
