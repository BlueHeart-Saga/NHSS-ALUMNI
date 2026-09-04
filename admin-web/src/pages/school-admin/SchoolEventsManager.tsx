import React, { useEffect, useState } from 'react';
import { 
  Plus, Calendar, MapPin, Users, Trash2, Edit3, Sparkles, 
  Clock, Search, Building2, UserCheck, Image, RefreshCw, X, Eye, CheckCircle2 
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { SchoolEventItem } from '../../types';
import { getAssetUrl } from '../../utils/asset';

const CATEGORIES = [
  { key: 'ALL', label: 'All Celebrations' },
  { key: 'ANNUAL_DAY', label: 'Annual Day' },
  { key: 'SPORTS_DAY', label: 'Sports Day' },
  { key: 'CULTURAL_FEST', label: 'Cultural Fest' },
  { key: 'NATIONAL_DAY', label: 'National Days' },
  { key: 'EXHIBITION', label: 'Science / Tech Expo' },
  { key: 'CELEBRATION', label: 'Festivals & Celebrations' },
  { key: 'GRADUATION_DAY', label: 'Graduation / Convocation' },
  { key: 'OTHER', label: 'Other School Events' },
];

const TARGET_AUDIENCES = [
  { key: 'ALL_STUDENTS', label: 'All Students' },
  { key: 'PARENTS', label: 'Parents & Guardians' },
  { key: 'STAFF', label: 'Teachers & Staff' },
  { key: 'PUBLIC', label: 'Public & Visitors' },
  { key: 'ALUMNI_GUESTS', label: 'Alumni & Special Guests' },
];

const DEFAULT_COVER_IMAGES = [
  { label: 'School Main Campus', url: '/school-images/banner.png' },
  { label: 'Campus Heritage Door', url: '/school-images/school-door.png' },
  { label: 'National Celebrations', url: '/school-images/Republic-Day.png' },
  { label: 'Awards & Honors', url: '/school-images/sudentgetprize.png' },
  { label: 'Student Assembly', url: '/school-images/our-students.png' },
  { label: 'Cultural & Student Events', url: '/school-images/students-events.png' },
];

export const SchoolEventsManager: React.FC = () => {
  const [events, setEvents] = useState<SchoolEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEventItem | null>(null);
  const [viewingEvent, setViewingEvent] = useState<SchoolEventItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<SchoolEventItem>>({
    title: '',
    category: 'ANNUAL_DAY',
    event_date: new Date().toISOString().split('T')[0],
    end_date: '',
    start_time: '09:00 AM',
    end_time: '04:00 PM',
    venue: 'School Main Campus Auditorium',
    chief_guest: '',
    target_audience: 'ALL_STUDENTS',
    description: '',
    cover_image_url: DEFAULT_COVER_IMAGES[0].url,
    status: 'UPCOMING'
  });

  useEffect(() => {
    fetchSchoolEvents();
  }, []);

  const fetchSchoolEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getSchoolEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch school events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      category: 'ANNUAL_DAY',
      event_date: new Date().toISOString().split('T')[0],
      end_date: '',
      start_time: '09:00 AM',
      end_time: '04:00 PM',
      venue: 'School Main Campus Auditorium',
      chief_guest: '',
      target_audience: 'ALL_STUDENTS',
      description: '',
      cover_image_url: DEFAULT_COVER_IMAGES[0].url,
      status: 'UPCOMING'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: SchoolEventItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setFormData({ ...event });
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alertService.showWarning('Event Title Required', 'Please enter the title for the school event.');
      return;
    }
    if (!formData.event_date) {
      alertService.showWarning('Event Date Required', 'Please select a date for the event.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingEvent) {
        await api.updateSchoolEvent(editingEvent.id, formData);
        alertService.showSuccess('School Event Updated', `"${formData.title}" details have been saved.`);
      } else {
        await api.createSchoolEvent(formData);
        alertService.showSuccess('School Event Created', `"${formData.title}" has been published.`);
      }
      setIsModalOpen(false);
      fetchSchoolEvents();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to save school event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await alertService.showConfirm(
      'Delete School Event?',
      `Are you sure you want to delete "${title}"? This celebration record will be permanently removed.`
    );
    if (confirmed) {
      try {
        await api.deleteSchoolEvent(id);
        alertService.showSuccess('Event Removed', `"${title}" has been deleted.`);
        fetchSchoolEvents();
      } catch (err) {
        alertService.handleApiError(err, 'Failed to delete event.');
      }
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      await api.seedSchoolEvents();
      alertService.showSuccess('School Events Seeded', 'Default school celebrations have been restored.');
      fetchSchoolEvents();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to seed school events.');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering Logic
  const filteredEvents = events.filter(e => {
    const isPast = e.event_date && e.event_date < todayStr;
    const matchesTab = activeTab === 'UPCOMING' ? (!isPast || e.status === 'UPCOMING') : (isPast || e.status === 'COMPLETED');
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.chief_guest && e.chief_guest.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.venue && e.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesCategory && matchesSearch;
  });

  const upcomingCount = events.filter(e => !e.event_date || e.event_date >= todayStr).length;
  const pastCount = events.filter(e => e.event_date && e.event_date < todayStr).length;

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-[#111111]">
      
      {/* Top Banner Header & Primary Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 border border-[#E5E7EB] rounded-3xl shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[#FFF7D6] text-[#854D0E] border-2 border-[#F4C542] rounded-2xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-[#854D0E]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-[#111111]">School Events &amp; Celebrations</h2>
              <span className="px-2.5 py-0.5 bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                Official School Module
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Manage official school annual days, sports meets, cultural festivals, science exhibitions, and national celebrations.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 space-x-0 sm:space-x-3 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSeedData}
            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-gray-200 w-full sm:w-auto"
            title="Restore Default Sample Events"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Samples</span>
          </button>

          <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create School Event</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 bg-amber-50 text-[#854D0E] rounded-xl flex items-center justify-center border border-amber-200">
            <Sparkles className="w-5 h-5 text-[#854D0E]" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#111111]">{events.length}</div>
            <div className="text-xs text-gray-500 font-medium">Total Celebrations</div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center border border-emerald-200">
            <Calendar className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#111111]">{upcomingCount}</div>
            <div className="text-xs text-gray-500 font-medium">Upcoming School Events</div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center border border-blue-200">
            <Clock className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#111111]">{pastCount}</div>
            <div className="text-xs text-gray-500 font-medium">Past Celebrations</div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center border border-purple-200">
            <Building2 className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#111111]">
              {new Set(events.map(e => e.category)).size}
            </div>
            <div className="text-xs text-gray-500 font-medium">Event Categories</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
          
          {/* Main Date Tabs (Upcoming vs Past Celebrations) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'UPCOMING'
                  ? 'bg-[#111111] text-[#F4C542] shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Upcoming Events ({upcomingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('PAST')}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'PAST'
                  ? 'bg-[#111111] text-[#F4C542] shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Past Celebrations ({pastCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search school events, guest..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#FFF7D6] text-[#854D0E] border-[#F4C542]'
                    : 'bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Cards Grid Display */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title={activeTab === 'UPCOMING' ? 'No Upcoming School Events' : 'No Past Celebrations'}
          description={
            searchQuery || selectedCategory !== 'ALL'
              ? 'No school events match your current filter parameters.'
              : activeTab === 'UPCOMING'
              ? 'No upcoming school celebrations scheduled yet.'
              : 'No historical school celebrations recorded.'
          }
          action={
            <Button onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create First School Event</span>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const isPast = ev.event_date && ev.event_date < todayStr;
            const coverImg = getAssetUrl(ev.cover_image_url) || DEFAULT_COVER_IMAGES[0].url;

            const categoryLabel = CATEGORIES.find(c => c.key === ev.category)?.label || ev.category;
            const audienceLabel = TARGET_AUDIENCES.find(a => a.key === ev.target_audience)?.label || ev.target_audience;

            return (
              <div
                key={ev.id}
                onClick={() => setViewingEvent(ev)}
                className="bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-xs hover:border-[#F4C542] hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                {/* Banner Image Container */}
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                  <img
                    src={coverImg}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Category & Status Badges Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="text-[11px] font-extrabold bg-[#111111] text-[#F4C542] border border-[#F4C542]/60 px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                      {categoryLabel}
                    </span>
                    <Badge status={isPast ? 'COMPLETED' : ev.status} />
                  </div>

                  {/* Event Title Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <h3 className="font-bold text-white text-base leading-snug drop-shadow-md line-clamp-1">
                      {ev.title}
                    </h3>
                  </div>
                </div>

                {/* Event Information Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="space-y-2 text-xs text-[#111111] bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#854D0E] shrink-0" />
                      <span className="font-semibold">{ev.event_date} ({ev.start_time} - {ev.end_time})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[#854D0E] shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>

                    {ev.chief_guest && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <UserCheck className="w-4 h-4 text-[#854D0E] shrink-0" />
                        <span className="truncate">Chief Guest: <strong className="text-[#111111]">{ev.chief_guest}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Footer Bar with Audience Badge & Action Icons */}
                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg text-[10px] uppercase tracking-wider">
                      {audienceLabel}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(ev, e)}
                        className="p-1.5 text-gray-600 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(ev.id, ev.title, e)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Event"
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

      {/* CREATE / EDIT SCHOOL EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#854D0E]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#111111]">
                    {editingEvent ? 'Edit School Celebration' : 'Create New School Event'}
                  </h3>
                  <p className="text-xs text-gray-500">Official School Celebrations &amp; Event Management</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-[#111111] rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual Sports Meet 2026 or Science Expo"
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">Category</label>
                  <select
                    value={formData.category || 'ANNUAL_DAY'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    {CATEGORIES.filter(c => c.key !== 'ALL').map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">Target Audience</label>
                  <select
                    value={formData.target_audience || 'ALL_STUDENTS'}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    {TARGET_AUDIENCES.map(a => (
                      <option key={a.key} value={a.key}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Event Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.event_date || ''}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formData.start_time || ''}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">End Time</label>
                  <input
                    type="text"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    placeholder="04:00 PM"
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">Venue / Location</label>
                  <input
                    type="text"
                    value={formData.venue || ''}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. NHSS Main Play Grounds"
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">Chief Guest (Optional)</label>
                  <input
                    type="text"
                    value={formData.chief_guest || ''}
                    onChange={(e) => setFormData({ ...formData, chief_guest: e.target.value })}
                    placeholder="e.g. Honorable Minister or Alumnus"
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">Banner Cover Image URL</label>
                <input
                  type="url"
                  value={formData.cover_image_url || ''}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                />
                
                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {DEFAULT_COVER_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, cover_image_url: preset.url })}
                      className="px-2 py-1 text-[10px] bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700"
                    >
                      Preset: {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">Description &amp; Agenda</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter details, schedule, highlights of the school celebration..."
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={submitting}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>{editingEvent ? 'Save Changes' : 'Publish School Event'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW EVENT DETAILS MODAL */}
      {viewingEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl">
            <div className="h-52 bg-gray-100 relative">
              <img
                src={getAssetUrl(viewingEvent.cover_image_url) || DEFAULT_COVER_IMAGES[0].url}
                alt={viewingEvent.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setViewingEvent(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-extrabold bg-[#F4C542] text-[#111111] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {CATEGORIES.find(c => c.key === viewingEvent.category)?.label || viewingEvent.category}
                </span>
                <h3 className="text-xl font-bold mt-1.5 leading-snug">{viewingEvent.title}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-700 leading-relaxed font-normal">{viewingEvent.description}</p>

              <div className="space-y-2 text-xs text-[#111111] bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#854D0E] shrink-0" />
                  <span className="font-semibold">{viewingEvent.event_date} ({viewingEvent.start_time} - {viewingEvent.end_time})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#854D0E] shrink-0" />
                  <span>{viewingEvent.venue}</span>
                </div>
                {viewingEvent.chief_guest && (
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-[#854D0E] shrink-0" />
                    <span>Chief Guest: <strong className="text-[#111111]">{viewingEvent.chief_guest}</strong></span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={() => setViewingEvent(null)}>Close View</Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
