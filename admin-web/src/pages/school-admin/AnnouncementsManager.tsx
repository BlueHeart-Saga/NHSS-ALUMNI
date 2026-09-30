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
  PartyPopper,
  Upload,
  CheckCircle2,
  Download,
  ExternalLink,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { ImageUploadAndEdit } from '../../components/ImageUploadAndEdit';
import { PdfViewerModal } from '../../components/PdfViewerModal';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Announcement, Batch } from '../../types';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { useLanguage } from '../../context/LanguageContext';

// Category config with translation keys for labels.
export const ANNOUNCEMENT_CATEGORIES = [
  { id: 'GENERAL', labelKey: 'admin_announcements_cat_general', icon: Megaphone, color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'CIRCULAR', labelKey: 'admin_announcements_cat_circular', icon: FileText, color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'EVENT_NOTICE', labelKey: 'admin_announcements_cat_event_notice', icon: Calendar, color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'CELEBRATION', labelKey: 'admin_announcements_cat_celebration', icon: PartyPopper, color: 'bg-rose-100 text-rose-900 border-rose-300' },
  { id: 'ACADEMIC', labelKey: 'admin_announcements_cat_academic', icon: BookOpen, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'ACHIEVEMENT', labelKey: 'admin_announcements_cat_achievement', icon: Award, color: 'bg-orange-100 text-orange-900 border-orange-300' },
];

