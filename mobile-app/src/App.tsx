import React, { useState, useEffect } from 'react';
import { 
  Home, Users, Calendar, Image as ImageIcon, User, QrCode, 
  ChevronRight, ArrowLeft, LogOut, CheckCircle2, AlertCircle, Plus, 
  MapPin, Clock, ShieldAlert, Sparkles, Send, Lock, Smartphone, RefreshCw,
  Search, Filter, Building2, Mail, Phone, ExternalLink, Award, Globe, RotateCcw,
  Menu, X, FileText, Megaphone, BookOpen, ThumbsUp, MessageCircle, Briefcase, Share2, Eye, EyeOff, KeyRound, ShieldCheck,
  UserX, UserPlus, ArrowRight, Bell, MessageSquare
} from 'lucide-react';
import { mobileApi } from './services/api';

export const App: React.FC = () => {
  // Navigation & Token State
  const [token, setToken] = useState<string | null>(mobileApi.getToken());
  const [userProfile, setUserProfile] = useState<any | null>(null);
  
  // Main Navigation Active Tab/Module
  const [activeTab, setActiveTab] = useState<
    'HOME' | 'DIRECTORY' | 'BATCH' | 'EVENTS' | 'SCHOOL_EVENTS' | 'MEMORIES' | 
    'DOCUMENTS' | 'MENTORSHIP' | 'COMMUNITY' | 'NOTIFICATIONS' | 'PROFILE' | 'SETTINGS' | 'ANNOUNCEMENTS'
  >('HOME');

  // Mobile Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auth Flow Screen Stack
  const [screen, setScreen] = useState<'SPLASH' | 'WELCOME' | 'LOGIN' | 'FORGOT_PASSWORD' | 'OTP' | 'REGISTER' | 'PENDING' | 'MAIN'>('SPLASH');

  // Auth Login Sub-Modes: 'PASSWORD_OTP' (Email/Phone + Pass -> OTP), 'DIRECT_OTP' (Direct OTP code), 'GOOGLE'
  const [loginMode, setLoginMode] = useState<'PASSWORD_OTP' | 'DIRECT_OTP'>('PASSWORD_OTP');
  
  // Auth Form State
  const [loginIdentifier, setLoginIdentifier] = useState('alumni@school.edu');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpPin, setOtpPin] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [passwordNotCreated, setPasswordNotCreated] = useState(false);

  // Forgot Password Workflow State
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP' | 'RESET'>('EMAIL');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [showForgotPassToggle, setShowForgotPassToggle] = useState(false);

  // Registration Workflow State
  const [regStep, setRegStep] = useState<'VERIFY_CONTACT' | 'OTP' | 'DETAILS'>('VERIFY_CONTACT');
  const [regContactIdentifier, setRegContactIdentifier] = useState('');
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('+919876543210');
  const [regPassingYear, setRegPassingYear] = useState<number>(2010);
  const [regAdmissionNo, setRegAdmissionNo] = useState('');
  const [regSection, setRegSection] = useState('A');
  const [regCity, setRegCity] = useState('');
  const [regProfession, setRegProfession] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [school, setSchool] = useState<any>(null);

  // Data States across all modules
  const [events, setEvents] = useState<any[]>([]);
  const [schoolEvents, setSchoolEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedSchoolEvent, setSelectedSchoolEvent] = useState<any | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [batchMembers, setBatchMembers] = useState<any[]>([]);
  const [allAlumniDirectory, setAllAlumniDirectory] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [docRequests, setDocRequests] = useState<any[]>([]);

  // Directory Filters & Search State
  const [dirSearch, setDirSearch] = useState('');
  const [dirBatchFilter, setDirBatchFilter] = useState('ALL');
  const [dirCityFilter, setDirCityFilter] = useState('ALL');
  const [dirProfFilter, setDirProfFilter] = useState('ALL');
  const [selectedDirectoryAlumni, setSelectedDirectoryAlumni] = useState<any | null>(null);
  const [connectModalAlumni, setConnectModalAlumni] = useState<any | null>(null);
  const [connectMessage, setConnectMessage] = useState('');

  // Batch Hub Sub-Tabs State
  const [batchSubTab, setBatchSubTab] = useState<'info' | 'members' | 'classmates' | 'updates'>('info');

  // School Events Category Filter State
  const [schoolEventCategory, setSchoolEventCategory] = useState('ALL');

  // Events Sub-Tabs State
  const [eventsSubTab, setEventsSubTab] = useState<'upcoming' | 'registered' | 'past'>('upcoming');
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [qrTicketEvent, setQrTicketEvent] = useState<any | null>(null);

  // RSVP Modal State
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'ATTENDING' | 'MAYBE' | 'DECLINED'>('ATTENDING');
  const [adultsCount, setAdultsCount] = useState(1);
  const [kidsCount, setKidsCount] = useState(0);

  // Document Request Modal & Form State
  const [showDocReqModal, setShowDocReqModal] = useState(false);
  const [docType, setDocType] = useState('Transfer Certificate (TC)');
  const [docReason, setDocReason] = useState('');
  const [docRemarks, setDocRemarks] = useState('');
  const [submittingDocReq, setSubmittingDocReq] = useState(false);

  // Photo Memory Upload State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryAlbum, setMemoryAlbum] = useState('Alumni Gathering');
  const [memoryFileUrl, setMemoryFileUrl] = useState('');
  const [memoryDescription, setMemoryDescription] = useState('');

  // Mentorship Network State
  const [mentorshipMode, setMentorshipMode] = useState<'find' | 'become'>('find');
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [mentorDomain, setMentorDomain] = useState('');
  const [mentorAvailability, setMentorAvailability] = useState('');

  // Community Forums State
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postCategory, setPostCategory] = useState<'General' | 'Tech & AI' | 'Career & Jobs' | 'Entrepreneurship' | 'School Nostalgia'>('General');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);

  // Notifications Stream Filter State
  const [notifCategoryFilter, setNotifCategoryFilter] = useState('ALL');

  // Profile Management Sub-Tabs & Form State
  const [profileSubTab, setProfileSubTab] = useState<'personal' | 'education' | 'employment' | 'skills' | 'social' | 'visibility'>('personal');
  const [profileForm, setProfileForm] = useState<any>({});
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Settings & Security State
  const [settingsSubTab, setSettingsSubTab] = useState<'SECURITY' | 'OTP_RESET' | 'PREFERENCES'>('SECURITY');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  const [otpResetSent, setOtpResetSent] = useState(false);
  const [sendingResetOtp, setSendingResetOtp] = useState(false);
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetOtpNewPass, setResetOtpNewPass] = useState('');
  const [resetOtpConfirmPass, setResetOtpConfirmPass] = useState('');
  const [resetVerifying, setResetVerifying] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(0);

  // Initial Boot
  useEffect(() => {
    mobileApi.getSchoolProfile().then(setSchool).catch(console.error);
    const timer = setTimeout(() => {
      if (token) {
        loadUserProfile();
      } else {
        setScreen('WELCOME');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const loadUserProfile = async () => {
    try {
      const u = await mobileApi.getMe();
      setUserProfile(u);
      setProfileForm({
        full_name: u.full_name || '',
        email: u.email || '',
        mobile: u.mobile || '',
        current_city: u.current_city || '',
        state: u.state || 'Tamil Nadu',
        country: u.country || 'India',
        bio: u.bio || '',
        passing_year: u.passing_year || 2010,
        admission_number: u.admission_number || '',
        roll_number: u.roll_number || u.admission_number || '',
        section: u.section || '',
        house: u.house || '',
        stream: u.stream || '',
        profession: u.profession || '',
        company: u.company || '',
        industry: u.industry || '',
        experience_years: u.experience_years || 0,
        skills: u.skills || [],
        linkedin_url: u.linkedin_url || '',
        github_url: u.github_url || '',
        twitter_url: u.twitter_url || '',
        website_url: u.website_url || '',
        profile_photo_url: u.profile_photo_url || '',
        phone_visible: u.phone_visible || false,
        directory_visible: u.directory_visible ?? true,
        email_visible: u.email_visible || false
      });

      if (u.verification_status === 'NOT_REGISTERED') {
        setScreen('REGISTER');
      } else if (u.verification_status === 'PENDING') {
        setScreen('PENDING');
      } else {
        setScreen('MAIN');
        loadMainData(u);
      }
    } catch (err) {
      console.error(err);
      mobileApi.clearToken();
      setToken(null);
      setScreen('WELCOME');
    }
  };

  const [mentorsList, setMentorsList] = useState<any[]>([]);

  const loadMainData = async (userDoc?: any) => {
    const u = userDoc || userProfile;
    try {
      const [sData, evData, seData, annData, memData, dirData, docData, batchList, postsData, mentorsData] = await Promise.all([
        mobileApi.getSchoolProfile().catch(() => null),
        mobileApi.getEvents().catch(() => []),
        mobileApi.getSchoolEvents().catch(() => []),
        mobileApi.getAnnouncements().catch(() => []),
        mobileApi.getMemories().catch(() => []),
        mobileApi.getAlumniDirectory().catch(() => []),
        mobileApi.getDocumentRequests().catch(() => []),
        mobileApi.getBatches().catch(() => []),
        mobileApi.getCommunityPosts().catch(() => []),
        mobileApi.getMentors().catch(() => [])
      ]);
      setSchool(sData);
      setEvents(evData);
      if (evData.length > 0) setSelectedEvent(evData[0]);
      setSchoolEvents(seData);
      if (seData.length > 0) setSelectedSchoolEvent(seData[0]);
      setAnnouncements(annData);
      setMemories(memData);
      setAllAlumniDirectory(dirData);
      setDocRequests(docData);
      setBatches(batchList);
      setCommunityPosts(postsData);
      setMentorsList(mentorsData);

      if (u?.passing_year) {
        const b = batchList.find((x: any) => x.passing_year === u.passing_year);
        if (b) {
          const members = await mobileApi.getBatchMembers(b.id).catch(() => []);
          setBatchMembers(members);
        } else {
          setBatchMembers(dirData.filter((x: any) => x.passing_year === u.passing_year));
        }
      }
    } catch (err) {
      console.error('Failed to load main data:', err);
    }
  };

  // --- Login & Auth Handlers ---

  // Handle Credentials Submit (Password + OTP or Direct OTP Dispatch)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setUserNotFound(false);
    setPasswordNotCreated(false);

    if (!loginIdentifier) {
      setAuthError('Please enter your email or mobile number.');
      setAuthLoading(false);
      return;
    }

    try {
      if (loginMode === 'PASSWORD_OTP') {
        if (!loginPassword) {
          setAuthError('Please enter your account password.');
          setAuthLoading(false);
          return;
        }
        await mobileApi.sendOTP(loginIdentifier, undefined, true, loginPassword);
      } else {
        // Direct OTP Mode
        await mobileApi.sendOTP(loginIdentifier, undefined, true);
      }
      setOtpPin('');
      setScreen('OTP');
    } catch (err: any) {
      if (err.message && (err.message.includes('PASSWORD_NOT_CREATED') || err.message.toLowerCase().includes('not have a login password'))) {
        setPasswordNotCreated(true);
      } else if (err.message && (err.message.toLowerCase().includes('not found') || err.message.toLowerCase().includes('register'))) {
        setUserNotFound(true);
      } else {
        setAuthError(err.message || 'Failed to dispatch verification code.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Verify Security OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    if (!otpPin || otpPin.length < 6) {
      setAuthError('Please enter the complete 6-digit security code.');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await mobileApi.verifyOTP(loginIdentifier, otpPin);
      setToken(res.access_token);
      await loadUserProfile();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid security verification code.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Google OAuth Login
  const handleGoogleLogin = () => {
    window.location.href = mobileApi.getGoogleLoginUrl();
  };

  // --- Forgot Password Workflow Handlers ---
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!forgotIdentifier) {
      setAuthError('Please enter your registered email address or mobile number.');
      return;
    }
    setAuthLoading(true);
    try {
      await mobileApi.sendOTP(forgotIdentifier, undefined, false, undefined, true);
      setForgotStep('OTP');
    } catch (err: any) {
      setAuthError(err.message || 'No account matching this identifier was found.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!forgotOtp || forgotOtp.length < 6) {
      setAuthError('Please enter the 6-digit reset code.');
      return;
    }
    setAuthLoading(true);
    try {
      await mobileApi.verifyOTP(forgotIdentifier, forgotOtp);
      setForgotStep('RESET');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid reset code entered.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setAuthError('Passwords do not match.');
      return;
    }
    setAuthLoading(true);
    try {
      await mobileApi.updatePassword(forgotNewPass);
      alert('Password updated successfully! You can now log in.');
      setScreen('LOGIN');
      setForgotStep('EMAIL');
      setForgotNewPass('');
      setForgotConfirmPass('');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to update password.');
    } finally {
      setAuthLoading(false);
    }
  };

  // --- Registration Workflow Handlers ---
  const handleRegSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regContactIdentifier) {
      setAuthError('Please enter your email address or mobile number.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      await mobileApi.sendOTP(regContactIdentifier);
      setRegStep('OTP');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOtpCode || regOtpCode.length < 6) {
      setAuthError('Please enter 6-digit verification OTP code.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await mobileApi.verifyOTP(regContactIdentifier, regOtpCode);
      if (regContactIdentifier.includes('@')) {
        setRegEmail(regContactIdentifier);
      } else {
        setRegMobile(regContactIdentifier);
      }
      setRegStep('DETAILS');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid verification OTP.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await mobileApi.register({
        full_name: regFullName,
        mobile: regMobile,
        email: regEmail,
        passing_year: regPassingYear,
        admission_number: regAdmissionNo,
        section: regSection,
        current_city: regCity,
        profession: regProfession,
        password: regPassword
      });
      await loadUserProfile();
    } catch (err: any) {
      alert('Registration failed: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // RSVP Confirm Handler
  const handleConfirmRSVP = async () => {
    if (!selectedEvent) return;
    try {
      await mobileApi.submitRSVP(selectedEvent.id, rsvpStatus, adultsCount, kidsCount);
      if (!registeredEventIds.includes(selectedEvent.id)) {
        setRegisteredEventIds([...registeredEventIds, selectedEvent.id]);
      }
      setShowRsvpModal(false);
      setQrTicketEvent(selectedEvent);
      alert(`RSVP confirmed as ${rsvpStatus}! Gate Pass QR ticket generated.`);
      loadMainData();
    } catch (err: any) {
      alert('RSVP failed: ' + err.message);
    }
  };

  // Document Request Handler
  const handleCreateDocRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docReason.trim()) return;
    setSubmittingDocReq(true);
    try {
      await mobileApi.createDocumentRequest({
        doc_type: docType,
        reason: docReason.trim(),
        remarks: docRemarks.trim() || undefined
      });
      setShowDocReqModal(false);
      setDocReason('');
      setDocRemarks('');
      alert(`Requisition for ${docType} sent directly to school administration!`);
      const updatedDocs = await mobileApi.getDocumentRequests().catch(() => []);
      setDocRequests(updatedDocs);
    } catch (err: any) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmittingDocReq(false);
    }
  };

  // Memory Submit Handler
  const handleMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryTitle) return;
    const newMem = {
      id: `mem-${Date.now()}`,
      title: memoryTitle,
      album_name: memoryAlbum,
      description: memoryDescription,
      image_url: memoryFileUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      uploader_name: userProfile?.full_name || 'Alumni Member',
      uploader_id: userProfile?.id,
      created_at: new Date().toISOString()
    };
    setMemories([newMem, ...memories]);
    setUploadModalOpen(false);
    setMemoryTitle('');
    setMemoryDescription('');
    setMemoryFileUrl('');
    alert('Your photo memory was submitted successfully!');
  };

  // Save Profile Handler
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updated = await mobileApi.updateProfile(profileForm);
      setUserProfile({ ...userProfile, ...updated });
      alert('Alumni Profile saved successfully!');
    } catch (err: any) {
      alert('Profile update failed: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Security Change Password Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      alert('Please enter both current and new passwords');
      return;
    }
    if (newPass !== confirmPass) {
      alert('New passwords do not match');
      return;
    }
    setUpdatingPass(true);
    try {
      await mobileApi.changePassword(currentPass, newPass);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      alert('Password updated successfully!');
    } catch (err: any) {
      alert('Password update failed: ' + err.message);
    } finally {
      setUpdatingPass(false);
    }
  };

  // Security OTP Reset Password Handler
  const handleSendResetOTP = async () => {
    const id = userProfile?.email || userProfile?.mobile;
    if (!id) return;
    setSendingResetOtp(true);
    try {
      await mobileApi.sendOTP(id, undefined, false, undefined, true);
      setOtpResetSent(true);
      setResetCountdown(60);
      const timer = setInterval(() => {
        setResetCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      alert(`OTP dispatched to ${id}!`);
    } catch (err: any) {
      alert('Failed to send OTP: ' + err.message);
    } finally {
      setSendingResetOtp(false);
    }
  };

  const handleResetPasswordWithOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtpCode || !resetOtpNewPass) return;
    if (resetOtpNewPass !== resetOtpConfirmPass) {
      alert('Passwords do not match');
      return;
    }
    setResetVerifying(true);
    try {
      await mobileApi.resetPasswordWithOTP(userProfile?.email, userProfile?.mobile, resetOtpCode, resetOtpNewPass);
      setOtpResetSent(false);
      setResetOtpCode('');
      setResetOtpNewPass('');
      setResetOtpConfirmPass('');
      alert('Password reset successfully!');
    } catch (err: any) {
      alert('OTP Reset failed: ' + err.message);
    } finally {
      setResetVerifying(false);
    }
  };

  // Community Post Creator
  const handleCreateCommunityPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;
    try {
      await mobileApi.createCommunityPost({
        category: postCategory,
        title: postTitle,
        content: postContent
      });
      setShowCreatePostModal(false);
      setPostTitle('');
      setPostContent('');
      alert('Community post published successfully!');
      const updatedPosts = await mobileApi.getCommunityPosts().catch(() => []);
      setCommunityPosts(updatedPosts);
    } catch (err: any) {
      alert('Failed to publish post: ' + err.message);
    }
  };

  const handleToggleLikePost = async (postId: string) => {
    try {
      const res = await mobileApi.likeCommunityPost(postId);
      setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: res.likes, isLiked: res.isLiked } : p));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRegisterAsMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorDomain) return;
    try {
      await mobileApi.registerAsMentor({
        domain: mentorDomain,
        available_hours: mentorAvailability || '2 hrs/week',
        bio: userProfile?.bio || `Alumnus from Class of ${userProfile?.passing_year}`,
        skills: userProfile?.skills || []
      });
      alert('Successfully registered as Mentor in the network!');
      const mentors = await mobileApi.getMentors().catch(() => []);
      setMentorsList(mentors);
    } catch (err: any) {
      alert('Mentor registration failed: ' + err.message);
    }
  };

  const handleSendMentorshipRequest = async (mentor: any, note: string) => {
    try {
      await mobileApi.sendMentorshipRequest({
        mentor_id: mentor.id,
        mentor_name: mentor.name,
        note: note || 'Requesting career mentorship'
      });
      alert(`Mentorship request dispatched to ${mentor.name}!`);
    } catch (err: any) {
      alert('Failed to send mentorship request: ' + err.message);
    }
  };

  // Computed directory filters
  const filteredDirectory = allAlumniDirectory.filter(a => {
    const matchSearch = dirSearch === '' || 
      a.full_name?.toLowerCase().includes(dirSearch.toLowerCase()) ||
      a.profession?.toLowerCase().includes(dirSearch.toLowerCase()) ||
      a.company?.toLowerCase().includes(dirSearch.toLowerCase()) ||
      a.current_city?.toLowerCase().includes(dirSearch.toLowerCase());
    const matchBatch = dirBatchFilter === 'ALL' || a.passing_year?.toString() === dirBatchFilter;
    const matchCity = dirCityFilter === 'ALL' || (a.current_city && a.current_city.toLowerCase().includes(dirCityFilter.toLowerCase()));
    const matchProf = dirProfFilter === 'ALL' || (a.profession && a.profession.toLowerCase().includes(dirProfFilter.toLowerCase()));
    return matchSearch && matchBatch && matchCity && matchProf;
  });

  const uniqueBatches = Array.from(new Set(allAlumniDirectory.map(a => a.passing_year).filter(Boolean))).sort((a, b) => b - a);
  const uniqueCities = Array.from(new Set(allAlumniDirectory.map(a => a.current_city).filter(Boolean))).sort();
  const uniqueProfessions = Array.from(new Set(allAlumniDirectory.map(a => a.profession).filter(Boolean))).sort();

  // Compiled Live Notifications
  const compiledNotifications = [
    ...announcements.map(a => ({
      id: `ann-${a.id}`,
      category: 'ANNOUNCEMENT',
      title: a.title,
      message: a.content || 'New official notice.',
      timestamp: a.created_at || 'Recently',
      statusTag: a.target || 'SCHOOL'
    })),
    ...schoolEvents.map(e => ({
      id: `sevent-${e.id}`,
      category: 'SCHOOL_EVENT',
      title: `School Event: ${e.title}`,
      message: `${e.category.replace(/_/g, ' ')} scheduled for ${e.event_date} at ${e.venue}.`,
      timestamp: e.event_date || 'Upcoming',
      statusTag: e.status || 'UPCOMING'
    })),
    ...events.map(e => ({
      id: `aevent-${e.id}`,
      category: 'REUNION',
      title: `Reunion: ${e.title}`,
      message: `Gathering on ${e.event_date} at ${e.venue}.`,
      timestamp: e.event_date || 'Upcoming',
      statusTag: 'REUNION'
    })),
    ...docRequests.map(d => ({
      id: `docreq-${d.id}`,
      category: 'DOCUMENT',
      title: `Document Requisition: ${d.doc_type}`,
      message: `Status updated to [${d.status.replace(/_/g, ' ')}].`,
      timestamp: d.created_at || 'Recent',
      statusTag: d.status
    }))
  ];

  const filteredNotifications = compiledNotifications.filter(n => {
    if (notifCategoryFilter === 'ALL') return true;
    return n.category === notifCategoryFilter;
  });

  // Calculate profile score
  const calculateProfileScore = () => {
    if (!userProfile) return 30;
    let score = 30;
    if (userProfile.profile_photo_url) score += 20;
    if (userProfile.current_city) score += 20;
    if (userProfile.profession) score += 15;
    if (userProfile.email) score += 15;
    return Math.min(score, 100);
  };

  // ----------------------------------------------------
  // SCREEN ROUTING & RENDERING
  // ----------------------------------------------------

  // 1. SPLASH SCREEN
  if (screen === 'SPLASH') {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-20 h-20 bg-[#F4C542] rounded-3xl flex items-center justify-center text-[#111111] text-3xl font-extrabold shadow-2xl mb-6 animate-pulse">
          {school?.code || 'ALU'}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">{school?.name?.toUpperCase() || 'ALUMNI PORTAL'}</h1>
        <p className="text-xs text-gray-400 mt-2 font-medium">Official Mobile Network</p>
        <div className="mt-10 w-6 h-6 border-2 border-[#F4C542] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. WELCOME SCREEN WITH GOOGLE AUTH & MULTI-OPTION LOGIN
  if (screen === 'WELCOME') {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col justify-between text-[#111111] animate-fadeIn max-w-md mx-auto">
        <div className="pt-8 text-center space-y-4">
          <div className="w-20 h-20 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-3xl flex items-center justify-center mx-auto text-[#111111] text-2xl font-bold shadow-sm">
            {school?.code || 'ALU'}
          </div>
          <h2 className="text-2xl font-bold">Welcome Back, Alumnus</h2>
          <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs mx-auto">
            Stay connected with school batchmates, request official certificates, RSVP for reunions, and guide younger alumni.
          </p>

          {/* Value Highlights */}
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-4 text-xs space-y-2 text-left">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified School Alumni Directory</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Certificate Requisitions & TC</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Reunion Gate Pass QR Tickets</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-6 pt-4">
          {/* Option 1: Continue with Google Auth */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-50 text-[#111111] font-bold py-3.5 px-4 rounded-2xl border border-[#E5E7EB] shadow-xs active-press transition-all flex items-center justify-center space-x-3 text-sm cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Option 2: Email / Mobile Login */}
          <button
            onClick={() => { setLoginMode('PASSWORD_OTP'); setScreen('LOGIN'); }}
            className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3.5 rounded-2xl text-sm shadow-xs active-press transition-all flex items-center justify-center space-x-2"
          >
            <Mail className="w-4 h-4 text-[#111111]" />
            <span>Alumni Sign In with Email / OTP</span>
          </button>

          {/* Option 3: Register */}
          <button
            onClick={() => setScreen('REGISTER')}
            className="w-full bg-[#111111] hover:bg-black text-white font-bold py-3.5 rounded-2xl text-sm shadow-xs active-press transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4 text-[#F4C542]" />
            <span>Register New Alumni Profile</span>
          </button>

          <div className="text-center text-[10px] text-[#6B7280] pt-2">
            Private & Verified School Alumni Network
          </div>
        </div>
      </div>
    );
  }

  // 3. ENHANCED LOGIN SCREEN (PASSWORD + OTP OR DIRECT OTP OR GOOGLE)
  if (screen === 'LOGIN') {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col justify-between text-[#111111] animate-fadeIn max-w-md mx-auto">
        <div>
          <button onClick={() => setScreen('WELCOME')} className="p-2 text-gray-500 hover:text-black mb-2 flex items-center space-x-1 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <h2 className="text-2xl font-bold">Alumni Sign In</h2>
          <p className="text-xs text-[#6B7280] mt-1">Enter your registered email address or mobile number.</p>

          {/* Login Modes Sub-Tabs */}
          <div className="flex border-b border-[#E5E7EB] gap-2 text-xs font-bold mt-4 pb-2">
            <button
              type="button"
              onClick={() => { setLoginMode('PASSWORD_OTP'); setAuthError(null); }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                loginMode === 'PASSWORD_OTP' ? 'bg-[#111111] text-white shadow-xs' : 'bg-white border border-[#E5E7EB] text-gray-600'
              }`}
            >
              Password + OTP
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('DIRECT_OTP'); setAuthError(null); }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                loginMode === 'DIRECT_OTP' ? 'bg-[#111111] text-white shadow-xs' : 'bg-white border border-[#E5E7EB] text-gray-600'
              }`}
            >
              Direct OTP Code
            </button>
          </div>

          {/* Account Not Registered Alert */}
          {userNotFound && (
            <div className="mt-4 p-4 bg-[#FFF7D6] border border-[#F4C542] rounded-2xl space-y-2 text-xs">
              <div className="flex items-start space-x-2 text-[#854D0E] font-bold">
                <UserX className="w-5 h-5 shrink-0" />
                <span>Account Not Registered</span>
              </div>
              <p className="text-gray-700">No profile found for <strong>{loginIdentifier}</strong>. Unregistered users cannot log in.</p>
              <button
                onClick={() => setScreen('REGISTER')}
                className="w-full py-2.5 bg-[#111111] text-white font-bold rounded-xl flex items-center justify-center space-x-1"
              >
                <UserPlus className="w-4 h-4 text-[#F4C542]" />
                <span>Register Profile Now</span>
              </button>
            </div>
          )}

          {/* Password Not Created Alert */}
          {passwordNotCreated && (
            <div className="mt-4 p-4 bg-[#FFF7D6] border border-[#F4C542] rounded-2xl space-y-2 text-xs">
              <div className="flex items-start space-x-2 text-[#854D0E] font-bold">
                <Lock className="w-5 h-5 shrink-0" />
                <span>Password Not Created Yet</span>
              </div>
              <p className="text-gray-700">Your account does not have a password set. Click below to create your password.</p>
              <button
                onClick={() => { setScreen('FORGOT_PASSWORD'); setForgotStep('EMAIL'); setForgotIdentifier(loginIdentifier); }}
                className="w-full py-2.5 bg-[#111111] text-white font-bold rounded-xl"
              >
                Create Account Password →
              </button>
            </div>
          )}

          {authError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {authError}
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Registered Email or Mobile Number *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="name@email.com or +91..."
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-[#111111] focus:outline-none focus:border-[#F4C542]"
                  required
                />
              </div>
            </div>

            {loginMode === 'PASSWORD_OTP' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#111111]">Account Password *</label>
                  <button
                    type="button"
                    onClick={() => { setScreen('FORGOT_PASSWORD'); setForgotStep('EMAIL'); setForgotIdentifier(loginIdentifier); }}
                    className="text-xs font-semibold text-amber-800 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl pl-10 pr-10 py-3 text-sm font-medium text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3.5 rounded-2xl text-sm shadow-xs active-press transition-all flex items-center justify-center space-x-2"
            >
              <span>{authLoading ? 'Validating...' : 'Continue to OTP Verification'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Google Divider */}
          <div className="relative py-4 flex items-center justify-center">
            <div className="border-t border-[#E5E7EB] w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-gray-400 uppercase">OR</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-50 text-[#111111] font-bold py-3 px-4 rounded-2xl border border-[#E5E7EB] shadow-xs active-press transition-all flex items-center justify-center space-x-3 text-xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. FORGOT PASSWORD SCREEN (EMAIL -> OTP -> RESET)
  if (screen === 'FORGOT_PASSWORD') {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col justify-between text-[#111111] animate-fadeIn max-w-md mx-auto">
        <div>
          <button onClick={() => setScreen('LOGIN')} className="p-2 text-gray-500 hover:text-black mb-2 flex items-center space-x-1 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>

          <h2 className="text-2xl font-bold">Reset Password</h2>
          <p className="text-xs text-[#6B7280] mt-1">
            {forgotStep === 'EMAIL' && 'Enter your registered email or mobile to receive reset code.'}
            {forgotStep === 'OTP' && `Enter 6-digit security code sent to ${forgotIdentifier}.`}
            {forgotStep === 'RESET' && 'Set a new secure password for your account.'}
          </p>

          {authError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {authError}
            </div>
          )}

          {/* FORGOT STEP 1: IDENTIFIER */}
          {forgotStep === 'EMAIL' && (
            <form onSubmit={handleForgotEmailSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">Registered Email or Mobile *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Enter registered email"
                    className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-[#F4C542]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3.5 rounded-2xl text-sm shadow-xs active-press"
              >
                {authLoading ? 'Sending Reset Code...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* FORGOT STEP 2: OTP VERIFICATION */}
          {forgotStep === 'OTP' && (
            <form onSubmit={handleForgotOTPSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">6-Digit Reset OTP Code *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl pl-10 pr-4 py-3 text-center text-xl font-mono font-bold tracking-widest focus:outline-none focus:border-[#F4C542]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3.5 rounded-2xl text-sm shadow-xs active-press"
              >
                {authLoading ? 'Verifying...' : 'Verify Reset Code'}
              </button>
            </form>
          )}

          {/* FORGOT STEP 3: NEW PASSWORD */}
          {forgotStep === 'RESET' && (
            <form onSubmit={handleResetPasswordSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">New Password *</label>
                <input
                  type={showForgotPassToggle ? 'text' : 'password'}
                  value={forgotNewPass}
                  onChange={(e) => setForgotNewPass(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#F4C542]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">Confirm New Password *</label>
                <input
                  type={showForgotPassToggle ? 'text' : 'password'}
                  value={forgotConfirmPass}
                  onChange={(e) => setForgotConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#F4C542]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3.5 rounded-2xl text-sm shadow-xs active-press"
              >
                {authLoading ? 'Updating Password...' : 'Save New Password & Login'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 5. OTP SCREEN (VERIFY SECURITY CODE)
  if (screen === 'OTP') {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col justify-between text-[#111111] animate-fadeIn max-w-md mx-auto">
        <div>
          <button onClick={() => setScreen('LOGIN')} className="p-2 text-gray-500 hover:text-black mb-2 flex items-center space-x-1 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Change Login Method</span>
          </button>
          <h2 className="text-2xl font-bold">Verify Security OTP</h2>
          <p className="text-xs text-[#6B7280] mt-1">Code sent to <strong>{loginIdentifier}</strong>.</p>

          {authError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {authError}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">6-Digit Pin</label>
              <input
                type="text"
                maxLength={6}
                value={otpPin}
                onChange={(e) => setOtpPin(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl px-4 py-3.5 text-center text-2xl font-bold tracking-widest text-[#111111] focus:outline-none focus:border-[#F4C542]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-4 rounded-2xl text-sm shadow-xs active-press mt-4"
            >
              {authLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 6. ENHANCED ALUMNI REGISTRATION SCREEN WITH EMAIL OTP VERIFICATION
  if (screen === 'REGISTER') {
    return (
      <div className="min-h-screen bg-white p-6 text-[#111111] animate-fadeIn max-w-md mx-auto">
        <button onClick={() => setScreen('WELCOME')} className="p-2 text-gray-500 hover:text-black mb-2 flex items-center space-x-1 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h2 className="text-2xl font-bold">Alumni Registration</h2>
        <p className="text-xs text-[#6B7280] mt-1 mb-6">
          {regStep === 'VERIFY_CONTACT' && 'Step 1: Enter email or mobile for security verification.'}
          {regStep === 'OTP' && `Step 2: Enter 6-digit OTP code sent to ${regContactIdentifier}.`}
          {regStep === 'DETAILS' && 'Step 3: Complete your verified alumni profile details.'}
        </p>

        {authError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            {authError}
          </div>
        )}

        {/* STEP 1: VERIFY CONTACT IDENTIFIER */}
        {regStep === 'VERIFY_CONTACT' && (
          <form onSubmit={handleRegSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Email Address or Mobile Number *</label>
              <input
                type="text"
                value={regContactIdentifier}
                onChange={(e) => setRegContactIdentifier(e.target.value)}
                placeholder="name@email.com or +91..."
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#F4C542]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3.5 rounded-2xl text-sm shadow-xs active-press"
            >
              {authLoading ? 'Sending Verification OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP CODE */}
        {regStep === 'OTP' && (
          <form onSubmit={handleRegVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">6-Digit Verification OTP *</label>
              <input
                type="text"
                maxLength={6}
                value={regOtpCode}
                onChange={(e) => setRegOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl px-4 py-3.5 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-[#F4C542]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3.5 rounded-2xl text-sm shadow-xs active-press"
            >
              {authLoading ? 'Verifying...' : 'Verify OTP & Continue'}
            </button>
          </form>
        )}

        {/* STEP 3: COMPLETE REGISTRATION DETAILS */}
        {regStep === 'DETAILS' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 pb-8">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Mobile *</label>
                <input
                  type="text"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Passing Year (Batch) *</label>
                <input
                  type="number"
                  value={regPassingYear}
                  onChange={(e) => setRegPassingYear(Number(e.target.value))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Section</label>
                <input
                  type="text"
                  value={regSection}
                  onChange={(e) => setRegSection(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Admission Number / Alumni ID *</label>
              <input
                type="text"
                value={regAdmissionNo}
                onChange={(e) => setRegAdmissionNo(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Current City</label>
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Profession</label>
                <input
                  type="text"
                  value={regProfession}
                  onChange={(e) => setRegProfession(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Create Account Password *</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3.5 rounded-2xl text-sm mt-4 active-press"
            >
              {authLoading ? 'Submitting Registration...' : 'Submit Profile for Verification'}
            </button>
          </form>
        )}
      </div>
    );
  }

  // 7. VERIFICATION PENDING SCREEN
  if (screen === 'PENDING') {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col justify-between text-[#111111] text-center animate-fadeIn max-w-md mx-auto">
        <div className="pt-12">
          <div className="w-20 h-20 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-3xl flex items-center justify-center mx-auto text-[#854D0E] shadow-sm mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">Verification Pending</h2>
          <p className="text-xs text-[#6B7280] mt-2 max-w-xs mx-auto leading-relaxed">
            Your alumni profile registration has been submitted and is currently being reviewed by <strong>{school?.name || 'School'}</strong> admin.
          </p>

          <div className="mt-8 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-4 text-xs text-left space-y-2">
            <div>Name: <strong>{userProfile?.full_name}</strong></div>
            <div>Batch: <strong>Class of {userProfile?.passing_year}</strong></div>
            <div>Status: <span className="font-bold text-[#854D0E]">PENDING REVIEW</span></div>
          </div>
        </div>

        <div className="space-y-3 pb-6">
          <button
            onClick={() => loadUserProfile()}
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#111111] font-semibold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span>Refresh Verification Status</span>
          </button>
          <button
            onClick={() => {
              mobileApi.clearToken();
              setToken(null);
              setScreen('WELCOME');
            }}
            className="w-full text-xs font-semibold text-rose-600 hover:underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 8 - 14 MAIN APPROVED ALUMNI APPLICATION FLOW
  // ----------------------------------------------------
  return (
    <div className="h-screen w-screen max-w-md mx-auto bg-[#FAFAFA] flex flex-col overflow-hidden text-[#111111] relative font-sans">
      
      {/* TOP HEADER BAR */}
      <header className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#111111] hover:bg-gray-100"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('HOME')}>
            <div className="w-8 h-8 rounded-xl bg-[#FFF7D6] border border-[#F4C542] font-bold text-xs flex items-center justify-center text-[#111111]">
              {school?.code || 'ALU'}
            </div>
            <div>
              <h1 className="font-bold text-xs text-[#111111] truncate max-w-[140px] leading-tight">{school?.name || 'Alumni Portal'}</h1>
              <span className="text-[10px] text-[#854D0E] font-semibold">Class of {userProfile?.passing_year || 'Alumni'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Notifications button */}
          <button
            onClick={() => setActiveTab('NOTIFICATIONS')}
            className={`p-2 rounded-xl border relative transition-all ${
              activeTab === 'NOTIFICATIONS' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-[#FAFAFA] border-[#E5E7EB] text-[#4B5563]'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            {compiledNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {compiledNotifications.length}
              </span>
            )}
          </button>

          {/* Quick Gate Pass QR Ticket button */}
          <button
            onClick={() => {
              if (registeredEventIds.length > 0) {
                const ev = events.find(e => registeredEventIds.includes(e.id)) || events[0];
                setQrTicketEvent(ev);
              } else if (events.length > 0) {
                setQrTicketEvent(events[0]);
              }
            }}
            className="bg-[#FFF7D6] border border-[#F4C542] text-[#854D0E] p-2 rounded-xl text-xs font-semibold flex items-center justify-center"
            title="Gate Pass QR"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* SLIDE-OUT NAVIGATION DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full flex flex-col justify-between shadow-2xl animate-slideRight p-5 overflow-y-auto scrollbar-none">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF7D6] border border-[#F4C542] overflow-hidden flex items-center justify-center font-bold text-amber-900">
                    {userProfile?.profile_photo_url ? (
                      <img src={userProfile.profile_photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.full_name?.[0] || 'A'
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-[#111111] truncate">{userProfile?.full_name}</h3>
                    <p className="text-[10px] text-[#854D0E] font-semibold">Class of {userProfile?.passing_year}</p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-1 text-gray-400 hover:text-[#111111]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Section 1: Main */}
              <div className="space-y-1 text-xs font-semibold">
                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider mb-2">MAIN PORTAL</p>
                {[
                  { id: 'HOME', label: 'Home Dashboard', icon: Home },
                  { id: 'DIRECTORY', label: 'Global Directory', icon: CompassIcon },
                  { id: 'BATCH', label: 'My Batch Class Hub', icon: Users },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setDrawerOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === item.id ? 'bg-[#111111] text-white shadow-xs' : 'text-[#4B5563] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Navigation Section 2: Events & Celebrations */}
              <div className="space-y-1 text-xs font-semibold">
                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider mb-2">EVENTS & CELEBRATIONS</p>
                {[
                  { id: 'EVENTS', label: 'Alumni Reunions & RSVP', icon: Calendar },
                  { id: 'SCHOOL_EVENTS', label: 'School Celebrations', icon: Sparkles },
                  { id: 'MEMORIES', label: 'Photo Gallery & Memories', icon: ImageIcon },
                  { id: 'ANNOUNCEMENTS', label: 'Announcements & Notices', icon: Bell },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setDrawerOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === item.id ? 'bg-[#111111] text-white shadow-xs' : 'text-[#4B5563] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Navigation Section 3: Services & Network */}
              <div className="space-y-1 text-xs font-semibold">
                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider mb-2">SERVICES & NETWORK</p>
                {[
                  { id: 'DOCUMENTS', label: 'Certificates & Documents', icon: Award },
                  { id: 'MENTORSHIP', label: 'Mentorship Network', icon: GraduationCapIcon },
                  { id: 'COMMUNITY', label: 'Community Forums', icon: MessageCircle },
                  { id: 'NOTIFICATIONS', label: 'Live Notifications Stream', icon: Megaphone },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setDrawerOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === item.id ? 'bg-[#111111] text-white shadow-xs' : 'text-[#4B5563] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Navigation Section 4: Account & Security */}
              <div className="space-y-1 text-xs font-semibold">
                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider mb-2">ACCOUNT & SECURITY</p>
                {[
                  { id: 'PROFILE', label: 'My Alumni Profile', icon: User },
                  { id: 'SETTINGS', label: 'Account & Security Settings', icon: KeyRound },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setDrawerOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === item.id ? 'bg-[#111111] text-white shadow-xs' : 'text-[#4B5563] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E7EB]">
              <button
                onClick={() => {
                  mobileApi.clearToken();
                  setToken(null);
                  setScreen('WELCOME');
                }}
                className="w-full text-xs font-bold text-rose-600 py-2.5 flex items-center justify-center space-x-2 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Mobile App</span>
              </button>
            </div>
          </div>

          <div className="flex-1" onClick={() => setDrawerOpen(false)}></div>
        </div>
      )}

      {/* SCROLLABLE MAIN VIEWPORT */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
        
        {/* MODULE 1: HOME DASHBOARD */}
        {activeTab === 'HOME' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#111111] via-[#1E1E1E] to-[#2D2D2D] p-5 rounded-3xl text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-[#F4C542] tracking-wider bg-[#F4C542]/20 px-2.5 py-0.5 rounded-full border border-[#F4C542]/30">
                  Class of {userProfile?.passing_year || 'Alumni'}
                </span>
                <h2 className="text-xl font-bold tracking-tight">Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Alumnus'}!</h2>
                <p className="text-xs text-gray-300">
                  Stay connected with batchmates, view celebrations, request certificates, and guide juniors.
                </p>

                {/* Profile Completion Meter */}
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-semibold text-gray-300 mb-1">
                    <span>Profile Score</span>
                    <span className="text-[#F4C542]">{calculateProfileScore()}% Complete</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F4C542] transition-all" style={{ width: `${calculateProfileScore()}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Shortcuts Grid */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
              <button onClick={() => setActiveTab('DIRECTORY')} className="bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-xs active-press flex flex-col items-center space-y-1">
                <div className="p-2 bg-amber-50 text-amber-900 rounded-xl"><CompassIcon className="w-4 h-4" /></div>
                <span className="truncate w-full">Directory</span>
              </button>
              <button onClick={() => setActiveTab('EVENTS')} className="bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-xs active-press flex flex-col items-center space-y-1">
                <div className="p-2 bg-blue-50 text-blue-900 rounded-xl"><Calendar className="w-4 h-4" /></div>
                <span className="truncate w-full">Reunions</span>
              </button>
              <button onClick={() => setActiveTab('DOCUMENTS')} className="bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-xs active-press flex flex-col items-center space-y-1">
                <div className="p-2 bg-purple-50 text-purple-900 rounded-xl"><Award className="w-4 h-4" /></div>
                <span className="truncate w-full">Certificate</span>
              </button>
              <button onClick={() => setActiveTab('PROFILE')} className="bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-xs active-press flex flex-col items-center space-y-1">
                <div className="p-2 bg-emerald-50 text-emerald-900 rounded-xl"><User className="w-4 h-4" /></div>
                <span className="truncate w-full">My Profile</span>
              </button>
            </div>

            {/* Quick Statistics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">TOTAL ALUMNI</span>
                  <span className="text-xl font-extrabold text-[#111111]">{allAlumniDirectory.length || 100}+</span>
                </div>
                <Users className="w-6 h-6 text-amber-700" />
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">MY BATCH</span>
                  <span className="text-xl font-extrabold text-[#111111]">{batchMembers.length || 25} Members</span>
                </div>
                <BookOpen className="w-6 h-6 text-emerald-700" />
              </div>
            </div>

            {/* Upcoming Event Hero Preview Card */}
            {selectedEvent && (
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-[#854D0E] bg-[#FFF7D6] px-2.5 py-0.5 rounded-full border border-[#F4C542]/60">
                    UPCOMING REUNION
                  </span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {selectedEvent.attending_count || 12} Attending
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#111111] leading-snug">{selectedEvent.title}</h3>
                <p className="text-xs text-[#6B7280] line-clamp-2">{selectedEvent.description}</p>

                <div className="space-y-1.5 text-xs text-[#111111] pt-2 border-t border-[#E5E7EB]">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>{selectedEvent.event_date} ({selectedEvent.start_time || '10:00 AM'})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span className="truncate">{selectedEvent.venue}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowRsvpModal(true)}
                  className="w-full bg-[#111111] text-white hover:bg-black font-bold py-3 rounded-2xl text-xs active-press transition-all shadow-xs"
                >
                  Respond / RSVP Attendance
                </button>
              </div>
            )}

            {/* Recent Notices Feed */}
            <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#111111]">RECENT ANNOUNCEMENTS</h3>
                <button onClick={() => setActiveTab('ANNOUNCEMENTS')} className="text-[11px] font-bold text-amber-800 hover:underline">
                  View All
                </button>
              </div>

              {announcements.length > 0 ? (
                announcements.slice(0, 2).map(ann => (
                  <div key={ann.id} className="p-3.5 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {ann.target || 'SCHOOL'}
                      </span>
                      <span className="text-[10px] text-gray-400">{new Date(ann.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-xs text-[#111111]">{ann.title}</h4>
                    <p className="text-gray-600 line-clamp-2">{ann.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">No active announcements posted yet.</p>
              )}
            </div>
          </div>
        )}

        {/* MODULE 2: GLOBAL ALUMNI DIRECTORY */}
        {activeTab === 'DIRECTORY' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header & Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-3">
              <div>
                <h2 className="text-base font-bold text-[#111111]">Global Alumni Directory</h2>
                <p className="text-xs text-gray-500">Connect with verified alumni across batches, companies, and cities</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, company, profession..."
                  value={dirSearch}
                  onChange={e => setDirSearch(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl pl-9 pr-8 py-2.5 text-xs focus:outline-none focus:border-[#F4C542]"
                />
                {dirSearch && (
                  <button onClick={() => setDirSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <select value={dirBatchFilter} onChange={e => setDirBatchFilter(e.target.value)} className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none">
                  <option value="ALL">All Batches ({uniqueBatches.length})</option>
                  {uniqueBatches.map(b => <option key={b} value={b?.toString()}>Class of {b}</option>)}
                </select>

                <select value={dirCityFilter} onChange={e => setDirCityFilter(e.target.value)} className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none">
                  <option value="ALL">All Cities ({uniqueCities.length})</option>
                  {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select value={dirProfFilter} onChange={e => setDirProfFilter(e.target.value)} className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none">
                  <option value="ALL">All Professions ({uniqueProfessions.length})</option>
                  {uniqueProfessions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredDirectory.length > 0 ? (
                filteredDirectory.map(a => (
                  <div key={a.id || a.mobile} className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#F4C542] bg-[#FFF7D6] flex items-center justify-center shrink-0">
                        {a.profile_photo_url ? (
                          <img src={a.profile_photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-[#854D0E]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#111111] truncate">{a.full_name}</h4>
                        <span className="text-[10px] font-semibold text-[#854D0E] bg-[#FFF7D6] px-2 py-0.5 rounded-full inline-block mt-0.5">
                          Class of {a.passing_year} {a.section ? `(${a.section})` : ''}
                        </span>
                        <div className="text-[11px] text-gray-500 mt-1.5 space-y-0.5">
                          {a.profession && <div className="truncate flex items-center space-x-1"><Building2 className="w-3 h-3 text-amber-700 shrink-0" /><span className="truncate">{a.profession} {a.company ? `@ ${a.company}` : ''}</span></div>}
                          {a.current_city && <div className="truncate flex items-center space-x-1"><MapPin className="w-3 h-3 text-gray-400 shrink-0" /><span>{a.current_city}</span></div>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB] text-xs font-bold">
                      <button onClick={() => setSelectedDirectoryAlumni(a)} className="flex-1 py-2 bg-[#FAFAFA] hover:bg-gray-100 rounded-xl border border-[#E5E7EB] text-[#111111] text-center">
                        View Profile
                      </button>
                      <button onClick={() => setConnectModalAlumni(a)} className="px-4 py-2 bg-[#111111] text-white hover:bg-black rounded-xl text-center flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-[#F4C542]" />
                        <span>Connect</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-[#E5E7EB] text-center space-y-2">
                  <User className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-[#111111]">No Alumni Found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODULE 3: MY BATCH & CLASSMATE HUB */}
        {activeTab === 'BATCH' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 text-white p-5 rounded-3xl shadow-md space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Class of {userProfile?.passing_year || 'Alumni'}
              </span>
              <h2 className="text-xl font-bold">Class of {userProfile?.passing_year || ''} Hub</h2>
              <p className="text-xs text-amber-200">View batch committee, classmates list, and real-time notice board.</p>
            </div>

            <div className="flex overflow-x-auto gap-2 border-b border-[#E5E7EB] pb-2 text-xs font-bold scrollbar-none">
              {[
                { id: 'info', label: 'Batch Info', icon: BookOpen },
                { id: 'members', label: `Members (${batchMembers.length})`, icon: Users },
                { id: 'classmates', label: 'Classmates', icon: User },
                { id: 'updates', label: 'Notice Board', icon: MessageSquare }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setBatchSubTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    batchSubTab === tab.id ? 'bg-[#111111] text-white shadow-xs' : 'bg-white border border-[#E5E7EB] text-[#4B5563]'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {batchSubTab === 'info' && (
              <div className="space-y-4 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-[#111111]">Batch Overview & Committee</h3>
                  <p className="text-gray-600 leading-relaxed">The batch of {userProfile?.passing_year} consists of {batchMembers.length} verified alumni.</p>
                </div>
              </div>
            )}

            {(batchSubTab === 'members' || batchSubTab === 'classmates') && (
              <div className="space-y-3">
                {batchMembers.map(a => (
                  <div key={a.id || a.mobile} className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E5E7EB] bg-[#FFF7D6] flex items-center justify-center shrink-0">
                        {a.profile_photo_url ? <img src={a.profile_photo_url} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-[#854D0E]" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-[#111111] truncate">{a.full_name}</h4>
                        <span className="text-[10px] font-semibold text-[#854D0E]">Class of {a.passing_year}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedDirectoryAlumni(a)} className="p-2 text-amber-800"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODULE 4: ALUMNI EVENTS & REUNIONS */}
        {activeTab === 'EVENTS' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-[#E5E7EB] shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#111111]">Alumni Events & Reunions</h2>
                <p className="text-xs text-gray-500">Browse gatherings, register passes, and view QR tickets</p>
              </div>
            </div>

            <div className="flex gap-2 border-b border-[#E5E7EB] pb-2 text-xs font-bold">
              {[{ id: 'upcoming', label: 'Upcoming' }, { id: 'registered', label: 'My Registrations' }, { id: 'past', label: 'Past Events' }].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setEventsSubTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${eventsSubTab === tab.id ? 'bg-[#111111] text-white shadow-xs' : 'bg-white border border-[#E5E7EB] text-[#4B5563]'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {eventsSubTab === 'upcoming' && (
              <div className="space-y-4">
                {events.map(ev => (
                  <div key={ev.id} className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
                    <div className="h-36 bg-gradient-to-r from-[#111111] to-[#2D2D2D] p-5 text-white flex flex-col justify-end">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">ALUMNI GATHERING</span>
                      <h3 className="font-extrabold text-base">{ev.title}</h3>
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <p className="text-gray-600 line-clamp-2">{ev.description}</p>
                      {registeredEventIds.includes(ev.id) ? (
                        <button onClick={() => setQrTicketEvent(ev)} className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5">
                          <QrCode className="w-4 h-4" /><span>View Gate Pass QR</span>
                        </button>
                      ) : (
                        <button onClick={() => { setSelectedEvent(ev); setShowRsvpModal(true); }} className="w-full py-2.5 bg-[#111111] text-white font-bold rounded-xl">
                          Register / RSVP Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODULE 5: SCHOOL EVENTS & CELEBRATIONS */}
        {activeTab === 'SCHOOL_EVENTS' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#111111] via-[#1E1E1E] to-[#2A2A2A] text-white p-5 rounded-3xl shadow-md space-y-2">
              <h2 className="text-xl font-bold">School Celebrations</h2>
              <p className="text-xs text-gray-300">Annual functions, sports meets, and official celebrations.</p>
            </div>
          </div>
        )}

        {/* MODULE 6: PHOTO GALLERY & MEMORIES */}
        {activeTab === 'MEMORIES' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-[#E5E7EB] shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#111111]">Photo Gallery & Memories</h2>
                <p className="text-xs text-gray-500">Relive old photos & reunion memories</p>
              </div>
              <button onClick={() => setUploadModalOpen(true)} className="px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-[#F4C542]" /><span>Upload</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {memories.map(mem => (
                <div key={mem.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
                  <img src={mem.image_url} alt="" className="w-full h-36 object-cover" />
                  <div className="p-2.5 text-xs"><h4 className="font-bold text-[#111111] truncate">{mem.title}</h4></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 7: DOCUMENTS & CERTIFICATES */}
        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-[#E5E7EB] shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#111111]">Certificates & Documents</h2>
                <p className="text-xs text-gray-500">Digital card & official requisitions to school</p>
              </div>
              <button onClick={() => setShowDocReqModal(true)} className="px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-bold flex items-center space-x-1">
                <Send className="w-3.5 h-3.5 text-[#F4C542]" /><span>Request Doc</span>
              </button>
            </div>
          </div>
        )}

        {/* MODULE 8: MENTORSHIP NETWORK */}
        {activeTab === 'MENTORSHIP' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-4 rounded-3xl border border-[#E5E7EB] shadow-xs flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-[#111111]">Mentorship Network</h2>
                <p className="text-xs text-gray-500">Connect with senior alumni for career guidance</p>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 9: COMMUNITY FORUMS */}
        {activeTab === 'COMMUNITY' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-[#E5E7EB] shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#111111]">Community Forums</h2>
                <p className="text-xs text-gray-500">Share updates and discuss with batchmates</p>
              </div>
              <button onClick={() => setShowCreatePostModal(true)} className="px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-bold flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5 text-[#F4C542]" /><span>Post</span>
              </button>
            </div>
          </div>
        )}

        {/* MODULE 10: NOTIFICATIONS STREAM */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-4 rounded-3xl border border-[#E5E7EB] shadow-xs">
              <h2 className="text-base font-bold text-[#111111]">Notifications Stream</h2>
            </div>
          </div>
        )}

        {/* MODULE 11: PROFILE MANAGEMENT */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-4 animate-fadeIn text-xs">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-[#E5E7EB] shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#111111]">My Alumni Profile</h2>
              </div>
              <button onClick={handleSaveProfile} disabled={isSavingProfile} className="px-4 py-2 bg-[#111111] text-white rounded-xl font-bold">
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* MODULE 12: ACCOUNT & SECURITY SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="space-y-4 animate-fadeIn text-xs">
            <div className="bg-white p-4 rounded-3xl border border-[#E5E7EB] shadow-xs">
              <h2 className="text-base font-bold text-[#111111]">Account & Security Settings</h2>
            </div>
          </div>
        )}

        {/* MODULE 13: ANNOUNCEMENTS */}
        {activeTab === 'ANNOUNCEMENTS' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-4 rounded-3xl border border-[#E5E7EB] shadow-xs">
              <h2 className="text-base font-bold text-[#111111]">Official Announcements</h2>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM TAB NAVIGATION BAR */}
      <nav className="bg-white border-t border-[#E5E7EB] px-2 py-1.5 flex items-center justify-around sticky bottom-0 z-30 shadow-lg">
        {[
          { id: 'HOME', label: 'Home', icon: Home },
          { id: 'DIRECTORY', label: 'Directory', icon: CompassIcon },
          { id: 'EVENTS', label: 'Events', icon: Calendar },
          { id: 'BATCH', label: 'Batch', icon: Users },
          { id: 'MORE', label: 'Menu', icon: Menu }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'MORE' && drawerOpen);
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'MORE') {
                  setDrawerOpen(true);
                } else {
                  setActiveTab(tab.id as any);
                  setDrawerOpen(false);
                }
              }}
              className={`flex flex-col items-center py-1 px-3.5 rounded-2xl transition-all ${
                isActive ? 'text-[#111111] font-bold scale-105' : 'text-[#6B7280] font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl ${isActive ? 'bg-[#FFF7D6] text-[#111111]' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};

// Helper icon components
const CompassIcon: React.FC<{ className?: string }> = ({ className }) => <Compass className={className} />;
const GraduationCapIcon: React.FC<{ className?: string }> = ({ className }) => <GraduationCap className={className} />;

const Compass: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
    <path strokeWidth="2" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>
  </svg>
);

const GraduationCap: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth="2" d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path strokeWidth="2" d="M6 12v5c0 2 6 2 6 2s6 0 6-2v-5"/>
  </svg>
);
