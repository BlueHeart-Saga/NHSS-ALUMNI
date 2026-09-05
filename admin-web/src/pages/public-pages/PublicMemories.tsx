import React, { useEffect, useState } from 'react';
import {
  ArrowRight, Image as ImageIcon, X, Trophy, Medal, Search, Video,
  Plus, Info, Award, Film, Play, Layers, ChevronLeft, ChevronRight, Upload, CheckCircle2, User
} from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';
import { RankHolder, Memory } from '../../types';
import { alertService } from '../../services/alertService';
import { Button } from '../../components/Button';

export const PublicMemories: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // State for Memories Gallery (Pure Backend DB)
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [activePhoto, setActivePhoto] = useState<Memory | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // State for Rank Holders (Pure Backend DB)
  const [rankHolders, setRankHolders] = useState<RankHolder[]>([]);
  const [loadingRankHolders, setLoadingRankHolders] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedHolderModal, setSelectedHolderModal] = useState<RankHolder | null>(null);

  // Pagination & Filter State
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [mediaFilter, setMediaFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'ALBUM'>('ALL');

  // Alumni Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | 'ALBUM'>('IMAGE');
  const [title, setTitle] = useState('');
  const [albumName, setAlbumName] = useState('Campus Memories');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submittingMemory, setSubmittingMemory] = useState(false);

  useEffect(() => {
    // Fetch Memories from Backend DB
    api.getPublicMemories()
      .then((m) => setMemories(m || []))
      .catch(() => setMemories([]))
      .finally(() => setLoadingMemories(false));

    // Fetch Rank Holders from Backend DB
    api.getPublicRankHolders()
      .then((r) => setRankHolders(r || []))
      .catch(() => setRankHolders([]))
      .finally(() => setLoadingRankHolders(false));

    // Pre-fill alumni user details if logged in
    if (api.getToken()) {
      api.getMe().then((u) => {
        if (u) {
          setUploaderName(u.full_name || '');
          if (u.passing_year) setBatchYear(String(u.passing_year));
        }
      }).catch(() => { });
    }
  }, []);

  // Reset pagination count when search or filter changes
  useEffect(() => {
    setVisibleCount(8);
  }, [searchTerm, selectedYear, mediaFilter]);

  const handleOpenPhotoModal = (memory: Memory) => {
    setActivePhoto(memory);
    setActiveImageIndex(0);
  };

  const handleOpenUploadModal = () => {
    if (!api.getToken()) {
      alertService.showInfo('Login Required', 'Please log in to your alumni account to share memories & videos.');
      navigate('/login');
      return;
    }
    setIsUploadModalOpen(true);
  };

  // Multi-file upload for alumni
  const handleAlumniMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAlumniSubmitMemory = async (e: React.FormEvent) => {
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
        batch_year: batchYear.trim() || '2024',
        uploader_name: uploaderName.trim() || 'Alumni Member',
        status: 'SUBMITTED' // Requires Admin Review
      });

      alertService.showSuccess(
        'Memory Submitted for Moderation!',
        'Thank you! Your memory item/video has been submitted to the School Administrator for review.'
      );
      setIsUploadModalOpen(false);
      setTitle('');
      setCoverImageUrl('');
      setMediaUrls([]);
      setVideoUrl('');
      setDescription('');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to submit memory.');
    } finally {
      setSubmittingMemory(false);
    }
  };

  // Extract unique academic years sorted descending
  const uniqueYears = Array.from(new Set(rankHolders.map(h => h.academic_year))).sort().reverse();

  // Filter Rank Holders
  const filteredRankHolders = rankHolders.filter(h => {
    const matchesSearch = !searchTerm ||
      h.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.achievement_title && h.achievement_title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesYear = !selectedYear || h.academic_year === selectedYear;

    return matchesSearch && matchesYear;
  });

  const displayedRankHolders = filteredRankHolders.slice(0, visibleCount);

  // Filter Memories
  const filteredMemories = memories.filter(m => {
    if (mediaFilter === 'ALL') return true;
    return m.media_type === mediaFilter || (mediaFilter === 'ALBUM' && m.media_urls && m.media_urls.length > 1);
  });

  return (
    <div className="bg-white text-[#111111] animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="py-10 sm:py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] tracking-tight">
            {t('memories_page_title')}
          </h1>
          <p className="text-xs sm:text-base text-gray-600 max-w-2xl mx-auto font-normal">
            {language === 'ta'
              ? 'பள்ளி நினைவுகள், சிறப்பு புகைப்படங்கள், வீடியோக்கள் மற்றும் சிறந்த சாதனை மாணவர்களின் விவரங்கள்.'
              : 'Cherished school photo albums, videos, heritage archives, and academic rank holder achievements.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">

        {/* ========================================================================= */}
        {/* SECTION 1: SCHOOL RANK HOLDERS & ACHIEVERS */}
        {/* ========================================================================= */}
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 border-b border-gray-200">
            <div className="space-y-2">
              <span className="inline-flex items-center space-x-2 text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-[#854D0E]" />
                <span>{language === 'ta' ? 'நமது பள்ளி சாதனையாளர்கள்' : 'School Rank Holders & Achievers'}</span>
              </span>

              <h2 className="text-xl sm:text-4xl font-bold text-[#111111]">
                {language === 'ta' ? 'கல்விச் சிறப்பும் விருதுகளும்' : 'Academic Excellence & Rank Holders'}
              </h2>
            </div>

            {/* Search & Academic Year Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'மாணவர் பெயர் தேட...' : 'Search student or rank...'}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setVisibleCount(10);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#F4C542] bg-gray-50 font-medium"
                />
              </div>

              <div className="w-full sm:w-56">
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setVisibleCount(10);
                  }}
                  className="w-full text-xs p-2.5 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#F4C542] font-semibold bg-gray-50 cursor-pointer"
                >
                  <option value="">
                    {language === 'ta' ? 'அனைத்து ஆண்டுகள் (All Years)' : 'All Academic Years'}
                  </option>
                  {uniqueYears.map(yr => (
                    <option key={yr} value={yr}>
                      Academic Year: {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rank Holders Grid */}
          {loadingRankHolders ? (
            <div className="text-center py-12 text-gray-500 font-semibold text-sm">
              Loading Rank Holders...
            </div>
          ) : displayedRankHolders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300 max-w-xl mx-auto space-y-2 p-6">
              <Award className="w-10 h-10 text-[#854D0E] mx-auto opacity-70" />
              <h4 className="font-bold text-sm text-[#111111]">
                {language === 'ta' ? 'சாதனையாளர்கள் பட்டியல் எதுவும் பதிவேற்றப்படவில்லை' : 'No Rank Holders Added Yet'}
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Academic achievers will appear here once published by the school administration.
              </p>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#111111] rounded-3xl shadow-[4px_4px_0px_0px_#111111] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#111111] text-white uppercase text-[11px] font-extrabold tracking-wider">
                      <th className="py-3.5 px-4 text-center w-12">{language === 'ta' ? 'எண்' : '#'}</th>
                      <th className="py-3.5 px-4">{language === 'ta' ? 'மாணவர் பெயர்' : 'Student Name'}</th>
                      <th className="py-3.5 px-4 text-center">{language === 'ta' ? 'கல்வியாண்டு' : 'Academic Year'}</th>
                      <th className="py-3.5 px-4 text-center">{language === 'ta' ? 'வகுப்பு' : 'Class / Standard'}</th>
                      <th className="py-3.5 px-4 text-center">{language === 'ta' ? 'பெற்ற மதிப்பெண்கள்' : 'Marks Secured'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-medium">
                    {displayedRankHolders.map((holder, idx) => (
                      <tr
                        key={holder.id}
                        onClick={() => setSelectedHolderModal(holder)}
                        className="hover:bg-[#FFF7D6]/60 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-sm text-[#111111] group-hover:text-[#854D0E] transition-colors">
                            {language === 'ta' && holder.student_name_ta ? holder.student_name_ta : holder.student_name}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-lg font-bold text-gray-800 text-xs">
                            {holder.academic_year}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs font-bold text-gray-700">
                          {holder.class_standard || '10th'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-sm text-[#111111]">
                          {holder.total_marks ? (
                            <span>
                              {holder.total_marks}
                              <span className="text-xs text-gray-400 font-normal"> / {holder.max_marks || (Number(holder.total_marks) > 500 ? '1200' : '500')}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs font-normal">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {visibleCount < filteredRankHolders.length && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="px-6 py-2 bg-white border border-gray-300 text-[#111111] hover:bg-gray-100 font-bold text-xs rounded-full shadow-sm transition-all"
                  >
                    {language === 'ta' ? `மேலும் பார்க்க (${filteredRankHolders.length - visibleCount} மீதம்)` : `View More (${filteredRankHolders.length - visibleCount} remaining)`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: SCHOOL PHOTO & VIDEO MEMORIES GALLERY */}
        {/* ========================================================================= */}
        <div className="space-y-6 sm:space-y-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#111111]">
                {language === 'ta' ? 'பள்ளி பருவ வரலாற்று படங்கள் & வீடியோக்கள்' : 'Cherished Campus Photo & Video Archives'}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Multi-Photo Albums, Celebrations, and Heritage Videos</p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Media Type Filter Pills */}
              <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
                {['ALL', 'IMAGE', 'VIDEO', 'ALBUM'].map((mt) => (
                  <button
                    key={mt}
                    onClick={() => setMediaFilter(mt as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${mediaFilter === mt ? 'bg-[#111111] text-[#F4C542]' : 'text-gray-600 hover:text-[#111111]'
                      }`}
                  >
                    {mt === 'ALL' ? 'All Media' : mt === 'IMAGE' ? 'Photos' : mt === 'VIDEO' ? 'Videos' : 'Albums'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleOpenUploadModal}
                className="px-4 py-2 bg-[#111111] text-[#F4C542] hover:bg-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 border border-[#F4C542]/40 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-[#F4C542]" />
                <span>Share Memory / Video</span>
              </button>
            </div>
          </div>

          {/* Photo & Video Grid */}
          {loadingMemories ? (
            <div className="text-center py-12 text-gray-500 font-semibold text-sm">
              Loading Memories Gallery...
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300 max-w-xl mx-auto space-y-3 p-6">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
              <h4 className="font-bold text-sm text-[#111111]">
                {language === 'ta' ? 'நினைவுகள் படங்கள் எதுவும் பதிவேற்றப்படவில்லை' : 'No School Memories Uploaded Yet'}
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Be the first alumnus to upload a cherished campus photo memory or celebration video!
              </p>
              <Button onClick={handleOpenUploadModal}>
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Upload First Memory / Video</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMemories.map((memory) => {
                const coverSrc = getAssetUrl(memory.cover_image_url || memory.image_url);
                const isVideo = memory.media_type === 'VIDEO' || Boolean(memory.video_url);
                const isAlbum = memory.media_type === 'ALBUM' || (memory.media_urls && memory.media_urls.length > 1);

                return (
                  <div
                    key={memory.id}
                    onClick={() => handleOpenPhotoModal(memory)}
                    className="bg-white border-2 border-[#111111] rounded-3xl overflow-hidden shadow-[5px_5px_0px_0px_#111111] hover:shadow-[8px_8px_0px_0px_#F4C542] transition-all duration-300 transform hover:-translate-x-1 hover:-translate-y-1 group cursor-pointer relative flex flex-col justify-between"
                  >
                    <div className="h-56 overflow-hidden bg-gray-900 relative flex items-center justify-center">
                      {coverSrc ? (
                        <img
                          src={coverSrc}
                          alt={memory.title || 'School Memory'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#111111] to-[#333333] flex flex-col items-center justify-center text-[#F4C542] p-4 text-center">
                          <ImageIcon className="w-12 h-12 mb-2 stroke-[1.5]" />
                          <span className="text-xs font-bold text-gray-300 line-clamp-1">{memory.title}</span>
                        </div>
                      )}

                      {/* Video Play Overlay Button */}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 bg-black/80 border-2 border-[#F4C542] rounded-full flex items-center justify-center text-[#F4C542] shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        {isVideo ? (
                          <span className="text-[10px] font-extrabold bg-purple-950/90 text-purple-300 border border-purple-400 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                            <Film className="w-3 h-3 text-purple-400" />
                            <span>Video</span>
                          </span>
                        ) : isAlbum ? (
                          <span className="text-[10px] font-extrabold bg-blue-950/90 text-blue-300 border border-blue-400 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                            <Layers className="w-3 h-3 text-blue-400" />
                            <span>{memory.media_urls?.length || 1} Photos</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold bg-gray-900/90 text-gray-200 border border-gray-700 px-2.5 py-0.5 rounded-full">
                            Photo
                          </span>
                        )}

                        {memory.album_name && (
                          <span className="text-[10px] font-bold bg-[#111111] text-[#F4C542] px-2.5 py-0.5 rounded-full border border-[#F4C542]/40 truncate max-w-[140px]">
                            {memory.album_name}
                          </span>
                        )}
                      </div>

                      {/* Title Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 z-10">
                        <h3 className="text-sm font-bold text-white truncate drop-shadow-md">{memory.title || 'School Memory'}</h3>
                        <span className="text-[11px] text-gray-300 font-semibold block mt-0.5">
                          {t('uploaded_by')} {memory.uploader_name || 'Alumni Member'} ({memory.batch_year || 'Alumni'})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upload Callout Card */}
        <div className="bg-white border-2 border-[#111111] rounded-[32px] p-8 text-center space-y-4 shadow-[8px_8px_0px_0px_#111111] max-w-2xl mx-auto relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#111111]">
              {language === 'ta' ? 'பள்ளி பருவ புகைப்படங்கள் அல்லது வீடியோக்கள் உள்ளதா?' : 'Have photos or videos from your school days?'}
            </h3>
            <p className="text-sm text-gray-600 font-normal">
              {language === 'ta' ? 'உங்கள் நினைவுகள் மற்றும் ஆல்பங்களை முன்னாள் வகுப்புத் தோழர்களுடன் இப்போதே பகிருங்கள்.' : 'Upload your photo albums and celebration videos to preserve our school heritage.'}
            </p>
            <button
              onClick={handleOpenUploadModal}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all border border-[#F4C542]/40 cursor-pointer"
            >
              <span>{t('share_memory_btn')}</span>
              <ArrowRight className="w-4 h-4 text-[#F4C542]" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ALUMNI SHARE MEMORY / VIDEO / ALBUM MODAL */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#111111]">Share School Memory / Video</h3>
                <p className="text-xs text-gray-500 font-medium">Upload photos, create photo albums, or attach video links</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAlumniSubmitMemory} className="space-y-4">
              {/* Media Category Selection */}
              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                  Select Media Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMediaType('IMAGE')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all ${mediaType === 'IMAGE' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E]' : 'border-gray-200 text-gray-600'
                      }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('ALBUM')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all ${mediaType === 'ALBUM' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E]' : 'border-gray-200 text-gray-600'
                      }`}
                  >
                    <Layers className="w-5 h-5" />
                    <span>Photo Album</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('VIDEO')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all ${mediaType === 'VIDEO' ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E]' : 'border-gray-200 text-gray-600'
                      }`}
                  >
                    <Video className="w-5 h-5" />
                    <span>Video</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2012 Batch Annual Day Celebrations"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Album Name
                </label>
                <input
                  type="text"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="Campus Memories"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              {/* Multi-Photo Files Upload */}
              {(mediaType === 'ALBUM' || mediaType === 'IMAGE') && (
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Upload Photos (Select Multiple)
                  </label>
                  <label className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-700">
                      {uploadingFiles ? 'Uploading files...' : 'Click to Browse Local Photos'}
                    </span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleAlumniMultiUpload} />
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
                    Video File URL / Stream Link
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="/uploads/my_reunion_video.mp4"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Batch / Graduation Year
                  </label>
                  <input
                    type="text"
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    placeholder="2012"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    placeholder="Alumni Name"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Description / Story
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share details about this photo memory or video..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={submittingMemory}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>Submit for Review</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO / VIDEO LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border-2 border-[#F4C542]">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Player OR Photo Carousel */}
            {activePhoto.media_type === 'VIDEO' || activePhoto.video_url ? (
              <div className="w-full bg-black aspect-video flex items-center justify-center">
                <video
                  src={getAssetUrl(activePhoto.video_url || activePhoto.image_url)}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[420px] object-contain"
                >
                  Your browser does not support video streaming.
                </video>
              </div>
            ) : (
              <div className="h-[420px] bg-black flex items-center justify-center overflow-hidden relative">
                <img
                  src={getAssetUrl(
                    (activePhoto.media_urls && activePhoto.media_urls.length > 0)
                      ? activePhoto.media_urls[activeImageIndex]
                      : activePhoto.cover_image_url || activePhoto.image_url
                  )}
                  alt={activePhoto.title || 'School Memory'}
                  className="max-h-full max-w-full object-contain"
                />

                {/* Carousel controls if album */}
                {activePhoto.media_urls && activePhoto.media_urls.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : activePhoto.media_urls!.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black text-white rounded-full"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex(prev => (prev < activePhoto.media_urls!.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black text-white rounded-full"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="p-6 bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
                  Album: {activePhoto.album_name || 'Campus Memories'}
                </span>
                <h3 className="text-lg font-bold text-[#111111]">{activePhoto.title || 'School Memory'}</h3>
                <p className="text-xs text-gray-500">{t('uploaded_by')} {activePhoto.uploader_name || 'Alumni Member'} ({activePhoto.batch_year || 'Alumni'})</p>
              </div>

              <button
                onClick={handleOpenUploadModal}
                className="px-5 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all border border-[#F4C542]/40 cursor-pointer flex items-center space-x-1.5"
              >
                <span>{t('share_memory_btn')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F4C542]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RANK HOLDER LIGHTBOX MODAL */}
      {selectedHolderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-[#F4C542] overflow-hidden p-6 text-center space-y-6">
            <button
              onClick={() => setSelectedHolderModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-[#F4C542] shadow-xl bg-[#FFF7D6] flex items-center justify-center text-[#854D0E]">
              {selectedHolderModal.photograph ? (
                <img
                  src={getAssetUrl(selectedHolderModal.photograph)}
                  alt={selectedHolderModal.student_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 stroke-[2.2] text-[#854D0E]" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold bg-[#111111] text-[#F4C542] px-4 py-1 rounded-full uppercase tracking-wider inline-block">
                {selectedHolderModal.rank}
              </span>
              <h3 className="text-2xl font-bold text-[#111111]">{selectedHolderModal.student_name}</h3>
              <p className="text-xs text-[#854D0E] font-semibold">{selectedHolderModal.achievement_title || 'School Academic Rank Holder'}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Academic Year:</span>
                <span className="font-bold text-[#111111]">{selectedHolderModal.academic_year}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Class / Standard:</span>
                <span className="font-bold text-[#111111]">{selectedHolderModal.class_standard || '10th Standard'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Exam / Achievement:</span>
                <span className="font-bold text-[#111111]">{selectedHolderModal.achievement_type || 'SSLC / Public Examination'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Marks / Score:</span>
                <span className="font-bold text-emerald-700">{selectedHolderModal.marks_percentage || 'N/A'}</span>
              </div>
              {selectedHolderModal.description && (
                <div className="pt-1 text-gray-600 leading-relaxed">
                  {selectedHolderModal.description}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedHolderModal(null)}
              className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Close Achiever Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
