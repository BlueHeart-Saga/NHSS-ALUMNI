import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Mail, Lock, KeyRound, ArrowRight, CheckCircle2,
  Home, Eye, EyeOff, RotateCw, ArrowLeft, Phone
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { alertService } from '../../services/alertService';
import { getRedirectPathForRoles } from '../../utils/roleRedirect';

interface LoginProps {
  onLoginSuccess?: (path?: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  // Login Mode State
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');

  // Standard Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot Password Workflow State
  const [forgotStep, setForgotStep] = useState<'IDENTIFIER' | 'OTP' | 'RESET'>('IDENTIFIER');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (api.getToken()) {
      api.getMe()
        .then((u) => {
          if (u && u.roles) {
            const upperRoles = (u.roles || []).map((r: string) => String(r).toUpperCase());
            if (upperRoles.includes('SCHOOL_ADMIN') || upperRoles.includes('SUPER_ADMIN')) {
              navigate('/school-admin');
            } else {
              const target = getRedirectPathForRoles(u.roles, u.verification_status === 'NOT_REGISTERED');
              navigate(target);
            }
          }
        })
        .catch(() => {
          api.clearToken();
        });
    }
  }, [navigate]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // -------------------------------------------------------------
  // STANDARD LOGIN HANDLER  (NO OTP — email/mobile + password only)
  // -------------------------------------------------------------
  const handleVerifyCredentialsAndSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your Admin Mobile Number / Email and Password.');
      return;
    }

    setLoading(true);
    try {
      // ✅ Password-only login. Adjust the method name below to match your
      //    public login page's call (e.g. api.login, api.authenticate,
      //    api.signIn, api.adminLogin ...).
      const res = await api.login(email.trim(), password);

      const upperRoles = (res.roles || []).map((r: string) => String(r).toUpperCase());
      let targetPath = getRedirectPathForRoles(res.roles, res.registration_required);
      if (upperRoles.includes('SCHOOL_ADMIN') || upperRoles.includes('SUPER_ADMIN')) {
        targetPath = '/school-admin';
      }

      if (targetPath === '/developer') {
        alertService.showSuccess('Developer Authenticated', 'Welcome to the Platform Developer Portal!');
      } else {
        alertService.showSuccess('School Admin Login Verified', 'Welcome back to your School Admin Dashboard!');
      }

      if (onLoginSuccess) {
        onLoginSuccess(targetPath);
      } else {
        navigate(targetPath);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid mobile number/email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // (Kept for backward compatibility, but unused now)
  // -------------------------------------------------------------
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code sent via SMS.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyAdminOTP(email.trim(), otp.trim());
      const upperRoles = (res.roles || []).map((r: string) => String(r).toUpperCase());
      let targetPath = getRedirectPathForRoles(res.roles, res.registration_required);
      if (upperRoles.includes('SCHOOL_ADMIN') || upperRoles.includes('SUPER_ADMIN')) {
        targetPath = '/school-admin';
      }

      if (targetPath === '/developer') {
        alertService.showSuccess('Developer Authenticated', 'Welcome to the Platform Developer Portal!');
      } else {
        alertService.showSuccess('School Admin Login Verified', 'Welcome back to your School Admin Dashboard!');
      }

      if (onLoginSuccess) {
        onLoginSuccess(targetPath);
      } else {
        navigate(targetPath);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // FORGOT & RESET PASSWORD WORKFLOW HANDLERS
  // -------------------------------------------------------------
  const handleForgotIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const target = forgotIdentifier.trim();
    if (!target) {
      setError('Please enter your registered Admin Mobile Number or Email address.');
      return;
    }

    setLoading(true);
    try {
      await api.sendOTP(target, undefined, false, undefined, true);
      setResendCountdown(30);
      alertService.showInfo(
        'Reset Code Sent',
        `A 6-digit password reset verification code has been dispatched via SMS to your registered mobile number.`
      );
      setForgotStep('OTP');
    } catch (err: any) {
      setError(err.message || `No registered account found matching '${target}'. Please check your credentials.`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotOTP = async () => {
    if (resendCountdown > 0) return;
    const target = forgotIdentifier.trim();
    if (!target) return;

    setError(null);
    setLoading(true);
    try {
      await api.sendOTP(target, undefined, false, undefined, true);
      setResendCountdown(30);
      alertService.showInfo(
        'Code Resent',
        'A fresh 6-digit OTP code has been dispatched to your mobile number via SMS.'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = forgotOtp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP verification code.');
      return;
    }

    setForgotStep('RESET');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const target = forgotIdentifier.trim();
      const isEmail = target.includes('@');
      const emailVal = isEmail ? target : undefined;
      const mobileVal = !isEmail ? target : undefined;

      await api.resetPasswordWithOTP(emailVal, mobileVal, forgotOtp.trim(), newPassword);

      alertService.showSuccess(
        'Password Reset Successfully',
        'Your School Admin account password has been updated. You can now log in with your new password.'
      );

      setEmail(target);
      setPassword(newPassword);

      setMode('LOGIN');
      setStep('CREDENTIALS');
      setForgotStep('IDENTIFIER');
      setForgotOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The OTP code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToForgot = () => {
    setError(null);
    setForgotIdentifier(email.trim());
    setMode('FORGOT_PASSWORD');
    setForgotStep('IDENTIFIER');
  };

  const handleBackToLogin = () => {
    setError(null);
    setMode('LOGIN');
    setStep('CREDENTIALS');
    setForgotStep('IDENTIFIER');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 font-sans selection:bg-[#F4C542] selection:text-[#111111]">
      {/* Top Header / Home Page Navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-700 bg-white border border-[#E5E7EB] px-3.5 py-2 rounded-xl shadow-xs hover:bg-gray-50 hover:text-[#111111] transition-all cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#854D0E]" />
          <span>Home Page</span>
        </Link>
        <span className="text-xs font-medium text-gray-400">School Admin Authentication</span>
      </div>

      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-[#854D0E]">
            {mode === 'FORGOT_PASSWORD' ? (
              <KeyRound className="w-7 h-7 sm:w-8 sm:h-8 text-[#854D0E]" />
            ) : (
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#854D0E]" />
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111]">
            {mode === 'FORGOT_PASSWORD'
              ? (forgotStep === 'IDENTIFIER'
                  ? 'Reset Admin Password'
                  : forgotStep === 'OTP'
                  ? 'Verify Reset Code'
                  : 'Set New Admin Password')
              : 'School Admin Portal'}
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            {mode === 'FORGOT_PASSWORD'
              ? (forgotStep === 'IDENTIFIER'
                  ? 'Enter your registered Mobile or Email to receive an SMS OTP.'
                  : forgotStep === 'OTP'
                  ? 'Enter the 6-digit OTP code sent via SMS.'
                  : 'Create a new secure password for your administrator account.')
              : 'Authorized School Administrator Verification'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 leading-relaxed animate-fadeIn">
            {error}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. STANDARD LOGIN FLOW (email/mobile + password only — NO OTP)            */}
        {/* ========================================================================= */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleVerifyCredentialsAndSendOTP} className="space-y-5">
            <Input
              label="Admin Mobile Number (or Email) *"
              type="text"
              placeholder="Enter 10-digit mobile number or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#111111]">
                  Account Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSwitchToForgot}
                  className="text-xs font-semibold text-[#854D0E] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 pr-10 text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-[#F4C542] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold cursor-pointer border border-[#111111]"
              isLoading={loading}
            >
              <span>Verify</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* 2. FORGOT & RESET PASSWORD WORKFLOW                                       */}
        {/* ========================================================================= */}
        {mode === 'FORGOT_PASSWORD' && (
          <div className="space-y-5">
            {/* Step 1: Identifier Input */}
            {forgotStep === 'IDENTIFIER' && (
              <form onSubmit={handleForgotIdentifierSubmit} className="space-y-5">
                <Input
                  label="Admin Mobile Number or Email *"
                  type="text"
                  placeholder="e.g. 9876543210 or admin@school.com"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  autoFocus
                  required
                />

                <Button
                  type="submit"
                  className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold cursor-pointer border border-[#111111]"
                  isLoading={loading}
                >
                  <span>Send Reset OTP Code</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-xs font-semibold text-[#6B7280] hover:text-[#111111] text-center pt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Admin Login</span>
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {forgotStep === 'OTP' && (
              <form onSubmit={handleForgotOTPSubmit} className="space-y-5">
                <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs text-[#854D0E] font-medium flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#854D0E] shrink-0" />
                  <span>A 6-digit OTP has been sent via SMS for: <strong>{forgotIdentifier}</strong></span>
                </div>

                <Input
                  label="6-Digit Verification Code *"
                  placeholder="123456"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                  required
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep('IDENTIFIER')}
                    className="text-[#6B7280] hover:text-[#111111] underline cursor-pointer"
                  >
                    Change Mobile / Email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendForgotOTP}
                    disabled={resendCountdown > 0 || loading}
                    className={`inline-flex items-center gap-1 font-semibold ${
                      resendCountdown > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#854D0E] hover:underline cursor-pointer'
                    }`}
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend OTP'}</span>
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={forgotOtp.length < 6}
                  className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold cursor-pointer border border-[#111111]"
                  isLoading={loading}
                >
                  <span>Continue to Set Password</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-xs font-semibold text-[#6B7280] hover:text-[#111111] text-center pt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel &amp; Return to Login</span>
                </button>
              </form>
            )}

            {/* Step 3: Set New Password */}
            {forgotStep === 'RESET' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#111111]">
                    New Admin Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      autoFocus
                      className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 pr-10 text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-[#F4C542] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#111111]">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 pr-10 text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-[#F4C542] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={newPassword.length < 6 || confirmNewPassword.length < 6}
                  className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold cursor-pointer border border-[#111111]"
                  isLoading={loading}
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  <span>Reset Password &amp; Continue</span>
                </Button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-xs font-semibold text-[#6B7280] hover:text-[#111111] text-center pt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel &amp; Return to Login</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Request Access link */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-500 font-normal">
            Need an admin account for your school?
          </p>
          <Link
            to="/admin/request-access"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#854D0E] hover:underline uppercase tracking-wider"
          >
            <ShieldCheck className="w-4 h-4 text-[#854D0E]" />
            <span>Request School Admin Access →</span>
          </Link>
        </div>
      </div>
    </div>
  );
};