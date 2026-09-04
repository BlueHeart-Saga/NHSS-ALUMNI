import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Batch } from '../../types';

export const CreateEditEvent: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId?: string }>();
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
      alertService.showError('Error Loading Event', 'Could not fetch event details.');
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
      alertService.showWarning('Required Fields Missing', 'Please fill in required fields (Event Title, Date, and Venue) before saving.');
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
        alertService.showSuccess('Event Updated', `"${title}" has been updated successfully.`);
      } else {
        payload.publish_immediately = publishImmediately;
        await api.createEvent(payload);
        await alertService.showSuccess(
          publishImmediately ? 'Event Published Successfully' : 'Event Saved as Draft',
          publishImmediately ? 'Alumni can now view and RSVP for this event.' : 'Your event draft has been saved.'
        );
      }
      navigate('/school-admin/events');
    } catch (err: any) {
      alertService.handleApiError(err, isEditMode ? 'Failed to update event.' : 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const batchOptions = [
    { label: 'School-wide Event (All Alumni)', value: '' },
    ...batches.map((b) => ({ label: `${b.name} (Year ${b.passing_year})`, value: b.id }))
  ];

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      <button
        onClick={() => navigate('/school-admin/events')}
        className="inline-flex items-center text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Events
      </button>

      <div>
        <h2 className="text-2xl font-bold text-[#111111]">
          {isEditMode ? 'Edit Get-Together Event' : 'Create Get-Together Event'}
        </h2>
        <p className="text-xs text-[#6B7280]">
          {isEditMode ? 'Modify event details, timing, and venue' : 'Organize a batch reunion or school-wide alumni gathering'}
        </p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
        {/* Bilingual Titles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Event Name / Title (English) *"
            placeholder="2010 Silver Jubilee Reunion"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="நிகழ்வின் பெயர் (தமிழ் / Tamil Name)"
            placeholder="2010 வெள்ளி விழா மறுசந்திப்பு"
            value={titleTa}
            onChange={(e) => setTitleTa(e.target.value)}
          />
        </div>

        <Select
          label="Target Audience / Batch Cohort"
          options={batchOptions}
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />

        {/* Bilingual Banner Photo Uploads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* English Banner Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#111111]">Event Cover Banner Image (English)</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FFF7D6] file:text-[#854D0E] hover:file:bg-[#F4C542] cursor-pointer"
              />
            </div>
            <Input
              placeholder="https://images.unsplash.com/... (English Image URL)"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
            {coverImageUrl && (
              <div className="relative h-36 rounded-2xl overflow-hidden border-2 border-[#F4C542] shadow-sm mt-2">
                <img src={coverImageUrl} alt="English Banner Preview" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-[#111111] text-[#F4C542] text-[10px] font-bold px-2 py-0.5 rounded-md">
                  English Banner Preview
                </span>
              </div>
            )}
          </div>

          {/* Tamil Banner Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#111111]">Event Cover Banner Image (தமிழ் / Tamil)</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUploadTa}
                className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FFF7D6] file:text-[#854D0E] hover:file:bg-[#F4C542] cursor-pointer"
              />
            </div>
            <Input
              placeholder="https://images.unsplash.com/... (Tamil Image URL)"
              value={coverImageUrlTa}
              onChange={(e) => setCoverImageUrlTa(e.target.value)}
            />
            {coverImageUrlTa && (
              <div className="relative h-36 rounded-2xl overflow-hidden border-2 border-[#F4C542] shadow-sm mt-2">
                <img src={coverImageUrlTa} alt="Tamil Banner Preview" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-[#111111] text-[#F4C542] text-[10px] font-bold px-2 py-0.5 rounded-md">
                  தமிழ் பேனர் முன்னோட்டம்
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Apply / Registration Link */}
        <Input
          label="Event Apply / External Registration Link (Optional)"
          placeholder="https://forms.google.com/... or Registration Portal URL"
          value={registrationUrl}
          onChange={(e) => setRegistrationUrl(e.target.value)}
        />

        {/* Bilingual Descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">Description & Agenda (English)</label>
            <textarea
              rows={4}
              placeholder="Details, dress code, schedule overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">விவரங்கள் & நிரல் (தமிழ் / Tamil Description)</label>
            <textarea
              rows={4}
              placeholder="நிகழ்ச்சி விவரங்கள், உடைக்கட்டுப்பாடு, கால அட்டவணை..."
              value={descriptionTa}
              onChange={(e) => setDescriptionTa(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Event Date *"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
          <Input
            label="Start Time"
            placeholder="10:00 AM"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="End Time"
            placeholder="05:00 PM"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <Input
          label="Venue Name *"
          placeholder="Grand Ballroom, Hotel Taj Connemara"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
        />

        <Input
          label="Full Venue Address"
          placeholder="Binny Road, Chennai, Tamil Nadu - 600002"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Maximum Capacity Limit"
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
              Allow Alumni to Bring Family / Guests
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 space-x-0 sm:space-x-3 pt-6 border-t border-[#E5E7EB]">
          {isEditMode ? (
            <Button type="button" onClick={() => handleSubmit(true)} isLoading={submitting} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-1.5" />
              Save Changes
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => handleSubmit(false)} isLoading={submitting} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-1.5" />
                Save as Draft
              </Button>
              <Button type="button" onClick={() => handleSubmit(true)} isLoading={submitting} className="w-full sm:w-auto">
                <Send className="w-4 h-4 mr-1.5" />
                Publish Event Immediately
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