export const AnnouncementsManager: React.FC = () => {
  const { t } = useLanguage();
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
  
  // PDF Attachment Form state
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState(0);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Premium Poster Image Lightbox state
  const [previewPoster, setPreviewPoster] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    isFullScreen?: boolean;
  }>({
    isOpen: false,
    url: '',
    title: '',
    isFullScreen: false,
  });

  // PDF Viewer Modal state
  const [pdfModal, setPdfModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    fileName?: string;
  }>({
    isOpen: false,
    url: '',
    title: '',
    fileName: '',
  });

  // Active language tab in compose modal ('en' or 'ta')
  const [activeLangTab, setActiveLangTab] = useState<'en' | 'ta'>('en');

  useEffect(() => {
    loadData();
  }, []);

  // Escape key handler & scroll lock for image lightbox
  useEffect(() => {
    if (!previewPoster.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewPoster.isFullScreen) {
          setPreviewPoster((prev) => ({ ...prev, isFullScreen: false }));
        } else {
          setPreviewPoster((prev) => ({ ...prev, isOpen: false }));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [previewPoster.isOpen, previewPoster.isFullScreen]);

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
      alertService.handleApiError(err, t('admin_announcements_alert_load_error'));
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
    setPdfUrl('');
    setPdfFileName('');
    setPdfFileSize(0);
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
    setPdfUrl(item.pdf_url || '');
    setPdfFileName(item.pdf_file_name || '');
    setPdfFileSize(item.pdf_file_size || 0);
    setActiveLangTab('en');
    setIsModalOpen(true);
  };

  const processPdfFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alertService.showError('Invalid File', 'Only PDF files are accepted.');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      alertService.showError('File Too Large', 'PDF size must be less than 30MB.');
      return;
    }

    try {
      setUploadingPdf(true);
      const res = await api.uploadAnnouncementPdf(file);
      setPdfUrl(res.pdf_url);
      setPdfFileName(res.file_name);
      setPdfFileSize(res.file_size);
      alertService.showSuccess('PDF Uploaded', 'PDF document attached successfully.');
    } catch (err) {
      alertService.handleApiError(err, 'Failed to upload PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handlePdfInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processPdfFile(file);
    if (e.target) e.target.value = '';
  };

  const handlePdfDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingPdf(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processPdfFile(file);
  };

  const handleRemovePdf = () => {
    setPdfUrl('');
    setPdfFileName('');
    setPdfFileSize(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !titleTa.trim()) {
      alertService.showError(
        t('admin_announcements_alert_missing_title_title'),
        t('admin_announcements_alert_missing_title_body')
      );
      return;
    }
    if (!content.trim() && !contentTa.trim()) {
      alertService.showError(
        t('admin_announcements_alert_missing_content_title'),
        t('admin_announcements_alert_missing_content_body')
      );
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
        pdf_url: pdfUrl || undefined,
        pdf_file_name: pdfFileName || undefined,
        pdf_file_size: pdfFileSize || undefined,
      };

      if (editingItem) {
        await api.updateAnnouncement(editingItem.id, payload);
        alertService.showSuccess(
          t('admin_announcements_alert_updated_title'),
          t('admin_announcements_alert_updated_body')
        );
      } else {
        await api.createAnnouncement(payload);
        alertService.showSuccess(
          t('admin_announcements_alert_published_title'),
          t('admin_announcements_alert_published_body')
        );
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alertService.handleApiError(
        err,
        editingItem
          ? t('admin_announcements_alert_update_error')
          : t('admin_announcements_alert_create_error')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, titleText: string) => {
    const confirmed = window.confirm(
      t('admin_announcements_alert_delete_confirm').replace('{title}', titleText)
    );
    if (!confirmed) return;

    try {
      await api.deleteAnnouncement(id);
      alertService.showSuccess(
        t('admin_announcements_alert_deleted_title'),
        t('admin_announcements_alert_deleted_body')
      );
      loadData();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_announcements_alert_delete_error'));
    }
  };

  const batchOptions = [
    { label: t('admin_announcements_form_batch_label'), value: '' },
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
              {t('admin_announcements_page_title')}
            </h2>
          </div>
          <p className="text-xs text-[#6B7280] mt-1 ml-10">
            {t('admin_announcements_page_subtitle')}
          </p>
        </div>

        <Button onClick={handleOpenCompose} className="w-full md:w-auto shadow-md">
          <Plus className="w-4 h-4 mr-1.5" />
          {t('admin_announcements_compose_btn')}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin_announcements_search_placeholder')}
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
            <option value="ALL">{t('admin_announcements_filter_all_categories')}</option>
            {ANNOUNCEMENT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {t(cat.labelKey)}
              </option>
            ))}
          </select>

          {/* Target Filter */}
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="w-full md:w-auto text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] focus:outline-none focus:border-[#F4C542]"
          >
            <option value="ALL">{t('admin_announcements_filter_all_audiences')}</option>
            <option value="SCHOOL">{t('admin_announcements_filter_school_wide')}</option>
            <option value="BATCH">{t('admin_announcements_filter_batch_targeted')}</option>
          </select>
        </div>
      </div>

      {/* Announcements List Grid */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title={t('admin_announcements_empty_title')}
          description={
            searchTerm || categoryFilter !== 'ALL'
              ? t('admin_announcements_empty_filtered')
              : t('admin_announcements_empty_default')
          }
          action={
            <Button variant="primary" onClick={handleOpenCompose}>
              {t('admin_announcements_empty_create_btn')}
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
                  <div className="relative aspect-video bg-gray-900 overflow-hidden cursor-pointer group/poster border-b border-gray-100">
                    <img 
                      src={item.poster_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Premium Hover Actions Overlay */}
                    <div 
                      onClick={() =>
                        setPreviewPoster({
                          isOpen: true,
                          url: item.poster_url!,
                          title: item.title,
                        })
                      }
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white backdrop-blur-[2px] cursor-pointer"
                    >
                      <span className="px-4 py-2 bg-black/80 hover:bg-black rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-white/20 shadow-xl transition-all active:scale-95">
                        <Eye className="w-4 h-4 text-[#F4C542]" />
                        <span>View Poster Image</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 bg-gradient-to-r from-amber-50 to-[#FFF7D6] flex items-center justify-between px-5 border-b border-amber-100">
                    <div className="flex items-center space-x-2 text-amber-800">
                      <CatIcon className="w-6 h-6 stroke-[1.8]" />
                      <span className="text-xs font-bold">{t(catMeta.labelKey)}</span>
                    </div>
                    {item.pdf_url ? (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        PDF Attached
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700/80">{t('admin_announcements_no_poster')}</span>
                    )}
                  </div>
                )}

                {/* Card Content Area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Badge Strip */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center space-x-1 ${catMeta.color}`}>
                        <CatIcon className="w-3 h-3 mr-1 inline" />
                        <span>{t(catMeta.labelKey)}</span>
                      </span>

                      <span className="text-[10px] font-semibold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/60 px-2 py-0.5 rounded-full">
                        {item.target === 'SCHOOL' ? t('admin_announcements_badge_school_wide') : t('admin_announcements_badge_batch')}
                      </span>

                      {item.pdf_url && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <FileText className="w-3 h-3 text-blue-600" />
                          PDF Document
                        </span>
                      )}
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
                        {t('admin_announcements_tamil_prefix')} {item.content_ta}
                      </p>
                    )}
                  </div>

                  {/* PDF Attachment Action Chip */}
                  {item.pdf_url && (
                    <div className="bg-[#FFFDF5] border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#854D0E] shrink-0" />
                        <span className="text-xs font-semibold text-[#111111] truncate">
                          {item.pdf_file_name || 'Official_Circular.pdf'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPdfModal({
                            isOpen: true,
                            url: item.pdf_url!,
                            title: item.title,
                            fileName: item.pdf_file_name,
                          })
                        }
                        className="px-3 py-1 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-extrabold text-[11px] rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View PDF
                      </button>
                    </div>
                  )}

                  {/* Metadata Footer */}
                  <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#9CA3AF]">
                    <div className="flex flex-col">
                      <span className="text-[#4B5563] font-medium">
                        {t('admin_announcements_by_prefix').replace('{name}', item.created_by_name)}
                      </span>
                      <span>{formatDateDDMMYYYY(item.created_at)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      {item.pdf_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setPdfModal({
                              isOpen: true,
                              url: item.pdf_url!,
                              title: item.title,
                              fileName: item.pdf_file_name,
                            })
                          }
                          title="View PDF Document"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {item.poster_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewPoster({
                              isOpen: true,
                              url: item.poster_url!,
                              title: item.title,
                            })
                          }
                          title={t('admin_announcements_view_full_poster')}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <ImageIcon className="w-4 h-4" />
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
        title={editingItem ? t('admin_announcements_modal_title_edit') : t('admin_announcements_modal_title_create')}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {/* 1. Category & Scope Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                {t('admin_announcements_form_category_label')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
              >
                {ANNOUNCEMENT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                {t('admin_announcements_form_audience_label')}
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as any)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
              >
                <option value="SCHOOL">{t('admin_announcements_form_audience_school')}</option>
                <option value="BATCH">{t('admin_announcements_form_audience_batch')}</option>
              </select>
            </div>
          </div>

          {target === 'BATCH' && (
            <Select
              label={t('admin_announcements_form_batch_label')}
              options={batchOptions}
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              required
            />
          )}

          {/* 2. Interactive Image Upload & Editor Component */}
          <div className="bg-[#FFFDF5] border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-[#111111] block mb-1">
              1. Image Flyer / Cover Poster (Optional Image)
            </span>
            <ImageUploadAndEdit
              label={t('admin_announcements_form_poster_label')}
              sublabel={t('admin_announcements_form_poster_sublabel')}
              value={posterUrl}
              onChange={setPosterUrl}
              aspectRatioPreset="16:9"
            />
          </div>

          {/* 3. Interactive PDF Upload Component */}
          <div className="bg-[#FFFDF5] border border-amber-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111]">
                2. Official PDF Document Attachment (Optional PDF)
              </span>
              {pdfUrl && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  PDF Attached
                </span>
              )}
            </div>

            {pdfUrl ? (
              <div className="bg-white border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#111111] truncate">
                      {pdfFileName || 'Official_Document.pdf'}
                    </p>
                    {pdfFileSize > 0 && (
                      <p className="text-[10px] text-gray-500">
                        {(pdfFileSize / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setPdfModal({
                        isOpen: true,
                        url: pdfUrl,
                        title: title || 'Announcement PDF',
                        fileName: pdfFileName,
                      })
                    }
                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <label className="cursor-pointer p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold" title="Replace PDF">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handlePdfInputChange}
                      disabled={uploadingPdf}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove PDF"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingPdf(true);
                }}
                onDragLeave={() => setIsDraggingPdf(false)}
                onDrop={handlePdfDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
                  isDraggingPdf
                    ? 'border-[#F4C542] bg-[#FFF7D6]'
                    : 'border-gray-300 hover:border-[#F4C542] hover:bg-[#FFFDF5]'
                }`}
              >
                <Upload className="w-5 h-5 text-[#854D0E] mb-1.5" />
                <span className="text-xs font-semibold text-[#111111]">
                  {uploadingPdf ? 'Uploading PDF...' : 'Drag & Drop PDF or click to browse'}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">
                  PDF format only, up to 30MB · Attach official circulars or event guides
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePdfInputChange}
                  disabled={uploadingPdf}
                />
              </label>
            )}
          </div>

          {/* 4. Bilingual Tabs for English & Tamil Details */}
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
                <span>{t('admin_announcements_form_tab_en')}</span>
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
                <span>{t('admin_announcements_form_tab_ta')}</span>
              </button>
            </div>

            {/* English Fields */}
            {activeLangTab === 'en' && (
              <div className="space-y-3 animate-fadeIn">
                <Input
                  label={t('admin_announcements_form_title_en')}
                  placeholder={t('admin_announcements_form_title_en_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required={!titleTa}
                />

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                    {t('admin_announcements_form_content_en')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={t('admin_announcements_form_content_en_placeholder')}
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
                  label={t('admin_announcements_form_title_ta')}
                  placeholder={t('admin_announcements_form_title_ta_placeholder')}
                  value={titleTa}
                  onChange={(e) => setTitleTa(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                    {t('admin_announcements_form_content_ta')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={t('admin_announcements_form_content_ta_placeholder')}
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
              {t('admin_announcements_form_cancel_btn')}
            </Button>
            <Button type="submit" isLoading={submitting}>
              <Send className="w-4 h-4 mr-1.5" />
              {editingItem ? t('admin_announcements_form_update_btn') : t('admin_announcements_form_publish_btn')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Premium Full-Screen Image Lightbox Modal */}
      {previewPoster.isOpen && (
        <div
          onClick={() => setPreviewPoster((prev) => ({ ...prev, isOpen: false }))}
          className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${
            previewPoster.isFullScreen
              ? 'p-0 bg-black'
              : 'p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md'
          } animate-fadeIn`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-[#111827] text-white flex flex-col overflow-hidden transition-all duration-300 ${
              previewPoster.isFullScreen
                ? 'w-screen h-screen rounded-none border-0'
                : 'w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-800 max-h-[92vh]'
            }`}
          >
            {/* Modal Header */}
            <div className="px-3 sm:px-5 py-3 bg-[#1F2937] border-b border-gray-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-md">
              <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                <div className="p-2 sm:p-2.5 bg-[#F4C542] rounded-xl text-[#111111] shrink-0 shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
                      {previewPoster.title || 'Announcement Image Poster'}
                    </h3>
                    <span className="hidden md:inline-flex items-center gap-1 bg-amber-500/20 text-[#F4C542] border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" /> High Res Poster
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    Click backdrop or press Esc to close
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                {/* Full Screen Toggle Button */}
                <button
                  type="button"
                  onClick={() =>
                    setPreviewPoster((prev) => ({ ...prev, isFullScreen: !prev.isFullScreen }))
                  }
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700/80 cursor-pointer active:scale-95"
                  title={previewPoster.isFullScreen ? 'Exit Full Screen' : 'Full Screen View'}
                >
                  {previewPoster.isFullScreen ? (
                    <>
                      <Minimize2 className="w-4 h-4 text-[#F4C542]" />
                      <span className="hidden lg:inline">Exit Full Screen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4 text-[#F4C542]" />
                      <span className="hidden lg:inline">Full Screen</span>
                    </>
                  )}
                </button>

                {/* Download Button */}
                <a
                  href={previewPoster.url}
                  download="Announcement_Poster.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700/80 active:scale-95"
                  title="Download Image"
                >
                  <Download className="w-4 h-4 text-[#F4C542]" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                {/* Open in New Tab Button */}
                <a
                  href={previewPoster.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700/80 active:scale-95"
                  title="Open Image in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Open Tab</span>
                </a>

                {/* Premium Close Button */}
                <button
                  type="button"
                  onClick={() => setPreviewPoster((prev) => ({ ...prev, isOpen: false }))}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer active:scale-95 border border-red-500/30 ml-1"
                  title="Close Modal (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Poster Image Canvas Frame */}
            <div className="flex-1 bg-[#0B0F17] relative overflow-auto flex items-center justify-center p-4 sm:p-6 min-h-[400px]">
              <div className="relative p-1 rounded-2xl bg-gradient-to-b from-[#F4C542]/30 via-gray-800/50 to-transparent shadow-2xl max-w-full max-h-full">
                <img
                  src={previewPoster.url}
                  alt={previewPoster.title}
                  className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Embedded PDF Viewer Modal with Full Screen Cover Mode */}
      <PdfViewerModal
        isOpen={pdfModal.isOpen}
        onClose={() => setPdfModal((prev) => ({ ...prev, isOpen: false }))}
        title={pdfModal.title}
        pdfUrl={pdfModal.url}
        fileName={pdfModal.fileName}
      />
    </div>
  );
};