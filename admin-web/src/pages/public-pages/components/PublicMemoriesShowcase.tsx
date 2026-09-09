import React, { useEffect, useState, useMemo } from 'react';
import {
  Image as ImageIcon, Layers, Film, FolderPlus, Download, Share2, Eye,
  ChevronLeft, ChevronRight, X, Sparkles, Filter, Calendar, Globe,
  ArrowRight, Play, Loader2, RefreshCw, Plus, Upload, Video, CheckCircle2
} from 'lucide-react';
import { api } from '../../../services/api';
import { alertService } from '../../../services/alertService';
import { useLanguage } from '../../../context/LanguageContext';
import { getAssetUrl } from '../../../utils/asset';
import { Button } from '../../../components/Button';

interface MemoryItem {
  id: string;
  title: string;
  title_ta?: string;
  album_name?: string;
  media_type?: string;
  description?: string;
  description_ta?: string;
  target_audience?: string;
  batch_year?: string;
  image_url: string;
  cover_image_url?: string;
  media_urls?: string[];
  video_url?: string;
  uploader_name?: string;
}

export const PublicMemoriesShowcase: React.FC = () => {
  const { language } = useLanguage();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [viewMode, setViewMode] = useState<'GALLERY' | 'ALBUMS'>('GALLERY');
  const [audienceFilter, setAudienceFilter] = useState<'ALL' | 'PUBLIC' | 'BATCH'>('ALL');
  const [selectedBatchYear, setSelectedBatchYear] = useState<string>('ALL');

  // Pagination State
  const [itemsToShow, setItemsToShow] = useState<number>(8);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Lightbox Preview Modal State
  const [activePhoto, setActivePhoto] = useState<MemoryItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Public Upload Modal State (No Login Required)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | 'ALBUM'>('IMAGE');
  const [title, setTitle] = useState('');
  const [albumName, setAlbumName] = useState('Campus Memories');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [uploaderEmail, setUploaderEmail] = useState('');
  const [description, setDescription] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submittingMemory, setSubmittingMemory] = useState(false);

  useEffect(() => {
    fetchPublicMemories();
  }, []);

  const fetchPublicMemories = async () => {
    try {
      setLoading(true);
      const data = await api.getPublicMemories();
      setMemories(data as MemoryItem[]);
    } catch (err) {
      console.error('Failed to fetch public memories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Distinct Batch Years list from memories
  const batchYears = useMemo(() => {
    const years = new Set<string>();
    memories.forEach((m) => {
      if (m.batch_year && m.batch_year !== 'Public / School-Wide' && m.batch_year !== 'N/A') {
        years.add(m.batch_year);
      }
    });
    return Array.from(years).sort().reverse();
  }, [memories]);

  // Filtered Memories List
  const filteredMemories = useMemo(() => {
    return memories.filter((item) => {
      // Audience filter
      if (audienceFilter === 'PUBLIC') {
        if (item.target_audience === 'BATCH' && item.batch_year && item.batch_year !== 'Public / School-Wide') return false;
      }
      if (audienceFilter === 'BATCH') {
        if (item.target_audience === 'PUBLIC' || !item.batch_year || item.batch_year === 'Public / School-Wide') return false;
      }
      // Batch Year specific filter
      if (selectedBatchYear !== 'ALL') {
        if (item.batch_year !== selectedBatchYear) return false;
      }
      return true;
    });
  }, [memories, audienceFilter, selectedBatchYear]);

  // Grouped Albums
  const groupedAlbums = useMemo(() => {
    const map = new Map<string, { album_name: string; items: MemoryItem[]; cover_image_url: string }>();
    filteredMemories.forEach((item) => {
      const albName = item.album_name || 'Campus Memories';
      if (!map.has(albName)) {
        map.set(albName, {
          album_name: albName,
          items: [],
          cover_image_url: item.cover_image_url || item.image_url
        });
      }
      map.get(albName)!.items.push(item);
    });
    return Array.from(map.values());
  }, [filteredMemories]);

  // Items currently visible for pagination
  const visibleMemories = useMemo(() => {
    return filteredMemories.slice(0, itemsToShow);
  }, [filteredMemories, itemsToShow]);

  const visibleAlbums = useMemo(() => {
    return groupedAlbums.slice(0, itemsToShow);
  }, [groupedAlbums, itemsToShow]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setItemsToShow((prev) => prev + 8);
      setLoadingMore(false);
    }, 400);
  };

  // Open Lightbox Preview Modal
  const openPreview = (photo: MemoryItem, initialIdx = 0) => {
    setActivePhoto(photo);
    setActiveImageIndex(initialIdx);
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
      alertService.showSuccess('Downloading', 'Image download started!');
    } catch (err) {
      window.open(getAssetUrl(url), '_blank');
    }
  };

  // Share Handler
  const handleShareImage = async (photo: MemoryItem) => {
    const shareUrl = window.location.origin + '/memories#' + photo.id;
    const shareData = {
      title: photo.title || 'School Memory',
      text: photo.description || 'Check out this memory from our school gallery!',
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alertService.showSuccess('Link Copied!', 'Memory link copied to clipboard.');
      } catch (e) {
        alertService.showInfo('Share Memory', `Share link: ${shareUrl}`);
      }
    }
  };

  // Public Upload Handlers (No Login Required)
  const handleOpenUploadModal = () => {
    if (api.getToken()) {
      api.getMe().then((u) => {
        if (u) {
          if (!uploaderName) setUploaderName(u.full_name || '');
          if (!uploaderEmail) setUploaderEmail(u.email || '');
          if (!batchYear && u.passing_year) setBatchYear(String(u.passing_year));
        }
      }).catch(() => {});
    }
    setIsUploadModalOpen(true);
  };

  const handlePublicMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      alertService.showSuccess('Files Uploaded', `${res.urls.length} media file(s) attached.`);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to upload media files.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handlePublicSubmitMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alertService.showWarning('Title Required', 'Please enter a title for your memory.');
      return;
    }

    setSubmittingMemory(true);
    try {
      const cover = coverImageUrl.trim() || (mediaUrls.length > 0 ? mediaUrls[0] : '');
      await api.createMemory({
        title: title.trim(),
        album_name: albumName.trim() || 'Campus Memories',
        media_type: mediaType,
        cover_image_url: cover,
        image_url: cover,
        media_urls: mediaUrls.length > 0 ? mediaUrls : (cover ? [cover] : []),
        video_url: videoUrl.trim() || undefined,
        description: description.trim(),
        batch_year: batchYear.trim() || '',
        uploader_name: uploaderName.trim() || 'Public Visitor',
        uploader_email: uploaderEmail.trim() || undefined,
        status: 'SUBMITTED'
      });

      alertService.showSuccess(
        'Memory Submitted for Moderation!',
        'Thank you! Your photo memory / video has been submitted to the School Administrator for review.'
      );
      setIsUploadModalOpen(false);
      setTitle('');
      setCoverImageUrl('');
      setMediaUrls([]);
      setVideoUrl('');
      setDescription('');
      fetchPublicMemories();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to submit memory.');
    } finally {
      setSubmittingMemory(false);
    }
  };

  const totalItems = viewMode === 'GALLERY' ? filteredMemories.length : groupedAlbums.length;
  const currentCount = viewMode === 'GALLERY' ? visibleMemories.length : visibleAlbums.length;
  const hasMore = currentCount < totalItems;

  return (
    <div className="space-y-8 py-6 font-sans">
      
      {/* Header Title Section */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
          {language === 'ta' ? 'நமது பள்ளி வாழ்க்கையின் வரலாற்றுத் தருணங்கள்' : 'Glimpses of Our School History & Alumni Traditions'}
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {language === 'ta'
            ? 'மாணவர்கள் மற்றும் பழைய மாணவர்களால் பகிரப்பட்ட புகைப்படங்கள் மற்றும் ஆல்பங்கள்.'
            : 'Explore cherished moments, sports days, cultural fests, and reunion memories shared across generations.'}
        </p>
      </div>

      {/* Mode Controls & Filter Bar (Frameless Design) */}
      <div className="bg-gradient-to-r from-amber-50/60 via-white to-amber-50/60 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* View Mode Buttons: Gallery Grid vs Albums Grid */}
          <div className="flex items-center space-x-1.5 bg-gray-100/90 p-1.5 rounded-2xl">
            <button
              onClick={() => { setViewMode('GALLERY'); setItemsToShow(8); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
                viewMode === 'GALLERY'
                  ? 'bg-[#111111] text-[#F4C542] shadow-md'
                  : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'அனைத்து புகைப்படங்கள்' : 'All Photos Gallery'} ({filteredMemories.length})</span>
            </button>

            <button
              onClick={() => { setViewMode('ALBUMS'); setItemsToShow(8); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
                viewMode === 'ALBUMS'
                  ? 'bg-[#111111] text-[#F4C542] shadow-md'
                  : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'ஆல்பங்கள் பார்வை' : 'Albums View'} ({groupedAlbums.length})</span>
            </button>
          </div>

          {/* Audience Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => { setAudienceFilter('ALL'); setSelectedBatchYear('ALL'); setItemsToShow(8); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                audienceFilter === 'ALL'
                  ? 'bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'அனைத்தும்' : 'All Category'}</span>
            </button>

            <button
              onClick={() => { setAudienceFilter('PUBLIC'); setSelectedBatchYear('ALL'); setItemsToShow(8); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                audienceFilter === 'PUBLIC'
                  ? 'bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{language === 'ta' ? 'பொதுவானவை' : 'Public Gallery'}</span>
            </button>

            <button
              onClick={() => { setAudienceFilter('BATCH'); setItemsToShow(8); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                audienceFilter === 'BATCH'
                  ? 'bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'குறிப்பிட்ட பேட்ச்' : 'Batch Specific'}</span>
            </button>
          </div>
        </div>

        {/* Batch Year Selector if BATCH or ALL selected */}
        {batchYears.length > 0 && audienceFilter === 'BATCH' && (
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-100 animate-fadeIn">
            <span className="text-xs font-bold text-gray-600">Select Batch Year:</span>
            <select
              value={selectedBatchYear}
              onChange={(e) => { setSelectedBatchYear(e.target.value); setItemsToShow(8); }}
              className="px-3 py-1.5 bg-white border border-[#F4C542] rounded-xl text-xs font-bold text-[#854D0E] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Batch Years ({batchYears.length})</option>
              {batchYears.map(yr => (
                <option key={yr} value={yr}>Batch {yr}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#854D0E] animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-500">Loading alumni photo memories...</p>
        </div>
      ) : totalItems === 0 ? (
        <div className="py-16 text-center bg-gray-50/70 rounded-3xl space-y-3">
          <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
          <h4 className="text-base font-bold text-[#111111]">No Memory Items Found</h4>
          <p className="text-xs text-gray-500">There are no memory items matching the selected filters.</p>
        </div>
      ) : (
        /* Frameless Premium Cards Grid */
        <div className="space-y-8">
          
          {/* GALLERY VIEW MODE */}
          {viewMode === 'GALLERY' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleMemories.map((photo) => {
                const coverSrc = getAssetUrl(photo.cover_image_url || photo.image_url);
                const isAlbum = photo.media_type === 'ALBUM' || (photo.media_urls && photo.media_urls.length > 1);
                const photoCount = photo.media_urls?.length || 1;
                const displayTitle = language === 'ta' && photo.title_ta ? photo.title_ta : photo.title;

                return (
                  <div
                    key={photo.id}
                    onClick={() => openPreview(photo)}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
                  >
                    {/* Image Box */}
                    <div className="h-56 sm:h-60 overflow-hidden bg-gray-900 relative">
                      <img
                        src={coverSrc}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        {isAlbum ? (
                          <span className="text-[10px] font-extrabold bg-[#111111]/80 backdrop-blur-md text-[#F4C542] border border-[#F4C542]/50 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
                            <Layers className="w-3 h-3 text-[#F4C542]" />
                            <span>{photoCount} Photos</span>
                          </span>
                        ) : photo.media_type === 'VIDEO' ? (
                          <span className="text-[10px] font-extrabold bg-purple-950/80 backdrop-blur-md text-purple-300 border border-purple-400/50 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
                            <Film className="w-3 h-3 text-purple-300" />
                            <span>Video</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Photo
                          </span>
                        )}

                        {photo.batch_year && photo.batch_year !== 'Public / School-Wide' && (
                          <span className="text-[10px] font-bold text-[#854D0E] bg-[#FFF7D6]/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#F4C542]/60">
                            Batch {photo.batch_year}
                          </span>
                        )}
                      </div>

                      {/* Video Play Overlay */}
                      {photo.media_type === 'VIDEO' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          <div className="w-12 h-12 bg-black/70 border-2 border-[#F4C542] rounded-full flex items-center justify-center text-[#F4C542] shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Bottom Image Info */}
                      <div className="absolute bottom-3 left-3 right-3 z-10 text-white space-y-0.5">
                        <span className="text-[10px] font-bold text-[#F4C542] uppercase tracking-wider block">
                          {photo.album_name || 'Campus Gallery'}
                        </span>
                        <h4 className="font-extrabold text-base leading-snug line-clamp-1 text-white drop-shadow-md">
                          {displayTitle}
                        </h4>
                      </div>
                    </div>

                    {/* Frameless Card Foot & Hover Actions */}
                    <div className="p-4 bg-white space-y-3">
                      {photo.description && (
                        <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 leading-relaxed font-semibold">
                          {language === 'ta' && photo.description_ta ? photo.description_ta : photo.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                        <span className="text-gray-700 font-semibold text-xs">
                          {language === 'ta' ? 'பகிர்ந்தவர்' : 'By'} <strong className="text-[#111111] font-bold">{photo.uploader_name || (language === 'ta' ? 'பழைய மாணவர்' : 'Alumnus')}</strong>
                        </span>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShareImage(photo); }}
                            className="p-1.5 text-gray-400 hover:text-[#111111] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            title="Share Memory Link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadImage(photo.cover_image_url || photo.image_url, `${photo.title}.webp`); }}
                            className="p-1.5 text-[#854D0E] bg-[#FFF7D6] hover:bg-[#F4C542] rounded-xl transition-colors cursor-pointer"
                            title="Download Image"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ALBUMS VIEW MODE */}
          {viewMode === 'ALBUMS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleAlbums.map((alb, idx) => {
                const coverSrc = getAssetUrl(alb.cover_image_url);
                const firstItem = alb.items[0];

                return (
                  <div
                    key={idx}
                    onClick={() => openPreview(firstItem)}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="h-56 overflow-hidden bg-gray-900 relative">
                      <img
                        src={coverSrc}
                        alt={alb.album_name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                      <div className="absolute top-3 left-3 z-10">
                        <span className="text-[10px] font-extrabold bg-[#111111]/90 backdrop-blur-md text-[#F4C542] border border-[#F4C542]/60 px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5">
                          <FolderPlus className="w-3.5 h-3.5 text-[#F4C542]" />
                          <span>{alb.items.length} {language === 'ta' ? 'படங்கள்' : 'Records'}</span>
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                        <h4 className="font-extrabold text-lg leading-snug line-clamp-1 drop-shadow-md">
                          {alb.album_name}
                        </h4>
                        <p className="text-xs text-[#F4C542] font-semibold mt-0.5">
                          {language === 'ta' ? 'ஆல்பத்தைக் காண கிளிக் செய்க →' : 'Click to view photo album gallery →'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-gray-50 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#111111]">
                      <span>{language === 'ta' ? 'ஆல்பத்தைத் திறக்குக' : 'Explore Album Gallery'}</span>
                      <ArrowRight className="w-4 h-4 text-[#854D0E] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button Section */}
          {hasMore && (
            <div className="text-center pt-6 space-y-2">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-[#111111] hover:bg-black text-[#F4C542] font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-[#F4C542]/40"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 text-[#F4C542] animate-spin" />
                    <span>{language === 'ta' ? 'ஏற்றப்படுகிறது...' : 'Loading More Memories...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'ta' ? 'மேலும் படங்கள் பார்க்க' : 'Load More Memories'}</span>
                    <RefreshCw className="w-4 h-4 text-[#F4C542]" />
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 font-semibold">
                {language === 'ta' ? (
                  <>மொத்தம் <strong>{totalItems}</strong>-இல் <strong>{currentCount}</strong> புகைப்படங்கள் காண்பிக்கப்படுகின்றன</>
                ) : (
                  <>Showing <strong>{currentCount}</strong> of <strong>{totalItems}</strong> items</>
                )}
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BOTTOM UPLOAD CALLOUT CARD & BUTTON */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-[#111111] via-[#1c1c1c] to-[#111111] border-2 border-[#F4C542] rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-xl max-w-3xl mx-auto mt-10">
            <h4 className="text-xl sm:text-3xl font-extrabold text-[#F4C542]">
              {language === 'ta'
                ? 'பள்ளி பருவ புகைப்படங்கள் அல்லது வீடியோக்கள் உள்ளதா?'
                : 'Have photos or videos from your school days?'}
            </h4>
            <p className="text-xs sm:text-sm text-gray-300 font-semibold max-w-xl mx-auto leading-relaxed">
              {language === 'ta'
                ? 'உங்கள் புகைப்படங்கள், வீடியோக்கள் மற்றும் ஆல்பங்களை முன்னாள் வகுப்புத் தோழர்களுடன் இப்போதே பகிர்ந்து கொள்ளுங்கள்.'
                : 'Upload your photo albums and celebration videos to preserve our school heritage.'}
            </p>
            <button
              type="button"
              onClick={handleOpenUploadModal}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#F4C542] hover:bg-[#e0b236] text-[#111111] font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer border-2 border-[#F4C542]"
            >
              <Plus className="w-4 h-4 text-[#111111]" />
              <span>{language === 'ta' ? 'நினைவு / படம் பகிருங்கள்' : 'Share Memory / Upload Photo'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX PREVIEW MODAL (Multi-Photo Carousel, Download & Share) */}
      {/* ========================================================================= */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-8 space-y-5 relative">
            
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Album: {activePhoto.album_name || 'Campus Gallery'}
                </span>
                <h3 className="text-xl font-bold text-[#111111]">
                  {language === 'ta' && activePhoto.title_ta ? activePhoto.title_ta : activePhoto.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleShareImage(activePhoto)}
                  className="p-2 rounded-xl text-gray-600 hover:text-[#111111] hover:bg-gray-100 transition-all cursor-pointer"
                  title="Share Memory"
                >
                  <Share2 className="w-5 h-5 text-[#854D0E]" />
                </button>

                <button
                  onClick={() => handleDownloadImage(
                    activePhoto.media_urls?.[activeImageIndex] || activePhoto.cover_image_url || activePhoto.image_url,
                    `${activePhoto.title}_${activeImageIndex + 1}.webp`
                  )}
                  className="px-3 py-1.5 bg-[#FFF7D6] hover:bg-[#F4C542] text-[#854D0E] font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer border border-[#F4C542]"
                  title="Download Photo"
                >
                  <Download className="w-4 h-4 text-[#854D0E]" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => setActivePhoto(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-[#111111] hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Viewer Area */}
            {activePhoto.media_type === 'VIDEO' || activePhoto.video_url ? (
              <div className="w-full bg-black rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center">
                <video
                  src={getAssetUrl(activePhoto.video_url || activePhoto.image_url)}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[420px] object-contain"
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full h-72 sm:h-96 bg-gray-950 rounded-2xl overflow-hidden relative flex items-center justify-center">
                  <img
                    src={getAssetUrl(
                      (activePhoto.media_urls && activePhoto.media_urls.length > 0)
                        ? activePhoto.media_urls[activeImageIndex]
                        : activePhoto.cover_image_url || activePhoto.image_url
                    )}
                    alt={activePhoto.title}
                    className="w-full h-full object-contain"
                  />

                  {/* Previous / Next Controls for Multi-Photo Albums */}
                  {activePhoto.media_urls && activePhoto.media_urls.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : activePhoto.media_urls!.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer z-10"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev < activePhoto.media_urls!.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer z-10"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-3 bg-black/80 px-3 py-1 rounded-full text-white text-xs font-bold z-10">
                        {activeImageIndex + 1} / {activePhoto.media_urls.length} Photos
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails strip for Multi-Photo Albums */}
                {activePhoto.media_urls && activePhoto.media_urls.length > 1 && (
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {activePhoto.media_urls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImageIndex === idx ? 'border-[#F4C542] scale-105 shadow-md' : 'border-gray-200 opacity-60'
                        }`}
                      >
                        <img src={getAssetUrl(url)} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description & Info Details */}
            <div className="space-y-3 bg-gray-50 rounded-2xl p-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2 text-gray-700 font-semibold">
                <div>{language === 'ta' ? 'பதிவேற்றியவர்:' : 'Uploader:'} <strong className="text-[#111111] font-bold">{activePhoto.uploader_name || (language === 'ta' ? 'பழைய மாணவர்' : 'Alumnus')}</strong></div>
                {activePhoto.batch_year && (
                  <div>{language === 'ta' ? 'பேட்ச்:' : 'Batch:'} <strong className="text-[#854D0E] font-bold">{activePhoto.batch_year}</strong></div>
                )}
              </div>

              {(activePhoto.description || activePhoto.description_ta) && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-800 block mb-1">
                    {language === 'ta' ? 'விவரம்:' : 'Description:'}
                  </span>
                  <p className="text-gray-700 leading-relaxed font-semibold italic">
                    {language === 'ta' && activePhoto.description_ta ? activePhoto.description_ta : activePhoto.description}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PUBLIC SHARE MEMORY / VIDEO / ALBUM MODAL (NO LOGIN REQUIRED) */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#111111]">
                  {language === 'ta' ? 'பள்ளி நினைவுகள் & படங்களை பகிருங்கள்' : 'Share School Memory / Photo Album'}
                </h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">
                  {language === 'ta' ? 'புகைப்படங்கள், வீடியோக்கள் மற்றும் ஆல்பங்களை பதிவேற்றவும்' : 'Upload photos, create photo albums, or attach video links'}
                </p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-[#111111] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublicSubmitMemory} className="space-y-4">
              {/* Media Category Selection */}
              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                  {language === 'ta' ? 'ஊடக வகை தேர்வு செய்க' : 'Select Media Type'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMediaType('IMAGE')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                      mediaType === 'IMAGE' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E]' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>{language === 'ta' ? 'புகைப்படம்' : 'Photo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('ALBUM')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                      mediaType === 'ALBUM' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E]' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    <span>{language === 'ta' ? 'ஆல்பம்' : 'Photo Album'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('VIDEO')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                      mediaType === 'VIDEO' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E]' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    <span>{language === 'ta' ? 'வீடியோ' : 'Video'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  {language === 'ta' ? 'தலைப்பு *' : 'Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'ta' ? 'எ.கா. 2018 விளையாட்டு விழா புகைப்படங்கள்' : 'e.g. Annual Sports Day Celebrations 2018'}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] font-semibold focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  {language === 'ta' ? 'ஆல்பத்தின் பெயர்' : 'Album Name'}
                </label>
                <input
                  type="text"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="Campus Memories"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] font-semibold focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              {/* Multi-Photo Files Upload */}
              {(mediaType === 'ALBUM' || mediaType === 'IMAGE') && (
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    {language === 'ta' ? 'படங்களை பதிவேற்றுக (பல தேர்வு செய்யலாம்)' : 'Upload Photos (Select Multiple)'}
                  </label>
                  <label className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      {uploadingFiles
                        ? (language === 'ta' ? 'கோப்புகள் பதிவேற்றப்படுகின்றன...' : 'Uploading files...')
                        : (language === 'ta' ? 'உள்ளூர் படங்களை தேர்ந்தெடுக்கவும்' : 'Click to Browse Local Photos')}
                    </span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handlePublicMultiUpload} />
                  </label>

                  {mediaUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
                      {mediaUrls.map((url, idx) => (
                        <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-300">
                          <img src={getAssetUrl(url)} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Video URL Input */}
              {mediaType === 'VIDEO' && (
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    {language === 'ta' ? 'வீடியோ இணைப்பு URL' : 'Video File URL / Stream Link'}
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="/uploads/reunion_video.mp4"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] font-semibold focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    {language === 'ta' ? 'படித்த ஆண்டு / பேட்ச்' : 'Batch / Graduation Year'}
                  </label>
                  <input
                    type="text"
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    placeholder="e.g. 2012"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] font-semibold focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    {language === 'ta' ? 'உங்கள் பெயர்' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    placeholder={language === 'ta' ? 'உங்கள் பெயர்' : 'Your Name / Alumnus Name'}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] font-semibold focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  {language === 'ta' ? 'விவரம் / நினைவுக் குறிப்பு' : 'Description / Story'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'ta' ? 'இந்த புகைப்படங்கள் பற்றிய விவரத்தைப் பகிரவும்...' : 'Share details about this photo memory or video...'}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] font-semibold focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {language === 'ta' ? 'ரத்து செய்க' : 'Cancel'}
                </button>
                <Button type="submit" isLoading={submittingMemory}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>{language === 'ta' ? 'சமர்ப்பிக்கவும்' : 'Submit for Moderation'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
