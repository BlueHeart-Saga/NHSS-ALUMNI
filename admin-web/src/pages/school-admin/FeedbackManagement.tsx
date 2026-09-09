import React, { useEffect, useState } from 'react';
import {
  MessageSquareQuote, Star, CheckCircle2, XCircle, AlertTriangle, Plus, Search,
  Filter, Trash2, Edit3, ShieldCheck, Eye, Sparkles, MapPin, Check, X,
  Clock, ThumbsUp, Layers, HelpCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { FeedbackItem, FeedbackAnalytics } from '../../types';
import { getAssetUrl } from '../../utils/asset';

const FEEDBACK_TYPES = [
  { key: 'ALL', label: 'All Categories' },
  { key: 'SUGGESTIONS', label: 'Suggestions / பரிந்துரைகள்' },
  { key: 'APPRECIATION', label: 'Appreciation / பாராட்டுக்கள்' },
  { key: 'MEMORIES', label: 'School Memories / நினைவுகள்' },
  { key: 'WEBSITE', label: 'Website Portal / இணையதளம்' },
  { key: 'ASSOCIATION', label: 'Alumni Association / சங்கம்' },
  { key: 'EVENTS', label: 'Events & Reunions / நிகழ்ச்சிகள்' },
  { key: 'OTHER', label: 'Other / பிற' },
];

export const FeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [analytics, setAnalytics] = useState<FeedbackAnalytics>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    featured: 0,
    average_rating: 5.0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'FEATURED' | 'REJECTED' | 'ALL'>('PENDING');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals State
  const [reviewingFeedback, setReviewingFeedback] = useState<FeedbackItem | null>(null);
  const [adminRemarks, setAdminRemarks] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Edit / Create Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<FeedbackItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameTa, setEditNameTa] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editType, setEditType] = useState('SUGGESTIONS');
  const [editText, setEditText] = useState('');
  const [editTextTa, setEditTextTa] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editStatus, setEditStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('APPROVED');

  useEffect(() => {
    fetchFeedbacks();
    fetchAnalytics();
  }, [activeTab, typeFilter, batchFilter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminFeedback({
        status_filter: activeTab,
        feedback_type: typeFilter,
        batch_year: batchFilter,
        search: searchQuery || undefined,
      });
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to fetch admin feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const stats = await api.getFeedbackAnalytics();
      setAnalytics(stats);
    } catch (err) {
      console.error('Failed to fetch feedback analytics:', err);
    }
  };

  // Quick Approve Handler
  const handleApprove = async (item: FeedbackItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.updateFeedbackStatus(item.id, 'APPROVED', 'Approved by School Admin');
      alertService.showSuccess('Feedback Approved', `Feedback from ${item.alumni_name} is now public.`);
      fetchFeedbacks();
      fetchAnalytics();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to approve feedback.');
    }
  };

  // Quick Reject Handler
  const handleReject = async (item: FeedbackItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReviewingFeedback(item);
    setAdminRemarks('');
  };

  const handleExecuteStatusUpdate = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewingFeedback) return;
    setSubmittingAction(true);
    try {
      await api.updateFeedbackStatus(reviewingFeedback.id, status, adminRemarks);
      alertService.showSuccess('Status Updated', `Feedback marked as ${status}.`);
      setReviewingFeedback(null);
      fetchFeedbacks();
      fetchAnalytics();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to update feedback status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Toggle Featured Star
  const handleToggleFeatured = async (item: FeedbackItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await api.toggleFeaturedFeedback(item.id);
      alertService.showSuccess(
        updated.is_featured ? 'Featured on Top!' : 'Removed from Featured',
        `Feedback from ${item.alumni_name} updated.`
      );
      fetchFeedbacks();
      fetchAnalytics();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to toggle featured status.');
    }
  };

  // Delete Handler
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = await alertService.showConfirm(
      'Delete Feedback?',
      'Are you sure you want to permanently delete this alumni feedback entry?',
      'Delete Entry'
    );
    if (!confirmed) return;

    try {
      await api.deleteFeedback(id);
      alertService.showSuccess('Deleted', 'Feedback record removed.');
      fetchFeedbacks();
      fetchAnalytics();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to delete feedback.');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: FeedbackItem) => {
    setEditingFeedback(item);
    setEditName(item.alumni_name || '');
    setEditNameTa(item.alumni_name_ta || '');
    setEditBatch(item.batch_year || '');
    setEditLocation(item.location || '');
    setEditType(item.feedback_type || 'SUGGESTIONS');
    setEditText(item.feedback_text || '');
    setEditTextTa(item.feedback_text_ta || '');
    setEditRating(item.rating || 5);
    setEditStatus(item.status || 'APPROVED');
    setIsEditModalOpen(true);
  };

  const handleSaveEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeedback) return;
    setSubmittingAction(true);
    try {
      await api.updateFeedback(editingFeedback.id, {
        alumni_name: editName,
        alumni_name_ta: editNameTa,
        batch_year: editBatch,
        location: editLocation,
        feedback_type: editType,
        feedback_text: editText,
        feedback_text_ta: editTextTa,
        rating: editRating,
        status: editStatus,
      });
      alertService.showSuccess('Feedback Updated', 'Feedback details saved successfully.');
      setIsEditModalOpen(false);
      fetchFeedbacks();
      fetchAnalytics();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to update feedback details.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'APPROVED':
        return <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Approved</span>;
      case 'PENDING':
        return <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Pending Review</span>;
      case 'REJECTED':
        return <span className="text-[11px] font-extrabold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Rejected</span>;
      default:
        return <span className="text-[11px] font-extrabold text-gray-800 bg-gray-100 border border-gray-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{st}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-[#111111]">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 border border-[#E5E7EB] rounded-3xl shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[#FFF7D6] text-[#854D0E] border-2 border-[#F4C542] rounded-2xl flex items-center justify-center shrink-0">
            <MessageSquareQuote className="w-6 h-6 text-[#854D0E]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-[#111111]">Alumni Feedback &amp; Opinions</h2>
              <span className="px-2.5 py-0.5 bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                கருத்துகள் &amp; பரிந்துரைகள்
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Review, moderate, and publish alumni opinions, ratings, memories, and suggestions for management.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Feedback</span>
          <div className="text-2xl font-black text-[#111111]">{analytics.total}</div>
          <span className="text-[10px] text-gray-400 font-medium">All Submissions</span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Review</span>
          <div className="text-2xl font-black text-amber-900">{analytics.pending}</div>
          <span className="text-[10px] text-amber-700 font-medium">Needs Admin Action</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Approved</span>
          <div className="text-2xl font-black text-emerald-900">{analytics.approved}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Publicly Published</span>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Rejected</span>
          <div className="text-2xl font-black text-rose-900">{analytics.rejected}</div>
          <span className="text-[10px] text-rose-700 font-medium">Declined Entries</span>
        </div>

        <div className="bg-[#FFF7D6] border border-[#F4C542] p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#854D0E] uppercase tracking-wider">Featured Top</span>
          <div className="text-2xl font-black text-[#854D0E] flex items-center gap-1">
            <span>{analytics.featured}</span>
            <Star className="w-4 h-4 fill-[#854D0E] text-[#854D0E]" />
          </div>
          <span className="text-[10px] text-[#854D0E]/80 font-medium">Highlighted Cards</span>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Avg Rating</span>
          <div className="text-2xl font-black text-blue-900 flex items-center gap-1">
            <span>{analytics.average_rating}</span>
            <span className="text-sm text-amber-500">★</span>
          </div>
          <span className="text-[10px] text-blue-700 font-medium">5.0 Star Scale</span>
        </div>
      </div>

      {/* Tabs & Search Controls Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'PENDING', label: `Pending (${analytics.pending})` },
              { key: 'APPROVED', label: `Approved (${analytics.approved})` },
              { key: 'FEATURED', label: `Featured ⭐ (${analytics.featured})` },
              { key: 'REJECTED', label: `Rejected (${analytics.rejected})` },
              { key: 'ALL', label: `All (${analytics.total})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === t.key
                    ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchFeedbacks(); }}
              placeholder="Search name, batch, opinion text..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111] focus:bg-white"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-500 shrink-0">Category Filter:</span>
          {FEEDBACK_TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => setTypeFilter(type.key)}
              className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all shrink-0 cursor-pointer ${
                typeFilter === type.key
                  ? 'bg-[#FFF7D6] text-[#854D0E] border-[#F4C542]'
                  : 'bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedbacks Grid */}
      {loading ? (
        <LoadingState />
      ) : feedbacks.length === 0 ? (
        <EmptyState
          title="No Feedback Entries Found"
          description={`No alumni opinions match status "${activeTab}" or search query.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((item) => (
            <div
              key={item.id}
              className={`bg-white border-2 rounded-3xl p-5 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative ${
                item.is_featured ? 'border-[#F4C542] ring-2 ring-[#F4C542]/40 bg-gradient-to-b from-[#FFF7D6]/30 to-white' : 'border-gray-200'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badges & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {item.feedback_type}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleFeatured(item, e)}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                      item.is_featured
                        ? 'bg-[#F4C542] text-[#111111] border-[#F4C542] shadow-xs'
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-amber-500'
                    }`}
                    title={item.is_featured ? 'Featured on Top (Click to remove)' : 'Feature this feedback'}
                  >
                    <Star className={`w-4 h-4 ${item.is_featured ? 'fill-[#111111]' : ''}`} />
                  </button>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center space-x-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < (item.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>

                {/* Quote Styling Card Content */}
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-2 relative">
                  <MessageSquareQuote className="w-5 h-5 text-gray-300 absolute top-2 right-2 opacity-50" />
                  <p className="text-xs text-[#111111] leading-relaxed italic font-medium">
                    &quot;{item.feedback_text}&quot;
                  </p>
                  {item.feedback_text_ta && (
                    <p className="text-xs text-[#854D0E] leading-relaxed font-semibold pt-1 border-t border-gray-200/60">
                      &quot;{item.feedback_text_ta}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Alumni Profile Info & Actions Footer */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 border border-[#F4C542] flex items-center justify-center font-bold text-xs text-[#854D0E] shrink-0 overflow-hidden">
                    {item.photo_url ? (
                      <img src={getAssetUrl(item.photo_url)} alt={item.alumni_name} className="w-full h-full object-cover" />
                    ) : (
                      item.alumni_name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#111111] truncate">
                      — {item.alumni_name}
                      {item.alumni_name_ta && <span className="text-[11px] text-gray-500 font-normal ml-1">({item.alumni_name_ta})</span>}
                    </h4>
                    <div className="flex items-center space-x-2 text-[11px] text-gray-500 font-medium">
                      <span className="text-[#854D0E] font-bold">Batch {item.batch_year}</span>
                      {item.location && (
                        <span className="flex items-center space-x-0.5 truncate">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Moderation Buttons */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  {item.status === 'PENDING' ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handleApprove(item, e)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-all shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleReject(item, e)}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-all shadow-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#111111] font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-all border border-gray-300"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#854D0E]" />
                      <span>Edit Details</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Feedback"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Reject Remarks Modal */}
      {reviewingFeedback && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold text-[#111111]">Reject Feedback Entry</h3>
              <button onClick={() => setReviewingFeedback(null)} className="p-1 text-gray-400 hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Rejecting opinion from <strong>{reviewingFeedback.alumni_name}</strong> ({reviewingFeedback.batch_year} Batch).
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#111111]">Rejection Reason / Remarks</label>
              <textarea
                rows={3}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Enter feedback for rejection..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="secondary" onClick={() => setReviewingFeedback(null)}>Cancel</Button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={() => handleExecuteStatusUpdate('REJECTED')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {isEditModalOpen && editingFeedback && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-bold text-[#111111]">Edit Feedback Record</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-gray-400 hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111]">Alumni Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111111]">Tamil Name</label>
                  <input
                    type="text"
                    value={editNameTa}
                    onChange={(e) => setEditNameTa(e.target.value)}
                    placeholder="தமிழ் பெயர்"
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111]">Batch Year *</label>
                  <input
                    type="text"
                    required
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111111]">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Chennai, India"
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111]">Category</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-semibold"
                  >
                    {FEEDBACK_TYPES.filter(t => t.key !== 'ALL').map(t => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111]">Rating Stars (1-5)</label>
                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-semibold"
                  >
                    <option value={5}>5 Stars (★★★★★)</option>
                    <option value={4}>4 Stars (★★★★☆)</option>
                    <option value={3}>3 Stars (★★★☆☆)</option>
                    <option value={2}>2 Stars (★★☆☆☆)</option>
                    <option value={1}>1 Star (★☆☆☆☆)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111]">Feedback Text (English) *</label>
                <textarea
                  rows={3}
                  required
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111]">Feedback Text (Tamil)</label>
                <textarea
                  rows={2}
                  value={editTextTa}
                  onChange={(e) => setEditTextTa(e.target.value)}
                  placeholder="தமிழில் கருத்து..."
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111]">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
                >
                  <option value="APPROVED">Approved &amp; Published</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={submittingAction}>Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
