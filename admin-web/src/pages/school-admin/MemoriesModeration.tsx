import React, { useEffect, useState } from 'react';
import { 
  Image as ImageIcon, Trash2, CheckCircle2, XCircle, AlertTriangle, Plus, Eye, 
  Filter, Clock, ShieldCheck, X, Upload, Video, FolderPlus, Layers, Play, Search, Film, Check, ChevronLeft, ChevronRight,
  Loader2, Sparkles, Globe, Calendar, Star, Edit3, RefreshCw, CheckSquare, Square,
  User, GraduationCap, Building2
} from 'lucide-react';
import { Button } from '../../components/Button';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Memory, AlumniProfile } from '../../types';
import { getAssetUrl } from '../../utils/asset';
import { useLanguage } from '../../context/LanguageContext';

const DEFAULT_ALBUMS = [
  'General School Gallery',
  'Annual Sports Day 2025',
  'Annual Day & Cultural Fest',
  'Silver Jubilee Alumni Reunion',
  'Science & Technology Expo',
  'Heritage Campus Life',
  'Independence Day Celebrations',
  'Pongal Cultural Festival'
];

export const MemoriesModeration: React.FC = () => {
  const { t } = useLanguage();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [albums, setAlbums] = useState<{ album_name: string; count: number; cover_image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'GALLERY' vs 'ALBUMS'
  const [viewMode, setViewMode] = useState<'GALLERY' | 'ALBUMS'>('GALLERY');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'ALBUM'>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'>('ALL');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk Selection State
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);

  // Lightbox & Review Modal State
  const [reviewingMemory, setReviewingMemory] = useState<Memory | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [submittingModeration, setSubmittingModeration] = useState(false);

  // Admin Create & Edit Memory / Album Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | 'ALBUM'>('IMAGE');
  const [createTitle, setCreateTitle] = useState('');
  const [createTitleTa, setCreateTitleTa] = useState('');
  const [createAlbumName, setCreateAlbumName] = useState('General School Gallery');
  const [customAlbumInput, setCustomAlbumInput] = useState('');
  const [createCoverImageUrl, setCreateCoverImageUrl] = useState('');
  const [createMediaUrls, setCreateMediaUrls] = useState<string[]>([]);
  const [createVideoUrl, setCreateVideoUrl] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createDescriptionTa, setCreateDescriptionTa] = useState('');
  const [targetAudience, setTargetAudience] = useState<'PUBLIC' | 'BATCH'>('PUBLIC');
  const [createBatchYear, setCreateBatchYear] = useState('');
  const [createUploaderName, setCreateUploaderName] = useState('School Admin');
  const [createUploaderEmail, setCreateUploaderEmail] = useState('');

  // Current Logged-in Admin User & Alumni List
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [showAlumniPicker, setShowAlumniPicker] = useState(false);
  const [alumniFilterQuery, setAlumniFilterQuery] = useState('');

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const uploadAbortRef = React.useRef<boolean>(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const handleCancelUpload = () => {
    uploadAbortRef.current = true;
  };

  useEffect(() => {
    fetchMemories();
    fetchAlbums();
    loadAdminAndAlumni();
  }, [activeTab, mediaTypeFilter, selectedAlbum]);

  const loadAdminAndAlumni = async () => {
    try {
      const [user, alumni] = await Promise.all([
        api.getMe().catch(() => null),
        api.searchAlumni().catch(() => [])
      ]);
      if (user) {
        setCurrentUser(user);
        const name = user.full_name || (user as any).username || 'School Admin';
        setCreateUploaderName(name);
        if (user.email) setCreateUploaderEmail(user.email);
      }
      if (alumni && Array.isArray(alumni)) {
        setAlumniList(alumni);
      }
    } catch (err) {
      console.error('Failed to load admin profile or alumni records:', err);
    }
  };

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const data = await api.getMemories(
        activeTab === 'ALL' ? undefined : activeTab,
        mediaTypeFilter === 'ALL' ? undefined : mediaTypeFilter,
        selectedAlbum === 'ALL' ? undefined : selectedAlbum,
        searchQuery || undefined
      );
      setMemories(data);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const data = await api.getMemoryAlbums();
      setAlbums(data);
    } catch (err) {
      console.error('Failed to fetch albums:', err);
    }
  };

  const handleOpenReview = (memory: Memory) => {
    setReviewingMemory(memory);
    setActiveImageIndex(0);
    setAdminRemarks(memory.admin_remarks || '');
  };

  const handleExecuteModeration = async (chosenStatus: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
    if (!reviewingMemory) return;

    setSubmittingModeration(true);
    try {
      await api.updateMemoryStatus(reviewingMemory.id, chosenStatus, adminRemarks);

      const statusLabels: Record<string, string> = {
        APPROVED: t('admin_memories_alert_approved_body'),
        REJECTED: t('admin_memories_alert_rejected_body'),
        CHANGES_REQUESTED: t('admin_memories_alert_changes_body')
      };

      await alertService.showSuccess(t('admin_memories_alert_moderation_complete'), statusLabels[chosenStatus]);
      setReviewingMemory(null);
      fetchMemories();
      fetchAlbums();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_memories_alert_moderation_failed'));
    } finally {
      setSubmittingModeration(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = await alertService.showConfirm(
      t('admin_memories_alert_delete_confirm_title'),
      t('admin_memories_alert_delete_confirm_body'),
      t('admin_memories_alert_delete_confirm_btn'),
      t('admin_memories_alert_delete_cancel_btn')
    );
    if (!confirmed) return;
    try {
      await api.deleteMemory(id);
      alertService.showSuccess(t('admin_memories_alert_deleted_title'), t('admin_memories_alert_deleted_body'));
      fetchMemories();
      fetchAlbums();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_memories_alert_delete_error'));
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setUploadingMedia(true);
    uploadAbortRef.current = false;
    setUploadProgress({ current: 0, total: fileList.length });

    let successCount = 0;
    for (let i = 0; i < fileList.length; i++) {
      if (uploadAbortRef.current) {
        alertService.showInfo(
          t('admin_memories_alert_upload_stopped_title'),
          t('admin_memories_alert_upload_stopped_files')
            .replace('{done}', String(successCount))
            .replace('{total}', String(fileList.length))
        );
        break;
      }

      setUploadProgress({ current: i + 1, total: fileList.length });

      try {
        const res = await api.uploadMemoryFile(fileList[i]);
        if (i === 0 && !createCoverImageUrl) {
          setCreateCoverImageUrl(res.url);
        }
        if (res.media_type === 'VIDEO') {
          setCreateVideoUrl(res.url);
          setMediaType('VIDEO');
        } else {
          setCreateMediaUrls(prev => {
            if (prev.includes(res.url)) return prev;
            const updated = [...prev, res.url];
            if (!createCoverImageUrl) setCreateCoverImageUrl(updated[0]);
            if (updated.length > 1) setMediaType('ALBUM');
            return updated;
          });
        }
        successCount++;
      } catch (err: any) {
        console.error(`Failed to upload file ${i + 1}:`, err);
      }
    }

    setUploadingMedia(false);
    setUploadProgress(null);
    if (!uploadAbortRef.current && successCount > 0) {
      alertService.showSuccess(
        t('admin_memories_alert_files_uploaded_title'),
        t('admin_memories_alert_files_uploaded_body').replace('{count}', String(successCount))
      );
    }
  };

  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setUploadingMedia(true);
    uploadAbortRef.current = false;
    setUploadProgress({ current: 0, total: fileList.length });

    let successCount = 0;
    for (let i = 0; i < fileList.length; i++) {
      if (uploadAbortRef.current) {
        alertService.showInfo(
          t('admin_memories_alert_upload_stopped_title'),
          t('admin_memories_alert_upload_stopped_photos')
            .replace('{done}', String(successCount))
            .replace('{total}', String(fileList.length))
        );
        break;
      }

      setUploadProgress({ current: i + 1, total: fileList.length });

      try {
        const res = await api.uploadMemoryFile(fileList[i]);
        setCreateMediaUrls(prev => {
          if (prev.includes(res.url)) return prev;
          const updated = [...prev, res.url];
          if (!createCoverImageUrl && updated.length > 0) {
            setCreateCoverImageUrl(updated[0]);
          }
          if (updated.length > 1) {
            setMediaType('ALBUM');
          }
          return updated;
        });
        successCount++;
      } catch (err: any) {
        console.error(`Failed to upload photo ${i + 1}:`, err);
      }
    }

    setUploadingMedia(false);
    setUploadProgress(null);
    if (!uploadAbortRef.current && successCount > 0) {
      alertService.showSuccess(
        t('admin_memories_alert_photos_added_title'),
        t('admin_memories_alert_photos_added_body').replace('{count}', String(successCount))
      );
    }
  };

  const handleOpenCreateModal = () => {
    setEditingMemory(null);
    setMediaType('IMAGE');
    setCreateTitle('');
    setCreateTitleTa('');
    setCreateAlbumName(DEFAULT_ALBUMS[0]);
    setCustomAlbumInput('');
    setCreateCoverImageUrl('');
    setCreateMediaUrls([]);
    setCreateVideoUrl('');
    setCreateDescription('');
    setCreateDescriptionTa('');
    setTargetAudience('PUBLIC');
    setCreateBatchYear('');
    const defaultName = currentUser?.full_name || (currentUser as any)?.username || 'School Admin';
    setCreateUploaderName(defaultName);
    setCreateUploaderEmail(currentUser?.email || '');
    setShowAlumniPicker(false);
    setAlumniFilterQuery('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (memory: Memory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMemory(memory);
    setMediaType(memory.media_type || 'IMAGE');
    setCreateTitle(memory.title || '');
    setCreateTitleTa(memory.title_ta || '');
    
    if (DEFAULT_ALBUMS.includes(memory.album_name || '')) {
      setCreateAlbumName(memory.album_name || DEFAULT_ALBUMS[0]);
      setCustomAlbumInput('');
    } else {
      setCreateAlbumName('CUSTOM');
      setCustomAlbumInput(memory.album_name || '');
    }

    setCreateCoverImageUrl(memory.cover_image_url || memory.image_url || '');
    setCreateMediaUrls(memory.media_urls || []);
    setCreateVideoUrl(memory.video_url || '');
    setCreateDescription(memory.description || '');
    setCreateDescriptionTa(memory.description_ta || '');
    setTargetAudience(memory.target_audience === 'BATCH' || (memory.batch_year && memory.batch_year !== 'Public / School-Wide') ? 'BATCH' : 'PUBLIC');
    setCreateBatchYear(memory.batch_year && memory.batch_year !== 'Public / School-Wide' ? memory.batch_year : '');
    setCreateUploaderName(memory.uploader_name || currentUser?.full_name || 'School Admin');
    setCreateUploaderEmail(memory.uploader_email || '');
    setShowAlumniPicker(false);
    setAlumniFilterQuery('');
    setIsCreateModalOpen(true);
  };

  const handleReplaceSingleImage = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const res = await api.uploadMemoryFile(file);
      const updated = [...createMediaUrls];
      const oldUrl = updated[idx];
      updated[idx] = res.url;
      setCreateMediaUrls(updated);

      if (createCoverImageUrl === oldUrl || idx === 0) {
        setCreateCoverImageUrl(res.url);
      }
      alertService.showSuccess(
        t('admin_memories_alert_image_replaced_title'),
        t('admin_memories_alert_image_replaced_body').replace('{index}', String(idx + 1))
      );
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_memories_alert_image_replace_error'));
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleRemoveGalleryUrl = (idx: number) => {
    const updated = createMediaUrls.filter((_, i) => i !== idx);
    setCreateMediaUrls(updated);
  };

  const handleToggleSelectMemory = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedMemoryIds.includes(id)) {
      setSelectedMemoryIds(selectedMemoryIds.filter(item => item !== id));
    } else {
      setSelectedMemoryIds([...selectedMemoryIds, id]);
    }
  };

  const handleSelectAllMemories = () => {
    if (selectedMemoryIds.length === memories.length) {
      setSelectedMemoryIds([]);
    } else {
      setSelectedMemoryIds(memories.map(m => m.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMemoryIds.length === 0) return;
    const confirmed = await alertService.showConfirm(
      t('admin_memories_alert_bulk_delete_title'),
      t('admin_memories_alert_bulk_delete_body').replace('{count}', String(selectedMemoryIds.length)),
      t('admin_memories_alert_bulk_delete_btn').replace('{count}', String(selectedMemoryIds.length)),
      t('admin_memories_alert_delete_cancel_btn')
    );
    if (!confirmed) return;

    try {
      await api.bulkDeleteMemories(selectedMemoryIds);
      alertService.showSuccess(
        t('admin_memories_alert_bulk_delete_done_title'),
        t('admin_memories_alert_bulk_delete_done_body').replace('{count}', String(selectedMemoryIds.length))
      );
      setSelectedMemoryIds([]);
      fetchMemories();
      fetchAlbums();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_memories_alert_bulk_delete_error'));
    }
  };

  const handleCreateMemorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) {
      alertService.showWarning(
        t('admin_memories_alert_title_required_title'),
        t('admin_memories_alert_title_required_body')
      );
      return;
    }
    const finalAlbumName = (customAlbumInput.trim() || createAlbumName.trim()) || 'General School Gallery';
    const finalBatchYear = targetAudience === 'PUBLIC' ? 'Public / School-Wide' : (createBatchYear.trim() || '2025');

    setSubmittingCreate(true);
    try {
      const cover = createCoverImageUrl.trim() || (createMediaUrls.length > 0 ? createMediaUrls[0] : '');
      const finalUrls = createMediaUrls.length > 0 ? createMediaUrls : (cover ? [cover] : []);

      const payload: Partial<Memory> = {
        title: createTitle.trim(),
        title_ta: createTitleTa.trim() || undefined,
        album_name: finalAlbumName,
        media_type: mediaType,
        cover_image_url: cover,
        image_url: cover,
        media_urls: finalUrls,
        video_url: createVideoUrl.trim() || undefined,
        description: createDescription.trim(),
        description_ta: createDescriptionTa.trim() || undefined,
        target_audience: targetAudience,
        batch_year: finalBatchYear,
        uploader_name: createUploaderName.trim() || currentUser?.full_name || 'School Admin',
        uploader_email: createUploaderEmail.trim() || undefined,
        status: 'APPROVED'
      };

      if (editingMemory) {
        await api.updateMemory(editingMemory.id, payload);
        alertService.showSuccess(t('admin_memories_alert_updated_title'), t('admin_memories_alert_updated_body'));
      } else {
        await api.createMemory(payload);
        alertService.showSuccess(t('admin_memories_alert_published_title'), t('admin_memories_alert_published_body'));
      }

      setIsCreateModalOpen(false);
      setEditingMemory(null);
      setCreateTitle('');
      setCreateTitleTa('');
      setCreateCoverImageUrl('');
      setCreateMediaUrls([]);
      setCreateVideoUrl('');
      setCreateDescription('');
      setCreateDescriptionTa('');
      setTargetAudience('PUBLIC');
      setCreateBatchYear('');
      setCustomAlbumInput('');
      fetchMemories();
      fetchAlbums();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_memories_alert_save_error'));
    } finally {
      setSubmittingCreate(false);
    }
  };

  const statusTabs = [
    { key: 'ALL', labelKey: 'admin_memories_tab_all' },
    { key: 'PENDING', labelKey: 'admin_memories_tab_pending' },
    { key: 'APPROVED', labelKey: 'admin_memories_tab_approved' },
    { key: 'REJECTED', labelKey: 'admin_memories_tab_rejected' },
    { key: 'CHANGES_REQUESTED', labelKey: 'admin_memories_tab_changes' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{t('admin_memories_status_approved')}</span>;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'PENDING':
        return <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{t('admin_memories_status_pending')}</span>;
      case 'REJECTED':
        return <span className="text-[11px] font-extrabold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{t('admin_memories_status_rejected')}</span>;
      case 'CHANGES_REQUESTED':
        return <span className="text-[11px] font-extrabold text-blue-800 bg-blue-100 border border-blue-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{t('admin_memories_status_changes')}</span>;
      default:
        return <span className="text-[11px] font-extrabold text-gray-800 bg-gray-100 border border-gray-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{status}</span>;
    }
  };

  const getMediaTypeBadge = (type?: string, urlCount: number = 1) => {
    if (type === 'VIDEO') {
      return (
        <span className="text-[10px] font-extrabold bg-purple-950/90 text-purple-300 border border-purple-400/50 px-2 py-0.5 rounded-full flex items-center space-x-1">
          <Film className="w-3 h-3 text-purple-400" />
          <span>{t('admin_memories_badge_video')}</span>
        </span>
      );
    }
    if (type === 'ALBUM' || urlCount > 1) {
      return (
        <span className="text-[10px] font-extrabold bg-blue-950/90 text-blue-300 border border-blue-400/50 px-2 py-0.5 rounded-full flex items-center space-x-1">
          <Layers className="w-3 h-3 text-blue-400" />
          <span>{t('admin_memories_badge_album_photos').replace('{count}', String(urlCount))}</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-extrabold bg-gray-900/90 text-gray-200 border border-gray-700 px-2 py-0.5 rounded-full flex items-center space-x-1">
        <ImageIcon className="w-3 h-3 text-amber-400" />
        <span>{t('admin_memories_badge_photo')}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-[#111111]">
      
      {/* Top Header & Primary Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 border border-[#E5E7EB] rounded-3xl shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[#FFF7D6] text-[#854D0E] border-2 border-[#F4C542] rounded-2xl flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6 text-[#854D0E]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-[#111111]">{t('admin_memories_page_title')}</h2>
              <span className="px-2.5 py-0.5 bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                {t('admin_memories_page_badge')}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {t('admin_memories_page_subtitle')}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center shrink-0">
          <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>{t('admin_memories_create_btn')}</span>
          </Button>
        </div>
      </div>

      {/* Mode Toggle & Search Controls */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* View Mode Buttons: Gallery Grid vs Albums Grid */}
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => { setViewMode('GALLERY'); setSelectedAlbum('ALL'); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-2 ${
                viewMode === 'GALLERY' ? 'bg-[#111111] text-[#F4C542] shadow-sm' : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{t('admin_memories_view_gallery').replace('{count}', String(memories.length))}</span>
            </button>

            <button
              onClick={() => setViewMode('ALBUMS')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-2 ${
                viewMode === 'ALBUMS' ? 'bg-[#111111] text-[#F4C542] shadow-sm' : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{t('admin_memories_view_albums').replace('{count}', String(albums.length))}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchMemories(); }}
              placeholder={t('admin_memories_search_placeholder')}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111] focus:bg-white"
            />
          </div>
        </div>

        {/* Media Type Filter Pills & Status Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#111111] text-[#F4C542]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Media Type Pills */}
          <div className="flex items-center space-x-2 shrink-0">
            {(['ALL', 'IMAGE', 'VIDEO', 'ALBUM'] as const).map((mt) => (
              <button
                key={mt}
                onClick={() => setMediaTypeFilter(mt)}
                className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all cursor-pointer ${
                  mediaTypeFilter === mt
                    ? 'bg-[#FFF7D6] text-[#854D0E] border-[#F4C542]'
                    : 'bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50'
                }`}
              >
                {mt === 'ALL' ? t('admin_memories_type_all') : mt === 'IMAGE' ? t('admin_memories_type_photos') : mt === 'VIDEO' ? t('admin_memories_type_videos') : t('admin_memories_type_albums')}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Selection Action Bar */}
        {memories.length > 0 && viewMode === 'GALLERY' && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFF7D6] border border-[#F4C542] rounded-xl p-3 text-xs animate-fadeIn">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSelectAllMemories}
                className="flex items-center space-x-1.5 font-bold text-[#854D0E] hover:text-[#111111] cursor-pointer"
              >
                {selectedMemoryIds.length === memories.length && memories.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-[#854D0E]" />
                ) : (
                  <Square className="w-4 h-4 text-gray-500" />
                )}
                <span>{t('admin_memories_select_all').replace('{count}', String(memories.length))}</span>
              </button>
              
              {selectedMemoryIds.length > 0 && (
                <span className="font-extrabold text-[#111111] bg-white border border-[#F4C542] px-2.5 py-0.5 rounded-full text-[11px]">
                  {t('admin_memories_selected_count').replace('{count}', String(selectedMemoryIds.length))}
                </span>
              )}
            </div>

            {selectedMemoryIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('admin_memories_bulk_delete').replace('{count}', String(selectedMemoryIds.length))}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: ALBUMS GROUPED VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'ALBUMS' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#111111]">
              {t('admin_memories_albums_section_title').replace('{count}', String(albums.length))}
            </h3>
            {selectedAlbum !== 'ALL' && (
              <button
                onClick={() => setSelectedAlbum('ALL')}
                className="text-xs font-bold text-[#854D0E] underline"
              >
                {t('admin_memories_back_to_albums')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums.map((alb, idx) => {
              const coverSrc = getAssetUrl(alb.cover_image_url) || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80";

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedAlbum(alb.album_name);
                    setViewMode('GALLERY');
                  }}
                  className="bg-white border-2 border-[#111111] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-[#F4C542] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="h-44 overflow-hidden bg-gray-100 relative">
                    <img
                      src={coverSrc}
                      alt={alb.album_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-extrabold bg-[#111111] text-[#F4C542] border border-[#F4C542]/60 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
                        <FolderPlus className="w-3 h-3" />
                        <span>{t('admin_memories_badge_album')}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                      <h4 className="font-bold text-base leading-snug line-clamp-1 drop-shadow-md">{alb.album_name}</h4>
                      <p className="text-[11px] text-gray-300 font-medium">{t('admin_memories_album_items_recorded').replace('{count}', String(alb.count))}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 flex items-center justify-between text-xs font-bold text-[#111111]">
                    <span>{t('admin_memories_view_album_gallery')}</span>
                    <span className="text-[#854D0E]">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW MODE 2: GALLERY MEDIA ITEMS GRID */
        /* ========================================================================= */
        loading ? (
          <LoadingState />
        ) : memories.length === 0 ? (
          <EmptyState
            title={t('admin_memories_empty_title')}
            description={t('admin_memories_empty_description').replace('{status}', activeTab)}
            action={
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                <span>{t('admin_memories_empty_upload_btn')}</span>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {memories.map((photo) => {
              const coverSrc = getAssetUrl(photo.cover_image_url || photo.image_url) || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80";
              const mediaUrlsCount = photo.media_urls?.length || 1;
              const isSelected = selectedMemoryIds.includes(photo.id);

              return (
                <div
                  key={photo.id}
                  onClick={() => handleOpenReview(photo)}
                  className={`bg-white border-2 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between relative ${
                    isSelected ? 'border-[#F4C542] ring-2 ring-[#F4C542]/60 shadow-md' : 'border-[#111111] hover:border-[#F4C542]'
                  }`}
                >
                  {/* Media Thumbnail Box */}
                  <div className="h-48 overflow-hidden bg-gray-900 relative">
                    <img
                      src={coverSrc}
                      alt={photo.title || 'Memory'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Selection Checkbox (Top-Left) */}
                    <div
                      className="absolute top-3 left-3 z-20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectMemory(photo.id)}
                        className="w-4 h-4 rounded text-[#F4C542] focus:ring-[#F4C542] cursor-pointer accent-[#F4C542]"
                      />
                    </div>

                    {/* Top Badges (Top-Right) */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1 z-10">
                      <div>{getMediaTypeBadge(photo.media_type, mediaUrlsCount)}</div>
                      <div>{getStatusBadge(photo.status)}</div>
                    </div>

                    {/* Video Play Overlay */}
                    {photo.media_type === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 bg-black/75 border-2 border-[#F4C542] rounded-full flex items-center justify-center text-[#F4C542] shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Album Name & Title Bar */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <span className="text-[10px] font-bold text-gray-200 bg-black/60 px-2 py-0.5 rounded-md truncate max-w-full inline-block">
                        {t('admin_memories_album_prefix')} {photo.album_name || t('admin_memories_general_gallery')}
                      </span>
                      <h4 className="font-bold text-white text-sm leading-snug truncate drop-shadow-md">{photo.title || 'School Memory'}</h4>
                      {photo.title_ta && (
                        <p className="text-[11px] text-[#F4C542] font-semibold truncate drop-shadow-xs">{photo.title_ta}</p>
                      )}
                    </div>
                  </div>

                  {/* Body & Actions */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{photo.description || t('admin_memories_no_description')}</p>
                      <div className="text-[11px] text-gray-500 font-medium mt-2 space-y-1">
                        <div>{t('admin_memories_submitted_by')} <strong className="text-[#111111]">{photo.uploader_name}</strong></div>
                        {photo.batch_year && (
                          <div>{t('admin_memories_batch_label')} <strong className="text-[#854D0E]">{photo.batch_year}</strong></div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5">
                      <Button
                        variant="secondary"
                        className="text-xs font-bold py-1.5 flex-1"
                        onClick={(e) => { e.stopPropagation(); handleOpenReview(photo); }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        {t('admin_memories_review_btn')}
                      </Button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(photo); }}
                        className="px-2.5 py-1.5 text-[#854D0E] bg-amber-50 hover:bg-amber-100 border border-[#F4C542]/50 rounded-xl transition-colors font-bold text-xs flex items-center space-x-1 cursor-pointer"
                        title={t('admin_memories_edit_btn')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('admin_memories_edit_btn')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(photo.id, e)}
                        className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title={t('admin_memories_delete_title')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* REVIEW & LIGHTBOX MODAL DIALOG */}
      {/* ========================================================================= */}
      {reviewingMemory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-5 p-6 sm:p-8 relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#FFF7D6] border border-[#F4C542] rounded-2xl text-[#854D0E]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#111111]">{t('admin_memories_review_modal_title')}</h3>
                  <p className="text-xs text-gray-500 font-medium">{t('admin_memories_album_prefix')} <strong>{reviewingMemory.album_name || t('admin_memories_general_gallery')}</strong></p>
                </div>
              </div>

              <button
                onClick={() => setReviewingMemory(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-[#111111] hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Display Area: Video Player OR Photo Carousel */}
            {reviewingMemory.media_type === 'VIDEO' || reviewingMemory.video_url ? (
              <div className="w-full bg-black rounded-2xl overflow-hidden border-2 border-[#111111] aspect-video relative flex items-center justify-center">
                <video
                  src={getAssetUrl(reviewingMemory.video_url || reviewingMemory.image_url)}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[400px] object-contain"
                >
                  {t('admin_memories_video_unsupported')}
                </video>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full h-72 sm:h-96 bg-gray-900 rounded-2xl overflow-hidden border-2 border-[#111111] relative flex items-center justify-center">
                  <img
                    src={getAssetUrl(
                      (reviewingMemory.media_urls && reviewingMemory.media_urls.length > 0)
                        ? reviewingMemory.media_urls[activeImageIndex]
                        : reviewingMemory.cover_image_url || reviewingMemory.image_url
                    )}
                    alt={reviewingMemory.title}
                    className="w-full h-full object-contain bg-black"
                  />

                  {/* Previous / Next Controls for Multi-Photo Albums */}
                  {reviewingMemory.media_urls && reviewingMemory.media_urls.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : reviewingMemory.media_urls!.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setActiveImageIndex(prev => (prev < reviewingMemory.media_urls!.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-3 bg-black/75 px-3 py-1 rounded-full text-white text-xs font-bold">
                        {t('admin_memories_photos_count')
                          .replace('{current}', String(activeImageIndex + 1))
                          .replace('{total}', String(reviewingMemory.media_urls.length))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails list */}
                {reviewingMemory.media_urls && reviewingMemory.media_urls.length > 1 && (
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {reviewingMemory.media_urls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          activeImageIndex === idx ? 'border-[#F4C542] scale-105 shadow-md' : 'border-gray-300 opacity-60'
                        }`}
                      >
                        <img src={getAssetUrl(url)} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Metadata Information */}
            <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#111111] text-base">{reviewingMemory.title}</span>
                {getStatusBadge(reviewingMemory.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <div>{t('admin_memories_label_uploader')} <strong className="text-[#111111]">{reviewingMemory.uploader_name}</strong></div>
                <div>{t('admin_memories_label_batch_year')} <strong className="text-[#854D0E]">{reviewingMemory.batch_year || 'N/A'}</strong></div>
              </div>

              {reviewingMemory.description && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-700 block mb-1">{t('admin_memories_label_description')}</span>
                  <p className="text-gray-600 italic leading-relaxed">{reviewingMemory.description}</p>
                </div>
              )}
            </div>

            {/* Admin Remarks Input */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111]">
                {t('admin_memories_remarks_label')}
              </label>
              <textarea
                rows={2}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder={t('admin_memories_remarks_placeholder')}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                disabled={submittingModeration}
                onClick={() => handleExecuteModeration('REJECTED')}
                className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                {t('admin_memories_reject_btn')}
              </button>

              <button
                type="button"
                disabled={submittingModeration}
                onClick={() => handleExecuteModeration('CHANGES_REQUESTED')}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all"
              >
                {t('admin_memories_request_changes_btn')}
              </button>

              <button
                type="button"
                disabled={submittingModeration}
                onClick={() => handleExecuteModeration('APPROVED')}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs rounded-xl border border-[#F4C542]/50 flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#F4C542]" />
                <span>{t('admin_memories_approve_btn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN CREATE ALBUM / UPLOAD MULTIPLE MEDIA MODAL */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-8 space-y-5 relative">
            
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                  <FolderPlus className="w-6 h-6 text-[#854D0E]" />
                  <span>{editingMemory ? t('admin_memories_modal_title_edit') : t('admin_memories_modal_title_create')}</span>
                  
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingMemory
                    ? t('admin_memories_modal_subtitle_edit')
                    : t('admin_memories_modal_subtitle_create')}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-[#111111] hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMemorySubmit} className="space-y-5">
              
              {/* 1. Media Type Category Chooser */}
              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
                  {t('admin_memories_form_media_type_label')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMediaType('IMAGE')}
                    className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                      mediaType === 'IMAGE' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E] shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>{t('admin_memories_form_media_photo').replace('{count}', String(createMediaUrls.length))}</span>
                    <span className="text-[10px] text-gray-500 font-normal">{t('admin_memories_form_media_photo_sub')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('ALBUM')}
                    className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                      mediaType === 'ALBUM' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E] shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    <span>{t('admin_memories_form_media_album').replace('{count}', String(createMediaUrls.length))}</span>
                    <span className="text-[10px] text-gray-500 font-normal">{t('admin_memories_form_media_album_sub')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('VIDEO')}
                    className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                      mediaType === 'VIDEO' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E] shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    <span>{t('admin_memories_form_media_video')}</span>
                    <span className="text-[10px] text-gray-500 font-normal">{t('admin_memories_form_media_video_sub')}</span>
                  </button>
                </div>
              </div>

              {/* 2. Bilingual Title Section (English & Tamil Support) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{t('admin_memories_form_title_en_label')}</span>
                    
                  </label>
                  <input
                    type="text"
                    required
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder={t('admin_memories_form_title_en_placeholder')}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{t('admin_memories_form_title_ta_label')}</span>
                    
                  </label>
                  <input
                    type="text"
                    value={createTitleTa}
                    onChange={(e) => setCreateTitleTa(e.target.value)}
                    placeholder={t('admin_memories_form_title_ta_placeholder')}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Target Album Selection */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    {t('admin_memories_form_album_label')}
                  </label>
                  <select
                    value={createAlbumName}
                    onChange={(e) => setCreateAlbumName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none shadow-xs"
                  >
                    {DEFAULT_ALBUMS.map(alb => (
                      <option key={alb} value={alb}>{alb}</option>
                    ))}
                    <option value="CUSTOM">{t('admin_memories_form_album_custom_option')}</option>
                  </select>
                </div>

                {createAlbumName === 'CUSTOM' && (
                  <div className="p-3 bg-amber-50/50 border border-[#F4C542] rounded-2xl animate-fadeIn">
                    <label className="block text-xs font-bold text-[#854D0E] uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                      <FolderPlus className="w-4 h-4 text-[#854D0E]" />
                      <span>{t('admin_memories_form_album_custom_label')}</span>
                    </label>
                    <input
                      type="text"
                      value={customAlbumInput}
                      onChange={(e) => setCustomAlbumInput(e.target.value)}
                      placeholder={t('admin_memories_form_album_custom_placeholder')}
                      required={createAlbumName === 'CUSTOM'}
                      className="w-full px-4 py-2.5 bg-white border border-[#F4C542] rounded-xl text-xs sm:text-sm font-semibold text-[#111111] focus:border-[#854D0E] focus:outline-none shadow-xs"
                    />
                  </div>
                )}
              </div>

              {/* 4. Dynamic Uploader / Submitted By Section */}
              <div className="space-y-3 border-t border-gray-100 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-[#854D0E]" />
                      <span>{t('admin_memories_form_uploader_label')}</span>
                    </label>
                    <span className="text-[10px] text-gray-500">
                      {t('admin_memories_form_uploader_hint')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAlumniPicker(!showAlumniPicker)}
                    className="text-xs font-bold text-[#854D0E] hover:text-[#713f0c] flex items-center space-x-1 cursor-pointer self-start sm:self-auto px-2.5 py-1 bg-[#FFF7D6] hover:bg-[#F4C542] border border-[#F4C542]/70 rounded-lg transition-colors"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{showAlumniPicker ? t('admin_memories_form_uploader_hide_picker') : t('admin_memories_form_uploader_show_picker')}</span>
                  </button>
                </div>

                {/* Main Editable Text Input for Uploader / Submitted By */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4 text-[#854D0E]" />
                  </div>
                  <input
                    type="text"
                    value={createUploaderName}
                    onChange={(e) => setCreateUploaderName(e.target.value)}
                    placeholder={t('admin_memories_form_uploader_placeholder')}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-[#111111] focus:border-[#F4C542] focus:ring-1 focus:ring-[#F4C542] focus:outline-none shadow-xs"
                  />
                </div>

                {/* Quick Selection Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-0.5">
                    {t('admin_memories_form_uploader_quick_fill')}
                  </span>
                  
                  {currentUser?.full_name && (
                    <button
                      type="button"
                      onClick={() => {
                        setCreateUploaderName(currentUser.full_name);
                        if (currentUser.email) setCreateUploaderEmail(currentUser.email);
                      }}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#854D0E] border border-[#F4C542]/70 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                      title={t('admin_memories_form_uploader_show_picker')}
                    >
                      <User className="w-3 h-3 text-[#854D0E]" />
                      <span>{currentUser.full_name} {t('admin_memories_form_uploader_admin_suffix')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setCreateUploaderName('School Administration')}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Building2 className="w-3 h-3 text-gray-500" />
                    <span>{t('admin_memories_form_uploader_school_admin')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateUploaderName('Alumni Association')}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <GraduationCap className="w-3 h-3 text-blue-600" />
                    <span>{t('admin_memories_form_uploader_association')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateUploaderName('Alumni Member')}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{t('admin_memories_form_uploader_member')}</span>
                  </button>
                </div>

                {/* Interactive Alumni Selector Drawer if toggled */}
                {showAlumniPicker && (
                  <div className="p-3 bg-amber-50/70 border border-[#F4C542] rounded-2xl space-y-2 animate-fadeIn shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#854D0E] flex items-center space-x-1">
                        <GraduationCap className="w-3.5 h-3.5 text-[#854D0E]" />
                        <span>{t('admin_memories_form_alumni_picker_label').replace('{count}', String(alumniList.length))}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAlumniPicker(false)}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        value={alumniFilterQuery}
                        onChange={(e) => setAlumniFilterQuery(e.target.value)}
                        placeholder={t('admin_memories_form_alumni_search_placeholder')}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-[#111111] focus:border-[#F4C542] focus:outline-none"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-amber-100/80">
                      {alumniList
                        .filter(a => {
                          if (!alumniFilterQuery.trim()) return true;
                          const q = alumniFilterQuery.toLowerCase();
                          return (
                            a.full_name?.toLowerCase().includes(q) ||
                            (a as any).name_ta?.toLowerCase().includes(q) ||
                            a.mobile?.includes(q) ||
                            String(a.passing_year)?.includes(q)
                          );
                        })
                        .slice(0, 10)
                        .map(a => (
                          <div
                            key={a.id}
                            onClick={() => {
                              const chosenName = a.full_name + ((a as any).name_ta ? ` (${(a as any).name_ta})` : '');
                              setCreateUploaderName(chosenName);
                              if (a.email) setCreateUploaderEmail(a.email);
                              if (a.passing_year) {
                                setCreateBatchYear(String(a.passing_year));
                                setTargetAudience('BATCH');
                              }
                              setShowAlumniPicker(false);
                              alertService.showSuccess(
                                t('admin_memories_form_alumni_selected_title'),
                                t('admin_memories_form_alumni_selected_body').replace(
                                  '{name}',
                                  `${a.full_name}${a.passing_year ? ` (${t('admin_memories_form_alumni_class_of').replace('{year}', String(a.passing_year))})` : ''}`
                                )
                              );
                            }}
                            className="pt-1.5 pb-1 flex items-center justify-between text-xs hover:bg-[#FFF7D6] px-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <span className="font-bold text-[#111111]">{a.full_name}</span>
                              {(a as any).name_ta && (
                                <span className="text-gray-600 text-[11px] ml-1">({(a as any).name_ta})</span>
                              )}
                              {a.passing_year && (
                                <span className="text-amber-800 text-[10px] ml-2 font-semibold bg-amber-100/60 px-1.5 py-0.5 rounded">
                                  {t('admin_memories_form_alumni_class_of').replace('{year}', String(a.passing_year))}
                                </span>
                              )}
                              {a.current_city && (
                                <span className="text-gray-500 text-[10px] ml-1.5">• {a.current_city}</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-[#854D0E] bg-[#FFF7D6] hover:bg-[#F4C542] px-2.5 py-1 rounded-md border border-[#F4C542]/70 shrink-0">
                              {t('admin_memories_form_alumni_use_name')}
                            </span>
                          </div>
                        ))}
                      {alumniList.length === 0 && (
                        <div className="py-2 text-center text-xs text-gray-400">
                          {t('admin_memories_form_alumni_empty')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Audience Target Category Selection with Check Ticks */}
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{t('admin_memories_form_audience_label')}</span>
                  
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Public / School-Wide */}
                  <div
                    onClick={() => setTargetAudience('PUBLIC')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3 ${
                      targetAudience === 'PUBLIC'
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {targetAudience === 'PUBLIC' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5 font-bold text-xs">
                        <Globe className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{t('admin_memories_form_audience_public_title')}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {t('admin_memories_form_audience_public_sub')}
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Specific Batch Year */}
                  <div
                    onClick={() => setTargetAudience('BATCH')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3 ${
                      targetAudience === 'BATCH'
                        ? 'bg-amber-50/70 border-[#F4C542] text-[#854D0E] shadow-xs'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {targetAudience === 'BATCH' ? (
                        <CheckCircle2 className="w-5 h-5 text-[#854D0E] fill-[#FFF7D6]" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5 font-bold text-xs">
                        <Calendar className="w-3.5 h-3.5 text-[#854D0E]" />
                        <span>{t('admin_memories_form_audience_batch_title')}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {t('admin_memories_form_audience_batch_sub')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Batch Year Input if BATCH audience selected */}
                {targetAudience === 'BATCH' && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                      {t('admin_memories_form_batch_year_label')}
                    </label>
                    <input
                      type="text"
                      value={createBatchYear}
                      onChange={(e) => setCreateBatchYear(e.target.value)}
                      placeholder={t('admin_memories_form_batch_year_placeholder')}
                      className="w-full px-4 py-2.5 bg-amber-50/50 border border-[#F4C542] rounded-xl text-xs sm:text-sm text-[#111111] font-semibold focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 5. Cover Image & Media Upload Section */}
              <div className="space-y-3 border-t border-gray-100 pt-3">
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  {t('admin_memories_form_cover_label')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={createCoverImageUrl}
                    onChange={(e) => setCreateCoverImageUrl(e.target.value)}
                    placeholder={t('admin_memories_form_cover_placeholder')}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                  <label className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#111111] rounded-xl cursor-pointer border border-gray-300 flex items-center space-x-1.5 shrink-0 transition-all">
                    <Upload className="w-4 h-4 text-[#854D0E]" />
                    <span>{uploadingMedia ? t('admin_memories_form_cover_uploading') : t('admin_memories_form_cover_upload_btn')}</span>
                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleCoverFileUpload} />
                  </label>
                </div>

                {/* Multiple Photos Upload Button & Interactive Preview Gallery */}
                {(mediaType === 'ALBUM' || mediaType === 'IMAGE') && (
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                          {t('admin_memories_form_gallery_label').replace('{count}', String(createMediaUrls.length))}
                        </label>
                        
                      </div>

                      <label className="px-4 py-2 bg-[#FFF7D6] hover:bg-[#F4C542] text-[#854D0E] text-xs font-bold rounded-xl cursor-pointer border border-[#F4C542] flex items-center space-x-1.5 shadow-xs transition-all">
                        <Plus className="w-4 h-4 text-[#854D0E]" />
                        <span>{uploadingMedia ? t('admin_memories_form_gallery_uploading_btn') : t('admin_memories_form_gallery_add_btn')}</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleMultipleFilesUpload} />
                      </label>
                    </div>

                    {/* Live Upload Progress Indicator & Cancel Action Bar */}
                    {uploadingMedia && uploadProgress && (
                      <div className="w-full bg-[#FFF7D6] border border-[#F4C542] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-xs animate-fadeIn">
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-5 h-5 text-[#854D0E] animate-spin shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-[#854D0E]">
                              {t('admin_memories_form_upload_progress')
                                .replace('{current}', String(uploadProgress.current))
                                .replace('{total}', String(uploadProgress.total))
                                .replace('{percent}', String(Math.round((uploadProgress.current / uploadProgress.total) * 100)))}
                            </div>
                            <div className="text-[10px] text-[#854D0E]/80">
                              {t('admin_memories_form_upload_progress_sub')}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCancelUpload}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
                          title={t('admin_memories_form_upload_cancel_btn')}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{t('admin_memories_form_upload_cancel_btn')}</span>
                        </button>
                      </div>
                    )}

                    {/* Image List & Blur Upload Effect Grid Container */}
                    <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200 max-h-56 overflow-y-auto">
                      <div className="flex flex-wrap gap-3 items-center">
                        
                        {/* Live Upload Blur Placeholder Animation with Cancel Button */}
                        {uploadingMedia && (
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-dashed border-[#F4C542] bg-[#FFF7D6]/70 backdrop-blur-md flex flex-col items-center justify-center p-2 text-center shadow-md animate-pulse shrink-0">
                            <Loader2 className="w-5 h-5 text-[#854D0E] animate-spin mb-1" />
                            <span className="text-[10px] font-bold text-[#854D0E] leading-tight">
                              {uploadProgress
                                ? `${uploadProgress.current}/${uploadProgress.total}`
                                : t('admin_memories_form_uploading_label')}
                            </span>
                            <button
                              type="button"
                              onClick={handleCancelUpload}
                              className="mt-1 text-[9px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-1.5 py-0.5 rounded border border-rose-300 transition-colors cursor-pointer"
                            >
                              {t('admin_memories_form_upload_cancel_short')}
                            </button>
                          </div>
                        )}

                        {/* Interactive Image Thumbnails with Replace & Cover Actions */}
                        {createMediaUrls.map((url, idx) => {
                          const isCover = (url === createCoverImageUrl);
                          return (
                            <div key={idx} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-gray-300 hover:border-[#F4C542] group shrink-0 shadow-xs transition-all">
                              <img src={getAssetUrl(url)} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                              
                              {/* Index & Cover Badge */}
                              <div className="absolute top-1 left-1 flex items-center gap-1 z-10">
                                <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                                  #{idx + 1}
                                </span>
                                {isCover && (
                                  <span className="bg-[#F4C542] text-[#111111] text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-[#111111]" />
                                    <span>{t('admin_memories_form_thumb_cover_badge')}</span>
                                  </span>
                                )}
                              </div>

                              {/* Hover Action Overlay */}
                              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1 z-20">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => setCreateCoverImageUrl(url)}
                                    className="px-2 py-0.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold text-[9px] rounded shadow-xs cursor-pointer"
                                  >
                                    {t('admin_memories_form_thumb_set_cover')}
                                  </button>
                                )}
                                
                                {/* Single Image Replace Button */}
                                <label className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] rounded shadow-xs cursor-pointer flex items-center space-x-1 transition-all">
                                  <RefreshCw className="w-2.5 h-2.5" />
                                  <span>{t('admin_memories_form_thumb_replace')}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleReplaceSingleImage(idx, e)}
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryUrl(idx)}
                                  className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all cursor-pointer"
                                  title={t('admin_memories_form_thumb_remove_title')}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {createMediaUrls.length === 0 && !uploadingMedia && (
                          <div className="w-full py-6 text-center text-xs text-gray-400 font-normal">
                            {t('admin_memories_form_gallery_empty')}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )}

                {/* Video URL Input */}
                {mediaType === 'VIDEO' && (
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                      {t('admin_memories_form_video_url_label')}
                    </label>
                    <input
                      type="text"
                      value={createVideoUrl}
                      onChange={(e) => setCreateVideoUrl(e.target.value)}
                      placeholder={t('admin_memories_form_video_url_placeholder')}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 6. Bilingual Description Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{t('admin_memories_form_desc_en_label')}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder={t('admin_memories_form_desc_en_placeholder')}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{t('admin_memories_form_desc_ta_label')}</span>
              
                  </label>
                  <textarea
                    rows={2}
                    value={createDescriptionTa}
                    onChange={(e) => setCreateDescriptionTa(e.target.value)}
                    placeholder={t('admin_memories_form_desc_ta_placeholder')}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  {t('admin_memories_form_cancel_btn')}
                </Button>
                <Button type="submit" isLoading={submittingCreate}>
                  <CheckCircle2 className="w-4 h-4 mr-1 text-[#F4C542]" />
                  <span>{editingMemory ? t('admin_memories_form_update_btn') : t('admin_memories_form_publish_btn')}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};