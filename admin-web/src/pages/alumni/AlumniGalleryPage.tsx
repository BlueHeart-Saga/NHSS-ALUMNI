import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import {
  Upload,
  X,
  Image as ImageIcon,
  Layers,
  Film,
  FolderPlus,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Globe,
  Play,
  Loader2,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  User,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Memory } from '../../types';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';

type ViewTab = 'GALLERY' | 'ALBUMS' | 'MY_UPLOADS';

export const AlumniGalleryPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useOutletContext<AlumniContextType>();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [viewTab, setViewTab] = useState<ViewTab>('GALLERY');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'ALBUM'>('ALL');

  // Lightbox Preview Modal State
  const [activePhoto, setActivePhoto] = useState<Memory | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | 'ALBUM'>('IMAGE');
  const [title, setTitle] = useState('');
  const [albumName, setAlbumName] = useState('Campus Memories');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [description, setDescription] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submittingMemory, setSubmittingMemory] = useState(false);

  // Fetch memories
  const loadMemories = async () => {
    try {
      setLoading(true);
      // Fetch both public and all submitted/approved memories
      const data = await api.getMemories();
      setMemories(data || []);
    } catch (err) {
      console.error('Failed to load gallery memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  // Lock body scroll when modal active
  useEffect(() => {
    if (!activePhoto && !isUploadModalOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [activePhoto, isUploadModalOpen]);

  // Set default batch year when user context loads
  useEffect(() => {
    if (user?.passing_year && !batchYear) {
      setBatchYear(String(user.passing_year));
    }
  }, [user, batchYear]);

  // Filtered memories list based on search, media type, and view mode
  const filteredMemories = useMemo(() => {
    return memories.filter(item => {
      // My Uploads filter
      if (viewTab === 'MY_UPLOADS') {
        const isMine =
          (item.uploader_id && item.uploader_id === user?.id) ||
          (user?.email && item.uploader_email && item.uploader_email.toLowerCase() === user.email.toLowerCase()) ||
          (user?.full_name && item.uploader_name && item.uploader_name.toLowerCase() === user.full_name.toLowerCase());
        if (!isMine) return false;
      }

      // Media type filter
      if (mediaTypeFilter !== 'ALL') {
        if (mediaTypeFilter === 'IMAGE' && item.media_type !== 'IMAGE') return false;
        if (mediaTypeFilter === 'VIDEO' && item.media_type !== 'VIDEO' && !item.video_url) return false;
        if (mediaTypeFilter === 'ALBUM' && item.media_type !== 'ALBUM' && (!item.media_urls || item.media_urls.length <= 1)) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q) || (item.title_ta && item.title_ta.toLowerCase().includes(q));
        const matchAlbum = item.album_name && item.album_name.toLowerCase().includes(q);
        const matchUploader = item.uploader_name && item.uploader_name.toLowerCase().includes(q);
        const matchBatch = item.batch_year && item.batch_year.includes(q);
        if (!matchTitle && !matchAlbum && !matchUploader && !matchBatch) return false;
      }

      return true;
    });
  }, [memories, viewTab, mediaTypeFilter, searchQuery, user]);

  // Grouped Albums
  const groupedAlbums = useMemo(() => {
    const map = new Map<string, { album_name: string; items: Memory[]; cover_image_url: string }>();
    filteredMemories.forEach(item => {
      const albName = item.album_name || 'Campus Memories';
      if (!map.has(albName)) {
        map.set(albName, {
          album_name: albName,
          items: [],
          cover_image_url: item.cover_image_url || item.image_url,
        });
      }
      map.get(albName)!.items.push(item);
    });
    return Array.from(map.values());
  }, [filteredMemories]);

  // Uploader's own count
  const myUploadsCount = useMemo(() => {
    return memories.filter(item => {
      return (
        (item.uploader_id && item.uploader_id === user?.id) ||
        (user?.email && item.uploader_email && item.uploader_email.toLowerCase() === user.email.toLowerCase()) ||
        (user?.full_name && item.uploader_name && item.uploader_name.toLowerCase() === user.full_name.toLowerCase())
      );
    }).length;
  }, [memories, user]);

  // Open Lightbox Preview
  const openPreview = (photo: Memory, initialIdx = 0) => {
    setActivePhoto(photo);
    setActiveImageIndex(initialIdx);
  };

  // File Upload Handler (Single / Multiple Bulk Uploads)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const res = await api.uploadMultipleMemoryFiles(files);
      const newUrls = [...mediaUrls, ...res.urls];
      setMediaUrls(newUrls);

      if (!coverImageUrl && newUrls.length > 0) {
        setCoverImageUrl(newUrls[0]);
      }
      if (newUrls.length > 1 && mediaType === 'IMAGE') {
        setMediaType('ALBUM');
      }
      alertService.showSuccess(
        language === 'ta' ? 'கோப்புகள் பதிவேற்றப்பட்டன' : 'Files Uploaded',
        language === 'ta' ? `${res.urls.length} படங்கள் இணைக்கப்பட்டுள்ளன.` : `${res.urls.length} media file(s) uploaded successfully.`
      );
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to upload media files.');
    } finally {
      setUploadingFiles(false);
    }
  };

  // Submit New Memory Form
  const handleSubmitMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alertService.showWarning('Title Required', 'Please enter a title for your photo memory.');
      return;
    }

    setSubmittingMemory(true);
    try {
      const cover = coverImageUrl.trim() || (mediaUrls.length > 0 ? mediaUrls[0] : '');
      const payload: Partial<Memory> = {
        title: title.trim(),
        album_name: albumName.trim() || 'Campus Memories',
        media_type: mediaType,
        cover_image_url: cover,
        image_url: cover,
        media_urls: mediaUrls.length > 0 ? mediaUrls : cover ? [cover] : [],
        video_url: videoUrl.trim() || undefined,
        description: description.trim(),
        batch_year: batchYear.trim() || (user?.passing_year ? String(user.passing_year) : ''),
        uploader_name: user?.full_name || 'Alumni Member',
        uploader_email: user?.email || undefined,
        uploader_id: user?.id,
        status: 'SUBMITTED',
      };

      await api.createMemory(payload);

      alertService.showSuccess(
        language === 'ta' ? 'நினைவு சமர்ப்பிக்கப்பட்டது!' : 'Memory Submitted for Approval!',
        language === 'ta'
          ? 'உங்கள் பதிவு நிர்வாகியின் சரிபார்ப்பிற்குப் பின் கேலரியில் தோன்றும்.'
          : 'Thank you! Your photo memory has been submitted and will appear in the gallery once approved by admin.'
      );

      setIsUploadModalOpen(false);
      setTitle('');
      setCoverImageUrl('');
      setMediaUrls([]);
      setVideoUrl('');
      setDescription('');
      loadMemories();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to submit memory.');
    } finally {
      setSubmittingMemory(false);
    }
  };

  // Delete Own Memory
  const handleDeleteMemory = async (memoryId: string) => {
    const confirm = await alertService.showConfirm(
      language === 'ta' ? 'நீக்க விரும்புகிறீர்களா?' : 'Delete Memory?',
      language === 'ta' ? 'இந்த புகைப்படப் பதிவு கேலரியிலிருந்து நிரந்தரமாக நீக்கப்படும்.' : 'Are you sure you want to delete this submitted memory?'
    );
    if (!confirm) return;

    try {
      await api.deleteMemory(memoryId);
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      alertService.showSuccess('Deleted', 'Memory entry removed.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to delete memory.');
    }
  };

  // Share Handler
  const handleShareImage = async (photo: Memory) => {
    const shareUrl = window.location.origin + '/memories#' + photo.id;
    if (navigator.share) {
      try {
        await navigator.share({ title: photo.title, text: photo.description || '', url: shareUrl });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alertService.showSuccess('Link Copied!', 'Memory link copied to clipboard.');
      } catch {
        alertService.showInfo('Share Link', shareUrl);
      }
    }
  };

  // Download Handler
  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const fullUrl = getAssetUrl(url);
      const res = await fetch(fullUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'school-memory.webp';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(getAssetUrl(url), '_blank');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-[#111111] p-1 sm:p-2 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#111111] via-[#1F2937] to-[#111111] p-5 sm:p-7 rounded-2xl sm:rounded-3xl text-white shadow-md relative overflow-hidden border border-gray-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === 'ta'
                  ? 'பள்ளி புகைப்படக் கேலரி & நினைவுகள்'
                  : 'School Photo Gallery & Nostalgic Memories'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {language === 'ta' ? 'புகைப்பட கேலரி & ஆல்பங்கள்' : 'Alumni Photo Gallery & Video Albums'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              {language === 'ta'
                ? 'பள்ளிப் பருவத்தின் மறக்க முடியாத நினைவுகள், விளையாட்டு விழாக்கள், மறுசந்திப்புப் புகைப்படங்கள் மற்றும் வீடியோக்களைக் கண்டு மகிழுங்கள்.'
                : 'Relive cherished school days, sports meets, cultural celebrations, batch reunions, and share your own old class photographs.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'ta' ? 'புகைப்படம் / ஆல்பம் பதிவேற்று' : 'Upload Photos / Album'}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center text-amber-800 shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500">{language === 'ta' ? 'கேலரி படங்கள்' : 'Gallery Photos'}</p>
            <h4 className="text-lg font-extrabold text-[#111111]">{memories.length}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700 shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500">{language === 'ta' ? 'ஆல்பங்கள்' : 'Photo Albums'}</p>
            <h4 className="text-lg font-extrabold text-[#111111]">{groupedAlbums.length}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500">{language === 'ta' ? 'அங்கீகரிக்கப்பட்டது' : 'Live & Approved'}</p>
            <h4 className="text-lg font-extrabold text-[#111111]">
              {memories.filter(m => m.status === 'APPROVED' || !m.status).length}
            </h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center text-purple-700 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500">{language === 'ta' ? 'எனது பதிவேற்றங்கள்' : 'My Submissions'}</p>
            <h4 className="text-lg font-extrabold text-[#111111]">{myUploadsCount}</h4>
          </div>
        </div>
      </div>

      {/* Navigation & Controls Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* View Tab Switcher */}
          <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewTab('GALLERY')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                viewTab === 'GALLERY'
                  ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                  : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'அனைத்து கேலரி' : 'All Photos'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('ALBUMS')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                viewTab === 'ALBUMS'
                  ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                  : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'ஆல்பங்கள்' : 'Albums'} ({groupedAlbums.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('MY_UPLOADS')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                viewTab === 'MY_UPLOADS'
                  ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                  : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'எனது பதிவேற்றம்' : 'My Uploads'} ({myUploadsCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'ta' ? 'தலைப்பு / பேட்ச் தேடுக...' : 'Search photos or batch...'}
              className="w-full pl-9 pr-3 py-2 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-[#E5E7EB]">
          <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading alumni photo gallery...</p>
        </div>
      ) : filteredMemories.length === 0 && viewTab !== 'ALBUMS' ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB] space-y-3">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="font-bold text-sm text-[#111111]">
            {viewTab === 'MY_UPLOADS'
              ? (language === 'ta' ? 'நீங்கள் இன்னும் புகைப்படங்கள் பதிவேற்றவில்லை' : 'No Submissions Found')
              : (language === 'ta' ? 'புகைப்படங்கள் எதுவும் கிடைக்கவில்லை' : 'No Photos Match Your Search')}
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {viewTab === 'MY_UPLOADS'
              ? (language === 'ta' ? 'உங்கள் பள்ளிப் பருவப் படங்களைப் பகிர "புகைப்படம் பதிவேற்று" பொத்தானைக் கிளிக் செய்யவும்.' : 'Click "Upload Photos / Album" button above to submit your old school photographs.')
              : (language === 'ta' ? 'தேடல் நிபந்தனைகளை மாற்றி மீண்டும் முயற்சிக்கவும்.' : 'Try adjusting your search terms or filters.')}
          </p>
        </div>
      ) : (
        <div>
          {/* 1. ALL PHOTOS GRID VIEW */}
          {viewTab === 'GALLERY' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredMemories.map(photo => {
                const coverSrc = getAssetUrl(photo.cover_image_url || photo.image_url);
                const isAlbum = photo.media_type === 'ALBUM' || (photo.media_urls && photo.media_urls.length > 1);
                const photoCount = photo.media_urls?.length || 1;

                return (
                  <div
                    key={photo.id}
                    onClick={() => openPreview(photo)}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs hover:border-amber-300 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="h-52 bg-gray-900 relative overflow-hidden">
                      <img
                        src={coverSrc}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                        {isAlbum ? (
                          <span className="text-[10px] font-extrabold bg-black/80 backdrop-blur-xs text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Layers className="w-3 h-3 text-amber-300" />
                            <span>{photoCount} Photos</span>
                          </span>
                        ) : photo.media_type === 'VIDEO' || photo.video_url ? (
                          <span className="text-[10px] font-extrabold bg-purple-950/80 backdrop-blur-xs text-purple-300 border border-purple-400/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Film className="w-3 h-3 text-purple-300" />
                            <span>Video</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold bg-black/70 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Photo
                          </span>
                        )}

                        {photo.batch_year && (
                          <span className="text-[10px] font-bold text-amber-950 bg-amber-100/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-amber-300">
                            Batch {photo.batch_year}
                          </span>
                        )}
                      </div>

                      {/* Video Play Icon */}
                      {(photo.media_type === 'VIDEO' || photo.video_url) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          <div className="w-11 h-11 bg-black/70 border-2 border-amber-400 rounded-full flex items-center justify-center text-amber-400 shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 text-white">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                          {photo.album_name || 'Campus Gallery'}
                        </span>
                        <h4 className="font-bold text-sm text-white truncate drop-shadow-sm">
                          {language === 'ta' && photo.title_ta ? photo.title_ta : photo.title}
                        </h4>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2">
                      {photo.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {language === 'ta' && photo.description_ta ? photo.description_ta : photo.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-[#F3F4F6]">
                        <span className="truncate">
                          By <strong className="text-gray-800">{photo.uploader_name}</strong>
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleShareImage(photo); }}
                            className="p-1 text-gray-400 hover:text-black rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Share"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDownloadImage(photo.cover_image_url || photo.image_url, `${photo.title}.webp`); }}
                            className="p-1 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors cursor-pointer"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. ALBUMS VIEW MODE */}
          {viewTab === 'ALBUMS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {groupedAlbums.map((alb, idx) => {
                const coverSrc = getAssetUrl(alb.cover_image_url);
                const firstItem = alb.items[0];

                return (
                  <div
                    key={idx}
                    onClick={() => openPreview(firstItem)}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs hover:border-amber-300 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="h-52 bg-gray-900 relative overflow-hidden">
                      <img
                        src={coverSrc}
                        alt={alb.album_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="text-[10px] font-extrabold bg-black/80 backdrop-blur-xs text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <FolderPlus className="w-3.5 h-3.5 text-amber-300" />
                          <span>{alb.items.length} Photos</span>
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white z-10">
                        <h4 className="font-extrabold text-base text-white truncate drop-shadow-sm">
                          {alb.album_name}
                        </h4>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/60 flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>{language === 'ta' ? 'ஆல்பத்தைக் காண்க' : 'View Album Gallery'}</span>
                      <ChevronRight className="w-4 h-4 text-amber-800 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. MY UPLOADS VIEW MODE */}
          {viewTab === 'MY_UPLOADS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMemories.map(photo => {
                const coverSrc = getAssetUrl(photo.cover_image_url || photo.image_url);
                const isApproved = photo.status === 'APPROVED' || !photo.status;
                const isRejected = photo.status === 'REJECTED';

                return (
                  <div
                    key={photo.id}
                    className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    <div className="h-48 bg-gray-900 relative">
                      <img src={coverSrc} alt={photo.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 right-2.5 z-10">
                        {isApproved ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved</span>
                          </span>
                        ) : isRejected ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Declined</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>Awaiting Moderation</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                            {photo.album_name || 'Campus Memories'}
                          </span>
                          <h4 className="font-bold text-sm text-[#111111] mt-1">{photo.title}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMemory(photo.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {photo.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{photo.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
       * LIGHTBOX PREVIEW MODAL
       * ========================================================================= */}
      {activePhoto && createPortal(
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setActivePhoto(null)} aria-hidden="true" />

          <div
            className="relative z-10 bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-4 my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="space-y-0.5 min-w-0 pr-4">
                <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md">
                  Album: {activePhoto.album_name || 'Campus Memories'}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#111111] truncate mt-1">
                  {language === 'ta' && activePhoto.title_ta ? activePhoto.title_ta : activePhoto.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleShareImage(activePhoto)}
                  className="p-2 text-gray-600 hover:text-black rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadImage(
                    activePhoto.media_urls?.[activeImageIndex] || activePhoto.cover_image_url || activePhoto.image_url,
                    `${activePhoto.title}_${activeImageIndex + 1}.webp`
                  )}
                  className="px-3 py-1.5 bg-[#F4C542] hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Area */}
            {activePhoto.media_type === 'VIDEO' || activePhoto.video_url ? (
              <div className="w-full bg-black rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center">
                <video
                  src={getAssetUrl(activePhoto.video_url || activePhoto.image_url)}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[440px] object-contain"
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full h-72 sm:h-96 bg-gray-950 rounded-2xl overflow-hidden relative flex items-center justify-center">
                  <img
                    src={getAssetUrl(
                      activePhoto.media_urls && activePhoto.media_urls.length > 0
                        ? activePhoto.media_urls[activeImageIndex]
                        : activePhoto.cover_image_url || activePhoto.image_url
                    )}
                    alt={activePhoto.title}
                    className="w-full h-full object-contain"
                  />

                  {activePhoto.media_urls && activePhoto.media_urls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : activePhoto.media_urls!.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer z-10"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveImageIndex(prev => (prev < activePhoto.media_urls!.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer z-10"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-3 bg-black/80 px-3 py-1 rounded-full text-white text-xs font-bold z-10">
                        {activeImageIndex + 1} / {activePhoto.media_urls.length} Photos
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {activePhoto.media_urls && activePhoto.media_urls.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {activePhoto.media_urls.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImageIndex === idx ? 'border-amber-500 scale-105 shadow-sm' : 'border-gray-200 opacity-60'
                        }`}
                      >
                        <img src={getAssetUrl(url)} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description & Details */}
            <div className="space-y-2 bg-[#FAFAFA] rounded-2xl p-4 text-xs border border-[#E5E7EB]">
              <div className="flex flex-wrap items-center justify-between gap-2 text-gray-700 font-semibold">
                <div>Uploader: <strong className="text-[#111111] font-bold">{activePhoto.uploader_name}</strong></div>
                {activePhoto.batch_year && (
                  <div>Batch: <strong className="text-amber-800 font-bold">{activePhoto.batch_year}</strong></div>
                )}
              </div>

              {(activePhoto.description || activePhoto.description_ta) && (
                <p className="text-xs text-gray-700 leading-relaxed font-medium pt-1 border-t border-gray-200">
                  {language === 'ta' && activePhoto.description_ta ? activePhoto.description_ta : activePhoto.description}
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
       * UPLOAD MEMORY MODAL (Single / Multi-File Bulk & Video Support)
       * ========================================================================= */}
      {isUploadModalOpen && createPortal(
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsUploadModalOpen(false)} aria-hidden="true" />

          <div
            className="relative z-10 bg-white border border-[#E5E7EB] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-4 my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#111111]">
                  {language === 'ta' ? 'பள்ளி நினைவுகள் & படங்களைப் பதிவேற்று' : 'Upload School Photo / Album'}
                </h3>
                <p className="text-xs text-gray-500">
                  {language === 'ta'
                    ? 'புகைப்படங்கள், பல படங்களைக் கொண்ட ஆல்பம் அல்லது வீடியோக்களை இணைக்கவும்'
                    : 'Submit single photos, multi-photo albums, or attach video links'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMemory} className="space-y-4 text-xs">
              {/* Media Type Switcher */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {language === 'ta' ? 'ஊடக வகை தேர்வு செய்க' : 'Select Media Type'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaType('IMAGE')}
                    className={`p-2.5 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      mediaType === 'IMAGE' ? 'bg-amber-50 border-amber-500 text-amber-900' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Single Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('ALBUM')}
                    className={`p-2.5 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      mediaType === 'ALBUM' ? 'bg-amber-50 border-amber-500 text-amber-900' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Multi-Photo Album</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('VIDEO')}
                    className={`p-2.5 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      mediaType === 'VIDEO' ? 'bg-amber-50 border-amber-500 text-amber-900' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>Video</span>
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {language === 'ta' ? 'நினைவுத் தலைப்பு *' : 'Memory Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Annual Sports Meet 2018 Gold Medal Relay Team"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Album Category & Batch Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Album Category</label>
                  <select
                    value={albumName}
                    onChange={e => setAlbumName(e.target.value)}
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Campus Memories">Campus Memories</option>
                    <option value="Sports Day">Sports Day & Athletics</option>
                    <option value="Cultural Fest">Cultural Fest & Functions</option>
                    <option value="Batch Reunion">Batch Reunion Meetups</option>
                    <option value="Classroom & Friends">Classroom & Friends</option>
                    <option value="School Photos">School Campus Photos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Batch Year</label>
                  <input
                    type="text"
                    value={batchYear}
                    onChange={e => setBatchYear(e.target.value)}
                    placeholder="e.g. 2018"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* File Upload Box (Photos/Albums) */}
              {mediaType !== 'VIDEO' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {mediaType === 'ALBUM' ? 'Upload Album Photos (Select Multiple)' : 'Upload Photo'}
                  </label>
                  <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-4 text-center bg-[#FAFAFA] space-y-2">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-500 font-semibold">
                      Click to choose image file(s) from your device
                    </p>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple={mediaType === 'ALBUM'}
                      onChange={handleFileUpload}
                      disabled={uploadingFiles}
                      className="w-full text-xs text-gray-500 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900"
                    />
                    {uploadingFiles && (
                      <p className="text-xs text-amber-800 font-bold animate-pulse">
                        Uploading media file(s)...
                      </p>
                    )}
                  </div>

                  {mediaUrls.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[11px] font-bold text-gray-500">
                        {mediaUrls.length} file(s) uploaded:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {mediaUrls.map((url, i) => (
                          <div key={i} className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden relative group">
                            <img src={getAssetUrl(url)} alt={`Media ${i}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setMediaUrls(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Video URL Input */}
              {mediaType === 'VIDEO' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Video Stream URL</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://... MP4 link or video URL"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Description / Caption */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Story Behind Photo</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Share details about who is in the photo, the event, or the year..."
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl font-medium focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={submittingMemory || uploadingFiles}
                className="w-full py-3 bg-[#111111] hover:bg-black text-[#F4C542] font-extrabold text-xs rounded-xl shadow-md transition-all disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-2"
              >
                {submittingMemory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#F4C542]" />
                    <span>Submitting Photo Memory...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit Memory for Approval</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
