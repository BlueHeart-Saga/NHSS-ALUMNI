import React, { useEffect, useState } from 'react';
import { 
  Image as ImageIcon, Trash2, CheckCircle2, XCircle, AlertTriangle, Plus, Eye, 
  Filter, Clock, ShieldCheck, X, Upload, Video, FolderPlus, Layers, Play, Search, Film, Check, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '../../components/Button';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Memory } from '../../types';
import { getAssetUrl } from '../../utils/asset';

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
  const [memories, setMemories] = useState<Memory[]>([]);
  const [albums, setAlbums] = useState<{ album_name: string; count: number; cover_image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'GALLERY' vs 'ALBUMS'
  const [viewMode, setViewMode] = useState<'GALLERY' | 'ALBUMS'>('GALLERY');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('ALL');

  // Filters
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Moderation Review Modal State
  const [reviewingMemory, setReviewingMemory] = useState<Memory | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [submittingModeration, setSubmittingModeration] = useState(false);

  // Admin Create Memory & Album Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | 'ALBUM'>('IMAGE');
  const [createTitle, setCreateTitle] = useState('');
  const [createAlbumName, setCreateAlbumName] = useState('General School Gallery');
  const [customAlbumInput, setCustomAlbumInput] = useState('');
  const [createCoverImageUrl, setCreateCoverImageUrl] = useState('');
  const [createMediaUrls, setCreateMediaUrls] = useState<string[]>([]);
  const [createVideoUrl, setCreateVideoUrl] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createBatchYear, setCreateBatchYear] = useState('');
  const [createUploaderName, setCreateUploaderName] = useState('School Admin');

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  useEffect(() => {
    fetchMemories();
    fetchAlbums();
  }, [activeTab, mediaTypeFilter, selectedAlbum]);

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

      const statusLabels = {
        APPROVED: 'Memory Approved & Published!',
        REJECTED: 'Memory Rejected.',
        CHANGES_REQUESTED: 'Changes Requested from Uploader.'
      };

      await alertService.showSuccess('Moderation Complete', statusLabels[chosenStatus]);
      setReviewingMemory(null);
      fetchMemories();
      fetchAlbums();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to update memory moderation status.');
    } finally {
      setSubmittingModeration(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = await alertService.showConfirm(
      'Delete Memory Record?',
      'Are you sure you want to permanently delete this memory item and its media files?',
      'Delete Memory',
      'Cancel'
    );
    if (!confirmed) return;
    try {
      await api.deleteMemory(id);
      alertService.showSuccess('Memory Deleted', 'The memory record has been removed.');
      fetchMemories();
      fetchAlbums();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to delete photo memory.');
    }
  };

  // Upload Single Cover File
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const res = await api.uploadMemoryFile(file);
      setCreateCoverImageUrl(res.url);
      if (res.media_type === 'VIDEO') {
        setCreateVideoUrl(res.url);
        setMediaType('VIDEO');
      }
      alertService.showSuccess('File Uploaded', `${res.media_type === 'VIDEO' ? 'Video' : 'Cover image'} uploaded successfully.`);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to upload cover media file.');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Upload Multiple Gallery Files
  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    try {
      const res = await api.uploadMultipleMemoryFiles(files);
      const newUrls = [...createMediaUrls, ...res.urls];
      setCreateMediaUrls(newUrls);
      if (!createCoverImageUrl && newUrls.length > 0) {
        setCreateCoverImageUrl(newUrls[0]);
      }
      if (newUrls.length > 1 && mediaType === 'IMAGE') {
        setMediaType('ALBUM');
      }
      alertService.showSuccess('Files Uploaded', `Successfully uploaded ${res.urls.length} media file(s).`);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to upload multiple files.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleRemoveGalleryUrl = (idx: number) => {
    const updated = createMediaUrls.filter((_, i) => i !== idx);
    setCreateMediaUrls(updated);
  };

  const handleCreateMemorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) {
      alertService.showWarning('Title Required', 'Please enter a title for this memory item.');
      return;
    }
    const finalAlbumName = (customAlbumInput.trim() || createAlbumName.trim()) || 'General School Gallery';

    setSubmittingCreate(true);
    try {
      const cover = createCoverImageUrl.trim() || (createMediaUrls.length > 0 ? createMediaUrls[0] : '');
      const finalUrls = createMediaUrls.length > 0 ? createMediaUrls : (cover ? [cover] : []);

      await api.createMemory({
        title: createTitle.trim(),
        album_name: finalAlbumName,
        media_type: mediaType,
        cover_image_url: cover,
        image_url: cover,
        media_urls: finalUrls,
        video_url: createVideoUrl.trim() || undefined,
        description: createDescription.trim(),
        batch_year: createBatchYear.trim() || '2025',
        uploader_name: createUploaderName.trim() || 'School Admin',
        status: 'APPROVED'
      });

      alertService.showSuccess('Memory Published', 'New memory item/album created and published!');
      setIsCreateModalOpen(false);
      setCreateTitle('');
      setCreateCoverImageUrl('');
      setCreateMediaUrls([]);
      setCreateVideoUrl('');
      setCreateDescription('');
      setCustomAlbumInput('');
      fetchMemories();
      fetchAlbums();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to create memory record.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Statuses' },
    { key: 'PENDING', label: 'Pending Review' },
    { key: 'APPROVED', label: 'Approved & Published' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'CHANGES_REQUESTED', label: 'Changes Requested' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Approved</span>;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'PENDING':
        return <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Pending Review</span>;
      case 'REJECTED':
        return <span className="text-[11px] font-extrabold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Rejected</span>;
      case 'CHANGES_REQUESTED':
        return <span className="text-[11px] font-extrabold text-blue-800 bg-blue-100 border border-blue-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Changes Requested</span>;
      default:
        return <span className="text-[11px] font-extrabold text-gray-800 bg-gray-100 border border-gray-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{status}</span>;
    }
  };

  const getMediaTypeBadge = (type?: string, urlCount: number = 1) => {
    if (type === 'VIDEO') {
      return (
        <span className="text-[10px] font-extrabold bg-purple-950/90 text-purple-300 border border-purple-400/50 px-2 py-0.5 rounded-full flex items-center space-x-1">
          <Film className="w-3 h-3 text-purple-400" />
          <span>Video</span>
        </span>
      );
    }
    if (type === 'ALBUM' || urlCount > 1) {
      return (
        <span className="text-[10px] font-extrabold bg-blue-950/90 text-blue-300 border border-blue-400/50 px-2 py-0.5 rounded-full flex items-center space-x-1">
          <Layers className="w-3 h-3 text-blue-400" />
          <span>{urlCount} Photos Album</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-extrabold bg-gray-900/90 text-gray-200 border border-gray-700 px-2 py-0.5 rounded-full flex items-center space-x-1">
        <ImageIcon className="w-3 h-3 text-amber-400" />
        <span>Photo</span>
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
              <h2 className="text-2xl font-bold text-[#111111]">Memories, Video &amp; Photo Albums</h2>
              <span className="px-2.5 py-0.5 bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                Multi-Album Module
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Moderate alumni uploads, organize high-resolution image albums, videos, and campus heritage archives.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center shrink-0">
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Album / Upload Media</span>
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
              <span>All Media Gallery ({memories.length})</span>
            </button>

            <button
              onClick={() => setViewMode('ALBUMS')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-2 ${
                viewMode === 'ALBUMS' ? 'bg-[#111111] text-[#F4C542] shadow-sm' : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Albums View ({albums.length})</span>
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
              placeholder="Search title, album, uploader..."
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
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#111111] text-[#F4C542]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Media Type Pills */}
          <div className="flex items-center space-x-2 shrink-0">
            {['ALL', 'IMAGE', 'VIDEO', 'ALBUM'].map((mt) => (
              <button
                key={mt}
                onClick={() => setMediaTypeFilter(mt)}
                className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all cursor-pointer ${
                  mediaTypeFilter === mt
                    ? 'bg-[#FFF7D6] text-[#854D0E] border-[#F4C542]'
                    : 'bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50'
                }`}
              >
                {mt === 'ALL' ? 'All Types' : mt === 'IMAGE' ? 'Photos' : mt === 'VIDEO' ? 'Videos' : 'Photo Albums'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: ALBUMS GROUPED VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'ALBUMS' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#111111]">School Photo &amp; Video Albums ({albums.length})</h3>
            {selectedAlbum !== 'ALL' && (
              <button
                onClick={() => setSelectedAlbum('ALL')}
                className="text-xs font-bold text-[#854D0E] underline"
              >
                ← Back to All Albums
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
                        <span>Album</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                      <h4 className="font-bold text-base leading-snug line-clamp-1 drop-shadow-md">{alb.album_name}</h4>
                      <p className="text-[11px] text-gray-300 font-medium">{alb.count} items recorded</p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 flex items-center justify-between text-xs font-bold text-[#111111]">
                    <span>View Album Gallery</span>
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
            title="No Memory Media Items Found"
            description={`No photos or videos match status "${activeTab}" or search query.`}
            action={
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Upload First Memory</span>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {memories.map((photo) => {
              const coverSrc = getAssetUrl(photo.cover_image_url || photo.image_url) || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80";
              const mediaUrlsCount = photo.media_urls?.length || 1;

              return (
                <div
                  key={photo.id}
                  onClick={() => handleOpenReview(photo)}
                  className="bg-white border-2 border-[#111111] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-[#F4C542] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  {/* Media Thumbnail Box */}
                  <div className="h-48 overflow-hidden bg-gray-900 relative">
                    <img
                      src={coverSrc}
                      alt={photo.title || 'Memory'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
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

                    {/* Album Name Bar */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <span className="text-[10px] font-bold text-gray-200 bg-black/60 px-2 py-0.5 rounded-md truncate max-w-full inline-block">
                        Album: {photo.album_name || 'General Gallery'}
                      </span>
                      <h4 className="font-bold text-white text-sm leading-snug truncate drop-shadow-md">{photo.title || 'School Memory'}</h4>
                    </div>
                  </div>

                  {/* Body & Actions */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{photo.description || 'No description provided.'}</p>
                      <div className="text-[11px] text-gray-500 font-medium mt-2 space-y-1">
                        <div>Submitted by: <strong className="text-[#111111]">{photo.uploader_name}</strong></div>
                        {photo.batch_year && (
                          <div>Batch: <strong className="text-[#854D0E]">{photo.batch_year}</strong></div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <Button
                        variant="secondary"
                        className="text-xs font-bold py-1.5 flex-1 mr-2"
                        onClick={(e) => { e.stopPropagation(); handleOpenReview(photo); }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Review / Play
                      </Button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(photo.id, e)}
                        className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Memory"
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
                  <h3 className="text-xl font-bold text-[#111111]">Review Memory &amp; Media</h3>
                  <p className="text-xs text-gray-500 font-medium">Album: <strong>{reviewingMemory.album_name || 'General Gallery'}</strong></p>
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
                  Your browser does not support HTML5 video streaming.
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
                        {activeImageIndex + 1} / {reviewingMemory.media_urls.length} Photos
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
                <div>Uploader: <strong className="text-[#111111]">{reviewingMemory.uploader_name}</strong></div>
                <div>Batch Year: <strong className="text-[#854D0E]">{reviewingMemory.batch_year || 'N/A'}</strong></div>
              </div>

              {reviewingMemory.description && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-700 block mb-1">Description:</span>
                  <p className="text-gray-600 italic leading-relaxed">{reviewingMemory.description}</p>
                </div>
              )}
            </div>

            {/* Admin Remarks Input */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111]">
                Moderation Feedback / Admin Remarks
              </label>
              <textarea
                rows={2}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Enter feedback shown to uploader..."
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
                Reject
              </button>

              <button
                type="button"
                disabled={submittingModeration}
                onClick={() => handleExecuteModeration('CHANGES_REQUESTED')}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all"
              >
                Request Changes
              </button>

              <button
                type="button"
                disabled={submittingModeration}
                onClick={() => handleExecuteModeration('APPROVED')}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs rounded-xl border border-[#F4C542]/50 flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#F4C542]" />
                <span>Approve &amp; Publish</span>
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
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#111111]">Create Album &amp; Upload Media</h3>
                <p className="text-xs text-gray-500">Supports Cover Image, Multiple Photos, and Video Files/Streams</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMemorySubmit} className="space-y-4">
              
              {/* Media Type Chooser */}
              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                  Select Media Category
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMediaType('IMAGE')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                      mediaType === 'IMAGE' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E]' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>Single Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('ALBUM')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                      mediaType === 'ALBUM' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E]' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    <span>Photo Album</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('VIDEO')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                      mediaType === 'VIDEO' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E]' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    <span>Video Memory</span>
                  </button>
                </div>
              </div>

              {/* Title & Album Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Annual Day Cultural Dances 2025"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Target Album Name
                  </label>
                  <select
                    value={createAlbumName}
                    onChange={(e) => setCreateAlbumName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  >
                    {DEFAULT_ALBUMS.map(alb => (
                      <option key={alb} value={alb}>{alb}</option>
                    ))}
                    <option value="CUSTOM">+ Create New Custom Album</option>
                  </select>
                </div>
              </div>

              {/* Custom Album Name if Selected */}
              {createAlbumName === 'CUSTOM' && (
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    New Album Name *
                  </label>
                  <input
                    type="text"
                    value={customAlbumInput}
                    onChange={(e) => setCustomAlbumInput(e.target.value)}
                    placeholder="e.g. 1995 Golden Jubilee Reunion Album"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              )}

              {/* Cover Image Selection */}
              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Cover Image URL / Upload
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={createCoverImageUrl}
                    onChange={(e) => setCreateCoverImageUrl(e.target.value)}
                    placeholder="https://... or choose local file"
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                  <label className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#111111] rounded-xl cursor-pointer border border-gray-300 flex items-center space-x-1 shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingMedia ? 'Uploading...' : 'Upload Cover File'}</span>
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleCoverFileUpload} />
                  </label>
                </div>
              </div>

              {/* Multiple Gallery Photos Upload Section */}
              {(mediaType === 'ALBUM' || mediaType === 'IMAGE') && (
                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                      Multiple Gallery Photos ({createMediaUrls.length} selected)
                    </label>
                    <label className="px-3 py-1.5 bg-[#FFF7D6] hover:bg-[#F4C542] text-[#854D0E] text-xs font-bold rounded-xl cursor-pointer border border-[#F4C542] flex items-center space-x-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>{uploadingMedia ? 'Uploading...' : 'Select Multiple Photo Files'}</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleMultipleFilesUpload} />
                    </label>
                  </div>

                  {/* Thumbnail List */}
                  {createMediaUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 max-h-40 overflow-y-auto">
                      {createMediaUrls.map((url, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-300 group shrink-0">
                          <img src={getAssetUrl(url)} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryUrl(idx)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Video URL Input */}
              {mediaType === 'VIDEO' && (
                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Video Stream / File URL
                  </label>
                  <input
                    type="text"
                    value={createVideoUrl}
                    onChange={(e) => setCreateVideoUrl(e.target.value)}
                    placeholder="/uploads/video_file.mp4 or video URL"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              )}

              {/* Batch Year & Uploader Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Batch Year
                  </label>
                  <input
                    type="text"
                    value={createBatchYear}
                    onChange={(e) => setCreateBatchYear(e.target.value)}
                    placeholder="2025"
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

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Enter details about this memory album or celebration video..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={submittingCreate}>
                  Save &amp; Publish Media Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
