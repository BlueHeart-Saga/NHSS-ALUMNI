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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getBatches().then(setBatches).catch(console.error);
  }, []);

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
