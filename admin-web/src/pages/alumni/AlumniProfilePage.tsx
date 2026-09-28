import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  User, BookOpen, Briefcase, Award, Share2, Eye, X, Loader2, Save, 
  CheckCircle2, Camera, ShieldCheck, HeartHandshake, Phone, Mail, MapPin, 
  GraduationCap, Building2, Sparkles, AlertCircle, Lock, Pencil, Trash2,
  ArrowRight, ShieldAlert, FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { AlumniProfile } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const AlumniProfilePage: React.FC = () => {
  const { language } = useLanguage();
  const { user, school, setUser } = useOutletContext<AlumniContextType>();

  const [profileSubTab, setProfileSubTab] = useState<'personal' | 'education' | 'employment' | 'social' | 'visibility'>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [profileForm, setProfileForm] = useState<Partial<AlumniProfile>>({
    full_name: user?.full_name || '',
    name_ta: user?.name_ta || user?.full_name_ta || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    gender: user?.gender || '',
    dob: user?.dob || user?.date_of_birth || '',
    date_of_birth: user?.date_of_birth || user?.dob || '',
    blood_group: user?.blood_group || '',
    father_name: user?.father_name || '',
    mother_name: user?.mother_name || '',
    current_city: user?.current_city || '',
    state: user?.state || 'Tamil Nadu',
    country: user?.country || 'India',
    address: user?.address || '',

    passing_year: user?.passing_year || 2010,
    leaving_class: user?.leaving_class || '10th',
    roll_no: user?.roll_no || '',
    section: user?.section || '',
    stream: user?.stream || '',
    no_higher_education: user?.no_higher_education || 'NO',
    college_name: user?.college_name || user?.institution_name || '',
    degree: user?.degree || '',
    custom_degree: user?.custom_degree || '',
    department: user?.department || '',
    college_register_no: user?.college_register_no || '',
    college_joining_year: user?.college_joining_year,
    college_passing_year: user?.college_passing_year,

    employment_status: user?.employment_status || 'Employed',
    profession: user?.profession || user?.designation || '',
    company: user?.company || user?.company_name || '',
    industry: user?.industry || '',
    experience_years: user?.experience_years || 0,

    linkedin_url: user?.linkedin_url || '',
    instagram_url: user?.instagram_url || '',
    whatsapp_number: user?.whatsapp_number || '',
    profile_photo_url: user?.profile_photo_url || '',

    is_volunteer: user?.is_volunteer || 'NO',
    willing_to_donate: user?.willing_to_donate || 'NO',
    phone_visible: user?.phone_visible || false,
    directory_visible: user?.directory_visible ?? true,
    email_visible: user?.email_visible || false
  });

  // Sync profileForm from DB/user when user loads or updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        ...user,
        full_name: user.full_name || '',
        name_ta: user.name_ta || user.full_name_ta || '',
        email: user.email || '',
        mobile: user.mobile || '',
        gender: user.gender || '',
        dob: user.dob || user.date_of_birth || '',
        date_of_birth: user.date_of_birth || user.dob || '',
        blood_group: user.blood_group || '',
        father_name: user.father_name || '',
        mother_name: user.mother_name || '',
        current_city: user.current_city || '',
        state: user.state || 'Tamil Nadu',
        country: user.country || 'India',
        address: user.address || '',
        passing_year: user.passing_year || 2010,
        leaving_class: user.leaving_class || '10th',
        roll_no: user.roll_no || '',
        section: user.section || '',
        stream: user.stream || '',
        no_higher_education: user.no_higher_education || 'NO',
        college_name: user.college_name || user.institution_name || '',
        degree: user.degree || '',
        department: user.department || '',
        college_joining_year: user.college_joining_year,
        college_passing_year: user.college_passing_year,
        employment_status: user.employment_status || 'Employed',
        profession: user.profession || user.designation || '',
        company: user.company || user.company_name || '',
        industry: user.industry || '',
        experience_years: user.experience_years || 0,
        linkedin_url: user.linkedin_url || '',
        instagram_url: user.instagram_url || '',
        whatsapp_number: user.whatsapp_number || '',
        profile_photo_url: user.profile_photo_url || '',
        is_volunteer: user.is_volunteer || 'NO',
        willing_to_donate: user.willing_to_donate || 'NO',
        phone_visible: user.phone_visible || false,
        directory_visible: user.directory_visible ?? true,
        email_visible: user.email_visible || false
      });
      setIsDirty(false);
    }
  }, [user]);

  const updateFormField = (updates: Partial<AlumniProfile>) => {
    setProfileForm(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  // Calculate profile completion percentage dynamically
  const calculateCompletion = () => {
    const fields = [
      profileForm.full_name,
      profileForm.email,
      profileForm.mobile,
      profileForm.gender,
      profileForm.dob || profileForm.date_of_birth,
      profileForm.current_city,
      profileForm.blood_group,
      profileForm.passing_year,
      profileForm.profession,
      profileForm.company,
      profileForm.profile_photo_url
    ];
    const filled = fields.filter(f => f && String(f).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleSaveProfile = async (showSuccessAlert = true) => {
    if (!user) return false;
    setIsSaving(true);
    try {
      const payload: Partial<AlumniProfile> = {
        ...profileForm,
        full_name_ta: profileForm.name_ta,
        date_of_birth: profileForm.dob || profileForm.date_of_birth,
        institution_name: profileForm.college_name,
        company_name: profileForm.company,
        designation: profileForm.profession
      };

      const updated = await api.updateAlumniProfile(payload);
      setUser({ ...user, ...updated });
      setIsDirty(false);

      if (showSuccessAlert) {
        Swal.fire({
          icon: 'success',
          title: language === 'ta' ? 'சுயவிவரம் சேமிக்கப்பட்டது!' : 'Profile Saved Successfully!',
          text: language === 'ta'
            ? 'உங்கள் மாற்றங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன. ரகசிய அமைப்புகளும் தளத்தில் உடனடியாக செயல்படும்.'
            : 'Your alumni profile details and privacy settings have been saved and applied in real-time.',
          confirmButtonColor: '#111111',
          timer: 2000
        });
      }
      return true;
    } catch (err: any) {
      console.error('Failed to update alumni profile:', err);
      Swal.fire({
        icon: 'error',
        title: language === 'ta' ? 'புதுப்பித்தல் தோல்வியடைந்தது' : 'Update Failed',
        text: err?.message || (language === 'ta' ? 'விவரங்களைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Could not save profile changes. Please try again.'),
        confirmButtonColor: '#111111'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Switch Sub-Tab with Unsaved Changes Protection Prompt
  const handleTabSwitch = (targetTab: typeof profileSubTab) => {
    if (targetTab === profileSubTab) return;

    if (isDirty) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'சேமிக்கப்படாத மாற்றங்கள் உள்ளன!' : 'Unsaved Profile Changes!',
        text: language === 'ta'
          ? 'உங்கள் சுயவிவரத்தில் சில மாற்றங்களைச் செய்யப்பட்டுள்ளீர்கள். வேறு பகுதிக்குச் செல்வதற்கு முன் அவற்றைச் சேமிக்க விரும்புகிறீர்களா?'
          : 'You have modified details in your profile. Would you like to save your changes before switching tabs?',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: language === 'ta' ? 'மாற்றங்களைச் சேமிக்க' : 'Save Changes',
        denyButtonText: language === 'ta' ? 'மாற்றங்களை நிராகரிக்க' : 'Discard Changes',
        cancelButtonText: language === 'ta' ? 'இங்கேயே நிற்க' : 'Cancel',
        confirmButtonColor: '#111111',
        denyButtonColor: '#DC2626'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const success = await handleSaveProfile(false);
          if (success) {
            setProfileSubTab(targetTab);
          }
        } else if (result.isDenied) {
          // Reset form to current user data
          if (user) {
            setProfileForm({
              ...user,
              full_name: user.full_name || '',
              name_ta: user.name_ta || user.full_name_ta || '',
              email: user.email || '',
              mobile: user.mobile || '',
              gender: user.gender || '',
              dob: user.dob || user.date_of_birth || '',
              date_of_birth: user.date_of_birth || user.dob || '',
              blood_group: user.blood_group || '',
              father_name: user.father_name || '',
              mother_name: user.mother_name || '',
              current_city: user.current_city || '',
              state: user.state || 'Tamil Nadu',
              country: user.country || 'India',
              address: user.address || '',
              passing_year: user.passing_year || 2010,
              leaving_class: user.leaving_class || '10th',
              roll_no: user.roll_no || '',
              section: user.section || '',
              stream: user.stream || '',
              no_higher_education: user.no_higher_education || 'NO',
              college_name: user.college_name || user.institution_name || '',
              degree: user.degree || '',
              department: user.department || '',
              college_joining_year: user.college_joining_year,
              college_passing_year: user.college_passing_year,
              employment_status: user.employment_status || 'Employed',
              profession: user.profession || user.designation || '',
              company: user.company || user.company_name || '',
              industry: user.industry || '',
              experience_years: user.experience_years || 0,
              linkedin_url: user.linkedin_url || '',
              instagram_url: user.instagram_url || '',
              whatsapp_number: user.whatsapp_number || '',
              profile_photo_url: user.profile_photo_url || '',
              is_volunteer: user.is_volunteer || 'NO',
              willing_to_donate: user.willing_to_donate || 'NO',
              phone_visible: user.phone_visible || false,
              directory_visible: user.directory_visible ?? true,
              email_visible: user.email_visible || false
            });
            setIsDirty(false);
          }
          setProfileSubTab(targetTab);
        }
      });
    } else {
      setProfileSubTab(targetTab);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'பெரிய கோப்பு' : 'File Too Large',
        text: language === 'ta' ? 'புகைப்படம் 5MB-க்கு குறைவாக இருக்க வேண்டும்.' : 'Please select an image smaller than 5MB.',
        confirmButtonColor: '#111111'
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const res = await api.uploadSchoolImage(file);
      if (res && res.url) {
        updateFormField({ profile_photo_url: res.url });
        Swal.fire({
          icon: 'success',
          title: language === 'ta' ? 'புகைப்படம் தேர்ந்தெடுக்கப்பட்டது!' : 'Photo Updated!',
          text: language === 'ta' ? 'சுயவிவரப் படம் புதுப்பிக்கப்பட்டது. மாற்றங்களைச் சேமிக்கவும்.' : 'Profile photo preview updated. Click "Save Profile Changes" to finalize.',
          confirmButtonColor: '#111111',
          timer: 1800
        });
      }
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      Swal.fire({
        icon: 'error',
        title: language === 'ta' ? 'பதிவேற்றம் தோல்வி' : 'Upload Failed',
        text: err?.message || 'Failed to upload photo.',
        confirmButtonColor: '#111111'
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    Swal.fire({
      title: language === 'ta' ? 'புகைப்படத்தை அகற்றவா?' : 'Remove Profile Photo?',
      text: language === 'ta' ? 'உங்கள் தற்போதைய சுயவிவரப் படம் நீக்கப்படும்.' : 'Your profile photo will be removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: language === 'ta' ? 'ஆம், அகற்று' : 'Yes, Remove',
      cancelButtonText: language === 'ta' ? 'ரத்துசெய்' : 'Cancel',
      confirmButtonColor: '#DC2626'
    }).then((res) => {
      if (res.isConfirmed) {
        updateFormField({ profile_photo_url: '' });
      }
    });
  };

  const completionPct = calculateCompletion();

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-[#111111] pb-12">
      {/* Top Banner & Header */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#111111]">
              {language === 'ta' ? 'என் சுயவிவர மேலாண்மை' : 'My Alumni Profile Management'}
            </h2>
            <span className="bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#854D0E]" />
              <span>{completionPct}% {language === 'ta' ? 'பூர்த்தியானது' : 'Complete'}</span>
            </span>
            {isDirty && (
              <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                {language === 'ta' ? 'சேமிக்கப்படாதவை' : 'Unsaved Changes'}
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280]">
            {language === 'ta'
              ? 'உங்கள் தனிப்பட்ட, கல்வி, பணி விவரங்கள் மற்றும் ரகசிய அமைப்புகளை நிர்வகிக்கவும்'
              : 'Manage your personal, educational, professional credentials and contact visibility settings'}
          </p>
        </div>

        <button
          onClick={() => handleSaveProfile(true)}
          disabled={isSaving}
          className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer ${
            isDirty
              ? 'bg-[#111111] hover:bg-black text-white ring-2 ring-[#F4C542]'
              : 'bg-[#111111] hover:bg-gray-800 text-white'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>{language === 'ta' ? 'சேமிக்கிறது...' : 'Saving Changes...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-amber-400" />
              <span>{language === 'ta' ? 'மாற்றங்களைச் சேமி' : 'Save Profile Changes'}</span>
            </>
          )}
        </button>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#E5E7EB] pb-2 text-xs font-bold scrollbar-none">
        {[
          { id: 'personal', label: language === 'ta' ? 'தனிப்பட்ட விவரங்கள்' : 'Personal Information', icon: User },
          { id: 'education', label: language === 'ta' ? 'கல்வி விவரங்கள்' : 'Education & School', icon: BookOpen },
          { id: 'employment', label: language === 'ta' ? 'பணி விவரங்கள்' : 'Current Employment', icon: Briefcase },
          { id: 'social', label: language === 'ta' ? 'சமூக இணைப்புகள்' : 'Social Links & Contact', icon: Share2 },
          { id: 'visibility', label: language === 'ta' ? 'ரகசிய அமைப்புகள்' : 'Privacy & Visibility', icon: Eye }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabSwitch(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              profileSubTab === tab.id
                ? 'bg-[#111111] text-white shadow-xs'
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
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6">
          
          {/* Avatar Profile Photo Circle with Pencil Icon & Remove Option */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 bg-[#FAFAFA] p-4 sm:p-5 rounded-2xl border border-[#E5E7EB]">
            
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#FFF7D6] border-4 border-[#F4C542] overflow-hidden flex items-center justify-center shadow-md relative">
                {profileForm.profile_photo_url ? (
                  <img src={profileForm.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-[#854D0E]" />
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white backdrop-blur-2xs">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  </div>
                )}
              </div>

              {/* Bottom Right Floating Pencil Edit Button */}
              <label 
                title={language === 'ta' ? 'புகைப்படம் மாற்று' : 'Change Profile Photo'}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#111111] hover:bg-black text-[#F4C542] border-2 border-white flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-110"
              >
                <Pencil className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
              </label>

              {/* Top Right Floating Trash Remove Button (if photo exists) */}
              {profileForm.profile_photo_url && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title={language === 'ta' ? 'புகைப்படம் அகற்று' : 'Remove Profile Photo'}
                  className="absolute top-0 right-0 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white border-2 border-white flex items-center justify-center cursor-pointer shadow-sm transition-transform hover:scale-110"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="font-extrabold text-base text-[#111111]">{profileForm.full_name || 'Alumni Member'}</h4>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Batch of {profileForm.passing_year || 2010}
                </span>
              </div>
              
              <p className="text-xs text-[#6B7280]">
                {school?.name || 'Alumni Member Network'} • {profileForm.current_city ? `${profileForm.current_city}, ` : ''}{profileForm.state || 'Tamil Nadu'}
              </p>

              <div className="pt-1 text-[11px] text-gray-500">
                {language === 'ta'
                  ? 'சுயவிவர புகைப்படத்தை மாற்ற வட்டத்தின் வலது கீழ் பென்சில் குறியீட்டைக் கிளிக் செய்யவும்.'
                  : 'Click the pencil icon on the photo circle to change your profile picture.'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'முழு பெயர் (ஆங்கிலத்தில்)' : 'Full Name (in English)'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profileForm.full_name || ''}
                onChange={e => updateFormField({ full_name: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'பெயர் (தமிழில்)' : 'Name in Tamil'}
              </label>
              <input
                type="text"
                value={profileForm.name_ta || ''}
                onChange={e => updateFormField({ name_ta: e.target.value })}
                placeholder="எ.கா: கார்த்திகேயன் .ரா"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={profileForm.email || ''}
                onChange={e => updateFormField({ email: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                required
              />
            </div>

            {/* Read-Only Disabled Mobile Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-[#374151] flex items-center space-x-1">
                  <span>{language === 'ta' ? 'கைபேசி எண்' : 'Mobile Number'}</span>
                  <Lock className="w-3 h-3 text-gray-400" />
                </label>
                <span className="text-[10px] text-amber-800 font-bold">{language === 'ta' ? 'பூட்டப்பட்டது' : 'Read-Only'}</span>
              </div>
              <input
                type="text"
                disabled
                value={profileForm.mobile || ''}
                className="w-full p-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl text-gray-600 font-medium cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                {language === 'ta' ? 'பாதுகாப்பு காரணமாக கைபேசி எண் நேரடி மாற்றம் செய்ய முடியாது.' : 'Primary mobile is locked for safety.'}{' '}
                <Link to="/alumni/settings" className="text-[#854D0E] font-bold underline">
                  {language === 'ta' ? 'மாற்ற கோரிக்கை அனுப்ப' : 'Request Change'}
                </Link>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'பாலினம்' : 'Gender'}
              </label>
              <select
                value={profileForm.gender || ''}
                onChange={e => updateFormField({ gender: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542] cursor-pointer"
              >
                <option value="">{language === 'ta' ? 'பாலினம் தேர்ந்தெடுக்கவும்' : 'Select Gender'}</option>
                <option value="Male">{language === 'ta' ? 'ஆண் (Male)' : 'Male'}</option>
                <option value="Female">{language === 'ta' ? 'பெண் (Female)' : 'Female'}</option>
                <option value="Other">{language === 'ta' ? 'மற்றவை (Other)' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'பிறந்த தேதி' : 'Date of Birth (DOB)'}
              </label>
              <input
                type="date"
                value={profileForm.dob || profileForm.date_of_birth || ''}
                onChange={e => updateFormField({ dob: e.target.value, date_of_birth: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'இரத்த வகை' : 'Blood Group'}
              </label>
              <select
                value={profileForm.blood_group || ''}
                onChange={e => updateFormField({ blood_group: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542] cursor-pointer font-bold text-rose-700"
              >
                <option value="">{language === 'ta' ? 'இரத்த வகை தேர்ந்தெடுக்கவும்' : 'Select Blood Group'}</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg} Blood Group</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'தந்தை பெயர்' : "Father's Name"}
              </label>
              <input
                type="text"
                value={profileForm.father_name || ''}
                onChange={e => updateFormField({ father_name: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'தாய் பெயர்' : "Mother's Name"}
              </label>
              <input
                type="text"
                value={profileForm.mother_name || ''}
                onChange={e => updateFormField({ mother_name: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'தற்போதைய நகரம்' : 'Current City'}
              </label>
              <input
                type="text"
                value={profileForm.current_city || ''}
                onChange={e => updateFormField({ current_city: e.target.value })}
                placeholder="e.g. Chennai, Madurai, Singapore"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'மாநிலம்' : 'State'}
              </label>
              <input
                type="text"
                value={profileForm.state || ''}
                onChange={e => updateFormField({ state: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {language === 'ta' ? 'நாடு' : 'Country'}
              </label>
              <input
                type="text"
                value={profileForm.country || ''}
                onChange={e => updateFormField({ country: e.target.value })}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-[#374151] mb-1">
              {language === 'ta' ? 'முழு முகவரி' : 'Permanent / Residential Address'}
            </label>
            <textarea
              rows={2}
              value={profileForm.address || ''}
              onChange={e => updateFormField({ address: e.target.value })}
              placeholder="e.g. No. 12, Main Street, District Name..."
              className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
            />
          </div>

          {/* Community & Volunteer Willingness Box */}
          <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <HeartHandshake className="w-4 h-4 text-[#854D0E]" />
              <h4 className="font-extrabold text-xs text-[#854D0E] uppercase tracking-wider">
                {language === 'ta' ? 'பள்ளி மற்றும் சமூக பங்கேற்பு விருப்பம்' : 'School & Community Engagement Preferences'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-white border border-amber-200 rounded-xl shadow-2xs">
                <div>
                  <div className="font-bold text-[#111111]">{language === 'ta' ? 'தன்னார்வலராக விரும்புகிறீர்களா?' : 'Willing to Volunteer?'}</div>
                  <div className="text-[11px] text-gray-500">{language === 'ta' ? 'நிகழ்வுகளை ஒருங்கிணைக்க & வழிகாட்ட' : 'Help organize events & mentor students'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateFormField({ is_volunteer: profileForm.is_volunteer === 'YES' ? 'NO' : 'YES' })}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    profileForm.is_volunteer === 'YES'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {profileForm.is_volunteer === 'YES' ? (language === 'ta' ? 'ஆம் (YES)' : 'VOLUNTEER (YES)') : (language === 'ta' ? 'இல்லை' : 'NO')}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white border border-amber-200 rounded-xl shadow-2xs">
                <div>
                  <div className="font-bold text-[#111111]">{language === 'ta' ? 'பள்ளிக்கு நன்கொடை அளிக்க?' : 'Willing to Donate?'}</div>
                  <div className="text-[11px] text-gray-500">{language === 'ta' ? 'பள்ளி வளர்ச்சி & நிதியுதவிக்கு' : 'Support school & alumni fund initiatives'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateFormField({ willing_to_donate: profileForm.willing_to_donate === 'YES' ? 'NO' : 'YES' })}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    profileForm.willing_to_donate === 'YES'
                      ? 'bg-[#854D0E] text-white shadow-2xs'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {profileForm.willing_to_donate === 'YES' ? (language === 'ta' ? 'ஆம் (YES)' : 'WILLING (YES)') : (language === 'ta' ? 'இல்லை' : 'NO')}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: EDUCATION / SCHOOL & HIGHER ED */}
      {profileSubTab === 'education' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6 text-xs">
          
          {/* School Details Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[#111111] border-b border-[#E5E7EB] pb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>{language === 'ta' ? 'பள்ளி படிப்பு விவரங்கள் (School Education)' : 'School Education Details'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  {language === 'ta' ? 'பள்ளி பெயர்' : 'School Name'}
                </label>
                <input
                  type="text"
                  disabled
                  value={school?.name || 'Natarajan Higher Secondary School'}
                  className="w-full p-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl text-gray-600 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1 flex items-center justify-between">
                  <span>{language === 'ta' ? 'தேர்ச்சி பெற்ற வகுப்பு (Batch)' : 'Passing Year (Batch)'}</span>
                  <Lock className="w-3 h-3 text-gray-400" />
                </label>
                <input
                  type="text"
                  disabled
                  value={`Batch of ${profileForm.passing_year || 2010}`}
                  className="w-full p-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl text-gray-600 font-bold cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  {language === 'ta' ? 'வகுப்பு ஆண்டை மாற்ற' : 'To update batch year'}{' '}
                  <Link to="/alumni/settings" className="text-[#854D0E] font-bold underline">
                    {language === 'ta' ? 'கோரிக்கை அனுப்பவும்' : 'Request Change'}
                  </Link>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  {language === 'ta' ? 'முடிவுற்ற வகுப்பு' : 'Leaving Class'}
                </label>
                <input
                  type="text"
                  value={profileForm.leaving_class || '10th'}
                  onChange={e => updateFormField({ leaving_class: e.target.value })}
                  placeholder="e.g. 10th / 12th"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  {language === 'ta' ? 'வகுப்புப் பிரிவு' : 'Section'}
                </label>
                <input
                  type="text"
                  value={profileForm.section || ''}
                  onChange={e => updateFormField({ section: e.target.value })}
                  placeholder="e.g. A / B / C"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  {language === 'ta' ? 'பதிவு எண்' : 'Roll Number'}
                </label>
                <input
                  type="text"
                  value={profileForm.roll_no || ''}
                  onChange={e => updateFormField({ roll_no: e.target.value })}
                  placeholder="e.g. 1012"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  {language === 'ta' ? 'மேல்நிலை பாடப்பிரிவு' : 'High School Stream'}
                </label>
                <input
                  type="text"
                  value={profileForm.stream || ''}
                  onChange={e => updateFormField({ stream: e.target.value })}
                  placeholder="e.g. Bio-Maths, Computer Science, Commerce"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>
            </div>
          </div>

          {/* Higher Education Section */}
          <div className="space-y-4 pt-2 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#111111] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ta' ? 'கல்லூரி & உயர்கல்வி (College & Higher Education)' : 'College & Higher Education Details'}</span>
              </h4>

              <label className="flex items-center space-x-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={profileForm.no_higher_education === 'YES'}
                  onChange={e => updateFormField({ no_higher_education: e.target.checked ? 'YES' : 'NO' })}
                  className="w-4 h-4 accent-[#111111]"
                />
                <span className="font-semibold text-gray-700">
                  {language === 'ta' ? 'உயர்கல்வி இல்லை' : 'No Higher Education'}
                </span>
              </label>
            </div>

            {profileForm.no_higher_education !== 'YES' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#374151] mb-1">
                    {language === 'ta' ? 'கல்லூரி / பல்கலைக்கழக பெயர்' : 'College / University Name'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.college_name || ''}
                    onChange={e => updateFormField({ college_name: e.target.value })}
                    placeholder="e.g. Anna University, Loyola College, IIT Madras"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    {language === 'ta' ? 'பட்டம் / படிப்பு' : 'Degree / Qualification'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.degree || ''}
                    onChange={e => updateFormField({ degree: e.target.value })}
                    placeholder="e.g. B.E, B.Tech, B.Sc, M.B.A, Ph.D"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    {language === 'ta' ? 'துறை / பாடப்பிரிவு' : 'Major / Department'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.department || ''}
                    onChange={e => updateFormField({ department: e.target.value })}
                    placeholder="e.g. Computer Science, Mechanical, Commerce"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    {language === 'ta' ? 'கல்லூரி சேர்ந்த ஆண்டு' : 'College Joining Year'}
                  </label>
                  <input
                    type="number"
                    value={profileForm.college_joining_year || ''}
                    onChange={e => updateFormField({ college_joining_year: parseInt(e.target.value) || undefined })}
                    placeholder="e.g. 2010"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    {language === 'ta' ? 'கல்லூரி தேர்ச்சி ஆண்டு' : 'College Passing Year'}
                  </label>
                  <input
                    type="number"
                    value={profileForm.college_passing_year || ''}
                    onChange={e => updateFormField({ college_passing_year: parseInt(e.target.value) || undefined })}
                    placeholder="e.g. 2014"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-center">
                {language === 'ta' ? 'உயர்கல்வி விவரங்கள் எதுவும் இல்லை எனக் குறிப்பிடப்பட்டுள்ளது.' : 'Marked as no higher education.'}
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUB-TAB 3: CURRENT EMPLOYMENT */}
      {profileSubTab === 'employment' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6 text-xs">
          
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[#111111] border-b border-[#E5E7EB] pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>{language === 'ta' ? 'தொழில் & பணி விவரங்கள்' : 'Professional Career & Employment Details'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  {language === 'ta' ? 'பணி நிலை' : 'Employment Status'}
                </label>
                <select
                  value={profileForm.employment_status || 'Employed'}
                  onChange={e => updateFormField({ employment_status: e.target.value })}
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542] cursor-pointer"
                >
                  <option value="Employed">{language === 'ta' ? 'வேலையில் உள்ளார் (Employed)' : 'Employed'}</option>
                  <option value="Self-Employed / Business">{language === 'ta' ? 'சொந்த தொழில் / வணிகம் (Business)' : 'Self-Employed / Business'}</option>
                  <option value="Student">{language === 'ta' ? 'மாணவர் (Student)' : 'Student'}</option>
                  <option value="Looking for Opportunities">{language === 'ta' ? 'வேலை தேடுபவர் (Looking for Job)' : 'Looking for Opportunities'}</option>
                  <option value="Retired">{language === 'ta' ? 'ஓய்வு பெற்றவர் (Retired)' : 'Retired'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  {language === 'ta' ? 'தற்போதைய பதவி / தொழில்' : 'Current Profession / Job Title'}
                </label>
                <input
                  type="text"
                  value={profileForm.profession || ''}
                  onChange={e => updateFormField({ profession: e.target.value })}
                  placeholder="e.g. Senior Software Engineer / Manager / Doctor"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  {language === 'ta' ? 'நிறுவனம் / அமைப்பு பெயர்' : 'Company / Organization Name'}
                </label>
                <input
                  type="text"
                  value={profileForm.company || ''}
                  onChange={e => updateFormField({ company: e.target.value })}
                  placeholder="e.g. Google, TCS, Apollo Hospitals, Self-Employed"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  {language === 'ta' ? 'தொழில் துறை' : 'Industry Domain'}
                </label>
                <input
                  type="text"
                  value={profileForm.industry || ''}
                  onChange={e => updateFormField({ industry: e.target.value })}
                  placeholder="e.g. Information Technology, Healthcare, Education"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  {language === 'ta' ? 'மொத்த பணி அனுபவம் (ஆண்டுகள்)' : 'Total Work Experience (Years)'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={profileForm.experience_years || 0}
                  onChange={e => updateFormField({ experience_years: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: SOCIAL & CONTACT LINKS */}
      {profileSubTab === 'social' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4 text-xs">
          <h4 className="font-bold text-sm text-[#111111] border-b border-[#E5E7EB] pb-2 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>{language === 'ta' ? 'சமூக வலைதள இணைப்புகள்' : 'Social & Professional Web Presence'}</span>
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-[#374151] mb-1 flex items-center space-x-1.5">
                <span className="font-bold text-blue-700">LinkedIn:</span>
                <span>{language === 'ta' ? 'லிங்க்ட்இன் சுயவிவர இணைப்பு' : 'LinkedIn Profile URL'}</span>
              </label>
              <input
                type="url"
                value={profileForm.linkedin_url || ''}
                onChange={e => updateFormField({ linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1 flex items-center space-x-1.5">
                <span className="font-bold text-pink-600">Instagram:</span>
                <span>{language === 'ta' ? 'இன்ஸ்டாகிராம் இணைப்பு' : 'Instagram Profile Handle / Link'}</span>
              </label>
              <input
                type="text"
                value={profileForm.instagram_url || ''}
                onChange={e => updateFormField({ instagram_url: e.target.value })}
                placeholder="https://instagram.com/username"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1 flex items-center space-x-1.5">
                <span className="font-bold text-emerald-600">WhatsApp:</span>
                <span>{language === 'ta' ? 'வாட்ஸ்அப் எண்' : 'WhatsApp Contact Number'}</span>
              </label>
              <input
                type="text"
                value={profileForm.whatsapp_number || ''}
                onChange={e => updateFormField({ whatsapp_number: e.target.value })}
                placeholder="e.g. +919876543210"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: PROFILE VISIBILITY & PRIVACY */}
      {profileSubTab === 'visibility' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4 text-xs">
          <h4 className="font-bold text-sm text-[#111111] border-b border-[#E5E7EB] pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ta' ? 'ரகசிய அமைப்புகள் & நேரடி தெரிவுநிலை' : 'Privacy Control & Real-time Member Visibility Settings'}</span>
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB]">
              <div>
                <h4 className="font-bold text-[#111111]">
                  {language === 'ta' ? 'மின்னஞ்சல் முகவரியை மற்றவர்களுக்குக் காட்டுக' : 'Make Email Address Visible to Alumni'}
                </h4>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {language === 'ta' ? 'சரிபார்க்கப்பட்ட தோழர்கள் உங்கள் மின்னஞ்சலைக் காண அனுமதி அளிக்கிறது' : 'Allow verified alumni batchmates to view your contact email'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={profileForm.email_visible || false}
                onChange={e => updateFormField({ email_visible: e.target.checked })}
                className="w-5 h-5 accent-[#111111] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB]">
              <div>
                <h4 className="font-bold text-[#111111]">
                  {language === 'ta' ? 'கைபேசி எண்ணை மற்றவர்களுக்குக் காட்டுக' : 'Make Phone Number Visible to Alumni'}
                </h4>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {language === 'ta' ? 'வகுப்புத் தோழர்கள் உங்கள் மொபைல் எண்ணைக் காண அனுமதி அளிக்கிறது' : 'Allow verified alumni batchmates to view your mobile phone number'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={profileForm.phone_visible || false}
                onChange={e => updateFormField({ phone_visible: e.target.checked })}
                className="w-5 h-5 accent-[#111111] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB]">
              <div>
                <h4 className="font-bold text-[#111111]">
                  {language === 'ta' ? 'முன்னாள் மாணவர்கள் கோப்பகத்தில் காட்டுக' : 'Appear in Public Alumni Directory'}
                </h4>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {language === 'ta' ? 'தேடக்கூடிய முன்னாள் மாணவர்கள் பட்டியலில் உங்கள் சுயவிவரத்தைக் காட்டுக' : 'Include your profile card in the searchable alumni directory list'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={profileForm.directory_visible ?? true}
                onChange={e => updateFormField({ directory_visible: e.target.checked })}
                className="w-5 h-5 accent-[#111111] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION: Account Identity Change Request Banner & Links */}
      <div className="bg-gradient-to-r from-slate-900 to-black text-white p-5 sm:p-6 rounded-3xl border border-gray-800 shadow-md space-y-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF7D6] text-[#854D0E] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <ShieldAlert className="w-5 h-5 text-[#854D0E]" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm sm:text-base text-white">
              {language === 'ta' ? 'வகுப்பு ஆண்டு அல்லது கைபேசி எண்ணை மாற்ற வேண்டுமா?' : 'Need to Update Account Identity Details? (Batch / Mobile)'}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
              {language === 'ta'
                ? 'பாதுகாப்பு மற்றும் கணக்கு சரிபார்ப்பு காரணங்களுக்காக, உங்கள் தேர்ச்சி பெற்ற வகுப்பு (Batch Year) மற்றும் முதன்மை கைபேசி எண் நேரடி திருத்தத்திற்கு பூட்டப்பட்டுள்ளன. இவற்றை மாற்ற அமைப்புகள் பக்கம் சென்று பள்ளி நிர்வாகியிடம் அதிகாரப்பூர்வ கோரிக்கை அனுப்பலாம்.'
                : 'For security and identity verification, Batch (Passing Year) and Primary Mobile Number are locked for direct editing. To change these details, send an official update request to School Administrators via the Settings module.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-gray-800/80">
          <Link
            to="/alumni/settings?tab=requests"
            className="px-4 py-2.5 bg-[#FFF7D6] hover:bg-amber-200 text-[#854D0E] rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center justify-center space-x-2"
          >
            <span>{language === 'ta' ? 'வகுப்பு ஆண்டு மாற்ற கோரிக்கை' : 'Request Batch Year Change'}</span>
            <ArrowRight className="w-4 h-4 text-[#854D0E]" />
          </Link>

          <Link
            to="/alumni/settings?tab=requests"
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2"
          >
            <span>{language === 'ta' ? 'கைபேசி எண் மாற்ற கோரிக்கை' : 'Request Mobile Number Update'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};
