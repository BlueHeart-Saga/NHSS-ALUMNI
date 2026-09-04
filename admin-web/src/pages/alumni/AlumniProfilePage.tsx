import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, BookOpen, Briefcase, Award, Share2, Eye, X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { AlumniProfile } from '../../types';
import { api } from '../../services/api';

export const AlumniProfilePage: React.FC = () => {
  const { user, school, setUser } = useOutletContext<AlumniContextType>();

  const [profileSubTab, setProfileSubTab] = useState<'personal' | 'education' | 'employment' | 'skills' | 'social' | 'visibility'>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const [profileForm, setProfileForm] = useState<Partial<AlumniProfile>>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    current_city: user?.current_city || '',
    state: user?.state || 'Tamil Nadu',
    country: user?.country || 'India',
    bio: user?.bio || '',
    passing_year: user?.passing_year || 2010,
    admission_number: user?.admission_number || '',
    roll_number: user?.roll_number || user?.admission_number || '',
    section: user?.section || '',
    house: user?.house || '',
    stream: user?.stream || '',
    profession: user?.profession || '',
    company: user?.company || '',
    industry: user?.industry || '',
    experience_years: user?.experience_years || 0,
    skills: user?.skills || [],
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || '',
    twitter_url: user?.twitter_url || '',
    website_url: user?.website_url || '',
    profile_photo_url: user?.profile_photo_url || '',
    phone_visible: user?.phone_visible || false,
    directory_visible: user?.directory_visible ?? true,
    email_visible: user?.email_visible || false
  });
  const [newSkillInput, setNewSkillInput] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        ...user,
        state: user.state || prev.state || 'Tamil Nadu',
        country: user.country || prev.country || 'India',
        roll_number: user.roll_number || user.admission_number || prev.roll_number || ''
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updated = await api.updateAlumniProfile(profileForm);
      setUser({ ...user, ...updated });
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your alumni profile details have been saved to the database successfully.',
        confirmButtonColor: '#111111',
        timer: 2000
      });
    } catch (err: any) {
      console.error('Failed to update alumni profile:', err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err?.message || 'Could not save profile changes. Please try again.',
        confirmButtonColor: '#111111'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const res = await api.uploadSchoolImage(file);
      if (res && res.url) {
        setProfileForm(prev => ({ ...prev, profile_photo_url: res.url }));
        Swal.fire({
          icon: 'success',
          title: 'Photo Uploaded!',
          text: 'Profile photo preview updated. Click "Save Changes" to finalize.',
          confirmButtonColor: '#111111',
          timer: 1800
        });
      }
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err?.message || 'Failed to upload photo.',
        confirmButtonColor: '#111111'
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const currentSkills = profileForm.skills || [];
    if (!currentSkills.includes(newSkillInput.trim())) {
      setProfileForm({ ...profileForm, skills: [...currentSkills, newSkillInput.trim()] });
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = profileForm.skills || [];
    setProfileForm({ ...profileForm, skills: currentSkills.filter(s => s !== skillToRemove) });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-[#111111]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#111111]">My Alumni Profile</h2>
          <p className="text-xs text-[#6B7280]">Manage your personal, education, employment details and privacy settings</p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#111111] hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#E5E7EB] pb-2 text-xs font-bold scrollbar-none">
        {[
          { id: 'personal', label: 'Personal Information', icon: User },
          { id: 'education', label: 'Education / School', icon: BookOpen },
          { id: 'employment', label: 'Current Employment', icon: Briefcase },
          { id: 'skills', label: 'Skills & Interests', icon: Award },
          { id: 'social', label: 'Social Links', icon: Share2 },
          { id: 'visibility', label: 'Profile Visibility', icon: Eye }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setProfileSubTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              profileSubTab === tab.id
                ? 'bg-[#111111] text-white shadow-sm'
                : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111111]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: PERSONAL INFORMATION */}
      {profileSubTab === 'personal' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
            <div className="w-20 h-20 rounded-full bg-[#FFF7D6] border-2 border-[#F4C542] overflow-hidden flex items-center justify-center shrink-0 relative">
              {profileForm.profile_photo_url ? (
                <img src={profileForm.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[#854D0E]" />
              )}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#111111]">{profileForm.full_name || 'Alumni Member'}</h4>
              <p className="text-xs text-[#6B7280]">Class of {profileForm.passing_year || 2010}</p>
              <label className="inline-block mt-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-[#111111] rounded-lg text-xs font-semibold cursor-pointer">
                {isUploadingPhoto ? 'Uploading...' : 'Upload New Photo'}
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.full_name || ''}
                onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Email Address</label>
              <input
                type="email"
                value={profileForm.email || ''}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Mobile Number</label>
              <input
                type="text"
                value={profileForm.mobile || ''}
                onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Current City</label>
              <input
                type="text"
                value={profileForm.current_city || ''}
                onChange={e => setProfileForm({ ...profileForm, current_city: e.target.value })}
                placeholder="e.g. Chennai, Bengaluru"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">State</label>
              <input
                type="text"
                value={profileForm.state || ''}
                onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Country</label>
              <input
                type="text"
                value={profileForm.country || ''}
                onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#374151] mb-1 text-xs">Bio Summary</label>
            <textarea
              rows={3}
              value={profileForm.bio || ''}
              onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
              placeholder="Brief bio for your batchmates..."
              className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-[#F4C542]"
            ></textarea>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EDUCATION / SCHOOL DETAILS */}
      {profileSubTab === 'education' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">School Name</label>
              <input
                type="text"
                disabled
                value={school?.name || 'School Alumni Network'}
                className="w-full p-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Passing Year (Batch)</label>
              <input
                type="text"
                disabled
                value={profileForm.passing_year || ''}
                className="w-full p-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Roll / Admission Number</label>
              <input
                type="text"
                value={profileForm.roll_number || ''}
                onChange={e => setProfileForm({ ...profileForm, roll_number: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Section</label>
              <input
                type="text"
                value={profileForm.section || ''}
                onChange={e => setProfileForm({ ...profileForm, section: e.target.value })}
                placeholder="e.g. A Section"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">House / Branch</label>
              <input
                type="text"
                value={profileForm.house || ''}
                onChange={e => setProfileForm({ ...profileForm, house: e.target.value })}
                placeholder="e.g. Red House, Jubilee House"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">High School Stream</label>
              <input
                type="text"
                value={profileForm.stream || ''}
                onChange={e => setProfileForm({ ...profileForm, stream: e.target.value })}
                placeholder="e.g. Science, Commerce, Bio-Maths"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CURRENT EMPLOYMENT */}
      {profileSubTab === 'employment' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">Current Profession / Title</label>
              <input
                type="text"
                value={profileForm.profession || ''}
                onChange={e => setProfileForm({ ...profileForm, profession: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Company / Organization</label>
              <input
                type="text"
                value={profileForm.company || ''}
                onChange={e => setProfileForm({ ...profileForm, company: e.target.value })}
                placeholder="e.g. Google, Microsoft, Self-Employed"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Industry Domain</label>
              <input
                type="text"
                value={profileForm.industry || ''}
                onChange={e => setProfileForm({ ...profileForm, industry: e.target.value })}
                placeholder="e.g. Information Technology, Healthcare, Finance"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Total Work Experience (Years)</label>
              <input
                type="number"
                value={profileForm.experience_years || 0}
                onChange={e => setProfileForm({ ...profileForm, experience_years: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SKILLS & INTERESTS */}
      {profileSubTab === 'skills' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6 text-xs">
          <div>
            <label className="block font-semibold text-[#374151] mb-2">Technical & Professional Skills</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
              <input
                type="text"
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Type a skill and press Add or Enter..."
                className="flex-1 p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-gray-800 shrink-0 text-center"
              >
                Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profileForm.skills || []).map((skill, idx) => (
                <span key={idx} className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full font-semibold">
                  <span>{skill}</span>
                  <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SOCIAL / PROFESSIONAL LINKS */}
      {profileSubTab === 'social' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#374151] mb-1">LinkedIn Profile URL</label>
            <input
              type="url"
              value={profileForm.linkedin_url || ''}
              onChange={e => setProfileForm({ ...profileForm, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#374151] mb-1">Personal Website / Portfolio</label>
            <input
              type="url"
              value={profileForm.website_url || ''}
              onChange={e => setProfileForm({ ...profileForm, website_url: e.target.value })}
              placeholder="https://mywebsite.com"
              className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 6: PROFILE VISIBILITY */}
      {profileSubTab === 'visibility' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB]">
            <div>
              <h4 className="font-bold text-[#111111]">Make Email Address Visible to Alumni</h4>
              <p className="text-gray-500">Allow verified batchmates to view your contact email</p>
            </div>
            <input
              type="checkbox"
              checked={profileForm.email_visible || false}
              onChange={e => setProfileForm({ ...profileForm, email_visible: e.target.checked })}
              className="w-5 h-5 accent-[#111111]"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB]">
            <div>
              <h4 className="font-bold text-[#111111]">Make Phone Number Visible</h4>
              <p className="text-gray-500">Allow batchmates to view your mobile number</p>
            </div>
            <input
              type="checkbox"
              checked={profileForm.phone_visible || false}
              onChange={e => setProfileForm({ ...profileForm, phone_visible: e.target.checked })}
              className="w-5 h-5 accent-[#111111]"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB]">
            <div>
              <h4 className="font-bold text-[#111111]">Appear in Public Alumni Directory</h4>
              <p className="text-gray-500">Include profile card in searchable alumni directory</p>
            </div>
            <input
              type="checkbox"
              checked={profileForm.directory_visible ?? true}
              onChange={e => setProfileForm({ ...profileForm, directory_visible: e.target.checked })}
              className="w-5 h-5 accent-[#111111]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
