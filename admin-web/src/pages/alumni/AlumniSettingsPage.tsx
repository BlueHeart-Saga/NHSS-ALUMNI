import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KeyRound, ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const AlumniSettingsPage: React.FC = () => {
  const { user } = useOutletContext<AlumniContextType>();
  const { language, setLanguage } = useLanguage();

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'SECURITY' | 'OTP_RESET' | 'PREFERENCES'>('SECURITY');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // OTP Reset Password State
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Handle Direct Password Update (Current Password -> New Password)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) {
      Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'Please fill in both current and new passwords.', confirmButtonColor: '#111111' });
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'New password must be at least 6 characters long.', confirmButtonColor: '#111111' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'Password Mismatch', text: 'New password and confirmation do not match.', confirmButtonColor: '#111111' });
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
        title: 'Password Updated!',
        text: 'Your security password has been changed successfully.',
        confirmButtonColor: '#111111'
      });
    } catch (err: any) {
      console.error('Password change failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Password Update Failed',
        text: err?.message || 'Could not update password. Please check your current password.',
        confirmButtonColor: '#111111'
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle Request OTP for Forgot/Reset Password
  const handleSendResetOTP = async () => {
    const identifier = user?.email || user?.mobile;
    if (!identifier) {
      Swal.fire({ icon: 'error', title: 'Account Identifier Missing', text: 'No email or mobile found on account.', confirmButtonColor: '#111111' });
      return;
    }

    setSendingOtp(true);
    try {
      const isEmail = identifier.includes('@');
      await api.sendOTP(
        identifier,
        undefined,
        false,
        undefined,
        true // forPasswordReset
      );

      setOtpSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: `Verification OTP has been dispatched to ${identifier}.`,
        confirmButtonColor: '#111111'
      });
    } catch (err: any) {
      console.error('Send OTP failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'OTP Dispatch Failed',
        text: err?.message || 'Could not send verification OTP code.',
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
      Swal.fire({ icon: 'warning', title: 'Incomplete Fields', text: 'Please enter the 6-digit OTP code and new password.', confirmButtonColor: '#111111' });
      return;
    }
    if (otpNewPassword.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'New password must be at least 6 characters.', confirmButtonColor: '#111111' });
      return;
    }
    if (otpNewPassword !== otpConfirmPassword) {
      Swal.fire({ icon: 'warning', title: 'Password Mismatch', text: 'New password and confirmation do not match.', confirmButtonColor: '#111111' });
      return;
    }

    setVerifyingOtp(true);
    try {
      await api.resetPasswordWithOTP(
        user?.email || undefined,
        user?.mobile || undefined,
        otpCode,
        otpNewPassword
      );

      setOtpSent(false);
      setOtpCode('');
      setOtpNewPassword('');
      setOtpConfirmPassword('');

      Swal.fire({
        icon: 'success',
        title: 'Password Reset Successful!',
        text: 'Your password was successfully reset using OTP verification.',
        confirmButtonColor: '#111111'
      });
    } catch (err: any) {
      console.error('OTP Reset Password failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: err?.message || 'Invalid OTP code or password reset failed.',
        confirmButtonColor: '#111111'
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-[#111111]">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111111]">Account & Security Settings</h2>
          <p className="text-xs text-[#6B7280]">Manage authentication credentials, OTP security verification, and portal preferences</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold bg-[#FFF7D6] text-amber-900 px-3 py-1.5 rounded-xl border border-[#F4C542]/40">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Account Verified ({user?.passing_year ? `Batch of ${user.passing_year}` : 'Alumni Member'})</span>
        </div>
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex border-b border-[#E5E7EB] gap-2 text-xs font-bold pb-2">
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'SECURITY'
              ? 'bg-[#111111] text-white shadow-sm'
              : 'bg-white border border-[#E5E7EB] text-gray-600 hover:text-[#111111]'
          }`}
        >
          Change Password
        </button>
        <button
          onClick={() => setActiveTab('OTP_RESET')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'OTP_RESET'
              ? 'bg-[#111111] text-white shadow-sm'
              : 'bg-white border border-[#E5E7EB] text-gray-600 hover:text-[#111111]'
          }`}
        >
          OTP Verification & Forgot Password
        </button>
        <button
          onClick={() => setActiveTab('PREFERENCES')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'PREFERENCES'
              ? 'bg-[#111111] text-white shadow-sm'
              : 'bg-white border border-[#E5E7EB] text-gray-600 hover:text-[#111111]'
          }`}
        >
          Portal Preferences
        </button>
      </div>

      {/* TAB 1: DIRECT PASSWORD CHANGE */}
      {activeTab === 'SECURITY' && (
        <form onSubmit={handleUpdatePassword} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-5 text-xs">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E7EB]">
            <KeyRound className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-sm text-[#111111]">Update Account Password</h3>
              <p className="text-gray-500">Update your current password to secure your alumni portal account</p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Current Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542] pr-9"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">New Password *</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Confirm New Password *</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="px-5 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-black disabled:bg-gray-400 shadow-sm transition-all flex items-center space-x-2"
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F4C542]" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: OTP VERIFICATION & FORGOT PASSWORD */}
      {activeTab === 'OTP_RESET' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-5 text-xs">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5E7EB]">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-sm text-[#111111]">Reset Password via OTP Code</h3>
              <p className="text-gray-500">Send a 6-digit OTP verification code to your registered email or mobile to reset password</p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
              <span className="font-bold block">REGISTERED IDENTIFIER:</span>
              <p className="text-xs font-mono">{user?.email || user?.mobile || 'No contact email found'}</p>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendResetOTP}
                disabled={sendingOtp}
                className="w-full py-3 bg-[#111111] text-white font-bold rounded-xl shadow-md hover:bg-black disabled:bg-gray-400 flex items-center justify-center space-x-2 transition-all"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#F4C542]" />
                    <span>Dispatching OTP Code...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#F4C542]" />
                    <span>Send Verification OTP Code</span>
                  </>
                )}
              </button>
            ) : (
              <form onSubmit={handleResetPasswordWithOTP} className="space-y-4 pt-2 border-t border-gray-100">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-gray-700">Enter 6-Digit OTP Code *</label>
                    {countdown > 0 ? (
                      <span className="text-gray-400 text-[11px]">Resend in {countdown}s</span>
                    ) : (
                      <button type="button" onClick={handleSendResetOTP} className="text-amber-800 font-bold text-[11px] hover:underline">
                        Resend OTP
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542] tracking-widest font-mono text-center text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    value={otpNewPassword}
                    onChange={e => setOtpNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    value={otpConfirmPassword}
                    onChange={e => setOtpConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="w-full py-3 bg-[#111111] text-white font-bold rounded-xl shadow-md hover:bg-black disabled:bg-gray-400 flex items-center justify-center space-x-2 transition-all"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#F4C542]" />
                      <span>Verifying OTP & Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verify OTP & Reset Password</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PORTAL PREFERENCES */}
      {activeTab === 'PREFERENCES' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-5 text-xs">
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
