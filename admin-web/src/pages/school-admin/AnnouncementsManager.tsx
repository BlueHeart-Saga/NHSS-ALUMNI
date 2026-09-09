import React, { useEffect, useState } from 'react';
import { 
  Megaphone, 
  Send, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  X, 
  Eye, 
  Search, 
  Calendar, 
  FileText, 
  Award, 
  BookOpen, 
  PartyPopper
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { ImageUploadAndEdit } from '../../components/ImageUploadAndEdit';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Announcement, Batch } from '../../types';

// Categories Configuration with bilingual labels & badge colors
export const ANNOUNCEMENT_CATEGORIES = [
  { id: 'GENERAL', labelEn: 'General Notice', labelTa: 'பொது அறிவிப்பு', icon: Megaphone, color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'CIRCULAR', labelEn: 'Official Circular', labelTa: 'அதிகாரப்பூர்வ சுற்றறிக்கை', icon: FileText, color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'EVENT_NOTICE', labelEn: 'Event / Reunion', labelTa: 'நிகழ்வு / சந்திப்பு', icon: Calendar, color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'CELEBRATION', labelEn: 'Celebration & Festival', labelTa: 'விழா & கொண்டாட்டம்', icon: PartyPopper, color: 'bg-rose-100 text-rose-900 border-rose-300' },
  { id: 'ACADEMIC', labelEn: 'Academic & Exams', labelTa: 'கல்வி & தேர்வுகள்', icon: BookOpen, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'ACHIEVEMENT', labelEn: 'School Achievement', labelTa: 'பள்ளி சாதனை', icon: Award, color: 'bg-orange-100 text-orange-900 border-orange-300' },
];

