import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Phone, User, GraduationCap, Building2, MapPin, 
  KeyRound, ArrowRight, CheckCircle2, Lock, Camera, Globe, Briefcase, 
  BookOpen, ArrowLeft, Upload, Check, Eye, EyeOff, Info, Plus
} from 'lucide-react';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';

export const AlumniRegister: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email & Verification State (Step 1)
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [accountAlreadyExists, setAccountAlreadyExists] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  // Create Password State (Step 2)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 3 — Personal Details
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [mobilePrefix, setMobilePrefix] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [currentCity, setCurrentCity] = useState('');

  // Step 4 — Alumni Academic Details
  const [degree, setDegree] = useState('');
  const [stream, setStream] = useState('');
  const [joiningYear, setJoiningYear] = useState('');
  const [passingYear, setPassingYear] = useState('');

  // Step 5 — Professional & Additional Details
  const [chapter, setChapter] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [totalExperience, setTotalExperience] = useState('');
  const [industries, setIndustries] = useState('');
  const [skills, setSkills] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  const [otherCollege, setOtherCollege] = useState('');
  const [otherDegree, setOtherDegree] = useState('');
  const [otherStream, setOtherStream] = useState('');
  const [otherPassingYear, setOtherPassingYear] = useState('');
  const [showExtraEducation, setShowExtraEducation] = useState(false);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pinCode, setPinCode] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setOtpSent(true);
      setShowEmailInput(true);
      if (location.state?.resumeStep) {
        setStep(location.state.resumeStep as any);
      }
      if (location.state?.hasPassword) {
        setHasExistingPassword(true);
      }
      if (location.state?.fullName) {
        setFullName(location.state.fullName);
      }
      if (location.state?.profilePhotoUrl) {
        setProfilePhotoUrl(location.state.profilePhotoUrl);
      }
      if (location.state?.isGoogleAuth) {
        setIsGoogleAuth(true);
      }
    }

    // Prefill completed steps draft data if user session token exists
    if (api.getToken()) {
      api.getProfile()
        .then((p: any) => {
          if (p) {
            if (p.email) {
              setEmail(p.email);
              setOtpSent(true);
              setShowEmailInput(true);
            }
            if (p.full_name) setFullName(p.full_name);
            if (p.profile_photo_url) setProfilePhotoUrl(p.profile_photo_url);
            if (p.mobile) setMobile(p.mobile.replace(/^\+91\s?/, ''));
            if (p.current_city || p.city) setCurrentCity(p.current_city || p.city);
            if (p.gender) setGender(p.gender);
            if (p.dob) setDob(p.dob);
            if (p.degree) setDegree(p.degree);
            if (p.stream) setStream(p.stream);
            if (p.joining_year) setJoiningYear(String(p.joining_year));
            if (p.passing_year) setPassingYear(String(p.passing_year));
            if (p.chapter) setChapter(p.chapter);
            if (p.company) setCompany(p.company);
            if (p.position) setPosition(p.position);
            if (p.total_experience) setTotalExperience(p.total_experience);
            if (p.industries) setIndustries(p.industries);
            if (p.skills) setSkills(p.skills);

            // Automatically navigate to the resume step if location.state did not specify one
            if (!location.state?.resumeStep) {
              if (p.degree && p.stream) {
                setStep(5);
              } else if (p.full_name && p.mobile) {
                setStep(4);
              } else if (p.email) {
                setStep(3);
              }
            }
          }
        })
        .catch(() => {});
    }

    // Restore local draft fallback
    const savedDraft = localStorage.getItem('alumni_register_draft');
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        if (d.fullName) setFullName(d.fullName);
        if (d.mobile) setMobile(d.mobile);
        if (d.gender) setGender(d.gender);
        if (d.dob) setDob(d.dob);
        if (d.currentCity) setCurrentCity(d.currentCity);
        if (d.degree) setDegree(d.degree);
        if (d.stream) setStream(d.stream);
        if (d.joiningYear) setJoiningYear(d.joiningYear);
        if (d.passingYear) setPassingYear(d.passingYear);
        if (d.company) setCompany(d.company);
        if (d.position) setPosition(d.position);
      } catch (e) {}
    }
  }, [location.state]);

  // Persist form inputs to localStorage draft as user completes steps
  useEffect(() => {
    const draftData = {
      fullName, mobile, gender, dob, currentCity,
      degree, stream, joiningYear, passingYear,
      chapter, company, position, totalExperience, industries, skills
    };
    localStorage.setItem('alumni_register_draft', JSON.stringify(draftData));
  }, [
    fullName, mobile, gender, dob, currentCity,
    degree, stream, joiningYear, passingYear,
    chapter, company, position, totalExperience, industries, skills
  ]);

  // Photo File Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1: Send OTP for Email Signup
  const handleSendEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAccountAlreadyExists(false);

    if (!email || !email.trim() || !email.includes('@')) {
      alertService.showWarning('Email Address Required', 'Please enter a valid email address to receive your OTP verification code.');
      return;
    }
    setLoading(true);
    try {
      // Pass checkAlreadyRegistered = true -> backend checks if user account is already complete
      await api.sendOTP(email, undefined, false, undefined, false, true);
      setOtpSent(true);
    } catch (err: any) {
      if (err.message && (err.message.includes('ACCOUNT_ALREADY_REGISTERED') || err.message.toLowerCase().includes('already registered'))) {
        setAccountAlreadyExists(true);
      } else {
        alertService.handleApiError(err, 'Failed to send verification OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verify OTP and proceed directly to Step 2 (Create Password)
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length < 6) {
      alertService.showWarning('Verification Code Required', 'Please enter the complete 6-digit security code sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.verifyOTP(email, otp);
      if (res.resume_step && res.resume_step > 2) {
        setHasExistingPassword(true);
      }
      setStep(res.resume_step && res.resume_step > 2 ? (res.resume_step as any) : 2);
    } catch (err: any) {
      alertService.handleApiError(err, 'Invalid verification code entered.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Submission: Create / Update Password -> Persist in DB immediately -> Step 3
  const handlePasswordStepNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 6) {
      alertService.showWarning('Password Required', 'Password must be at least 6 characters long to secure your account.');
      return;
    }
    if (password !== confirmPassword) {
      alertService.showWarning('Password Mismatch', 'The passwords entered do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      await api.updatePassword(password);
      setHasExistingPassword(true);
      setStep(3);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to save account password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 Submission: Personal Details -> Step 4 (Alumni Details)
  const handleStep3Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const missing: string[] = [];
    if (!fullName || !fullName.trim()) missing.push('Full Name');
    if (!mobile || !mobile.trim()) missing.push('Mobile Number');
    if (!currentCity || !currentCity.trim()) missing.push('Current City');

    if (missing.length > 0) {
      alertService.showWarning(
        'Required Personal Details Missing',
        `Please complete the following required fields to continue:\n• ${missing.join('\n• ')}`
      );
      return;
    }

    if (mobile.replace(/\D/g, '').length < 10) {
      alertService.showWarning(
        'Invalid Mobile Number',
        'Please enter a valid 10-digit mobile phone number.'
      );
      return;
    }

    setStep(4);
  };

  // Step 4 Submission: Alumni Details -> Step 5 (Professional Details)
  const handleStep4Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const missing: string[] = [];
    if (!degree) missing.push('Degree / Qualification');
    if (!stream) missing.push('Stream / Specialization');
    if (!joiningYear) missing.push('Joining Year');
    if (!passingYear) missing.push('Passing Year');

    if (missing.length > 0) {
      alertService.showWarning(
        'Required Academic Details Missing',
        `Please complete the following required fields to continue:\n• ${missing.join('\n• ')}`
      );
      return;
    }

    if (parseInt(joiningYear) > parseInt(passingYear)) {
      alertService.showWarning(
        'Invalid Academic Timeline',
        'Joining Year cannot be later than Passing Year. Please check your batch years.'
      );
      return;
    }

    setStep(5);
  };

  // Step 5 Submission: Final Registration
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !mobile || !currentCity || !degree || !stream || !joiningYear || !passingYear) {
      alertService.showWarning(
        'Incomplete Registration Profile',
        'Please review your registration and complete all required fields marked with (*).'
      );
      return;
    }

    setLoading(true);

    try {
      const fullMobile = mobile.startsWith('+') ? mobile : `${mobilePrefix} ${mobile}`.trim();
      const payload = {
        full_name: fullName,
        email: email,
        mobile: fullMobile,
        gender: gender || undefined,
        dob: dob || undefined,
        current_city: currentCity,
        password: password,

        degree: degree,
        stream: stream,
        joining_year: parseInt(joiningYear) || 2006,
        passing_year: parseInt(passingYear) || 2010,
        admission_number: "ADM-" + Math.floor(1000 + Math.random() * 9000),
        section: "A",

        chapter: chapter || undefined,
        company: company || undefined,
        position: position || undefined,
        profession: position || "Alumnus",
        total_experience: totalExperience || undefined,
        industries: industries || undefined,
        skills: skills || undefined,
        profile_photo_url: profilePhotoUrl || undefined,

        other_college: otherCollege || undefined,
        other_degree: otherDegree || undefined,
        other_stream: otherStream || undefined,
        other_passing_year: otherPassingYear ? parseInt(otherPassingYear) : undefined,

        address: address || undefined,
        city: city || currentCity,
        state: state || undefined,
        country: country || "India",
        linkedin_url: linkedinUrl || undefined
      };

      await api.register(payload);
      await alertService.showSuccess(
        'Registration Submitted Successfully!',
        'Your alumni profile has been registered and submitted for verification. Redirecting to dashboard...'
      );
      navigate('/alumni');
    } catch (err: any) {
      alertService.handleApiError(err, 'Registration submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentYearNum = new Date().getFullYear();
  const yearOptions = Array.from({ length: 60 }, (_, i) => currentYearNum - i);
  const progressPercent = Math.round((step / 5) * 100);

  const stepsList = [
    { num: 1, label: 'Sign Up', sub: 'Verify Email OTP' },
    { num: 2, label: hasExistingPassword ? 'Change Password' : 'Create Password', sub: hasExistingPassword ? 'Update account password' : 'Set account password' },
    { num: 3, label: 'Personal Details', sub: 'Basic information' },
    { num: 4, label: 'Alumni Details', sub: 'Education history' },
    { num: 5, label: 'Professional Details', sub: 'Work & additional info' },
  ];

  return (
    <div className="bg-[#FAFAFA] text-[#111111] pt-4 sm:pt-6 pb-4 animate-fadeIn font-normal">
      
      {/* Main Container: LEFT Sticky Sidebar (lg:col-span-4) & RIGHT Form Card (lg:col-span-8) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Sticky Progress & Navigation Sidebar */}
          <div className="lg:col-span-4 sticky top-28 space-y-5">
            
            {/* Registration Progress Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#111111] tracking-wide">Registration Progress</h3>
                <span className="text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3 py-1 rounded-full">
                  {progressPercent}%
                </span>
              </div>

              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#F4C542] transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Step Status Checklist */}
              <div className="space-y-2 pt-2">
                {stepsList.map((s) => {
                  const isDone = step > s.num;
                  const isCurrent = step === s.num;

                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => {
                        if (isDone) setStep(s.num as any);
                      }}
                      disabled={!isDone}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-[#FFF7D6] border-[#F4C542] text-[#854D0E] shadow-xs'
                          : isDone
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 cursor-pointer hover:bg-emerald-100/60'
                          : 'bg-gray-50/50 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-normal ${
                          isCurrent
                            ? 'bg-[#F4C542] text-[#111111]'
                            : isDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                        </div>
                        <span className="text-sm font-medium truncate">{s.label}</span>
                      </div>

                      {isDone && <span className="text-xs font-normal text-emerald-700 underline">Edit</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Official Network Assurance Box */}
            <div className="bg-gradient-to-br from-[#FFF7D6] to-amber-50 border border-[#F4C542] rounded-2xl p-5 shadow-md space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#854D0E]" />
                <h4 className="text-sm font-medium text-[#854D0E]">Official Alumni Network</h4>
              </div>
              <p className="text-xs sm:text-sm text-[#854D0E] leading-relaxed font-normal">
                Your information is protected and encrypted. All alumni registrations are reviewed and verified by your school administration.
              </p>
            </div>

            {/* Live Draft Profile Summary Widget */}
            {(fullName || email || company) && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-lg space-y-3">
                <h4 className="text-sm font-medium text-[#111111] border-b border-gray-100 pb-2">
                  Draft Profile Summary
                </h4>
                <div className="space-y-2 text-xs sm:text-sm font-normal">
                  {fullName && <p className="font-medium text-[#111111] text-base">{fullName}</p>}
                  {email && <p className="text-gray-600 truncate">{email}</p>}
                  {mobile && <p className="text-gray-600">{mobilePrefix} {mobile}</p>}
                  {passingYear && <p className="text-gray-600">Batch of {passingYear} • {degree || 'Alumnus'}</p>}
                  {company && <p className="text-gray-600">{position ? `${position} at ` : ''}{company}</p>}
                  {currentCity && <p className="text-gray-500">📍 {currentCity}</p>}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Main Registration Form Card (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 shadow-xl space-y-7">

            {/* Header Title */}
            <div className="border-b border-[#E5E7EB] pb-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-normal text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1 rounded-lg uppercase tracking-wider">
                  Step {step} of 5
                </span>
                <h1 className="text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight mt-2">
                  {step === 1 && 'Sign Up — Create your account'}
                  {step === 2 && (hasExistingPassword ? 'Change Password — Update your account security' : 'Create Password — Set your account security')}
                  {step === 3 && 'Personal Details — Tell us about yourself'}
                  {step === 4 && 'Alumni Details — Education history'}
                  {step === 5 && 'Professional & Additional Details — Work & contact details'}
                </h1>
              </div>

              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="inline-flex items-center space-x-1 px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-normal text-gray-700 bg-white hover:bg-gray-50 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm font-normal text-rose-700">
                {error}
              </div>
            )}

            {/* Account Already Registered Sweet Alert */}
            {accountAlreadyExists && (
              <div className="p-5 bg-[#FFF7D6] border border-[#F4C542] rounded-xl space-y-3 shadow-xs animate-fadeIn">
                <div className="flex items-start space-x-3 text-[#854D0E]">
                  <CheckCircle2 className="w-6 h-6 shrink-0 text-[#854D0E] mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-wider">Account Already Registered</h4>
                    <p className="text-xs text-gray-800 mt-1 leading-relaxed font-normal">
                      An account for <strong>{email}</strong> is already registered and active in our system. You can directly log in using your account password.
                    </p>
                  </div>
                </div>
                <Link
                  to="/login"
                  className="w-full py-3 bg-[#111111] hover:bg-black text-white font-medium text-xs rounded-xl flex items-center justify-center space-x-2 border border-[#111111] shadow-sm uppercase tracking-wider transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F4C542]" />
                  <span>Go to Login Page Now →</span>
                </Link>
              </div>
            )}

            {/* Success Notice */}
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs sm:text-sm font-normal text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* STEP 1: Sign Up (Verify Email OTP) */}
            {step === 1 && (
              <div className="space-y-6 py-2 max-w-md mx-auto animate-fadeIn">
                
                {!showEmailInput && !otpSent ? (
                  /* Initial View: Google & Email Options */
                  <div className="space-y-5">
                    <button
                      type="button"
                      onClick={() => {
                        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
                        window.location.href = `${apiBase}/auth/google/login`;
                      }}
                      className="w-full py-4 px-6 bg-white border border-[#E5E7EB] hover:border-[#111111] rounded-xl font-medium text-base text-[#111111] flex items-center justify-center space-x-3 shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <div className="relative py-2 flex items-center justify-center">
                      <div className="border-t border-[#E5E7EB] w-full" />
                      <span className="bg-white px-3 text-xs font-normal text-gray-400 uppercase tracking-wider">OR</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowEmailInput(true)}
                      className="w-full py-4 px-6 bg-white border border-[#E5E7EB] hover:border-[#F4C542] rounded-xl font-medium text-base text-[#111111] flex items-center justify-center space-x-3 shadow-xs hover:shadow-md transition-all"
                    >
                      <Mail className="w-6 h-6 text-[#854D0E] shrink-0" />
                      <span>Sign up with Email</span>
                    </button>
                  </div>
                ) : !otpSent ? (
                  /* Dedicated Email Entry View */
                  <form onSubmit={handleSendEmailOTP} className="space-y-5 bg-gray-50 border border-[#E5E7EB] rounded-2xl p-6 shadow-sm animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                      <div>
                        <h3 className="text-base font-medium text-[#111111]">Sign Up with Email</h3>
                        <p className="text-xs text-gray-500 font-normal mt-0.5">We will send a 6-digit OTP code to your email</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEmailInput(false)}
                        className="text-xs font-normal text-[#854D0E] hover:underline"
                      >
                        ← Back
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030]"
                    >
                      <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  /* Dedicated OTP Code Verification View */
                  <form onSubmit={handleVerifyOTP} className="space-y-5 bg-[#FFF7D6]/60 border border-[#F4C542] rounded-2xl p-6 shadow-sm animate-fadeIn">
                    <div>
                      <h3 className="text-base font-medium text-[#111111]">Verify Email OTP</h3>
                      <p className="text-xs text-[#854D0E] font-normal mt-1">
                        6-digit verification code sent to <strong>{email}</strong>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">
                        6-Digit Security Code <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-xl font-mono font-normal text-[#111111] tracking-widest focus:outline-none focus:border-[#F4C542]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <button
                        type="button"
                        onClick={() => api.sendOTP(email)}
                        className="font-medium text-[#854D0E] hover:underline"
                      >
                        Resend OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setShowEmailInput(true);
                        }}
                        className="font-normal text-gray-500 hover:text-[#111111] underline"
                      >
                        Change Email
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030]"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#111111]" />
                      <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                    </button>
                  </form>
                )}

                <div className="p-4 bg-gray-50 border border-[#E5E7EB] rounded-xl text-center text-xs sm:text-sm font-normal text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-[#854D0E] underline ml-1">
                    Login here
                  </Link>
                </div>

              </div>
            )}

            {/* STEP 2: Create / Modify Password Step */}
            {step === 2 && (
              hasExistingPassword ? (
                <div className="space-y-6 max-w-md mx-auto animate-fadeIn">
                  <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 shadow-xs">
                    <div className="flex items-center space-x-3 text-emerald-900">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium uppercase tracking-wider">Password Already Created</h4>
                        <p className="text-xs text-emerald-800 mt-0.5 font-normal">
                          Your login password for <strong>{email}</strong> is already set up and secured.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Change Password Form */}
                  <form onSubmit={handlePasswordStepNext} className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-[#111111] border-b border-gray-200 pb-1">
                        Change Password
                      </h3>
                      <button
                        type="button"
                        onClick={() => alertService.showInfo('Password Reset Instructions', 'Password reset instructions have been sent to your registered email address.')}
                        className="text-xs font-normal text-[#854D0E] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new account password"
                          minLength={6}
                          className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new account password"
                          minLength={6}
                          className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        type="submit"
                        className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030]"
                      >
                        <span>Update Password & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="w-full py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-normal text-sm rounded-xl border border-[#E5E7EB] transition-all text-center"
                      >
                        Skip Password Change & Continue →
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <form onSubmit={handlePasswordStepNext} className="space-y-6 max-w-md mx-auto animate-fadeIn">
                  <div className="p-4 bg-[#FFF7D6]/70 border border-[#F4C542] rounded-xl text-xs sm:text-sm text-[#854D0E] flex items-start space-x-2.5 font-normal">
                    <ShieldCheck className="w-5 h-5 text-[#854D0E] shrink-0 mt-0.5" />
                    <div>
                      <span>Email verified cleanly for <strong>{email}</strong>. Please set a secure password to protect your account.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create account password"
                        required
                        minLength={6}
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter account password"
                        required
                        minLength={6}
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 font-normal">
                    ℹ️ Password must be at least 6 characters long.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030]"
                  >
                    <span>Continue to Personal Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )
            )}

            {/* STEP 3: Personal Details */}
            {step === 3 && (
              <form onSubmit={handleStep3Next} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={mobilePrefix}
                        onChange={(e) => setMobilePrefix(e.target.value)}
                        className="w-24 px-3 py-3.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111]"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+971">+971</option>
                      </select>
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter mobile number"
                        required
                        className="flex-1 px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-normal text-[#111111] mb-2">
                    Current City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    placeholder="Enter your current city"
                    required
                    className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all border border-[#E0B030]"
                >
                  Continue to Alumni Details
                </button>
              </form>
            )}

            {/* STEP 4: Alumni Academic Details */}
            {step === 4 && (
              <form onSubmit={handleStep4Next} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      Degree <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    >
                      <option value="">Select degree</option>
                      <option value="Higher Secondary (12th)">Higher Secondary (12th)</option>
                      <option value="High School (10th)">High School (10th)</option>
                      <option value="B.E. / B.Tech">B.E. / B.Tech</option>
                      <option value="B.Sc / M.Sc">B.Sc / M.Sc</option>
                      <option value="B.Com / M.Com">B.Com / M.Com</option>
                      <option value="Diploma / Other">Diploma / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      Stream <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    >
                      <option value="">Select stream</option>
                      <option value="Science / Mathematics">Science / Mathematics</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Commerce & Accounts">Commerce & Accounts</option>
                      <option value="Arts & Humanities">Arts & Humanities</option>
                      <option value="Electrical / Electronics">Electrical / Electronics</option>
                      <option value="Mechanical / Civil">Mechanical / Civil</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      Joining Year <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={joiningYear}
                      onChange={(e) => setJoiningYear(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    >
                      <option value="">Select year</option>
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      Passing Year / Batch <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={passingYear}
                      onChange={(e) => setPassingYear(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    >
                      <option value="">Select year</option>
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-[#FFF7D6]/70 border border-[#F4C542] rounded-xl text-xs sm:text-sm text-[#854D0E] flex items-center space-x-2 font-normal">
                  <Info className="w-5 h-5 text-[#854D0E] shrink-0" />
                  <span>Your batch cohort will be automatically displayed based on your selected passing year.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all border border-[#E0B030]"
                >
                  Continue to Professional Details
                </button>
              </form>
            )}

            {/* STEP 5: Professional & Additional Details */}
            {step === 5 && (
              <form onSubmit={handleFinalRegister} className="space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">Chapter / City</label>
                    <select
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    >
                      <option value="">Select chapter / city</option>
                      <option value="Chennai Chapter">Chennai Chapter</option>
                      <option value="Bengaluru Chapter">Bengaluru Chapter</option>
                      <option value="Hyderabad Chapter">Hyderabad Chapter</option>
                      <option value="Mumbai Chapter">Mumbai Chapter</option>
                      <option value="Delhi NCR Chapter">Delhi NCR Chapter</option>
                      <option value="International Alumni">International Alumni</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">Company / Organization</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Enter company name"
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">Position / Role</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Enter your role"
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">Total Experience (Years)</label>
                    <select
                      value={totalExperience}
                      onChange={(e) => setTotalExperience(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    >
                      <option value="">Select experience</option>
                      <option value="0 - 2 Years">0 - 2 Years</option>
                      <option value="2 - 5 Years">2 - 5 Years</option>
                      <option value="5 - 10 Years">5 - 10 Years</option>
                      <option value="10+ Years">10+ Years</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">Industries</label>
                    <input
                      type="text"
                      value={industries}
                      onChange={(e) => setIndustries(e.target.value)}
                      placeholder="Select or enter industries"
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">Professional Skills</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="Select or enter skills"
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>
                </div>

                {/* Upload Photograph Box */}
                <div>
                  <label className="block text-sm font-normal text-[#111111] mb-2">Photograph</label>
                  <div className="border-2 border-dashed border-[#E5E7EB] hover:border-[#F4C542] rounded-2xl p-6 text-center bg-gray-50 flex flex-col items-center justify-center space-y-2 relative transition-all">
                    {profilePhotoUrl ? (
                      <div className="flex flex-col items-center space-y-2">
                        <img src={profilePhotoUrl} alt="Photograph Preview" className="w-20 h-20 rounded-xl object-cover border-2 border-[#F4C542] shadow-sm" />
                        <span className="text-xs font-medium text-emerald-700">Photo Attached Cleanly</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-[#FFF7D6] rounded-full flex items-center justify-center text-[#854D0E] border border-[#F4C542]">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-sm font-normal text-[#111111]">Upload Photo</span>
                          <p className="text-xs text-gray-500 font-normal">JPG, PNG (Max. 2MB)</p>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Other Education */}
                <div className="space-y-5 pt-2">
                  <h3 className="text-sm font-medium text-[#854D0E] uppercase tracking-wider border-b border-gray-200 pb-2">
                    Other Education
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">College / Institution</label>
                      <input
                        type="text"
                        value={otherCollege}
                        onChange={(e) => setOtherCollege(e.target.value)}
                        placeholder="Enter institution name"
                        className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">Degree</label>
                      <input
                        type="text"
                        value={otherDegree}
                        onChange={(e) => setOtherDegree(e.target.value)}
                        placeholder="Enter degree"
                        className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">Stream</label>
                      <input
                        type="text"
                        value={otherStream}
                        onChange={(e) => setOtherStream(e.target.value)}
                        placeholder="Enter stream"
                        className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">Passing Year</label>
                      <select
                        value={otherPassingYear}
                        onChange={(e) => setOtherPassingYear(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      >
                        <option value="">Select year</option>
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowExtraEducation(true)}
                    className="inline-flex items-center space-x-1 text-xs sm:text-sm font-normal text-[#854D0E] hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Education</span>
                  </button>
                </div>

                {/* Contact Details */}
                <div className="space-y-5 pt-2">
                  <h3 className="text-sm font-medium text-[#854D0E] uppercase tracking-wider border-b border-gray-200 pb-2">
                    Contact Details
                  </h3>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your address"
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city"
                        className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Enter state"
                        className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">Country</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-[#111111] mb-2">PIN / ZIP Code</label>
                      <input
                        type="text"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="Enter PIN code"
                        className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">LinkedIn Profile (Optional)</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="Enter LinkedIn profile URL"
                      className="w-full px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#10B981] hover:bg-[#059669] text-white font-medium text-base rounded-xl shadow-lg transition-all border border-[#059669] flex items-center justify-center space-x-2 mt-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>{loading ? 'Submitting Registration...' : 'Complete Registration'}</span>
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
