import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  KeyRound, ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, Send, CheckCircle2,
  AlertCircle, FileText, Sparkles, Phone, GraduationCap, RotateCcw
} from 'lucide-react';
import Swal from 'sweetalert2';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const AlumniSettingsPage: React.FC = () => {
  const { user } = useOutletContext<AlumniContextType>();
  const { language, setLanguage } = useLanguage();
  const [searchParams] = useSearchParams();

  // Active Sub-Tab: 'SECURITY' | 'REQUESTS' | 'PREFERENCES'
  const [activeTab, setActiveTab] = useState<'SECURITY' | 'REQUESTS' | 'PREFERENCES'>('SECURITY');

  // Sub-mode in Password & Security tab: 'DIRECT' (Current -> New) | 'MOBILE_OTP' (Forgot/Reset via Phone OTP)
  const [securityMode, setSecurityMode] = useState<'DIRECT' | 'MOBILE_OTP'>('DIRECT');

  useEffect(() => {
    if (searchParams.get('tab') === 'requests') {
      setActiveTab('REQUESTS');
    }
  }, [searchParams]);

  // Mode 1: Direct Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Mode 2: Phone Number OTP Reset Password State
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [showOtpPass, setShowOtpPass] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle 6-digit OTP input card refs & navigation
  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpDigitChange = (index: number, val: string) => {
    const digitsOnly = val.replace(/\D/g, '');
    if (!digitsOnly && val !== '') return;

    let currentArr = (otpCode || '').padEnd(6, ' ').split('');

    if (digitsOnly.length > 1) {
      const pasted = digitsOnly.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        currentArr[i] = pasted[i] || '';
      }
      const finalStr = currentArr.join('').trim();
      setOtpCode(finalStr);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    currentArr[index] = digitsOnly.slice(-1);
    const finalStr = currentArr.join('').trim();
    setOtpCode(finalStr);

    if (digitsOnly && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const charAtIndex = (otpCode || '')[index] || '';
      if (!charAtIndex && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      setOtpCode(pasted);
      const focusIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[focusIdx]?.focus();
    }
  };

  useEffect(() => {
    if (user?.mobile) {
      setMobileNumber(user.mobile);
    }
  }, [user]);

  // Account Identity Change Request State
  const [requestType, setRequestType] = useState<'BATCH' | 'MOBILE'>('BATCH');
  const [requestedValue, setRequestedValue] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Handle Direct Password Update (Current Password -> New Password)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'விவரங்கள் தேவை' : 'Missing Information',
        text: language === 'ta' ? 'தற்போதைய மற்றும் புதிய கடவுச்சொற்களை நிரப்பவும்.' : 'Please fill in both current and new passwords.',
        confirmButtonColor: '#111111'
      });
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'எளிய கடவுச்சொல்' : 'Weak Password',
        text: language === 'ta' ? 'புதிய கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துக்களாக இருக்க வேண்டும்.' : 'New password must be at least 6 characters long.',
        confirmButtonColor: '#111111'
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'கடவுச்சொல் பொருந்தவில்லை' : 'Password Mismatch',
        text: language === 'ta' ? 'புதிய கடவுச்சொல் மற்றும் உறுதிப்படுத்தல் கடவுச்சொல் பொருந்தவில்லை.' : 'New password and confirmation do not match.',
        confirmButtonColor: '#111111'
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Swal.fire({
        icon: 'success',
        title: language === 'ta' ? 'கடவுச்சொல் புதுப்பிக்கப்பட்டது!' : 'Password Updated!',
        text: language === 'ta' ? 'உங்கள் கணக்கு கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது.' : 'Your security password has been changed successfully.',
        confirmButtonColor: '#111111'
      });
    } catch (err: any) {
      console.error('Password change failed:', err);
      Swal.fire({
        icon: 'error',
        title: language === 'ta' ? 'புதுப்பித்தல் தோல்வி' : 'Password Update Failed',
        text: err?.message || 'Could not update password. Please check your current password.',
        confirmButtonColor: '#111111'
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle Request OTP for Forgot/Reset Password via Mobile Phone
  const handleSendResetOTP = async () => {
    const targetMobile = mobileNumber.trim() || user?.mobile;
    if (!targetMobile) {
      Swal.fire({
        icon: 'error',
        title: language === 'ta' ? 'மொபைல் எண் தேவை' : 'Mobile Number Required',
        text: language === 'ta' ? 'தயவுசெய்து பதிவான மொபைல் எண்ணை உள்ளிடவும்.' : 'Please provide your registered mobile number for verification.',
        confirmButtonColor: '#111111'
      });
      return;
    }

    setSendingOtp(true);
    try {
      await api.sendOTP(
        targetMobile,
        undefined,
        false,
        undefined,
        true // forPasswordReset
      );

      setOtpSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Swal.fire({
        icon: 'success',
        title: language === 'ta' ? 'OTP அனுப்பப்பட்டது!' : 'OTP Code Dispatched!',
        text: language === 'ta'
          ? `${targetMobile} என்ற கைபேசி எண்ணிற்கு 6-இலக்க OTP சரிபார்ப்புக் குறியீடு அனுப்பப்பட்டது.`
          : `A 6-digit verification OTP code has been dispatched to mobile number ${targetMobile}.`,
        confirmButtonColor: '#111111'
      });
    } catch (err: any) {
      console.error('Send OTP failed:', err);
      Swal.fire({
        icon: 'error',
        title: language === 'ta' ? 'OTP அனுப்புவதில் தோல்வி' : 'OTP Dispatch Failed',
        text: err?.message || 'Could not send verification OTP code to mobile number.',
        confirmButtonColor: '#111111'
      });
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Submit OTP & Reset Password
  const handleResetPasswordWithOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !otpNewPassword.trim()) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'விவரங்கள் தேவை' : 'Incomplete Fields',
        text: language === 'ta' ? '6-இலக்க OTP குறியீடு மற்றும் புதிய கடவுச்சொல்லை உள்ளிடவும்.' : 'Please enter the 6-digit OTP code and your new password.',
        confirmButtonColor: '#111111'
      });
      return;
    }
    if (otpNewPassword.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'எளிய கடவுச்சொல்' : 'Weak Password',
        text: language === 'ta' ? 'புதிய கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துக்களாக இருக்க வேண்டும்.' : 'New password must be at least 6 characters long.',
        confirmButtonColor: '#111111'
      });
      return;
    }
    if (otpNewPassword !== otpConfirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'கடவுச்சொல் பொருந்தவில்லை' : 'Password Mismatch',
        text: language === 'ta' ? 'புதிய கடவுச்சொல் மற்றும் உறுதிப்படுத்தல் கடவுச்சொல் பொருந்தவில்லை.' : 'New password and confirmation do not match.',
        confirmButtonColor: '#111111'
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      const targetMobile = mobileNumber.trim() || user?.mobile;
      await api.resetPasswordWithOTP(
        user?.email || undefined,
        targetMobile || undefined,
        otpCode,
        otpNewPassword
      );

      setOtpSent(false);
      setOtpCode('');
      setOtpNewPassword('');
      setOtpConfirmPassword('');

      Swal.fire({
        icon: 'success',
        title: language === 'ta' ? 'கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது!' : 'Password Reset Successful!',
        text: language === 'ta'
          ? 'மொபைல் OTP சரிபார்ப்பு மூலம் உங்கள் புதிய கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது.'
          : 'Your password was successfully reset using mobile OTP verification.',
        confirmButtonColor: '#111111'
      });
    } catch (err: any) {
      console.error('OTP Reset Password failed:', err);
      Swal.fire({
        icon: 'error',
        title: language === 'ta' ? 'மீட்டமைப்பில் தோல்வி' : 'Reset Failed',
        text: err?.message || 'Invalid OTP code or password reset failed.',
        confirmButtonColor: '#111111'
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle Submit Change Request to Admin
  const handleSubmitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedValue.trim()) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'விவரம் தேவை' : 'Value Required',
        text: language === 'ta' ? 'புதிய வகுப்பு அல்லது மொபைல் எண்ணை உள்ளிடவும்.' : 'Please enter the requested new value.',
        confirmButtonColor: '#111111'
      });
      return;
    }

    setSubmittingRequest(true);
    try {
      const title = requestType === 'BATCH'
        ? `Batch Year Update Request from ${user?.full_name || 'Alumni'} (${user?.mobile || 'N/A'})`
        : `Mobile Number Change Request from ${user?.full_name || 'Alumni'} (Current: ${user?.mobile || 'N/A'})`;

      const content = `Request Type: ${requestType === 'BATCH' ? 'Passing Batch Year Change' : 'Mobile Number Change'}\n` +
        `Requested New Value: ${requestedValue}\n` +
        `Current Registered Mobile: ${user?.mobile}\n` +
        `Current Registered Batch: ${user?.passing_year}\n` +
        `Reason / Remarks: ${requestReason || 'None provided'}`;

      await api.createFeedback({
        alumni_name: user?.full_name || 'Alumni Member',
        batch_year: String(user?.passing_year || 2010),
        feedback_type: 'Account Verification / Change Request',
        feedback_text: `${title}\n\n${content}`
      });

      setRequestedValue('');
      setRequestReason('');

      Swal.fire({
        icon: 'success',
        title: language === 'ta' ? 'கோரிக்கை அனுப்பப்பட்டது!' : 'Change Request Submitted!',
        text: language === 'ta'
          ? 'உங்கள் மாற்றக் கோரிக்கை பள்ளி நிர்வாகியிடம் வெற்றிகரமாக அனுப்பப்பட்டது. சரிபார்ப்பிற்குப் பிறகு புதுப்பிக்கப்படும்.'
          : 'Your account identity change request has been submitted to school administrators for review and approval.',
        confirmButtonColor: '#111111'
      });
    } catch (err: any) {
      console.error('Failed to submit change request:', err);
      Swal.fire({
        icon: 'error',
        title: language === 'ta' ? 'கோரிக்கை தோல்வியடைந்தது' : 'Submission Failed',
        text: err?.message || 'Could not submit change request. Please try again.',
        confirmButtonColor: '#111111'
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-[#111111] pb-12">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
            {language === 'ta' ? 'கணக்கு & பாதுகாப்பு அமைப்புகள்' : 'Account & Security Settings'}
          </h2>
          <p className="text-xs text-[#6B7280]">
            {language === 'ta'
              ? 'கடவுச்சொல் மாற்றம், கைபேசி OTP சரிபார்ப்பு மற்றும் கணக்கு விவர மாற்ற கோரிக்கைகளை நிர்வகிக்கவும்'
              : 'Manage password security credentials, mobile phone OTP verification, and account update requests'}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold bg-[#FFF7D6] text-amber-900 px-3 py-1.5 rounded-xl border border-[#F4C542]/40 shrink-0">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Account Verified ({user?.passing_year ? `Batch of ${user.passing_year}` : 'Alumni Member'})</span>
        </div>
      </div>

      {/* Primary Sub-Tabs */}
      <div className="flex overflow-x-auto border-b border-[#E5E7EB] gap-2 text-xs font-bold pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activeTab === 'SECURITY'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-gray-600 hover:text-[#111111]'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'ta' ? 'கடவுச்சொல் & பாதுகாப்பு' : 'Password & Security'}</span>
        </button>

        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'REQUESTS'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-gray-600 hover:text-[#111111]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'ta' ? 'கணக்கு விவர மாற்ற கோரிக்கை' : 'Batch & Mobile Change Request'}</span>
        </button>

        <button
          onClick={() => setActiveTab('PREFERENCES')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'PREFERENCES'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-gray-600 hover:text-[#111111]'
          }`}
        >
          {language === 'ta' ? 'மொழி அமைப்புகள்' : 'Portal Preferences'}
        </button>
      </div>

      {/* TAB 1: UNIFIED PASSWORD & SECURITY (DIRECT CHANGE OR MOBILE OTP RESET) */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6 text-xs">
          {/* Sub-Mode Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSecurityMode('DIRECT')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                securityMode === 'DIRECT'
                  ? 'bg-gradient-to-br from-[#111111] to-gray-900 text-white border-[#111111] shadow-md ring-2 ring-[#F4C542]'
                  : 'bg-gray-50/70 hover:bg-white text-gray-700 border-gray-200 shadow-2xs'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${securityMode === 'DIRECT' ? 'bg-[#F4C542] text-[#111111]' : 'bg-gray-200 text-gray-700'}`}>
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm">
                  {language === 'ta' ? 'நேரடி கடவுச்சொல் மாற்று' : 'Direct Password Change'}
                </h4>
                <p className={`text-[11px] mt-0.5 leading-relaxed ${securityMode === 'DIRECT' ? 'text-gray-300' : 'text-gray-500'}`}>
                  {language === 'ta'
                    ? 'தற்போதைய கடவுச்சொல்லைப் பயன்படுத்தி புதிய கடவுச்சொல்லை அமைக்கவும்'
                    : 'Update your password using your current active password'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSecurityMode('MOBILE_OTP')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                securityMode === 'MOBILE_OTP'
                  ? 'bg-gradient-to-br from-[#111111] to-gray-900 text-white border-[#111111] shadow-md ring-2 ring-[#F4C542]'
                  : 'bg-gray-50/70 hover:bg-white text-gray-700 border-gray-200 shadow-2xs'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${securityMode === 'MOBILE_OTP' ? 'bg-[#F4C542] text-[#111111]' : 'bg-gray-200 text-gray-700'}`}>
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm">
                  {language === 'ta' ? 'கைபேசி OTP சரிபார்ப்பு & மீட்டமைப்பது' : 'Mobile OTP Reset / Forgot Password'}
                </h4>
                <p className={`text-[11px] mt-0.5 leading-relaxed ${securityMode === 'MOBILE_OTP' ? 'text-gray-300' : 'text-gray-500'}`}>
                  {language === 'ta'
                    ? 'பதிவுசெய்யப்பட்ட கைபேசி எண்ணிற்கு OTP அனுப்பி கடவுச்சொல்லை மீட்டமைக்கவும்'
                    : 'Send 6-digit OTP code to your mobile phone to reset password'}
                </p>
              </div>
            </button>
          </div>

          {/* MODE 1: DIRECT PASSWORD CHANGE FORM */}
          {securityMode === 'DIRECT' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 pb-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <h4 className="font-bold text-xs sm:text-sm text-[#111111]">
                  {language === 'ta' ? 'தற்போதைய கடவுச்சொல்லை மாற்று' : 'Update Active Password'}
                </h4>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {language === 'ta' ? 'தற்போதைய கடவுச்சொல் *' : 'Current Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542] pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {language === 'ta' ? 'புதிய கடவுச்சொல் *' : 'New Password *'}
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {language === 'ta' ? 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும் *' : 'Confirm New Password *'}
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-black disabled:bg-gray-400 shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#F4C542]" />
                    <span>{language === 'ta' ? 'புதுப்பிக்கப்படுகிறது...' : 'Updating Password...'}</span>
                  </>
                ) : (
                  <span>{language === 'ta' ? 'கடவுச்சொல் மாற்று' : 'Update Password'}</span>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: MOBILE PHONE OTP RESET PASSWORD FORM */}
          {securityMode === 'MOBILE_OTP' && (
            <div className="space-y-4 max-w-md pt-2 border-t border-gray-100">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1.5">
                <div className="font-extrabold text-xs flex items-center space-x-1.5 text-amber-900">
                  <Phone className="w-4 h-4 text-amber-700" />
                  <span>{language === 'ta' ? 'பதிவுசெய்யப்பட்ட கைபேசி எண்:' : 'Registered Primary Mobile Number:'}</span>
                </div>
                <p className="text-sm font-bold font-mono text-[#111111]">{mobileNumber || user?.mobile || 'No mobile found'}</p>
                <p className="text-[11px] text-amber-800">
                  {language === 'ta'
                    ? 'உங்கள் கைபேசி எண்ணிற்கு 6-இலக்க OTP குறியீடு அனுப்பப்படும். அதைப் பயன்படுத்தி புதிய கடவுச்சொல்லை அமைத்துக் கொள்ளலாம்.'
                    : 'We will send a 6-digit OTP verification SMS to your mobile phone to safely reset your password.'}
                </p>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendResetOTP}
                  disabled={sendingOtp}
                  className="w-full py-3 bg-[#111111] text-white font-bold rounded-xl shadow-md hover:bg-black disabled:bg-gray-400 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#F4C542]" />
                      <span>{language === 'ta' ? 'OTP அனுப்பப்படுகிறது...' : 'Dispatching Mobile OTP Code...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#F4C542]" />
                      <span>{language === 'ta' ? 'கைபேசிக்கு OTP அனுப்பு' : 'Send Verification OTP to Mobile'}</span>
                    </>
                  )}
                </button>
              ) : (
                <form onSubmit={handleResetPasswordWithOTP} className="space-y-4 pt-2 border-t border-gray-200">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-semibold text-gray-700">
                        {language === 'ta' ? '6-இலக்க OTP குறியீட்டை உள்ளிடவும் *' : 'Enter 6-Digit OTP Code *'}
                      </label>
                      {countdown > 0 ? (
                        <span className="text-gray-400 text-[11px]">Resend in {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendResetOTP}
                          className="text-amber-800 font-bold text-[11px] hover:underline cursor-pointer flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Resend OTP</span>
                        </button>
                      )}
                    </div>
                    <div
                      className="flex items-center justify-between gap-1.5 sm:gap-2.5 py-1"
                      onPaste={handleOtpPaste}
                    >
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const digit = (otpCode || '')[idx] || '';
                        return (
                          <input
                            key={idx}
                            ref={(el) => (otpInputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 text-center text-lg sm:text-xl font-extrabold font-mono focus:outline-none transition-all shadow-xs cursor-pointer ${
                              digit
                                ? 'border-amber-500 bg-amber-50/60 text-amber-950 shadow-sm'
                                : 'border-[#E5E7EB] bg-[#FAFAFA] text-[#111111] focus:border-amber-500 focus:bg-white'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {language === 'ta' ? 'புதிய கடவுச்சொல் *' : 'New Password *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showOtpPass ? 'text' : 'password'}
                        value={otpNewPassword}
                        onChange={(e) => setOtpNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542] pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOtpPass(!showOtpPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                      >
                        {showOtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {language === 'ta' ? 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும் *' : 'Confirm New Password *'}
                    </label>
                    <input
                      type={showOtpPass ? 'text' : 'password'}
                      value={otpConfirmPassword}
                      onChange={(e) => setOtpConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifyingOtp}
                    className="w-full py-3 bg-[#111111] text-white font-bold rounded-xl shadow-md hover:bg-black disabled:bg-gray-400 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    {verifyingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#F4C542]" />
                        <span>{language === 'ta' ? 'OTP சரிபார்க்கப்படுகிறது...' : 'Verifying OTP & Resetting Password...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'ta' ? 'OTP சரிபார்த்து கடவுச்சொல்லை மீட்டமைக்கவும்' : 'Verify OTP & Reset Password'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BATCH & MOBILE CHANGE REQUEST FORM */}
      {activeTab === 'REQUESTS' && (
        <form onSubmit={handleSubmitChangeRequest} className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5 text-xs">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E7EB]">
            <FileText className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-[#111111]">
                {language === 'ta' ? 'கணக்கு விவரங்கள் மாற்றக் கோரிக்கை' : 'Request Account Identity Update (Batch / Mobile)'}
              </h3>
              <p className="text-gray-500">
                {language === 'ta'
                  ? 'வகுப்பு ஆண்டு மற்றும் கைபேசி எண் நேரடி திருத்தத்திற்கு பூட்டப்பட்டுள்ளன. நிர்வாகியின் அனுமதிக்கு இங்கே கோரிக்கை அனுப்பவும்.'
                  : 'Batch Passing Year and Primary Mobile Number updates require verification by School Administrators.'}
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                {language === 'ta' ? 'மாற்றப்பட வேண்டிய விவரம்' : 'Request Type'} *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRequestType('BATCH')}
                  className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                    requestType === 'BATCH'
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap className={`w-4 h-4 ${requestType === 'BATCH' ? 'text-amber-400' : 'text-gray-500'}`} />
                  <div>
                    <div>{language === 'ta' ? 'வகுப்பு ஆண்டு' : 'Batch Passing Year'}</div>
                    <div className="text-[10px] opacity-80 font-normal">Current: {user?.passing_year}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('MOBILE')}
                  className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                    requestType === 'MOBILE'
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Phone className={`w-4 h-4 ${requestType === 'MOBILE' ? 'text-amber-400' : 'text-gray-500'}`} />
                  <div>
                    <div>{language === 'ta' ? 'கைபேசி எண்' : 'Mobile Number'}</div>
                    <div className="text-[10px] opacity-80 font-normal">Current: {user?.mobile}</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                {requestType === 'BATCH'
                  ? (language === 'ta' ? 'கேட்கப்படும் புதிய வகுப்பு ஆண்டு (எ.கா: 2012)' : 'Requested New Batch Passing Year (e.g. 2012)')
                  : (language === 'ta' ? 'கேட்கப்படும் புதிய கைபேசி எண்' : 'Requested New Mobile Number')} *
              </label>
              <input
                type={requestType === 'BATCH' ? 'number' : 'text'}
                value={requestedValue}
                onChange={e => setRequestedValue(e.target.value)}
                placeholder={requestType === 'BATCH' ? 'e.g. 2012' : 'e.g. +91 98765 43210'}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                {language === 'ta' ? 'காரணம் / குறிப்பு' : 'Reason for Update Request'}
              </label>
              <textarea
                rows={3}
                value={requestReason}
                onChange={e => setRequestReason(e.target.value)}
                placeholder="e.g. Registered with wrong batch year during initial signup..."
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <button
              type="submit"
              disabled={submittingRequest}
              className="w-full py-3 bg-[#111111] hover:bg-black text-white font-bold rounded-xl shadow-md disabled:bg-gray-400 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {submittingRequest ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F4C542]" />
                  <span>{language === 'ta' ? 'கோரிக்கை அனுப்பப்படுகிறது...' : 'Submitting Request...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{language === 'ta' ? 'நிர்வாகியிடம் கோரிக்கை அனுப்பு' : 'Submit Update Request to Admin'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: PORTAL PREFERENCES */}
      {activeTab === 'PREFERENCES' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5 text-xs">
          <h3 className="font-bold text-sm text-[#111111]">Portal Language & Localization</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Preferred Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542] font-medium"
              >
                <option value="en">English (US / IN)</option>
                <option value="ta">Tamil (தமிழ்)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Default Time Zone</label>
              <input
                type="text"
                disabled
                value="Asia/Kolkata (IST +05:30)"
                className="w-full p-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl text-gray-500 cursor-not-allowed font-medium"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