export const AnnouncementsManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [targetFilter, setTargetFilter] = useState('ALL');

  // Compose / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  // Form fields
  const [target, setTarget] = useState<'SCHOOL' | 'BATCH'>('SCHOOL');
  const [batchId, setBatchId] = useState<string>('');
  const [category, setCategory] = useState<string>('GENERAL');
  const [title, setTitle] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [content, setContent] = useState('');
  const [contentTa, setContentTa] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Poster preview modal state
  const [previewPosterUrl, setPreviewPosterUrl] = useState<string | null>(null);

  // Active language tab in compose modal ('en' or 'ta')
  const [activeLangTab, setActiveLangTab] = useState<'en' | 'ta'>('en');

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
      alertService.handleApiError(err, 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompose = () => {
    setEditingItem(null);
    setTarget('SCHOOL');
    setBatchId('');
    setCategory('GENERAL');
    setTitle('');
    setTitleTa('');
    setContent('');
    setContentTa('');
    setPosterUrl('');
    setActiveLangTab('en');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingItem(item);
    setTarget(item.target);
    setBatchId(item.batch_id || '');
    setCategory(item.category || 'GENERAL');
    setTitle(item.title || '');
    setTitleTa(item.title_ta || '');
    setContent(item.content || '');
    setContentTa(item.content_ta || '');
    setPosterUrl(item.poster_url || '');
    setActiveLangTab('en');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !titleTa.trim()) {
      alertService.showError('Missing Title', 'Please enter at least an English or Tamil title for the announcement.');
      return;
    }
    if (!content.trim() && !contentTa.trim()) {
      alertService.showError('Missing Content', 'Please enter at least English or Tamil content details.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        target,
        batch_id: target === 'BATCH' ? batchId : undefined,
        category,
        title: title.trim() || titleTa.trim(),
        title_ta: titleTa.trim() || undefined,
        content: content.trim() || contentTa.trim(),
        content_ta: contentTa.trim() || undefined,
        poster_url: posterUrl || undefined,
      };

      if (editingItem) {
        await api.updateAnnouncement(editingItem.id, payload);
        alertService.showSuccess('Updated Successfully', 'The announcement details have been updated.');
      } else {
        await api.createAnnouncement(payload);
        alertService.showSuccess('Broadcast Published', 'The announcement has been broadcasted and saved.');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alertService.handleApiError(err, editingItem ? 'Update failed' : 'Broadcast failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, titleText: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete announcement "${titleText}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.deleteAnnouncement(id);
      alertService.showSuccess('Deleted', 'The announcement has been deleted.');
      loadData();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to delete announcement');
    }
  };

  const batchOptions = [
    { label: 'Select Target Batch...', value: '' },
    ...batches.map((b) => ({ label: `${b.name} (Year ${b.passing_year})`, value: b.id }))
  ];

  // Filtering
  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch = 
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.title_ta && item.title_ta.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.content_ta && item.content_ta.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.created_by_name && item.created_by_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || (item.category || 'GENERAL') === categoryFilter;
    const matchesTarget = targetFilter === 'ALL' || item.target === targetFilter;

    return matchesSearch && matchesCategory && matchesTarget;
  });

  const getCategoryMeta = (catId?: string) => {
    const found = ANNOUNCEMENT_CATEGORIES.find((c) => c.id === catId);
    return found || ANNOUNCEMENT_CATEGORIES[0];
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-amber-50 via-white to-amber-50/40 p-6 rounded-3xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-[#F4C542] rounded-xl text-[#111111]">
              <Megaphone className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-[#111111]">
              Announcements & News Manager
            </h2>
          </div>
          <p className="text-xs text-[#6B7280] mt-1 ml-10">
            Publish school news, posters, circulars, and notices in English & தமிழ் (Tamil) with built-in image crop and editing
          </p>
        </div>

        <Button onClick={handleOpenCompose} className="w-full md:w-auto shadow-md">
          <Plus className="w-4 h-4 mr-1.5" />
          Compose New Notice
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search news by title, Tamil keyword, content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542] text-[#111111]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] focus:outline-none focus:border-[#F4C542]"
          >
            <option value="ALL">All Categories (அனைத்து வகைகள்)</option>
            {ANNOUNCEMENT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.labelEn} ({cat.labelTa})
              </option>
            ))}
          </select>

          {/* Target Filter */}
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="w-full md:w-auto text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] focus:outline-none focus:border-[#F4C542]"
          >
            <option value="ALL">All Audiences</option>
            <option value="SCHOOL">School-wide (Public)</option>
            <option value="BATCH">Batch Targeted</option>
          </select>
        </div>
      </div>

      {/* Announcements List Grid */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No Announcements Found"
          description={searchTerm || categoryFilter !== 'ALL' ? "No notices match your selected filters." : "Publish your first school announcement with poster flyers and bilingual text."}
          action={
            <Button variant="primary" onClick={handleOpenCompose}>
              Create Announcement
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnnouncements.map((item) => {
            const catMeta = getCategoryMeta(item.category);
            const CatIcon = catMeta.icon;

            return (
              <div 
                key={item.id} 
                className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-[#F4C542] transition-all flex flex-col justify-between group"
              >
                {/* Poster Flyer Banner (If present) */}
                {item.poster_url ? (
                  <div className="relative aspect-video bg-gray-900 overflow-hidden cursor-pointer group/poster">
                    <img 
                      src={item.poster_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Hover Actions Overlay */}
                    <div 
                      onClick={() => setPreviewPosterUrl(item.poster_url!)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white backdrop-blur-[2px] cursor-pointer"
                    >
                      <span className="px-3.5 py-1.5 bg-black/70 hover:bg-black rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-white/20 shadow-md">
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Poster</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 bg-gradient-to-r from-amber-50 to-[#FFF7D6] flex items-center justify-between px-5 border-b border-amber-100">
                    <div className="flex items-center space-x-2 text-amber-800">
                      <CatIcon className="w-6 h-6 stroke-[1.8]" />
                      <span className="text-xs font-bold">{catMeta.labelEn}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-700/80">No Poster Attached</span>
                  </div>
                )}

                {/* Card Content Area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Badge Strip */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center space-x-1 ${catMeta.color}`}>
                        <CatIcon className="w-3 h-3 mr-1 inline" />
                        <span>{catMeta.labelEn}</span>
                      </span>

                      <span className="text-[10px] font-semibold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/60 px-2 py-0.5 rounded-full">
                        {item.target === 'SCHOOL' ? '🌐 School-wide (Public)' : '🎯 Batch Cohort'}
                      </span>
                    </div>

                    {/* Titles: English & Tamil */}
                    <h3 className="text-base font-bold text-[#111111] group-hover:text-[#854D0E] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    {item.title_ta && (
                      <p className="text-sm font-semibold text-amber-900/90 mt-0.5">
                        {item.title_ta}
                      </p>
                    )}

                    {/* Excerpt */}
                    <p className="text-xs text-[#4B5563] mt-2 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                    {item.content_ta && item.content_ta !== item.content && (
                      <p className="text-xs text-[#6B7280] mt-1.5 italic line-clamp-2">
                        தமிழ்: {item.content_ta}
                      </p>
                    )}
                  </div>

                  {/* Metadata Footer */}
                  <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#9CA3AF]">
                    <div className="flex flex-col">
                      <span className="text-[#4B5563] font-medium">By {item.created_by_name}</span>
                      <span>{new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      {item.poster_url && (
                        <button
                          type="button"
                          onClick={() => setPreviewPosterUrl(item.poster_url!)}
                          title="View Full Poster"
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Announcement"
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        title="Delete Announcement"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compose / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "Edit Announcement Notice" : "Compose Announcement & School News"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {/* 1. Category & Scope Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Notice Category (அறிவிப்பு வகை)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
              >
                {ANNOUNCEMENT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.labelEn} ({c.labelTa})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Audience Scope (பார்வையாளர்கள்)
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as any)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
              >
                <option value="SCHOOL">School-wide & Public Homepage (அனைவருக்கும்)</option>
                <option value="BATCH">Specific Batch Cohort (குறிப்பிட்ட ஆண்டு)</option>
              </select>
            </div>
          </div>

          {target === 'BATCH' && (
            <Select
              label="Select Target Batch Cohort"
              options={batchOptions}
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              required
            />
          )}

          {/* 2. Interactive Image Upload & Editor Component */}
          <div className="bg-[#FFFDF5] border border-amber-200/80 rounded-2xl p-4">
            <ImageUploadAndEdit
              label="Notice Poster / Flyer (சுவரொட்டி அல்லது படம்)"
              sublabel="Drag & drop, upload WebP, crop to 16:9 banner, rotate, or adjust colors."
              value={posterUrl}
              onChange={setPosterUrl}
              aspectRatioPreset="16:9"
            />
          </div>

          {/* 3. Bilingual Tabs for English & Tamil Details */}
          <div>
            <div className="flex border-b border-gray-200 mb-3">
              <button
                type="button"
                onClick={() => setActiveLangTab('en')}
                className={`flex-1 py-2 text-xs font-bold border-b-2 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                  activeLangTab === 'en'
                    ? 'border-[#F4C542] text-[#111111]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>🇬🇧 English Notice Details</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('ta')}
                className={`flex-1 py-2 text-xs font-bold border-b-2 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                  activeLangTab === 'ta'
                    ? 'border-[#F4C542] text-[#111111]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>🇮🇳 தமிழ் விவரங்கள் (Tamil Details)</span>
              </button>
            </div>

            {/* English Fields */}
            {activeLangTab === 'en' && (
              <div className="space-y-3 animate-fadeIn">
                <Input
                  label="Title (English)"
                  placeholder="e.g. Annual Alumni Meet 2026 Registration Open"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required={!titleTa}
                />

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                    Announcement Details (English)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide full announcement details, timings, guidelines..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    required={!contentTa}
                  />
                </div>
              </div>
            )}

            {/* Tamil Fields */}
            {activeLangTab === 'ta' && (
              <div className="space-y-3 animate-fadeIn">
                <Input
                  label="அறிவிப்பு தலைப்பு (Tamil Title)"
                  placeholder="எ.கா: முன்னாள் மாணவர் சங்க ஆண்டு விழா 2026 பதிவு தொடக்கம்"
                  value={titleTa}
                  onChange={(e) => setTitleTa(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                    முழு விவரம் / செய்தி (Tamil Content)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="அறிவிப்பின் முழு விவரங்கள், நேரம், விதிகளினை உள்ளிடவும்..."
                    value={contentTa}
                    onChange={(e) => setContentTa(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              <Send className="w-4 h-4 mr-1.5" />
              {editingItem ? 'Update Announcement' : 'Publish Broadcast'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Full-Screen Poster Preview Lightbox Modal */}
      {previewPosterUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewPosterUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-2 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewPosterUrl}
              alt="Poster Fullscreen"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
