import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Phone, KeyRound, ArrowRight, UserX, UserPlus, 
  Users, Calendar, Image, Lock, CheckCircle2, Eye, EyeOff, ArrowLeft 
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
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [schoolName, setSchoolName] = useState('School Alumni Network');
  const [schoolLogo, setSchoolLogo] = useState('');

  // Forgot Password Module State
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP' | 'RESET'>('EMAIL');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    api.getPublicStats()
      .then((s) => {
        if (s.school_name) setSchoolName(s.school_name);
        if (s.logo_url) setSchoolLogo(s.logo_url);
      })
      .catch(() => {});

    // Auto-redirect if user is already authenticated
    if (api.getToken()) {
      api.getMe()
        .then((u) => {
          if (u && u.roles) {
            const target = getRedirectPathForRoles(u.roles, u.verification_status === 'NOT_REGISTERED');
            navigate(target);
          }
        })
        .catch(() => {});
    }
  }, [navigate]);

  // Step 1 Submission: Validate Credentials & Send OTP
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUserNotFound(false);
    setPasswordNotCreated(false);

    if (!email) {
      setError(language === 'ta' ? 'தயவுசெய்து உங்கள் மின்னஞ்சலை உள்ளிடுங்கள்.' : 'Please enter your registered email address.');
      return;
    }
    if (!password) {
      setError(language === 'ta' ? 'தயவுசெய்து உங்கள் கடவுச்சொல்லை உள்ளிடுங்கள்.' : 'Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      await api.sendOTP(email, undefined, true, password);
      setOtp('');
      setStep('OTP');
    } catch (err: any) {
      if (err.message && (err.message.includes('PASSWORD_NOT_CREATED') || err.message.toLowerCase().includes('not have a login password'))) {
        setPasswordNotCreated(true);
      } else if (err.message && (err.message.toLowerCase().includes('not found') || err.message.toLowerCase().includes('register'))) {
        setUserNotFound(true);
      } else {
        setError(err.message || (language === 'ta' ? 'கணக்கை சரிபார்க்க முடியவில்லை.' : 'Failed to verify account credentials.'));
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
    if (!email || !email.trim() || !email.includes('@')) {
      alertService.showWarning(
        language === 'ta' ? 'மின்னஞ்சல் தேவை' : 'Email Required',
        language === 'ta' ? 'தயவுசெய்து உங்கள் மின்னஞ்சலை உள்ளிடுங்கள்.' : 'Please enter your registered email address.'
      );
      return;
    }

    setLoading(true);
    try {
      // Pass forPasswordReset = true -> backend checks if email exists in DB
      await api.sendOTP(email, undefined, false, undefined, true);
      alertService.showInfo(
        language === 'ta' ? 'OTP அனுப்பப்பட்டது' : 'Reset Code Sent',
        language === 'ta'
          ? `கடவுச்சொல் மாற்றும் 6-இலக்க OTP ${email} முகவரிக்கு அனுப்பப்பட்டுள்ளது.`
          : `A 6-digit password reset verification code has been dispatched to ${email}.`
      );
      setForgotStep('OTP');
    } catch (err: any) {
      alertService.handleApiError(
        err,
        language === 'ta'
          ? `'${email}' என்ற மின்னஞ்சலில் கணக்கு எதுவும் இல்லை. தயவுசெய்து சரிபார்க்கவும்.`
          : `No alumni profile found matching '${email}'. Please check your email address.`
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
      await api.updatePassword(newPassword);
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
            <div className="flex items-center space-x-4">
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
            </div>

            {/* Accent Yellow Bar */}
            <div className="w-14 h-1 bg-[#F4C542] rounded-full" />

            {/* Welcome Heading */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-normal text-[#111111] tracking-tight">
                {language === 'ta' ? 'அன்போடு வரவேற்கிறோம்!' : 'Welcome Back!'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
                {language === 'ta' ? 'உங்கள் பழைய பள்ளி தோழர்களுடன் மீண்டும் இணைய இப்போதே உள்நுழையுங்கள்.' : 'Login to your account and continue your journey with your alumni community.'}
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
                  {mode === 'FORGOT_PASSWORD'
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

                {(mode === 'FORGOT_PASSWORD' || step === 'OTP') && (
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'FORGOT_PASSWORD') {
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
                        <><strong>{email}</strong> என்ற மின்னஞ்சலில் கணக்கு எதுவும் இல்லை. தொடர புதிய கணக்கு உருவாக்குங்கள்.</>
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

            {/* Password Not Created Alert */}
            {passwordNotCreated && (
              <div className="p-5 bg-[#FFF7D6] border border-[#F4C542] rounded-xl space-y-3 shadow-xs animate-fadeIn">
                <div className="flex items-start space-x-3 text-[#854D0E]">
                  <Lock className="w-6 h-6 shrink-0 text-[#854D0E] mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-wider">
                      {language === 'ta' ? 'கடவுச்சொல் அமைக்கப்படவில்லை' : 'Password Not Created'}
                    </h4>
                    <p className="text-xs text-gray-800 mt-1 leading-relaxed font-normal">
                      {language === 'ta' ? (
                        <>உங்கள் கணக்கில் (<strong>{email}</strong>) இன்னும் கடவுச்சொல் அமைக்கப்படவில்லை. தொடர கடவுச்சொல் உருவாக்குங்கள்.</>
                      ) : (
                        <>Your account (<strong>{email}</strong>) is registered but does not have a login password set yet. Please set your password to secure your account.</>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.sendOTP(email);
                    } catch (e) {}
                    navigate('/register', {
                      state: {
                        email: email,
                        resumeStep: 2
                      }
                    });
                  }}
                  className="w-full py-3 bg-[#111111] hover:bg-black text-white font-medium text-xs rounded-xl flex items-center justify-center space-x-2 border border-[#111111] shadow-sm uppercase tracking-wider transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F4C542]" />
                  <span>{language === 'ta' ? 'இப்போதே கடவுச்சொல் உருவாக்க →' : 'Create Account Password Now →'}</span>
                </button>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm font-normal text-rose-700 animate-fadeIn">
                {error}
              </div>
            )}

            {/* --- FORGOT PASSWORD MODULE VIEWS --- */}
            {mode === 'FORGOT_PASSWORD' ? (
              forgotStep === 'EMAIL' ? (
                /* FORGOT STEP 1: Enter Registered Email */
                <form onSubmit={handleForgotEmailSubmit} className="space-y-5 animate-fadeIn">
                  <div className="p-4 bg-[#FFF7D6] border border-[#F4C542] rounded-xl text-xs sm:text-sm text-[#854D0E] font-normal">
                    {language === 'ta'
                      ? 'உங்கள் மின்னஞ்சலை உள்ளிடுங்கள். கடவுச்சொல் மாற்றும் குறியீட்டை அனுப்புவோம்.'
                      : 'Enter your registered email address below. We will check our database and dispatch a password reset code to your email.'}
                  </div>

                  <div>
                    <label className="block text-sm font-normal text-[#111111] mb-2">
                      {language === 'ta' ? 'மின்னஞ்சல்' : 'Registered Email Address'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'ta' ? 'உங்கள் மின்னஞ்சல்' : 'Enter your registered email'}
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
                        ? (language === 'ta' ? 'சரிபார்க்கப்படுகிறது...' : 'Checking Account Email...')
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
                      <><strong>{email}</strong> முகவரிக்கு வந்த 6-இலக்க OTP-ஐ உள்ளிடுங்கள்.</>
                    ) : (
                      <>Reset verification OTP code sent to <strong>{email}</strong>. Enter the 6-digit code to reset your password.</>
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
                      <><strong>{email}</strong> சரிபார்க்கப்பட்டது. புதிய கடவுச்சொல்லை உள்ளிடுங்கள்.</>
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
                      {language === 'ta' ? 'மின்னஞ்சல்' : 'Email Address'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'ta' ? 'உங்கள் மின்னஞ்சல்' : 'Enter your email'}
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-normal text-[#111111] focus:outline-none focus:border-[#F4C542]"
                      />
                    </div>
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
                        : (language === 'ta' ? 'தொடரவும்' : 'Continue to OTP Verification')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* STEP 2: Verify Email OTP Form */
                <form onSubmit={handleVerifyOTP} className="space-y-5 animate-fadeIn">
                  <div className="p-4 bg-[#FFF7D6] border border-[#F4C542] rounded-xl text-xs sm:text-sm text-[#854D0E] font-normal">
                    {language === 'ta' ? (
                      <><strong>{email}</strong> முகவரிக்கு வந்த 6-இலக்க OTP-ஐ உள்ளிடுங்கள்.</>
                    ) : (
                      <>Security OTP verification code sent to <strong>{email}</strong>. Please enter the code below to complete sign in.</>
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
                      {language === 'ta' ? 'மின்னஞ்சலை மாற்ற' : 'Change Credentials'}
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

          </div>

        </div>
      </div>
    </div>
  );
};
