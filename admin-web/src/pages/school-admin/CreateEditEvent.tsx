import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';
import { Batch } from '../../types';

export const CreateEditEvent: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId?: string }>();
  const { t } = useLanguage();
  const isEditMode = Boolean(eventId);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(isEditMode);

  const [title, setTitle] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [batchId, setBatchId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [descriptionTa, setDescriptionTa] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-20');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(300);
  const [guestAllowed, setGuestAllowed] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageUrlTa, setCoverImageUrlTa] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [eventId]);

  const loadInitialData = async () => {
    try {
      if (isEditMode) setLoading(true);
      const bData = await api.getBatches();
      setBatches(bData);

      if (eventId) {
        const ev = await api.getEventDetails(eventId);
        setTitle(ev.title || '');
        setTitleTa(ev.title_ta || '');
        setBatchId(ev.batch_id || '');
        setDescription(ev.description || '');
        setDescriptionTa(ev.description_ta || '');
        setEventDate(ev.event_date || '2026-12-20');
        setStartTime(ev.start_time || '10:00 AM');
        setEndTime(ev.end_time || '05:00 PM');
        setVenue(ev.venue || '');
        setAddress(ev.address || '');
        setMaxCapacity(ev.max_capacity ?? 300);
        setGuestAllowed(ev.guest_allowed ?? true);
        setCoverImageUrl(ev.cover_image_url || '');
        setCoverImageUrlTa(ev.cover_image_url_ta || '');
        setRegistrationUrl(ev.registration_url || '');
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      alertService.showError(t('admin_event_alert_error_load_title'), t('admin_event_alert_error_load_body'));
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUploadTa = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageUrlTa(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (publishImmediately: boolean) => {
    if (!title || !eventDate || !venue) {
      alertService.showWarning(t('admin_event_alert_required_title'), t('admin_event_alert_required_body'));
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title,
        title_ta: titleTa || null,
        batch_id: batchId || null,
        description,
        description_ta: descriptionTa || null,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        venue,
        address,
        max_capacity: maxCapacity,
        guest_allowed: guestAllowed,
        cover_image_url: coverImageUrl || null,
        cover_image_url_ta: coverImageUrlTa || null,
        registration_url: registrationUrl || null,
      };

      if (isEditMode && eventId) {
        await api.updateEvent(eventId, payload);
        alertService.showSuccess(
          t('admin_event_alert_updated_title'),
          t('admin_event_alert_updated_body').replace('{title}', title)
        );
      } else {
        payload.publish_immediately = publishImmediately;
        await api.createEvent(payload);
        await alertService.showSuccess(
          publishImmediately ? t('admin_event_alert_published_title') : t('admin_event_alert_draft_title'),
          publishImmediately ? t('admin_event_alert_published_body') : t('admin_event_alert_draft_body')
        );
      }
      navigate('/school-admin/events');
    } catch (err: any) {
      alertService.handleApiError(err, isEditMode ? t('admin_event_alert_error_update') : t('admin_event_alert_error_create'));
    } finally {
      setSubmitting(false);
    }
  };

  const batchOptions = [
    { label: t('admin_event_option_school_wide'), value: '' },
    ...batches.map((b) => ({
      label: t('admin_event_option_batch_format')
        .replace('{name}', b.name)
        .replace('{year}', String(b.passing_year)),
      value: b.id,
    }))
  ];

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      <button
        onClick={() => navigate('/school-admin/events')}
        className="inline-flex items-center text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('admin_event_back_to_events')}
      </button>

      <div>
        <h2 className="text-2xl font-bold text-[#111111]">
          {isEditMode ? t('admin_event_page_title_edit') : t('admin_event_page_title_create')}
        </h2>
        <p className="text-xs text-[#6B7280]">
          {isEditMode ? t('admin_event_page_subtitle_edit') : t('admin_event_page_subtitle_create')}
        </p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
        {/* Bilingual Titles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('admin_event_label_title_en')}
            placeholder={t('admin_event_placeholder_title_en')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label={t('admin_event_label_title_ta')}
            placeholder={t('admin_event_placeholder_title_ta')}
            value={titleTa}
            onChange={(e) => setTitleTa(e.target.value)}
          />
        </div>

        <Select
          label={t('admin_event_label_audience')}
          options={batchOptions}
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />

        {/* Bilingual Banner Photo Uploads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* English Banner Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#111111]">{t('admin_event_label_banner_en')}</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FFF7D6] file:text-[#854D0E] hover:file:bg-[#F4C542] cursor-pointer"
              />
            </div>
            <Input
              placeholder={t('admin_event_placeholder_banner_en')}
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
            {coverImageUrl && (
              <div className="relative h-36 rounded-2xl overflow-hidden border-2 border-[#F4C542] shadow-sm mt-2">
                <img src={coverImageUrl} alt={t('admin_event_banner_preview_en')} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-[#111111] text-[#F4C542] text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {t('admin_event_banner_preview_en')}
                </span>
              </div>
            )}
          </div>

          {/* Tamil Banner Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#111111]">{t('admin_event_label_banner_ta')}</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUploadTa}
                className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FFF7D6] file:text-[#854D0E] hover:file:bg-[#F4C542] cursor-pointer"
              />
            </div>
            <Input
              placeholder={t('admin_event_placeholder_banner_ta')}
              value={coverImageUrlTa}
              onChange={(e) => setCoverImageUrlTa(e.target.value)}
            />
            {coverImageUrlTa && (
              <div className="relative h-36 rounded-2xl overflow-hidden border-2 border-[#F4C542] shadow-sm mt-2">
                <img src={coverImageUrlTa} alt={t('admin_event_banner_preview_ta')} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-[#111111] text-[#F4C542] text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {t('admin_event_banner_preview_ta')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Apply / Registration Link */}
        <Input
          label={t('admin_event_label_registration')}
          placeholder={t('admin_event_placeholder_registration')}
          value={registrationUrl}
          onChange={(e) => setRegistrationUrl(e.target.value)}
        />

        {/* Bilingual Descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">{t('admin_event_label_description_en')}</label>
            <textarea
              rows={4}
              placeholder={t('admin_event_placeholder_description_en')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">{t('admin_event_label_description_ta')}</label>
            <textarea
              rows={4}
              placeholder={t('admin_event_placeholder_description_ta')}
              value={descriptionTa}
              onChange={(e) => setDescriptionTa(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={t('admin_event_label_date')}
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
          <Input
            label={t('admin_event_label_start_time')}
            placeholder={t('admin_event_placeholder_start_time')}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label={t('admin_event_label_end_time')}
            placeholder={t('admin_event_placeholder_end_time')}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <Input
          label={t('admin_event_label_venue')}
          placeholder={t('admin_event_placeholder_venue')}
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
        />

        <Input
          label={t('admin_event_label_address')}
          placeholder={t('admin_event_placeholder_address')}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('admin_event_label_capacity')}
            type="number"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(Number(e.target.value))}
          />

          <div className="flex items-center space-x-3 pt-6">
            <input
              type="checkbox"
              id="guest_allowed"
              checked={guestAllowed}
              onChange={(e) => setGuestAllowed(e.target.checked)}
              className="w-4 h-4 text-[#F4C542] rounded focus:ring-0 cursor-pointer"
            />
            <label htmlFor="guest_allowed" className="text-sm font-semibold text-[#111111] cursor-pointer">
              {t('admin_event_label_guest_allowed')}
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 space-x-0 sm:space-x-3 pt-6 border-t border-[#E5E7EB]">
          {isEditMode ? (
            <Button type="button" onClick={() => handleSubmit(true)} isLoading={submitting} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-1.5" />
              {t('admin_event_btn_save_changes')}
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => handleSubmit(false)} isLoading={submitting} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-1.5" />
                {t('admin_event_btn_save_draft')}
              </Button>
              <Button type="button" onClick={() => handleSubmit(true)} isLoading={submitting} className="w-full sm:w-auto">
                <Send className="w-4 h-4 mr-1.5" />
                {t('admin_event_btn_publish')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};