import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Save, Send } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Batch } from '../../types';

export const CreateEditEvent: React.FC = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);

  const [title, setTitle] = useState('');
  const [batchId, setBatchId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-20');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(300);
  const [guestAllowed, setGuestAllowed] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getBatches().then(setBatches).catch(console.error);
  }, []);

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

  const handleSubmit = async (publishImmediately: boolean) => {
    if (!title || !eventDate || !venue) {
      alertService.showWarning('Required Fields Missing', 'Please fill in required fields (Event Title, Date, and Venue) before saving.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createEvent({
        title,
        batch_id: batchId || null,
        description,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        venue,
        address,
        max_capacity: maxCapacity,
        guest_allowed: guestAllowed,
        cover_image_url: coverImageUrl || null,
        registration_url: registrationUrl || null,
        publish_immediately: publishImmediately
      });
      await alertService.showSuccess(
        publishImmediately ? 'Event Published Successfully' : 'Event Saved as Draft',
        publishImmediately ? 'Alumni can now view and RSVP for this event.' : 'Your event draft has been saved.'
      );
      navigate('/school-admin/events');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const batchOptions = [
    { label: 'School-wide Event (All Alumni)', value: '' },
    ...batches.map((b) => ({ label: `${b.name} (Year ${b.passing_year})`, value: b.id }))
  ];

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
        <h2 className="text-2xl font-bold text-[#111111]">Create Get-Together Event</h2>
        <p className="text-xs text-[#6B7280]">Organize a batch reunion or school-wide alumni gathering</p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs space-y-6">
        <Input
          label="Event Name *"
          placeholder="2010 Silver Jubilee Reunion"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Select
          label="Target Audience / Batch Cohort"
          options={batchOptions}
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />

        {/* Banner Photo Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#111111]">Event Cover Banner Image</label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FFF7D6] file:text-[#854D0E] hover:file:bg-[#F4C542] cursor-pointer"
            />
            <span className="text-xs text-gray-400">or paste URL:</span>
          </div>
          <Input
            placeholder="https://images.unsplash.com/... (Image URL)"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
          />
          {coverImageUrl && (
            <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-[#F4C542] shadow-sm mt-2">
              <img src={coverImageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 bg-[#111111] text-[#F4C542] text-[10px] font-bold px-2 py-0.5 rounded-md">
                Banner Preview
              </span>
            </div>
          )}
        </div>

        {/* Apply / Registration Link */}
        <Input
          label="Event Apply / External Registration Link (Optional)"
          placeholder="https://forms.google.com/... or Registration Portal URL"
          value={registrationUrl}
          onChange={(e) => setRegistrationUrl(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">Description & Agenda</label>
          <textarea
            rows={4}
            placeholder="Details, dress code, schedule overview..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] focus:bg-white"
          />
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

        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-[#E5E7EB]">
          <Button type="button" variant="secondary" onClick={() => handleSubmit(false)} isLoading={submitting}>
            <Save className="w-4 h-4 mr-1.5" />
            Save as Draft
          </Button>
          <Button type="button" onClick={() => handleSubmit(true)} isLoading={submitting}>
            <Send className="w-4 h-4 mr-1.5" />
            Publish Event Immediately
          </Button>
        </div>
      </div>
    </div>
  );
};
