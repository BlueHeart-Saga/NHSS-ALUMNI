import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, Mail, Phone, KeyRound, ArrowRight, UserX, UserPlus,
  Users, Calendar, Image, Lock, CheckCircle2, Eye, EyeOff, ArrowLeft, Loader2, X
} from 'lucide-react';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import { getAssetUrl } from '../../utils/asset';

import { getRedirectPathForRoles } from '../../utils/roleRedirect';

export const AlumniLogin: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, logoUrl } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [passwordNotCreated, setPasswordNotCreated] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(false);
  const topBannerTimer = React.useRef<any>(null);

  const triggerPasswordNotCreatedBanner = () => {
    setPasswordNotCreated(true);
    setShowTopBanner(true);
    if (topBannerTimer.current) {
      clearTimeout(topBannerTimer.current);
    }
    topBannerTimer.current = setTimeout(() => {
      setShowTopBanner(false);
    }, 4500); // Smoothly auto-hides after 4.5 seconds
  };
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [schoolName, setSchoolName] = useState('School Alumni Network');
  const [schoolLogo, setSchoolLogo] = useState('');

  // Forgot Password & Create Password Module State
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT_PASSWORD' | 'CREATE_PASSWORD'>('LOGIN');
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP' | 'RESET'>('EMAIL');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Create Password In-Place Module State
  const [createPassStep, setCreatePassStep] = useState<'VERIFY_OTP' | 'NEW_PASSWORD'>('VERIFY_OTP');
  const [createPassOtp, setCreatePassOtp] = useState('');
  const [createPassPassword, setCreatePassPassword] = useState('');
  const [createPassConfirm, setCreatePassConfirm] = useState('');
  const [showCreatePassPassword, setShowCreatePassPassword] = useState(false);
  const [showCreatePassConfirm, setShowCreatePassConfirm] = useState(false);
  // Live Password Status Check State
  const [liveCheckStatus, setLiveCheckStatus] = useState<'IDLE' | 'CHECKING' | 'EXISTS_HAS_PASSWORD' | 'EXISTS_NO_PASSWORD' | 'NOT_EXISTS'>('IDLE');
  const [liveCheckInfo, setLiveCheckInfo] = useState<{ full_name?: string; identifier?: string } | null>(null);
  const checkedSet = React.useRef(new Set<string>());

  const handleIdentifierCheck = async (val: string) => {
    const clean = val.trim();
    if (!clean) {
      setLiveCheckStatus('IDLE');
      setLiveCheckInfo(null);
      return;
    }

    const digitsOnly = clean.replace(/\D/g, '');
    const isMobile10 = digitsOnly.length === 10 || (digitsOnly.length === 12 && digitsOnly.startsWith('91'));
    const isEmail = clean.includes('@') && clean.includes('.');

    if (!isMobile10 && !isEmail) {
      setLiveCheckStatus('IDLE');
      setLiveCheckInfo(null);
      return;
    }

    setLiveCheckStatus('CHECKING');

    try {
      const res = await api.checkPasswordStatus(clean);
      if (res.exists) {
        setLiveCheckInfo({ full_name: res.full_name, identifier: res.identifier });
        if (!res.has_password) {
          setLiveCheckStatus('EXISTS_NO_PASSWORD');
          triggerPasswordNotCreatedBanner();

          if (!checkedSet.current.has(clean)) {
            checkedSet.current.add(clean);
            const confirm = await alertService.showConfirm(
              language === 'ta' ? 'கடவுச்சொல் அமைக்கப்படவில்லை' : 'Create Account Password',
              language === 'ta'
                ? `வணக்கம் ${res.full_name || ''}, உங்கள் கணக்கில் (${res.identifier || clean}) இன்னும் கடவுச்சொல் உருவாக்கப்படவில்லை. OTP சரிபார்ப்பு மூலம் புதிய கடவுச்சொல்லை உருவாக்கி உள்நுழையவும்.`
                : `Hello ${res.full_name || ''}, your account (${res.identifier || clean}) is registered but does not have a login password set yet. Please verify your phone number via OTP to create a password and log in.`,
              language === 'ta' ? 'OTP பெற்று கடவுச்சொல் உருவாக்க →' : 'Verify OTP & Create Password →',
              language === 'ta' ? 'ரத்துசெய்' : 'Cancel'
            );
            if (confirm) {
              handleStartCreatePassword(res.identifier || clean);
            }
          }
        } else {
          setLiveCheckStatus('EXISTS_HAS_PASSWORD');
        }
      } else {
        setLiveCheckStatus('NOT_EXISTS');
        setLiveCheckInfo(null);
      }
    } catch (err) {
      setLiveCheckStatus('IDLE');
    }
  };

  useEffect(() => {
    api.getPublicStats()
      .then((s) => {
        if (s.school_name) setSchoolName(s.school_name);
        if (s.logo_url) setSchoolLogo(s.logo_url);
      })
      .catch(() => { });

    // Auto-redirect if user is already authenticated
    if (api.getToken()) {
      api.getMe()
        .then((u) => {
          if (u && u.roles) {
            const target = getRedirectPathForRoles(u.roles, u.verification_status === 'NOT_REGISTERED');
            navigate(target);
          }
        })
        .catch(() => { });
    }
  }, [navigate]);

  // Direct Login: Authenticate via Mobile/Email & Password directly
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUserNotFound(false);
    setPasswordNotCreated(false);

    const identifier = email.trim();
    if (!identifier) {
      setError(language === 'ta' ? 'தயவுசெய்து உங்கள் கைபேசி எண் அல்லது மின்னஞ்சலை உள்ளிடுங்கள்.' : 'Please enter your registered mobile number or email address.');
      return;
    }

    setLoading(true);

    try {
      // If password field is left empty, attempt check to see if user has a password in DB
      const passwordToSubmit = password ? password : 'CHECK_PASSWORD_STATUS';
      const res = await api.login(identifier, passwordToSubmit, rememberMe);
      const targetPath = getRedirectPathForRoles(res.roles, res.registration_required);

      if (targetPath === '/register') {
        navigate('/register', {
          state: {
            email: identifier,
            user_id: res.user_id,
            resumeStep: res.resume_step || 2
          }
        });
      } else {
        if (targetPath === '/developer') {
          alertService.showSuccess('Developer Authenticated', 'Welcome to the Platform Developer Portal!');
        } else if (targetPath === '/school-admin') {
          alertService.showSuccess('School Admin Login Verified', 'Welcome back to your School Admin Dashboard!');
        } else {
          alertService.showSuccess(
            language === 'ta' ? 'உள்நுழைவு வெற்றி' : 'Login Successful',
            language === 'ta' ? 'மீண்டும் வருக!' : 'Welcome back to your alumni profile!'
          );
        }
        navigate(targetPath);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('ACCOUNT_PENDING_ACTIVATION')) {
        setError(
          language === 'ta'
            ? 'உங்கள் கணக்கு இன்னும் செயல்படுத்தப்படவில்லை. உங்கள் கைபேசிக்கு அனுப்பப்பட்ட SMS இணைப்பு மூலம் கணக்கை செயல்படுத்தவும்.'
            : 'Your account is pending activation. Please use the invitation link sent to your mobile phone via SMS to set your password.'
        );
      } else if (err.message && (err.message.includes('PASSWORD_NOT_CREATED') || err.message.toLowerCase().includes('not have a login password'))) {
        triggerPasswordNotCreatedBanner();
        setLoading(false);

        // SweetAlert2 popup alerting the user to create a password via OTP
        const confirm = await alertService.showConfirm(
          language === 'ta' ? 'கடவுச்சொல் அமைக்கப்படவில்லை' : 'Create Account Password',
          language === 'ta'
            ? `உங்கள் கணக்கில் (${identifier}) இன்னும் கடவுச்சொல் உருவாக்கப்படவில்லை. OTP சரிபார்ப்பு மூலம் புதிய கடவுச்சொல்லை உருவாக்கி உள்நுழையவும்.`
            : `Your account (${identifier}) does not have a login password set yet. Please verify your phone number via OTP to create a password and log in.`,
          language === 'ta' ? 'OTP பெற்று கடவுச்சொல் உருவாக்க →' : 'Verify OTP & Create Password →',
          language === 'ta' ? 'ரத்துசெய்' : 'Cancel'
        );

        if (confirm) {
          handleStartCreatePassword(identifier);
        }
      } else if (!password && err.message && (err.message.includes('Incorrect password') || err.message.includes('provide your account password'))) {
        setError(language === 'ta' ? 'தயவுசெய்து உங்கள் கடவுச்சொல்லை உள்ளிடுங்கள்.' : 'Please enter your account password.');
      } else if (err.message && (err.message.toLowerCase().includes('not found') || err.message.toLowerCase().includes('register'))) {
        setUserNotFound(true);
      } else {
        setError(err.message || (language === 'ta' ? 'உள்நுழைய முடியவில்லை. கடவுச்சொல்லை சரிபார்க்கவும்.' : 'Failed to log in. Please check your credentials and try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Submission: Verify OTP & Log In
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length < 6) {
      setError(language === 'ta' ? 'தயவுசெய்து 6-இலக்க OTP-ஐ உள்ளிடுங்கள்.' : 'Please enter the 6-digit security verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.verifyOTP(email, otp);
      const targetPath = getRedirectPathForRoles(res.roles, res.registration_required);

      if (targetPath === '/register') {
        navigate('/register', {
          state: {
            email: email,
            user_id: res.user_id,
            resumeStep: res.resume_step || 2
          }
        });
      } else {
        if (targetPath === '/developer') {
          alertService.showSuccess('Developer Authenticated', 'Welcome to the Platform Developer Portal!');
        } else if (targetPath === '/school-admin') {
          alertService.showSuccess('School Admin Login Verified', 'Welcome back to your School Admin Dashboard!');
        }
        navigate(targetPath);
      }
    } catch (err: any) {
      setError(err.message || (language === 'ta' ? 'தவறான OTP. மீண்டும் முயற்சிக்கவும்.' : 'Invalid verification code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // --- Forgot Password Workflow Handlers ---

  // Forgot Step 1: Check Email in DB & Send Reset OTP
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.trim()) {
      alertService.showWarning(
        language === 'ta' ? 'கைபேசி எண் தேவை' : 'Identifier Required',
        language === 'ta' ? 'தயவுசெய்து உங்கள் பதிவு செய்யப்பட்ட கைபேசி எண் அல்லது மின்னஞ்சலை உள்ளிடுங்கள்.' : 'Please enter your registered mobile number or email address.'
      );
      return;
    }

    setLoading(true);
    try {
      // Pass forPasswordReset = true -> backend checks if identifier exists in DB
      await api.sendOTP(email, undefined, false, undefined, true);
      alertService.showInfo(
        language === 'ta' ? 'OTP அனுப்பப்பட்டது' : 'Reset Code Sent',
        language === 'ta'
          ? 'கடவுச்சொல் மாற்றும் 6-இலக்க OTP SMS மூலம் உங்கள் கைபேசிக்கு அனுப்பப்பட்டுள்ளது.'
          : 'A 6-digit password reset verification code has been dispatched via SMS to your registered mobile number.'
      );
      setForgotStep('OTP');
    } catch (err: any) {
      alertService.handleApiError(
        err,
        language === 'ta'
          ? `'${email}' என்ற கணக்கு எதுவும் இல்லை. தயவுசெய்து சரிபார்க்கவும்.`
          : `No alumni profile found matching '${email}'. Please check your registered credentials.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Forgot Step 2: Verify Reset OTP Code
  const handleForgotOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotOtp || forgotOtp.length < 6) {
      alertService.showWarning(
        language === 'ta' ? 'OTP தேவை' : 'OTP Code Required',
        language === 'ta' ? 'தயவுசெய்து 6-இலக்க OTP-ஐ உள்ளிடுங்கள்.' : 'Please enter the complete 6-digit security code.'
      );
      return;
    }

    setLoading(true);
    try {
      await api.verifyOTP(email, forgotOtp);
      setForgotStep('RESET');
    } catch (err: any) {
      alertService.handleApiError(
        err,
        language === 'ta' ? 'தவறான OTP. மீண்டும் முயற்சிக்கவும்.' : 'Invalid reset verification code entered.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Forgot Step 3: Save New Password in DB
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      alertService.showWarning(
        language === 'ta' ? 'கடவுச்சொல் சிறியது' : 'Password Too Short',
        language === 'ta' ? 'புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.' : 'New password must be at least 6 characters long.'
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alertService.showWarning(
        language === 'ta' ? 'கடவுச்சொல் பொருந்தவில்லை' : 'Password Mismatch',
        language === 'ta' ? 'இரு கடவுச்சொற்களும் பொருந்தவில்லை.' : 'The new passwords entered do not match.'
      );
      return;
    }

    setLoading(true);
    try {
      try {
        await api.updatePassword(newPassword);
      } catch (updateErr) {
        const isEmail = email.includes('@');
        await api.resetPasswordWithOTP(
          isEmail ? email : undefined,
          !isEmail ? email : undefined,
          forgotOtp.trim(),
          newPassword
        );
      }
      await alertService.showSuccess(
        language === 'ta' ? 'கடவுச்சொல் மாற்றப்பட்டது!' : 'Password Reset Successfully!',
        language === 'ta'
          ? 'உங்கள் கணக்கு கடவுச்சொல் புதுப்பிக்கப்பட்டது. இப்போது புதிய கடவுச்சொல்லுடன் உள்நுழையலாம்.'
          : 'Your account password has been updated. You can now log in with your new password.'
      );
      setPassword(newPassword);
      setMode('LOGIN');
      setStep('CREDENTIALS');
      setForgotStep('EMAIL');
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotOtp('');
    } catch (err: any) {
      alertService.handleApiError(
        err,
        language === 'ta' ? 'கடவுச்சொல்லை மாற்ற முடியவில்லை.' : 'Failed to update account password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Create Password In-Place Workflow Handlers ---
  const handleStartCreatePassword = async (targetIdentifier?: string) => {
    const activeIdentifier = (targetIdentifier || email || '').trim();
    if (!activeIdentifier) {
      setError(
        language === 'ta'
          ? 'தயவுசெய்து உங்கள் பதிவு செய்யப்பட்ட கைபேசி எண் அல்லது மின்னஞ்சலை உள்ளிடுங்கள்.'
          : 'Please enter your registered mobile number or email address.'
      );
      return;
    }

    setError(null);
    setPasswordNotCreated(false);
    setLoading(true);

    try {
      // Send clean OTP to registered mobile number or email after verifying user registration
      await api.sendOTP(activeIdentifier, undefined, false, undefined, true);
      alertService.showInfo(
        language === 'ta' ? 'OTP அனுப்பப்பட்டது' : 'Verification OTP Sent',
        language === 'ta'
          ? 'கடவுச்சொல் உருவாக்க 6-இலக்க OTP SMS மூலம் உங்கள் கைபேசிக்கு அனுப்பப்பட்டுள்ளது.'
          : 'A 6-digit verification code has been dispatched via SMS to your registered mobile number.'
      );
      setMode('CREATE_PASSWORD');
      setCreatePassStep('VERIFY_OTP');
      setCreatePassOtp('');
      setCreatePassPassword('');
      setCreatePassConfirm('');
    } catch (err: any) {
      if (err.message && (err.message.toLowerCase().includes('not found') || err.message.toLowerCase().includes('register'))) {
        setUserNotFound(true);
        setError(null);
      } else {
        setError(err.message || (language === 'ta' ? 'OTP அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Failed to dispatch verification OTP code. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCreatePassOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanOtp = createPassOtp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError(language === 'ta' ? 'தயவுசெய்து 6-இலக்க OTP குறியீட்டை உள்ளிடுங்கள்.' : 'Please enter the 6-digit verification OTP code.');
      return;
    }
    setCreatePassStep('NEW_PASSWORD');
  };

  const handleCreatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = createPassOtp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError(language === 'ta' ? 'தயவுசெய்து 6-இலக்க OTP-ஐ உள்ளிடுங்கள்.' : 'Please enter the 6-digit OTP code.');
      return;
    }
    if (!createPassPassword || createPassPassword.length < 6) {
      setError(language === 'ta' ? 'கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் இருக்க வேண்டும்.' : 'Password must be at least 6 characters long.');
      return;
    }
    if (createPassPassword !== createPassConfirm) {
      setError(language === 'ta' ? 'கடவுச்சொற்கள் பொருந்தவில்லை.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.setPasswordWithOTP(email, cleanOtp, createPassPassword);
      await alertService.showSuccess(
        language === 'ta' ? 'கடவுச்சொல் சேமிக்கப்பட்டது' : 'Password Saved Successfully',
        language === 'ta'
          ? 'உங்கள் கணக்கு கடவுச்சொல் வெற்றிகரமாக உருவாக்கப்பட்டது!'
          : 'Your account password has been created successfully!'
      );

      if (res.access_token) {
        const targetPath = getRedirectPathForRoles(res.roles || ['ALUMNI'], res.registration_required);
        if (targetPath === '/register') {
          navigate('/register', {
            state: {
              email: email,
              user_id: res.user_id,
              resumeStep: res.resume_step || 3
            }
          });
        } else {
          navigate(targetPath);
        }
      } else {
        setMode('LOGIN');
        setStep('CREDENTIALS');
        setPassword(createPassPassword);
      }
    } catch (err: any) {
      setError(err.message || (language === 'ta' ? 'கடவுச்சொல் உருவாக்க முடியவில்லை. OTP சரிபார்க்கவும்.' : 'Failed to save password. Please check your OTP code.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] text-[#111111] pt-2 sm:pt-4 pb-2 animate-fadeIn font-normal relative overflow-hidden">

      {/* Background Premium Dynamic Wave Design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg className="absolute -top-10 -left-24 w-[650px] h-[650px] text-[#F4C542]/20 opacity-80" viewBox="0 0 1000 1000" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M0,100 C300,250 200,450 500,350 C800,250 600,600 0,800" />
          <path d="M0,160 C350,310 250,510 550,410 C850,310 650,710 0,910" />
          <path d="M0,220 C400,370 300,570 600,470 C900,370 700,770 0,970" />
        </svg>

        <svg className="absolute -bottom-20 -left-20 w-[550px] h-[550px] text-[#F4C542]/10" viewBox="0 0 1000 1000" fill="currentColor">
          <path d="M0,1000 C300,800 400,600 500,700 C600,800 700,600 1000,500 L1000,1000 Z" />
        </svg>

        <svg className="absolute -top-32 -right-32 w-[800px] h-[800px] text-[#F4C542]/15" viewBox="0 0 1000 1000" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M1000,0 C700,200 600,400 500,300 C400,200 300,400 0,500" />
          <path d="M1000,50 C750,250 650,450 550,350 C450,250 350,450 0,550" />
          <path d="M1000,100 C800,300 700,500 600,400 C500,300 400,500 0,600" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Sticky School Branding & Value Props */}
          <div className="lg:col-span-6 order-2 lg:order-1 lg:sticky top-28 space-y-6 pr-0 lg:pr-6 mt-6 lg:mt-0">

            {/* Header Branding */}
            {/* <div className="flex items-center space-x-4">
              <img
                src={logoUrl}
                alt="School Crest"
                className="h-14 sm:h-16 w-auto object-contain shrink-0"
              />
              <div>
                <h1 className="text-xl sm:text-3xl font-medium text-[#111111] tracking-tight leading-tight">
                  {t('app_title')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                  {language === 'ta' ? 'இணைந்திருப்போம். முன்னேறுவோம்.' : 'Stay Connected. Stay Together.'}
                </p>
              </div>
            </div> */}

            {/* Accent Yellow Bar */}
            <div className="w-14 h-1 bg-[#F4C542] rounded-full" />

            {/* Welcome Heading */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-normal text-[#111111] tracking-tight">
                {language === 'ta' ? 'அன்போடு வரவேற்கிறோம்!' : 'Welcome Back!'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
                {language === 'ta' ? 'உங்கள் முன்னாள் பள்ளி தோழர்களுடன் மீண்டும் இணைய இப்போதே உள்நுழையுங்கள்.' : 'Login to your account and continue your journey with your alumni community.'}
              </p>
            </div>

            {/* Feature Bullet Cards */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#FFF7D6] rounded-xl flex items-center justify-center text-[#854D0E] border border-[#F4C542] shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-[#111111]">
                    {language === 'ta' ? 'மீண்டும் இணையுங்கள்' : 'Reconnect'}
                  </h4>
                  <p className="text-sm text-gray-500 font-normal">
                    {language === 'ta' ? 'உங்கள் வகுப்புத் தோழர்களைக் கண்டறியுங்கள்' : 'Find and connect with your batchmates'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#FFF7D6] rounded-xl flex items-center justify-center text-[#854D0E] border border-[#F4C542] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-[#111111]">
                    {language === 'ta' ? 'நிகழ்வுகள் & சந்திப்புகள்' : 'Get Involved'}
                  </h4>
                  <p className="text-sm text-gray-500 font-normal">
                    {language === 'ta' ? 'பள்ளி நிகழ்வுகள் பற்றிய தகவல்களைப் பெறுங்கள்' : 'Stay updated with events and activities'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#FFF7D6] rounded-xl flex items-center justify-center text-[#854D0E] border border-[#F4C542] shrink-0">
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-[#111111]">
                    {language === 'ta' ? 'பள்ளி நினைவுகள்' : 'Share Memories'}
                  </h4>
                  <p className="text-sm text-gray-500 font-normal">
                    {language === 'ta' ? 'உங்கள் இனிய பள்ளி நினைவுகளைப் பகிர்ந்து கொள்ளுங்கள்' : 'Relive and share your school memories'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 2-Step Login Form Card */}
          <div className="lg:col-span-6 order-1 lg:order-2 bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 lg:p-10 shadow-lg space-y-6">

            {/* Card Title Header with Language Selector Toggle */}
            <div className="border-b border-[#E5E7EB] pb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight">
                  {mode === 'CREATE_PASSWORD'
                    ? (language === 'ta' ? 'கடவுச்சொல் உருவாக்குதல்' : 'Create Account Password')
                    : mode === 'FORGOT_PASSWORD'
                      ? (forgotStep === 'EMAIL'
                        ? (language === 'ta' ? 'கடவுச்சொல் மறந்ததா?' : 'Forgot Password')
                        : forgotStep === 'OTP'
                          ? (language === 'ta' ? 'OTP சரிபார்க்க' : 'Verify Reset Code')
                          : (language === 'ta' ? 'புதிய கடவுச்சொல்' : 'Set New Password'))
                      : (step === 'CREDENTIALS'
                        ? (language === 'ta' ? 'உள்நுழைவு' : 'Login to your account')
                        : (language === 'ta' ? 'OTP சரிபார்ப்பு' : 'Security OTP Verification'))}
                </h2>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {/* <LanguageSelector /> */}

                {(mode === 'CREATE_PASSWORD' || mode === 'FORGOT_PASSWORD' || step === 'OTP') && (
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'CREATE_PASSWORD') {
                        setMode('LOGIN');
                      } else if (mode === 'FORGOT_PASSWORD') {
                        if (forgotStep === 'OTP') setForgotStep('EMAIL');
                        else if (forgotStep === 'RESET') setForgotStep('OTP');
                        else setMode('LOGIN');
                      } else {
                        setStep('CREDENTIALS');
                      }
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 border border-[#E5E7EB] rounded-xl text-xs font-normal text-gray-700 bg-white hover:bg-gray-50 shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'திரும்பு' : 'Back'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Account Not Registered Alert */}
            {userNotFound && (
              <div className="p-5 bg-[#FFF7D6] border border-[#F4C542] rounded-xl space-y-3 shadow-xs animate-fadeIn">
                <div className="flex items-start space-x-3 text-[#854D0E]">
                  <UserX className="w-6 h-6 shrink-0 text-[#854D0E] mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-wider">
                      {language === 'ta' ? 'கணக்கு இல்லை' : 'Account Not Registered'}
                    </h4>
                    <p className="text-xs text-gray-800 mt-1 leading-relaxed font-normal">
                      {language === 'ta' ? (
                        <><strong>{email}</strong> என்ற கைபேசி எண்ணில் / கணக்கில் சுயவிவரம் எதுவும் இல்லை. தொடர புதிய கணக்கு உருவாக்குங்கள்.</>
                      ) : (
                        <>No alumni profile was found for <strong>{email}</strong>. Unregistered users cannot log in. Please create an account to proceed.</>
                      )}
                    </p>
                  </div>
                </div>
                <Link
                  to="/register"
                  className="w-full py-3 bg-[#111111] hover:bg-black text-white font-medium text-xs rounded-xl flex items-center justify-center space-x-2 border border-[#111111] shadow-sm uppercase tracking-wider transition-all"
                >
                  <UserPlus className="w-4 h-4 text-[#F4C542]" />
                  <span>{language === 'ta' ? 'இப்போதே பதிவு செய்யுங்கள்' : 'Register Alumni Profile Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Password Not Created Top Alert Banner (Auto-hides smoothly) */}
            {passwordNotCreated && (
              <div
                className={`transition-all duration-700 ease-in-out transform overflow-hidden ${
                  showTopBanner
                    ? 'max-h-96 opacity-100 scale-100 mb-4 p-5 bg-[#FFF7D6] border border-[#F4C542] rounded-xl shadow-xs'
                    : 'max-h-0 opacity-0 scale-95 mb-0 p-0 border-0 pointer-events-none'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 text-[#854D0E]">
                    <Lock className="w-5 h-5 shrink-0 text-[#854D0E] mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        {language === 'ta' ? 'கடவுச்சொல் அமைக்கப்படவில்லை' : 'Password Not Created'}
                      </h4>
                      <p className="text-xs text-gray-800 mt-1 leading-relaxed font-normal">
                        {language === 'ta' ? (
                          <>உங்கள் கணக்கில் (<strong>{email}</strong>) இன்னும் கடவுச்சொல் அமைக்கப்படவில்லை. தொடர கடவுச்சொல் உருவாக்குங்கள்.</>
                        ) : (
                          <>Your account (<strong>{email}</strong>) is registered but does not have a login password set yet.</>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTopBanner(false)}
                    className="text-[#854D0E] hover:text-black p-1 transition-colors cursor-pointer shrink-0 ml-2"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => handleStartCreatePassword(email)}
                    className="w-full py-2.5 bg-[#111111] hover:bg-black text-white font-medium text-xs rounded-xl flex items-center justify-center space-x-2 border border-[#111111] shadow-sm uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#F4C542]" />
                    <span>{language === 'ta' ? 'இப்போதே கடவுச்சொல் உருவாக்க →' : 'Create Account Password Now →'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm font-normal text-rose-700 animate-fadeIn">
                {error}
              </div>
            )}

            {/* --- CREATE PASSWORD IN-PLACE MODULE VIEW (2-STEP WIZARD) --- */}
            {mode === 'CREATE_PASSWORD' ? (
              createPassStep === 'VERIFY_OTP' ? (
                /* STEP 1: VERIFY OTP SCREEN */
                <form onSubmit={handleVerifyCreatePassOtp} className="space-y-5 animate-fadeIn">
                  {/* Stepper Progress Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#FFF7D6] border border-[#F4C542] rounded-xl text-xs font-medium">
                    <div className="flex items-center space-x-2 text-[#854D0E] font-bold">
                      <span className="w-5 h-5 rounded-full bg-[#854D0E] text-white flex items-center justify-center text-[11px] font-bold">1</span>
                      <span>{language === 'ta' ? 'படி 1: OTP சரிபார்ப்பு' : 'Step 1: Verify OTP'}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    <div className="flex items-center space-x-2 text-gray-400 font-normal">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px] font-bold">2</span>
                      <span>{language === 'ta' ? 'படி 2: கடவுச்சொல் உருவாக்கம்' : 'Step 2: Create Password'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-normal flex items-start space-x-2.5">
                    <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      {language === 'ta' ? (
                        <>உங்கள் பதிவு செய்யப்பட்ட கைபேசி எண்ணிற்கு (<strong>{email}</strong>) அனுப்பப்பட்ட 6-இலக்க OTP குறியீட்டை உள்ளிடுங்கள்.</>
                      ) : (
                        <>Enter the 6-digit verification code sent via SMS to your registered mobile number (<strong>{email}</strong>).</>
                      )}
                    </div>
                  </div>

                  {/* Mobile / Account ID (Read-Only) */}
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      {language === 'ta' ? 'பதிவு செய்யப்பட்ட கைபேசி எண்' : 'Registered Mobile Number / Account'}
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={email}
                        readOnly
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-[#E5E7EB] rounded-xl text-base font-normal text-gray-600 focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* 6-Digit Verification OTP */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-normal text-[#111111]">
                        {language === 'ta' ? '6-இலக்க OTP குறியீடு' : '6-Digit Verification OTP'} <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleStartCreatePassword(email)}
                        disabled={loading}
                        className="text-xs font-normal text-[#854D0E] hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {language === 'ta' ? 'OTP மீண்டும் அனுப்புக' : 'Resend OTP'}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={createPassOtp}
                        onChange={(e) => setCreatePassOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                        autoFocus
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-xl font-mono font-normal text-[#111111] tracking-widest focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>
                  </div>

                  {/* Step 1 Submit Button: Verify OTP & Continue */}
                  <button
                    type="submit"
                    disabled={loading || createPassOtp.trim().length < 6}
                    className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030] cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#111111]" />
                    <span>
                      {language === 'ta' ? 'OTP சரிபார்த்து தொடரவும் →' : 'Verify OTP & Continue →'}
                    </span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('LOGIN')}
                      className="text-xs text-gray-500 hover:text-[#111111] underline cursor-pointer"
                    >
                      {language === 'ta' ? 'உள்நுழைவுக்கு திரும்பு' : 'Return to Login Screen'}
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: CREATE PASSWORD SCREEN */
                <form onSubmit={handleCreatePasswordSubmit} className="space-y-5 animate-fadeIn">
                  {/* Stepper Progress Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#FFF7D6] border border-[#F4C542] rounded-xl text-xs font-medium">
                    <div className="flex items-center space-x-2 text-emerald-700 font-medium">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      <span>{language === 'ta' ? 'படி 1: OTP சரிபார்க்கப்பட்டது' : 'Step 1: OTP Verified'}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    <div className="flex items-center space-x-2 text-[#854D0E] font-bold">
                      <span className="w-5 h-5 rounded-full bg-[#854D0E] text-white flex items-center justify-center text-[11px] font-bold">2</span>
                      <span>{language === 'ta' ? 'படி 2: கடவுச்சொல் உருவாக்கம்' : 'Step 2: Create Password'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-normal flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      {language === 'ta' ? (
                        <>அடையாளம் வெற்றிகரமாக சரிபார்க்கப்பட்டது (<strong>{email}</strong>). இப்போது உங்கள் கணக்கிற்கு புதிய கடவுச்சொல்லை உருவாக்கவும்.</>
                      ) : (
                        <>Identity verified successfully for <strong>{email}</strong>! Set a strong password to secure your account.</>
                      )}
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      {language === 'ta' ? 'புதிய கடவுச்சொல்' : 'New Password'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showCreatePassPassword ? 'text' : 'password'}
                        value={createPassPassword}
                        onChange={(e) => setCreatePassPassword(e.target.value)}
                        placeholder={language === 'ta' ? 'புதிய கடவுச்சொல் (குறைந்தது 6 எழுத்துகள்)' : 'Create new password (min 6 chars)'}
                        required
                        autoFocus
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassPassword(!showCreatePassPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"
                      >
                        {showCreatePassPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      {language === 'ta' ? 'கடவுச்சொல்லை உறுதிப்படுத்துங்கள்' : 'Confirm New Password'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showCreatePassConfirm ? 'text' : 'password'}
                        value={createPassConfirm}
                        onChange={(e) => setCreatePassConfirm(e.target.value)}
                        placeholder={language === 'ta' ? 'மீண்டும் கடவுச்சொல் உள்ளிடுங்கள்' : 'Re-enter new password'}
                        required
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassConfirm(!showCreatePassConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"
                      >
                        {showCreatePassConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 2 Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !createPassPassword || createPassPassword.length < 6 || createPassPassword !== createPassConfirm}
                    className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030] cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#111111]" />
                    <span>
                      {loading
                        ? (language === 'ta' ? 'சேமிக்கப்படுகிறது...' : 'Saving Password...')
                        : (language === 'ta' ? 'கடவுச்சொல்லைச் சேமித்து சுயவிவரத்திற்குச் செல்லவும்' : 'Save Password & Go to Profile')}
                    </span>
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setCreatePassStep('VERIFY_OTP')}
                      className="text-[#854D0E] font-medium hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{language === 'ta' ? 'OTP படிக்கு திரும்ப' : 'Back to OTP Verification'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('LOGIN')}
                      className="text-gray-500 hover:text-[#111111] underline cursor-pointer"
                    >
                      {language === 'ta' ? 'உள்நுழைவுக்கு திரும்பு' : 'Return to Login Screen'}
                    </button>
                  </div>
                </form>
              )
            ) : mode === 'FORGOT_PASSWORD' ? (
              forgotStep === 'EMAIL' ? (
                /* FORGOT STEP 1: Enter Registered Email */
                <form onSubmit={handleForgotEmailSubmit} className="space-y-5 animate-fadeIn">
                  <div className="p-4 bg-[#FFF7D6] border border-[#F4C542] rounded-xl text-xs sm:text-sm text-[#854D0E] font-normal">
                    {language === 'ta'
                      ? 'உங்கள் பதிவு செய்யப்பட்ட கைபேசி எண்ணை உள்ளிடுங்கள். கடவுச்சொல் மாற்றும் 6-இலக்க OTP-ஐ SMS மூலம் அனுப்புவோம்.'
                      : 'Enter your registered mobile number below. We will send a 6-digit password reset verification OTP via SMS.'}
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      {language === 'ta' ? 'பதிவு செய்யப்பட்ட கைபேசி எண்' : 'Registered Mobile Number (or Email)'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'ta' ? 'உங்கள் 10-இலக்க கைபேசி எண்' : 'Enter registered 10-digit mobile number'}
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030] cursor-pointer"
                  >
                    <span>
                      {loading
                        ? (language === 'ta' ? 'சரிபார்க்கப்படுகிறது...' : 'Validating Mobile Number...')
                        : (language === 'ta' ? 'சரிபார்ப்புக் குறியீடு அனுப்புக' : 'Send Reset Verification Code')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('LOGIN')}
                      className="text-xs text-gray-500 hover:text-[#111111] underline cursor-pointer"
                    >
                      {language === 'ta' ? 'உள்நுழைவுக்கு திரும்பு' : 'Return to Login Screen'}
                    </button>
                  </div>
                </form>
              ) : forgotStep === 'OTP' ? (
                /* FORGOT STEP 2: Enter Reset OTP Code */
                <form onSubmit={handleForgotOTPSubmit} className="space-y-5 animate-fadeIn">
                  <div className="p-4 bg-[#FFF7D6] border border-[#F4C542] rounded-xl text-xs sm:text-sm text-[#854D0E] font-normal">
                    {language === 'ta' ? (
                      <>உங்கள் பதிவு செய்யப்பட்ட கைபேசிக்கு SMS மூலம் வந்த 6-இலக்க OTP-ஐ உள்ளிடுங்கள்.</>
                    ) : (
                      <>Reset verification OTP code sent via SMS to your registered mobile phone. Enter the 6-digit code to reset your password.</>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      {language === 'ta' ? '6-இலக்க OTP குறியீடு' : '6-Digit Reset Verification OTP'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-xl font-mono font-normal text-[#111111] tracking-widest focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030] cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#111111]" />
                    <span>
                      {loading
                        ? (language === 'ta' ? 'சரிபார்க்கப்படுகிறது...' : 'Verifying...')
                        : (language === 'ta' ? 'சரிபார்க்கவும்' : 'Verify Code & Proceed')}
                    </span>
                  </button>
                </form>
              ) : (
                /* FORGOT STEP 3: Reset Password Screen */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-5 animate-fadeIn">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 font-normal">
                    {language === 'ta' ? (
                      <><strong>{email}</strong> கைபேசி எண் சரிபார்க்கப்பட்டது. புதிய கடவுச்சொல்லை உள்ளிடுங்கள்.</>
                    ) : (
                      <>Identity verified for <strong>{email}</strong>. Enter your new password below to update your account security.</>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      {language === 'ta' ? 'புதிய கடவுச்சொல்' : 'New Password'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={language === 'ta' ? 'புதிய கடவுச்சொல் (குறைந்தது 6 எழுத்துகள்)' : 'Enter new password (min 6 chars)'}
                        required
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      {language === 'ta' ? 'கடவுச்சொல்லை உறுதிப்படுத்துங்கள்' : 'Confirm New Password'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder={language === 'ta' ? 'மீண்டும் கடவுச்சொல் உள்ளிடுங்கள்' : 'Re-enter new password'}
                        required
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030] cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#111111]" />
                    <span>
                      {loading
                        ? (language === 'ta' ? 'சேமிக்கப்படுகிறது...' : 'Saving New Password...')
                        : (language === 'ta' ? 'கடவுச்சொல்லை சேமிக்கவும்' : 'Save New Password & Login')}
                    </span>
                  </button>
                </form>
              )
            ) : (
              /* --- NORMAL LOGIN MODULE VIEWS --- */
              step === 'CREDENTIALS' ? (
                <form onSubmit={handleCredentialsSubmit} className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      {language === 'ta' ? 'பதிவு செய்யப்பட்ட கைபேசி எண்' : 'Registered Mobile Number (or Email)'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEmail(val);
                          handleIdentifierCheck(val);
                        }}
                        onBlur={() => handleIdentifierCheck(email)}
                        placeholder={language === 'ta' ? 'உங்கள் 10-இலக்க கைபேசி எண்' : 'Enter 10-digit mobile number (or email)'}
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>

                    {/* Live Mobile/Account Verification Status Badge */}
                    {liveCheckStatus === 'CHECKING' && (
                      <div className="mt-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center space-x-2 animate-fadeIn font-normal">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                        <span>{language === 'ta' ? 'தரவுத்தளத்தில் கணக்கு சரிபார்க்கப்படுகிறது...' : 'Checking account in database...'}</span>
                      </div>
                    )}

                    {liveCheckStatus === 'EXISTS_NO_PASSWORD' && (
                      <div className="mt-2 p-2.5 bg-[#FFF7D6] border border-[#F4C542] rounded-xl text-xs text-[#854D0E] flex items-center justify-between shadow-xs animate-fadeIn">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-[#854D0E] shrink-0" />
                          <span className="font-medium">
                            {language === 'ta' ? (
                              <>கணக்கு உள்ளது ({liveCheckInfo?.full_name || ''}) - கடவுச்சொல் அமைக்கப்படவில்லை</>
                            ) : (
                              <>Account Found ({liveCheckInfo?.full_name || 'Alumnus'}) - Password Not Set</>
                            )}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartCreatePassword(email)}
                          className="px-2.5 py-1 bg-[#854D0E] hover:bg-black text-white rounded-lg text-[11px] font-medium transition-all cursor-pointer shrink-0 ml-2"
                        >
                          {language === 'ta' ? 'கடவுச்சொல் உருவாக்க →' : 'Create Password →'}
                        </button>
                      </div>
                    )}

                    {liveCheckStatus === 'EXISTS_HAS_PASSWORD' && (
                      <div className="mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2 animate-fadeIn font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {language === 'ta' ? (
                            <>கணக்கு சரிபார்க்கப்பட்டது ({liveCheckInfo?.full_name || ''}). கடவுச்சொல்லை உள்ளிடவும்.</>
                          ) : (
                            <>Account Verified ({liveCheckInfo?.full_name || 'Alumnus'}). Please enter your password below.</>
                          )}
                        </span>
                      </div>
                    )}

                    {liveCheckStatus === 'NOT_EXISTS' && (
                      <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center justify-between animate-fadeIn font-normal">
                        <div className="flex items-center space-x-1.5">
                          <UserX className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{language === 'ta' ? 'கணக்கு இல்லை. தயவுசெய்து முதலில் பதிவு செய்யவும்.' : 'No account found matching this mobile number.'}</span>
                        </div>
                        <Link to="/register" className="font-semibold text-rose-800 hover:underline shrink-0 ml-1">
                          {language === 'ta' ? 'பதிவு செய்ய' : 'Register Now'}
                        </Link>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-normal text-[#111111]">
                        {language === 'ta' ? 'கடவுச்சொல்' : 'Password'} <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('FORGOT_PASSWORD');
                          setForgotStep('EMAIL');
                          setError(null);
                        }}
                        className="text-xs font-normal text-[#854D0E] hover:underline cursor-pointer"
                      >
                        {language === 'ta' ? 'கடவுச்சொல் மறந்ததா?' : 'Forgot Password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={language === 'ta' ? 'உங்கள் கடவுச்சொல்' : 'Enter your password'}
                        required
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

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center space-x-2 text-sm font-normal text-gray-600">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-[#F4C542] border-[#E5E7EB] rounded focus:ring-[#F4C542]"
                    />
                    <label htmlFor="rememberMe" className="cursor-pointer">
                      {language === 'ta' ? 'என்னை நினைவில் கொள்க' : 'Remember me'}
                    </label>
                  </div>

                  {/* Submit Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030] cursor-pointer"
                  >
                    <span>
                      {loading
                        ? (language === 'ta' ? 'சரிபார்க்கப்படுகிறது...' : 'Validating Account...')
                        : (language === 'ta' ? 'தொடரவும்' : 'Continue')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* STEP 2: Verify Email OTP Form */
                <form onSubmit={handleVerifyOTP} className="space-y-5 animate-fadeIn">
                  <div className="p-4 bg-[#FFF7D6] border border-[#F4C542] rounded-xl text-xs sm:text-sm text-[#854D0E] font-normal">
                    {language === 'ta' ? (
                      <><strong>{email}</strong> என்ற கைபேசிக்கு SMS மூலம் வந்த 6-இலக்க OTP-ஐ உள்ளிடுங்கள்.</>
                    ) : (
                      <>Security OTP verification code sent via SMS to <strong>{email}</strong>. Please enter the code below to complete sign in.</>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      {language === 'ta' ? '6-இலக்க OTP' : '6-Digit Security OTP'} <span className="text-rose-500">*</span>
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
                      onClick={() => api.sendOTP(email, undefined, true)}
                      className="font-medium text-[#854D0E] hover:underline cursor-pointer"
                    >
                      {language === 'ta' ? 'மீண்டும் அனுப்புக' : 'Resend OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('CREDENTIALS')}
                      className="font-normal text-gray-500 hover:text-[#111111] underline cursor-pointer"
                    >
                      {language === 'ta' ? 'கைபேசி எண்ணை மாற்ற' : 'Change Mobile Number'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-base rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030] cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#111111]" />
                    <span>
                      {loading
                        ? (language === 'ta' ? 'சரிபார்க்கப்படுகிறது...' : 'Verifying...')
                        : (language === 'ta' ? 'உள்நுழைக' : 'Verify & Sign In')}
                    </span>
                  </button>
                </form>
              )
            )}

            {/* Divider */}
            <div className="relative py-1 flex items-center justify-center">
              <div className="border-t border-[#E5E7EB] w-full" />
              <span className="bg-white px-3 text-xs font-normal text-gray-400 uppercase tracking-wider">
                {language === 'ta' ? 'அல்லது' : 'OR'}
              </span>
            </div>

            {/* Social Google Login Button */}
            <button
              type="button"
              onClick={() => {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
                window.location.href = `${apiBase}/auth/google/login`;
              }}
              className="w-full py-3.5 px-6 bg-white border border-[#E5E7EB] hover:border-[#111111] rounded-xl font-normal text-base text-[#111111] flex items-center justify-center space-x-3 shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{language === 'ta' ? 'Google மூலம் தொடரவும்' : 'Continue with Google'}</span>
            </button>

            {/* Footer Registration Link Prompt */}
<div className="text-center text-xs sm:text-sm font-normal text-gray-600 pt-2">
  {language === 'ta' ? 'புதிய பயனரா?' : "Don't have an account?"}{' '}
  <Link to="/register" className="font-medium text-[#854D0E] underline ml-1">
    {language === 'ta' ? 'இங்கே சேருங்கள்' : 'Sign up here'}
  </Link>
</div>

{/* NEW: Demo Link */}
<div className="text-center pt-3">
  <a
    href="https://drive.google.com/drive/folders/1Ypp-3OLxf1DJCDhYqMv5lpcD3OJ9y425?usp=sharing"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-[#854D0E] hover:text-[#111111] hover:underline transition-colors"
  >
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>
      {language === 'ta' ? 'டெமோவைப் பாருங்கள்' : 'Watch Demo'}
    </span>
    <svg
      className="w-3 h-3 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  </a>
</div>

          </div>

        </div>
      </div>
    </div>
  );
};
