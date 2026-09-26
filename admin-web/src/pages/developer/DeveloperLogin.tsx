import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, KeyRound, ArrowRight, Eye, EyeOff, Home, RotateCw, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { alertService } from '../../services/alertService';
import { getRedirectPathForRoles } from '../../utils/roleRedirect';

interface DeveloperLoginProps {
  onLoginSuccess?: (path?: string) => void;
}

export const DeveloperLogin: React.FC<DeveloperLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  // Mode: LOGIN or FORGOT_PASSWORD
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
            if (
              upperRoles.includes('SUPER_ADMIN') ||
              upperRoles.includes('DEVELOPER') ||
              upperRoles.includes('PLATFORM_DEVELOPER')
            ) {
              navigate('/developer');
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

  // Handle Email + Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Developer Email Address.');
      alertService.showError('Email Address Required', 'Please enter your registered Developer Email Address (e.g. devopstrioglobal@gmail.com).');
      return;
    }

    if (!password) {
      setError('Please enter your Developer Account Password.');
      return;
    }

    setLoading(true);

    try {
      if (cleanEmail) localStorage.setItem('developer_email', cleanEmail);
      const res = await api.login(cleanEmail, password);

      const upperRoles = (res.roles || []).map((r: string) => String(r).toUpperCase());
      let targetPath = getRedirectPathForRoles(res.roles, res.registration_required);
      if (
        upperRoles.includes('SUPER_ADMIN') ||
        upperRoles.includes('DEVELOPER') ||
        upperRoles.includes('PLATFORM_DEVELOPER')
      ) {
        targetPath = '/developer';
      }

      if (targetPath === '/developer') {
        alertService.showSuccess('Developer Authenticated', 'Welcome to the Platform Developer Portal!');
      } else {
        alertService.showSuccess('Login Verified', 'Welcome back!');
      }

      if (onLoginSuccess) {
        onLoginSuccess(targetPath);
      } else {
        navigate(targetPath);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Invalid developer credentials or password. Please check your credentials and try again.';
      setError(errMsg);
      alertService.showError('Developer Authentication Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Workflow Handlers
  const handleForgotIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const target = forgotIdentifier.trim();
    if (!target) {
      setError('Please enter your registered Developer Email or Mobile number.');
      return;
    }

    setLoading(true);
    try {
      await api.sendOTP(target, undefined, false, undefined, true, false, true);
      setResendCountdown(30);
      alertService.showInfo(
        'Reset Code Sent',
        `A 6-digit password reset verification code has been sent to your registered mobile/email.`
      );
      setForgotStep('OTP');
    } catch (err: any) {
      setError(err.message || `No registered developer account found matching '${target}'.`);
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
      await api.sendOTP(target, undefined, false, undefined, true, false, true);
      setResendCountdown(30);
      alertService.showInfo(
        'Code Resent',
        'A fresh 6-digit OTP code has been dispatched.'
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
        'Your Developer account password has been updated. You can now log in with your new password.'
      );

      setEmail(target);
      setPassword(newPassword);

      setMode('LOGIN');
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] flex flex-col items-center justify-center p-4">
      {/* Top Header / Home Page Navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-700 bg-white border border-[#E5E7EB] px-3.5 py-2 rounded-xl shadow-xs hover:bg-gray-50 hover:text-[#111111] transition-all cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#111111]" />
          <span>Home Page</span>
        </Link>
        <span className="text-xs font-medium text-gray-400">Platform Developer Access</span>
      </div>

      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs space-y-6 animate-fadeIn">
        {/* Developer Login Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-[#111111] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#111111] shadow-md">
            {mode === 'FORGOT_PASSWORD' ? (
              <KeyRound className="w-8 h-8 text-white" />
            ) : (
              <Shield className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3 text-[#111111]" />
            <span>Developer Portal Access</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            {mode === 'FORGOT_PASSWORD'
              ? (forgotStep === 'IDENTIFIER'
                  ? 'Reset Developer Password'
                  : forgotStep === 'OTP'
                  ? 'Verify Reset Code'
                  : 'Set New Developer Password')
              : 'Developer Portal'}
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            {mode === 'FORGOT_PASSWORD'
              ? 'Multi-Tenant Platform Password Recovery'
              : 'Multi-Tenant School Creation & Admin Provisioning'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {mode === 'LOGIN' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Developer Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="devopstrioglobal@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#111111]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#111111]">Account Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setForgotIdentifier(email.trim());
                    setMode('FORGOT_PASSWORD');
                    setForgotStep('IDENTIFIER');
                  }}
                  className="text-xs font-semibold text-gray-600 hover:text-[#111111] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter developer password"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#111111]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full py-3 bg-[#111111] text-white font-bold hover:bg-black" isLoading={loading}>
              <span>Authorize Developer Access</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        ) : (
          <div className="space-y-5">
            {forgotStep === 'IDENTIFIER' && (
              <form onSubmit={handleForgotIdentifierSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">Developer Email or Mobile *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="devopstrioglobal@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full py-3 bg-[#111111] text-white font-bold hover:bg-black" isLoading={loading}>
                  <span>Send Reset OTP Code</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('LOGIN');
                  }}
                  className="w-full text-xs font-semibold text-[#6B7280] hover:text-[#111111] text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Developer Login</span>
                </button>
              </form>
            )}

            {forgotStep === 'OTP' && (
              <form onSubmit={handleForgotOTPSubmit} className="space-y-5">
                <div className="p-3 bg-gray-50 border border-[#E5E7EB] rounded-xl text-xs text-[#6B7280]">
                  Verification code sent for: <strong>{forgotIdentifier}</strong>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">6-Digit Verification Code *</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-mono font-bold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setForgotStep('IDENTIFIER')}
                    className="text-[#6B7280] hover:text-[#111111] underline cursor-pointer"
                  >
                    Change Email / Mobile
                  </button>

                  <button
                    type="button"
                    onClick={handleResendForgotOTP}
                    disabled={resendCountdown > 0 || loading}
                    className={`inline-flex items-center gap-1 font-semibold ${
                      resendCountdown > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#111111] hover:underline cursor-pointer'
                    }`}
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}</span>
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={forgotOtp.length < 6}
                  className="w-full py-3 bg-[#111111] text-white font-bold hover:bg-black"
                  isLoading={loading}
                >
                  <span>Continue to Set Password</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('LOGIN');
                  }}
                  className="w-full text-xs font-semibold text-[#6B7280] hover:text-[#111111] text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel & Return to Login</span>
                </button>
              </form>
            )}

            {forgotStep === 'RESET' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">New Developer Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      className="w-full pl-10 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#111111]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">Confirm New Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      minLength={6}
                      className="w-full pl-10 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#111111]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={newPassword.length < 6 || confirmNewPassword.length < 6}
                  className="w-full py-3 bg-[#111111] text-white font-bold hover:bg-black"
                  isLoading={loading}
                >
                  <span>Reset Password & Login</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('LOGIN');
                  }}
                  className="w-full text-xs font-semibold text-[#6B7280] hover:text-[#111111] text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel & Return to Login</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
