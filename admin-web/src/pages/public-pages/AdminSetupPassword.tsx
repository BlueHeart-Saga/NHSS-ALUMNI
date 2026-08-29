import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { alertService } from '../../services/alertService';

export const AdminSetupPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryEmail = new URLSearchParams(location.search).get('email') || '';

  const [email, setEmail] = useState(queryEmail);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'SEND_OTP' | 'VERIFY_SET_PASS'>('SEND_OTP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [queryEmail]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your School Admin email address.');
      return;
    }

    setLoading(true);
    try {
      await api.sendOTP(cleanEmail);
      setStep('VERIFY_SET_PASS');
      alertService.showSuccess(
        'Verification OTP Sent!',
        `A 6-digit setup code has been sent to ${cleanEmail}. Check your email inbox.`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP verification code to email.');
      alertService.showError('Verification Error', err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      await api.setPasswordWithOTP(email.trim(), otp.trim(), password);
      alertService.showSuccess(
        'Account Password Created!',
        'Your School Admin password has been set successfully. You can now log in.'
      );
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to set account password. Invalid or expired OTP code.');
      alertService.showError('Setup Failed', err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans selection:bg-[#F4C542] selection:text-[#111111]">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#854D0E]">
            <ShieldCheck className="w-8 h-8 text-[#854D0E]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111111]">School Admin Account Setup</h1>
          <p className="text-xs text-[#6B7280] mt-1">Verify your email address &amp; create your account password</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 leading-relaxed animate-fadeIn">
            {error}
          </div>
        )}

        {step === 'SEND_OTP' ? (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <Input
              label="School Admin Email Address *"
              type="email"
              placeholder="admin@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" className="w-full py-3 bg-[#111111] text-white hover:bg-black font-bold cursor-pointer" isLoading={loading}>
              <span>Send OTP Verification Code to Email</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSetPassword} className="space-y-5">
            <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs text-[#854D0E] font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#854D0E] shrink-0" />
              <span>OTP code sent to <strong>{email}</strong>. Enter code &amp; create password.</span>
            </div>

            <Input
              label="6-Digit OTP Verification Code *"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />

            <Input
              label="Create New Password *"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password *"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold cursor-pointer border border-[#111111]" isLoading={loading}>
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>Save Password &amp; Activate Account</span>
            </Button>

            <button
              type="button"
              onClick={() => setStep('SEND_OTP')}
              className="w-full text-xs font-semibold text-[#6B7280] hover:text-[#111111] text-center pt-2 cursor-pointer"
            >
              ← Resend OTP or Change Email
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-500 font-normal">
            Already have a set password?
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#854D0E] hover:underline uppercase tracking-wider"
          >
            <Lock className="w-4 h-4 text-[#854D0E]" />
            <span>Go to School Admin Login →</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
