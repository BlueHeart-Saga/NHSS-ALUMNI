import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Button } from '../../components/Button';
import { Programme } from '../../types';
import { ArrowLeft, Save, Sparkles, Globe, Lock, ShieldCheck, Users, Calendar, MapPin, Link as LinkIcon, CheckSquare, Upload, Image as ImageIcon, X } from 'lucide-react';

export const CreateEditProgramme: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionTa, setDescriptionTa] = useState('');
  const [category, setCategory] = useState('Career Guidance & Tech');
  const [imageUrl, setImageUrl] = useState('');
  const [mode, setMode] = useState<'ONLINE' | 'IN_PERSON' | 'HYBRID'>('HYBRID');
  const [venue, setVenue] = useState('');
  const [onlineLink, setOnlineLink] = useState('');
  const [scheduleText, setScheduleText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [capacityLimit, setCapacityLimit] = useState<string>('');
  const [allowFamily, setAllowFamily] = useState(true);
  const [allowedFamilyTypes, setAllowedFamilyTypes] = useState<string[]>(['SPOUSE', 'SON', 'DAUGHTER', 'PARENT', 'SIBLING']);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'UNLISTED' | 'INVITATION_ONLY'>('PUBLIC');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'COMPLETED' | 'ARCHIVED'>('PUBLISHED');

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadProgrammeImage(file);
      setImageUrl(res.image_url);
      alertService.showSuccess('Image Uploaded', 'Programme poster image uploaded successfully.');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      loadProgramme(id);
    }
  }, [id, isEditing]);

  const loadProgramme = async (progId: string) => {
    setFetching(true);
    try {
      const data = await api.getAdminProgrammeDetail(progId);
      setTitle(data.title || '');
      setTitleTa(data.title_ta || '');
      setDescription(data.description || '');
      setDescriptionTa(data.description_ta || '');
      setCategory(data.category || 'Career Guidance & Tech');
      setImageUrl(data.image_url || '');
      setMode(data.mode || 'HYBRID');
      setVenue(data.venue || '');
      setOnlineLink(data.online_link || '');
      setScheduleText(data.schedule_text || '');
      setStartDate(data.start_date || '');
      setEndDate(data.end_date || '');
      setRegistrationDeadline(data.registration_deadline || '');
      setCapacityLimit(data.capacity_limit ? String(data.capacity_limit) : '');
      setAllowFamily(data.allow_family ?? true);
      setAllowedFamilyTypes(data.allowed_family_types || ['SPOUSE', 'SON', 'DAUGHTER', 'PARENT', 'SIBLING']);
      setVisibility(data.visibility || 'PUBLIC');
      setIsFeatured(data.is_featured || false);
      setStatus(data.status || 'PUBLISHED');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to load programme data.');
      navigate('/school-admin/programmes');
    } finally {
      setFetching(false);
    }
  };

  const handleFamilyTypeToggle = (type: string) => {
    setAllowedFamilyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alertService.showError('Required Fields Missing', 'Please provide a programme title and description.');
      return;
    }

    setLoading(true);
    try {
      const payload: Partial<Programme> = {
        title: title.trim(),
        title_ta: titleTa.trim() || undefined,
        description: description.trim(),
        description_ta: descriptionTa.trim() || undefined,
        category,
        image_url: imageUrl.trim() || undefined,
        mode,
        venue: venue.trim() || undefined,
        online_link: onlineLink.trim() || undefined,
        schedule_text: scheduleText.trim() || undefined,
        start_date: startDate.trim() || undefined,
        end_date: endDate.trim() || undefined,
        registration_deadline: registrationDeadline.trim() || undefined,
        capacity_limit: capacityLimit.trim() ? parseInt(capacityLimit, 10) : undefined,
        allow_family: allowFamily,
        allowed_family_types: allowedFamilyTypes,
        visibility,
        is_featured: isFeatured,
        status,
      };

      if (isEditing && id) {
        await api.updateAdminProgramme(id, payload);
        alertService.showSuccess('Programme Updated', 'Programme details updated successfully.');
      } else {
        await api.createAdminProgramme(payload);
        alertService.showSuccess('Programme Created', 'New programme published successfully.');
      }

      navigate('/school-admin/programmes');
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to save programme.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB] text-xs text-gray-400">
        Loading programme details...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/school-admin/programmes')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#111111]">
              {isEditing ? 'Edit Programme' : 'Create New Programme'}
            </h1>
            <p className="text-xs text-gray-500">
              NHSS Alumni Special Programme Configurator (தமிழில்: சிறப்புத் திட்டம்)
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sparkles className="w-4 h-4 text-amber-600" />
            1. Basic Information (Bilingual)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Programme Title (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Microsoft, Google & Zoho Orientation Programme"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#854D0E] mb-1">
                Programme Title (தமிழில் - Tamil)
              </label>
              <input
                type="text"
                placeholder="எ.கா. உலகளாவிய கல்வி மற்றும் தொழில்நுட்ப வாய்ப்புகள்"
                value={titleTa}
                onChange={(e) => setTitleTa(e.target.value)}
                className="w-full bg-[#FFFDF6] border border-[#F4C542]/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category <span className="text-gray-400 font-normal">(Select or type custom category)</span>
              </label>
              <input
                type="text"
                placeholder="Type or select custom category..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542] mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {['Career Guidance & Tech', 'Mentorship & Education', 'Alumni Reunion', 'Family & Culture', 'Entrepreneurship'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Header Poster / Image</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer bg-[#FAFAFA] hover:bg-gray-100 border border-dashed border-gray-300 hover:border-amber-400 rounded-xl p-2.5 text-center transition-colors flex items-center justify-center gap-2 text-xs font-bold text-gray-700">
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>{uploadingImage ? 'Uploading Image...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">OR URL</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
                  />
                </div>

                {imageUrl && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={imageUrl} alt="Poster Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Description (English) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Provide comprehensive details about the initiative, speakers, topics, and benefits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-3 text-xs focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#854D0E] mb-1">
                Full Description (தமிழில் - Tamil)
              </label>
              <textarea
                rows={4}
                placeholder="நமது முன்னாள் மாணவர்கள் மற்றும் அவர்களது பிள்ளைகளுக்கான கல்வி வாய்ப்புகள்..."
                value={descriptionTa}
                onChange={(e) => setDescriptionTa(e.target.value)}
                className="w-full bg-[#FFFDF6] border border-[#F4C542]/60 rounded-xl p-3 text-xs focus:outline-none focus:border-[#F4C542]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Mode, Schedule & Location */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <Calendar className="w-4 h-4 text-amber-600" />
            2. Mode, Schedule & Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Programme Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
              >
                <option value="HYBRID">Hybrid (In-person + Online Link)</option>
                <option value="ONLINE">Online Only (Google Meet / Zoom)</option>
                <option value="IN_PERSON">In-Person Only (School Auditorium / Venue)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Schedule Display Text</label>
              <input
                type="text"
                placeholder="e.g. Saturday 10:00 AM - 1:00 PM IST"
                value={scheduleText}
                onChange={(e) => setScheduleText(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Max Capacity Limit</label>
              <input
                type="number"
                placeholder="Unlimited if empty"
                value={capacityLimit}
                onChange={(e) => setCapacityLimit(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Venue Address (If In-Person / Hybrid)</label>
              <input
                type="text"
                placeholder="e.g. NHSS Main Auditorium, Campus, Chennai"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Online Joining Link (If Online / Hybrid)</label>
              <input
                type="url"
                placeholder="https://meet.google.com/xyz-abc-def"
                value={onlineLink}
                onChange={(e) => setOnlineLink(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Family Eligibility & Registration Rules */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <Users className="w-4 h-4 text-blue-600" />
            3. Family Members Participation Config
          </h3>

          <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <input
              type="checkbox"
              id="allowFamily"
              checked={allowFamily}
              onChange={(e) => setAllowFamily(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <label htmlFor="allowFamily" className="text-xs font-bold text-blue-900 cursor-pointer">
              Allow Alumni Members to Register Sons, Daughters & Relatives under their Account
            </label>
          </div>

          {allowFamily && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-gray-700">Permitted Family Relationship Types:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'SON', label: 'Son (மகன்)' },
                  { id: 'DAUGHTER', label: 'Daughter (மகள்)' },
                  { id: 'SPOUSE', label: 'Spouse (மனைவி/கணவர்)' },
                  { id: 'PARENT', label: 'Parent (பெற்றோர்)' },
                  { id: 'SIBLING', label: 'Sibling (சகோதரி/சகோதரன்)' },
                  { id: 'OTHER', label: 'Other Relative' }
                ].map((rel) => {
                  const active = allowedFamilyTypes.includes(rel.id);
                  return (
                    <button
                      type="button"
                      key={rel.id}
                      onClick={() => handleFamilyTypeToggle(rel.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-900'
                      }`}
                    >
                      {rel.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Visibility & Status Controls */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <Globe className="w-4 h-4 text-emerald-600" />
            4. Public Visibility & Status Controls
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Public Visibility Access</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
              >
                <option value="PUBLIC">Public (Visible on public website & homepage)</option>
                <option value="UNLISTED">Unlisted (Visible to logged-in alumni only)</option>
                <option value="INVITATION_ONLY">Invitation Only (Only accessible via unique invite URL)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Programme Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F4C542]"
              >
                <option value="PUBLISHED">Published</option>
                <option value="REGISTRATION_OPEN">Registration Open</option>
                <option value="REGISTRATION_CLOSED">Registration Closed</option>
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <label htmlFor="isFeatured" className="text-xs font-bold text-gray-800 cursor-pointer">
              Highlight on Public Homepage Featured Programmes Section
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/school-admin/programmes')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className="bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-xs flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Update Programme' : 'Publish Programme'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
